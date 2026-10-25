import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';

// All S18 1a Catalana matches (updated 2026-08-08)
const MATCH_IDS = [
  7792, 7793, 7794, 7834, 7835, 7836, 7893, 7894, 7895, 7941, 7942, 7943, 
  7992, 7993, 7994, 8046, 8047, 8048, 8124, 8125, 8126, 8168, 8169, 8281, 
  8282, 8322, 8323, 8383, 8384, 8385, 8435, 8436, 8519, 8520, 8556, 8557,
  8810, 8811, 8838
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchMatchData(matchId) {
  try {
    const url = `https://matchready.es/rugbycat/web/ca/public/competition/${matchId}/match_statistics/`;
    console.log(`[${matchId}] Fetching data...`);
    
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const html = res.data;
    const $ = cheerio.load(html);

    // Category filter — only process S18 1a Catalana matches
    const categoryText = $('.col-lg-4.text-center').first().text().trim();
    if (categoryText !== 'S18 1a Catalana') {
      console.log(`[${matchId}] Skipping — not S18 1a Catalana (found: "${categoryText}")`);
      return null;
    }

    const matchHeader = $('.title span').text().trim() || $('title').text().trim();
    if (!matchHeader) throw new Error("Match page not found or invalid format");

    let homeTeam = "Unknown Home";
    let awayTeam = "Unknown Away";
    let homeLogo = "";
    let awayLogo = "";
    
    // Extract team names and logos
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

    // Attempt to extract Score
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

    // Date
    let date = "Unknown Date";
    $('.row.text-justify').each((i, el) => {
        const txt = $(el).text();
        if (txt.includes('El dia')) {
            const match = txt.match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/);
            if (match) date = match[0];
        }
    });

    // Parse Lineups
    const lineups = {};
    lineups[homeTeam] = [];
    lineups[awayTeam] = [];
    
    // The first two tables inside modal or main view are lineups
    const tables = $('table.table');
    let teamIdx = 0;

    tables.each((tableIdx, tableEl) => {
       // Look for lineup tables (they have specific headers)
       const thText = $(tableEl).find('th').text().toLowerCase();
       if (thText.includes("dorsal") && thText.includes("cognoms") && !thText.includes("entrenador") && !thText.includes("delegat")) {
           let activeTeam = teamIdx === 0 || teamIdx === 1 ? homeTeam : awayTeam; // Home team has 2 blocks (starters, subs)
           if (teamIdx >= 2 && teamIdx < 4) activeTeam = awayTeam;
           if (teamIdx > 3) return; // Ignore referee tables

           let isStarter = teamIdx === 0 || teamIdx === 2;

           $(tableEl).find('tbody tr').each((i, tr) => {
               const cols = $(tr).find('td');
               if (cols.length >= 4) {
                   const number = parseInt($(cols[0]).text().trim());
                   // td 1 is asterisk
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

    // Parse Scorers
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
                
                // Find licenseId from lineup
                const lp = lineups[activeTeam].find(p => p.name === playerStr);
                const licenseId = lp ? lp.licenseId : `UN-${playerStr}`;

                if (!isNaN(min)) {
                    scorers.push({ min, type: translatedType, player: playerStr, team: activeTeam, licenseId });
                }
            }
        });
    });

    // Parse Subs
    const subs = [];
    // The "Canvis" tables are portlet-blue
    $('.portlet-blue .table').each((i, tableEl) => {
         $(tableEl).find('tbody tr').each((j, tr) => {
             const cols = $(tr).find('td');
             if (cols.length >= 4) {
                 const inPlayer = $(cols[0]).text().trim();
                 const outPlayer = $(cols[1]).text().trim();
                 const type = $(cols[2]).text().trim(); // "Cambio táctico" o "Sangre"
                 const min = parseInt($(cols[3]).text().trim());
                 
                 if (!isNaN(min)) {
                     subs.push({ min, in: inPlayer, out: outPlayer });
                 }
             }
         });
    });
    
    // Parse Cards
    const cards = [];
    $('.portlet-red .table, .portlet-orange .table').each((i, tableEl) => {
         let activeTeam = $(tableEl).closest('.portlet').find('h4').text().toLowerCase().includes('local') ? homeTeam : awayTeam;
         
         $(tableEl).find('tbody tr').each((j, tr) => {
             const cols = $(tr).find('td');
             if (cols.length >= 4) {
                 const min = parseInt($(cols[0]).text().trim());
                 const typeRaw = $(cols[1]).text().trim(); // SG, TV
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

    return {
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
  } catch (error) {
    console.error(`[${matchId}] Error: ${error.message}`);
    return null;
  }
}

async function scrapeAll() {
  const result = [];
  console.log(`Starting scrape of ${MATCH_IDS.length} matches...`);
  
  for (const id of MATCH_IDS) {
    const data = await fetchMatchData(id);
    if (data) {
        if (data.homeTeam !== "Unknown Home" && Object.keys(data.lineups).length > 0) {
            result.push(data);
            console.log(`[${id}] Done. ${data.homeTeam} vs ${data.awayTeam}. Subs: ${data.subs.length}, Scorers: ${data.scorers.length}`);
        } else {
            console.log(`[${id}] Parsing likely failed, skipping. Check match format.`);
        }
    }
    await delay(1000); // polite delay
  }
  
  const destPath = path.join(process.cwd(), 'src', 'data', 'matches.json');
  fs.writeFileSync(destPath, JSON.stringify(result, null, 2));
  console.log(`Successfully saved ${result.length} matches to ${destPath}`);
}

scrapeAll();
