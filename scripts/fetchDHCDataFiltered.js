import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';

// All M DHCAT (Male DHC) matches — F DHCAT removed (updated 2026-08-20)
const ALL_IDS = [
  7703,7708,7735,7745,7788,7789,7790,7791,7839,7863,7864,7865,7866,7872,7873,7874,
  7910,7926,7933,7940,7965,7966,7967,7968,7977,7997,8022,8023,8024,8025,8077,8078,
  8079,8080,8081,8082,8083,8099,8108,8116,8144,8145,8146,8147,8171,8201,8215,8216,
  8217,8240,8241,8242,8270,8271,8272,8273,8302,8303,8304,8348,8370,8373,8374,8375,
  8414,8415,8416,8417,8461,8462,8463,8464,8465,8466,8485,8503,8515,8516,8541,8542,
  8543,8544,8583,8584,8585,8586,8632,8633,8634,8635,8659,8683,8704,8705,8718,8746,
  8787,8800,8804,8815,8817
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchMatch(matchId) {
  try {
    const url = `https://matchready.es/rugbycat/web/ca/public/competition/${matchId}/match_statistics/`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });
    
    const html = res.data;
    const $ = cheerio.load(html);
    
    let isDHC = false;
    // Only accept Male DHC — check category div for exact 'M DHCAT' label
    const categoryText = $('.col-lg-4.text-center').first().text().trim();
    if (categoryText === 'M DHCAT') {
      isDHC = true;
    }

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

    let homeScore = 0;
    let awayScore = 0;
    $('.bs-callout').each((i, el) => {
       const scoreText = $(el).find('h1 b').text().replace('Punts', '').trim();
       const s = parseInt(scoreText);
       if (!isNaN(s)) {
           if (i === 0) homeScore = s;
           if (i === 1) awayScore = s;
       }
    });

    if (homeScore === 0 && awayScore === 0) return null;

    // Phase / Jornada
    let phase = "Jornada Desconeguda";
    $('.row').each((i, el) => {
        const txt = $(el).text();
        if (txt.includes('Jornada')) {
            const match = txt.match(/Jornada\s+\d+/i);
            if (match) phase = match[0];
            else if (txt.toLowerCase().includes('semifinal')) phase = "Semifinal";
            else if (txt.toLowerCase().includes('final')) phase = "Final";
        }
    });

    let date = "Unknown Date";
    $('.row.text-justify').each((i, el) => {
        const txt = $(el).text();
        if (txt.includes('El dia')) {
            const matchDate = txt.match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/);
            if (matchDate) date = matchDate[0];
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
           let activeTeam = teamIdx === 0 || teamIdx === 1 ? homeTeam : awayTeam;
           if (teamIdx >= 2 && teamIdx < 4) activeTeam = awayTeam;
           if (teamIdx > 3) return;

           let isStarter = teamIdx === 0 || teamIdx === 2;

           $(tableEl).find('tbody tr').each((i, tr) => {
               const cols = $(tr).find('td');
               if (cols.length >= 4) {
                   const number = parseInt($(cols[0]).text().trim());
                   const name = $(cols[2]).text().trim();
                   const licenseId = $(cols[3]).text().trim();
                   
                   if (name && name !== '-' && !isNaN(number)) {
                       lineups[activeTeam].push({
                           number, name, licenseId, isStarter
                       });
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
                 const type = $(cols[2]).text().trim();
                 const min = parseInt($(cols[3]).text().trim());
                 
                 if (!isNaN(min)) {
                     subs.push({ min, in: inPlayer, out: outPlayer });
                 }
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

                 if (!isNaN(min)) {
                     cards.push({ min, type: translatedType, player: playerStr, team: activeTeam, licenseId });
                 }
             }
         });
    });

    const matchData = {
      id: matchId,
      date,
      homeTeam,
      awayTeam,
      homeLogo,
      awayLogo,
      score: { home: homeScore, away: awayScore },
      lineups,
      scorers,
      subs,
      cards,
      phase
    };

    return matchData;
  } catch (error) {
    return null;
  }
}

async function run() {
  const finalMatches = [];
  console.log(`🏉 Fetching ${ALL_IDS.length} matches and filtering...`);

  // Process in chunks to be fast
  const chunkSize = 15;
  for (let i = 0; i < ALL_IDS.length; i += chunkSize) {
    const chunk = ALL_IDS.slice(i, i + chunkSize);
    const promises = chunk.map(id => fetchMatch(id));
    const results = await Promise.all(promises);
    
    results.forEach((match, idx) => {
      const id = chunk[idx];
      if (match) {
        finalMatches.push(match);
        console.log(`  ✅ [${id}] ${match.homeTeam} ${match.score.home}-${match.score.away} ${match.awayTeam}`);
      }
    });
    await delay(100);
  }

  const dest = path.join(process.cwd(), 'src', 'data', 'dhc_matches.json');
  fs.writeFileSync(dest, JSON.stringify(finalMatches, null, 2));
  console.log(`\n✅ Saved ${finalMatches.length} DHC matches to ${dest}`);
}

run();
