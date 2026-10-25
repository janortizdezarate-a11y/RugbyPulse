import axios from 'axios';
import * as cheerio from 'cheerio';

async function scan() {
  console.log("Scanning MatchReady IDs from 8500 to 9400 in parallel batches...");
  const foundDHC = [];
  const foundS18 = [];

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
          const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
          });
          const $ = cheerio.load(res.data);
          
          const div0Text = $('.col-lg-4.text-center').first().text().trim().toUpperCase();

          let isDHC = false;
          let isS18 = false;

          if (div0Text.includes("DHC") || div0Text.includes("M DHCAT") || div0Text.includes("DIVISIÓ D'HONOR")) {
            isDHC = true;
          }
          if (div0Text.includes("S18") || div0Text.includes("SUB 18") || div0Text.includes("SUB-18")) {
            if (div0Text.includes("1A") || div0Text.includes("PRIMERA") || div0Text.includes("CATALANA")) {
              // Exclude 7's or others
              if (!div0Text.includes("7'S") && !div0Text.includes("7S")) {
                isS18 = true;
              }
            }
          }

          if (isDHC) {
            console.log(`Found DHC Match ID [${id}]: ${div0Text} - ${$('.bs-callout h4').first().text().trim()} vs ${$('.bs-callout h4').eq(1).text().trim()}`);
            foundDHC.push(id);
          }
          if (isS18) {
            console.log(`Found S18 Match ID [${id}]: ${div0Text} - ${$('.bs-callout h4').first().text().trim()} vs ${$('.bs-callout h4').eq(1).text().trim()}`);
            foundS18.push(id);
          }
        } catch (e) {
          // ignore
        }
      })());
    }
    await Promise.all(promises);
  }

  console.log("\nScan complete!");
  console.log("DHC matches:", foundDHC.sort((a,b)=>a-b));
  console.log("S18 matches:", foundS18.sort((a,b)=>a-b));
}

scan();
