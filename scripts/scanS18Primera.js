import axios from 'axios';
import * as cheerio from 'cheerio';

async function scan() {
  console.log("Scanning for S18 1a Catalana matches from 8500 to 9400...");
  const found = [];
  const startId = 8500;
  const endId = 9400;
  const batchSize = 40;

  for (let i = startId; i <= endId; i += batchSize) {
    const promises = [];
    for (let j = 0; j < batchSize && (i + j) <= endId; j++) {
      const id = i + j;
      promises.push((async () => {
        try {
          const url = `https://matchready.es/rugbycat/web/ca/public/competition/${id}/match_statistics/`;
          const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
          const $ = cheerio.load(res.data);
          const cat = $('.col-lg-4.text-center').first().text().trim();
          if (cat === 'S18 1a Catalana') {
            const teams = $('.bs-callout h4').map((i, el) => $(el).text().trim()).get().slice(0, 2);
            console.log(`Found S18 1a [${id}]: ${teams.join(' vs ')}`);
            found.push(id);
          }
        } catch (e) { /* ignore */ }
      })());
    }
    await Promise.all(promises);
  }

  console.log("\nAll S18 1a Catalana IDs found:", found.sort((a,b)=>a-b));
}

scan();
