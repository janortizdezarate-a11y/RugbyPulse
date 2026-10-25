import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';

const ACTUAL_DHC_TEAMS = [
  'GÒTICS', 'GOTICS',
  'CE INEF LLEIDA', 'INEF LLEIDA',
  'QUÍMIC', 'QUIMIC',
  'CEU',
  'TARRAGONA',
  'CRUC',
  'BARÇA RUGBY BLAU', 'BARCA RUGBY BLAU',
  'CNPN B',
  'BUC B'
];

// Identify if a match is likely DHC by checking if both teams match known senior clubs
function likelyDHC(homeTeam, awayTeam) {
  const h = homeTeam.toUpperCase();
  const a = awayTeam.toUpperCase();
  return ACTUAL_DHC_TEAMS.some(k => h.includes(k)) && ACTUAL_DHC_TEAMS.some(k => a.includes(k));
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function probeMatch(matchId) {
  try {
    const url = `https://matchready.es/rugbycat/web/ca/public/competition/${matchId}/match_statistics/`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
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
  
  console.log(`\n📡 Scanning IDs 7700–7850 and 8560–8800...`);
  
  // Checking typical ranges for Rugby.cat competitions in 2025-2026
  for (let id = 7700; id <= 8800; id++) {
    // Skipping large gaps to speed it up if we don't find matches
    if (id > 7850 && id < 8560) continue; 

    const match = await probeMatch(id);
    if (match) {
      if (likelyDHC(match.homeTeam, match.awayTeam)) {
        dhcMatches.push(match);
        console.log(`  ✅ [${id}] DHC: ${match.homeTeam} vs ${match.awayTeam} | ${match.score}`);
      }
    }
    await delay(200);
  }

  const outPath = path.join(process.cwd(), 'actual_dhc_matches_found.json');
  fs.writeFileSync(outPath, JSON.stringify({ dhcMatches }, null, 2));
  
  console.log(`\n\n🏆 Found ${dhcMatches.length} actual DHC matches.`);
  console.log(JSON.stringify(dhcMatches.map(m => m.id)));
}

discover();
