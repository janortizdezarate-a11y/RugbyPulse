import axios from 'axios';
import * as cheerio from 'cheerio';

async function scan() {
  for (let i = 8818; i <= 8900; i++) {
    try {
      const res = await axios.get(`https://matchready.es/rugbycat/web/ca/public/competition/${i}/match_statistics/`);
      const $ = cheerio.load(res.data);
      let isDHC = false;
      $('.breadcrumb li, .title, h1, h2, h3, h4').each((_, el) => {
        const text = $(el).text().toUpperCase();
        if (text.includes('DHCAT') || text.includes('DIVISIÓ D\'HONOR CATALANA MASCULINA') || text.includes('DHC')) {
          isDHC = true;
        }
      });
      if (isDHC) {
        console.log('Found DHC match ID:', i);
      }
    } catch (e) {}
  }
}
scan();
