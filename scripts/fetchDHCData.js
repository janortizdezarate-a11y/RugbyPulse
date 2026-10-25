import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';

// All confirmed DHC Senior Masculí matches from exact team match discovery scan
const DHC_MATCH_IDS = [
  8414,8415,8416,8417,8461,8462,8463,8464,8465,8466,8485,8503,8515,8516,
  8541,8542,8543,8544,8583,8584,8585,8586,8632,8633,8634,8635,8659,8683,
  8704,8705,8718,8746,8787,8800,8815,8817
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchMatchData(matchId) {
  try {
    const url = `https://matchready.es/rugbycat/web/ca/public/competition/${matchId}/match_statistics/`;
    console.log(`[${matchId}] Fetching...`);

    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });

    const html = res.data;
    const $ = cheerio.load(html);

    const matchHeader = $('.title span').text().trim() || $('title').text().trim();
    if (!matchHeader) throw new Error("Invalid page");

    let homeTeam = "Unknown Home";
    let awayTeam = "Unknown Away";
    let homeLogo = "";
    let awayLogo = "";

    const teamHeaders = [];
    $('.bs-callout').each((i, el) => {
      const text = $(el).find('h4').text().trim().toUpperCase();
      if (text) teamHeaders.push(text);
      const img = $(el).find('img').attr('src');
      if (i === 0 && img) homeLogo = 'https://matchready.es' + img;
      if (i === 1 && img) awayLogo = 'https://matchready.es' + img;
    });

    if (teamHeaders.length >= 2) {
      homeTeam = teamHeaders[0];
      awayTeam = teamHeaders[1];
    }

    let homeScore = 0, awayScore = 0;
    $('.bs-callout').each((i, el) => {
      const scoreText = $(el).find('h1 b').text().replace('Punts', '').trim();
      const s = parseInt(scoreText);
      if (!isNaN(s)) {
        if (i === 0) homeScore = s;
        if (i === 1) awayScore = s;
      }
    });

    let date = "Unknown Date";
    $('.row.text-justify').each((i, el) => {
      const txt = $(el).text();
      if (txt.includes('El dia')) {
        const match = txt.match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/);
        if (match) date = match[0];
      }
    });

    const lineups = {};
    lineups[homeTeam] = [];
    lineups[awayTeam] = [];

    const tables = $('table.table');
    let teamIdx = 0;
    tables.each((tableIdx, tableEl) => {
      const thText = $(tableEl).find('th').text().toLowerCase();
      if (thText.includes("dorsal") && thText.includes("cognoms") && !thText.includes("entrenador") && !thText.includes("delegat")) {
        let activeTeam = teamIdx <= 1 ? homeTeam : awayTeam;
        if (teamIdx > 3) return;
        let isStarter = teamIdx === 0 || teamIdx === 2;
        $(tableEl).find('tbody tr').each((i, tr) => {
          const cols = $(tr).find('td');
          if (cols.length >= 4) {
            const number = parseInt($(cols[0]).text().trim());
            const name = $(cols[2]).text().trim();
            const licenseId = $(cols[3]).text().trim();
            if (name && name !== '-' && !isNaN(number)) {
              lineups[activeTeam].push({ number, name, licenseId, isStarter });
            }
          }
        });
        teamIdx++;
      }
    });

    const scorers = [];
    $('.portlet-green .table').each((i, tableEl) => {
      let activeTeam = i === 0 ? homeTeam : awayTeam;
      $(tableEl).find('tbody tr').each((j, tr) => {
        const cols = $(tr).find('td');
        if (cols.length >= 3) {
          const min = parseInt($(cols[0]).text().trim());
          let typeRaw = $(cols[1]).text().trim();
          const playerStr = $(cols[2]).text().trim();
          let translatedType = typeRaw;
          if (typeRaw === "A") translatedType = "Try";
          else if (typeRaw === "E") translatedType = "Penalty Try";
          else if (typeRaw === "T") translatedType = "Conv";
          else if (typeRaw === "C") translatedType = "Penalty";
          const lp = lineups[activeTeam].find(p => p.name === playerStr);
          const licenseId = lp ? lp.licenseId : `UN-${playerStr}`;
          if (!isNaN(min)) {
            scorers.push({ min, type: translatedType, player: playerStr, team: activeTeam, licenseId });
          }
        }
      });
    });

    const subs = [];
    $('.portlet-blue .table').each((i, tableEl) => {
      $(tableEl).find('tbody tr').each((j, tr) => {
        const cols = $(tr).find('td');
        if (cols.length >= 4) {
          const inPlayer = $(cols[0]).text().trim();
          const outPlayer = $(cols[1]).text().trim();
          const min = parseInt($(cols[3]).text().trim());
          if (!isNaN(min)) subs.push({ min, in: inPlayer, out: outPlayer });
        }
      });
    });

    const cards = [];
    $('.portlet-red .table, .portlet-orange .table').each((i, tableEl) => {
      let activeTeam = $(tableEl).closest('.portlet').find('h4').text().toLowerCase().includes('local') ? homeTeam : awayTeam;
      $(tableEl).find('tbody tr').each((j, tr) => {
        const cols = $(tr).find('td');
        if (cols.length >= 4) {
          const min = parseInt($(cols[0]).text().trim());
          const typeRaw = $(cols[1]).text().trim();
          const playerStr = $(cols[2]).text().trim();
          let translatedType = typeRaw === "SG" ? "Yellow" : "Red";
          const lp = lineups[activeTeam].find(p => p.name === playerStr);
          const licenseId = lp ? lp.licenseId : `UN-${playerStr}`;
          if (!isNaN(min)) cards.push({ min, type: translatedType, player: playerStr, team: activeTeam, licenseId });
        }
      });
    });

    return { id: matchId, date, homeTeam, awayTeam, homeLogo, awayLogo,
             score: { home: homeScore, away: awayScore }, lineups, scorers, subs, cards };
  } catch (error) {
    console.error(`[${matchId}] Error: ${error.message}`);
    return null;
  }
}

async function scrapeAll() {
  const result = [];
  console.log(`\n🏉 Fetching ${DHC_MATCH_IDS.length} DHC Senior Masculí matches...\n`);
  for (const id of DHC_MATCH_IDS) {
    const data = await fetchMatchData(id);
    if (data && data.homeTeam !== "Unknown Home") {
      result.push(data);
      console.log(`  ✅ [${id}] ${data.homeTeam} ${data.score.home}-${data.score.away} ${data.awayTeam}`);
    }
    await delay(800);
  }
  const destPath = path.join(process.cwd(), 'src', 'data', 'dhc_matches.json');
  fs.writeFileSync(destPath, JSON.stringify(result, null, 2));
  console.log(`\n✅ Saved ${result.length} DHC matches to ${destPath}`);
}

scrapeAll();
