import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const ids = [7708, 8746];
  for (const id of ids) {
    try {
      const url = `https://matchready.es/rugbycat/web/ca/public/competition/${id}/match_statistics/`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(res.data);
      console.log(`\n--- Match ID ${id} ---`);
      $('.col-lg-4.text-center').each((i, el) => {
        console.log(`Div ${i}: "${$(el).text().trim()}"`);
      });
    } catch (e) {
      console.error(e);
    }
  }
}
test();
