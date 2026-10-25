import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';

const ACTUAL_DHC_TEAMS = [
  'GÒTICS RC', 'GOTICS RC',
  'CE INEF LLEIDA', 
  'QUÍMIC ER', 'QUIMIC ER',
  'CEU',
  'CR TARRAGONA',
  'CRUC',
  'BARÇA RUGBY BLAU', 'BARCA RUGBY BLAU',
  'CNPN B',
  'BUC B'
];

function isExactDHC(teamName) {
  const upper = teamName.toUpperCase().trim();
  return ACTUAL_DHC_TEAMS.some(t => upper === t);
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function probeMatch(matchId) {
  try {
    const url = `https://matchready.es/rugbycat/web/ca/public/competition/${matchId}/match_statistics/`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 5000
    });

    const $ = cheerio.load(res.data);
    const titleEl = $('.title span').text().trim() || $('title').text().trim();
    if (!titleEl) return null;

    const teamHeaders = [];
    $('.bs-callout').each((i, el) => {
      const text = $(el).find('h4').text().trim().toUpperCase();
      if (text) teamHeaders.push(text);
    });

    if (teamHeaders.length < 2) return null;
    const [homeTeam, awayTeam] = teamHeaders;

    let homeScore = 0, awayScore = 0;
    $('.bs-callout').each((i, el) => {
      const s = parseInt($(el).find('h1 b').text().replace('Punts', '').trim());
      if (!isNaN(s)) { if (i === 0) homeScore = s; if (i === 1) awayScore = s; }
    });

    return { id: matchId, homeTeam, awayTeam, score: `${homeScore}-${awayScore}` };
  } catch {
    return null;
  }
}

async function discover() {
  const dhcMatches = [];
  
  console.log(`\n📡 Scanning IDs 7000 to 10000...`);
  
  // Create an array of IDs to scan
  const ids = [];
  for (let i = 7000; i <= 10000; i++) ids.push(i);

  // We can scan in chunks to make it faster
  const chunkSize = 20;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const promises = chunk.map(id => probeMatch(id));
    const results = await Promise.all(promises);
    
    results.forEach((match, idx) => {
      if (match) {
        if (isExactDHC(match.homeTeam) && isExactDHC(match.awayTeam)) {
            // Include all, even 0-0, so we don't miss admin results
            dhcMatches.push(match);
            console.log(`  ✅ [${match.id}] DHC: ${match.homeTeam} vs ${match.awayTeam} | ${match.score}`);
        }
      }
    });
    // Tiny delay to not murder the server completely
    await delay(100);
  }

  const outPath = path.join(process.cwd(), 'actual_dhc_matches_found.json');
  fs.writeFileSync(outPath, JSON.stringify({ dhcMatches }, null, 2));
  
  console.log(`\n\n🏆 Found ${dhcMatches.length} actual DHC matches.`);
  console.log(JSON.stringify(dhcMatches.map(m => m.id)));
}

discover();
