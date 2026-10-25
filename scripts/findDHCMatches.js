/**
 * DHC Match Discovery Script
 * Scans MatchReady IDs to find Senior Masculí Divisió d'Honor Catalana matches
 * Saves found IDs and match info to dhc_matches_found.json
 * 
 * Run with: node scripts/findDHCMatches.js
 */
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';

// DHC clubs known from rugby.cat: Santboiana, BUC, Cornellà (CORNE/CRUC), CN Poble Nou (CNPN),
// Gòtics, CR Tarragona, etc. Fénix might be Copa only.
// We scan around the S18 range (7792–8557) and ± 300 IDs above/below
const SCAN_RANGES = [
  // Try slightly below and above S18 range
  { start: 7700, end: 7791 },
  { start: 8560, end: 8800 },
];

// Known DHC teams (from probing IDs 8600, 8700)
const DHC_TEAM_KEYWORDS = [
  'SANTBOIANA', 'BUC', 'BARCELONA UNIVERSITARI',
  'CORNE', 'CNPN', 'POBLE NOU', 'GOTICS', 'GÒTICS',
  'TARRAGONA', 'SITGES', 'SANT CUGAT', 'BADALONA',
  'HOSPITALET', 'HOSPITALET', 'ESPARRAGUERA',
  'CORNELLA', 'CORNELLÀ', 'FÉNIX', 'FENIX', 'CR TARRAGONA'
];

// Identify if a match is likely DHC by checking if both teams match known senior clubs
function likelyDHC(homeTeam, awayTeam) {
  const h = homeTeam.toUpperCase();
  const a = awayTeam.toUpperCase();
  return DHC_TEAM_KEYWORDS.some(k => h.includes(k)) && DHC_TEAM_KEYWORDS.some(k => a.includes(k));
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
    if (!titleEl) return null;  // invalid page

    const teamHeaders = [];
    $('.bs-callout').each((i, el) => {
      const text = $(el).find('h4').text().trim().toUpperCase();
      if (text) teamHeaders.push(text);
    });

    if (teamHeaders.length < 2) return null;
    const [homeTeam, awayTeam] = teamHeaders;

    // Extract score
    let homeScore = 0, awayScore = 0;
    $('.bs-callout').each((i, el) => {
      const s = parseInt($(el).find('h1 b').text().replace('Punts', '').trim());
      if (!isNaN(s)) { if (i === 0) homeScore = s; if (i === 1) awayScore = s; }
    });

    // Extract date
    let date = 'Unknown';
    $('.row.text-justify').each((_, el) => {
      const txt = $(el).text();
      if (txt.includes('El dia')) {
        const m = txt.match(/[0-9]{2}-[0-9]{2}-[0-9]{4}/);
        if (m) date = m[0];
      }
    });

    return { id: matchId, homeTeam, awayTeam, score: `${homeScore}-${awayScore}`, date };
  } catch {
    return null;
  }
}

async function discover() {
  const dhcMatches = [];
  const allFound = [];

  for (const range of SCAN_RANGES) {
    console.log(`\n📡 Scanning IDs ${range.start}–${range.end}...`);
    for (let id = range.start; id <= range.end; id++) {
      const match = await probeMatch(id);
      if (match) {
        allFound.push(match);
        if (likelyDHC(match.homeTeam, match.awayTeam)) {
          dhcMatches.push(match);
          console.log(`  ✅ [${id}] DHC: ${match.homeTeam} vs ${match.awayTeam} | ${match.score} | ${match.date}`);
        } else {
          console.log(`  ℹ️  [${id}] Other: ${match.homeTeam} vs ${match.awayTeam}`);
        }
      } else {
        process.stdout.write('.');
      }
      await delay(700);
    }
  }

  const outPath = path.join(process.cwd(), 'dhc_matches_found.json');
  fs.writeFileSync(outPath, JSON.stringify({ dhcMatches, allFound }, null, 2));
  
  console.log(`\n\n🏆 Found ${dhcMatches.length} likely DHC matches.`);
  console.log(`📄 Full results saved to: ${outPath}`);
  console.log('\nDHC Match IDs to add to scraper:');
  console.log(JSON.stringify(dhcMatches.map(m => m.id)));
}

discover();
