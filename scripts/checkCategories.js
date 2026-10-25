import axios from 'axios';
import * as cheerio from 'cheerio';

// Check what category label our known good S18 Primera matches have
const ids = [7792, 8811, 8838, 8521, 8558, 8606];

for (const id of ids) {
  const r = await axios.get(`https://matchready.es/rugbycat/web/ca/public/competition/${id}/match_statistics/`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(r.data);
  const cat = $('.col-lg-4.text-center').first().text().trim();
  const teams = $('.bs-callout h4').map((i, el) => $(el).text().trim()).get().slice(0, 2);
  console.log(`[${id}] Category: "${cat}" | ${teams.join(' vs ')}`);
}
