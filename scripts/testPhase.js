import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const res = await axios.get('https://matchready.es/rugbycat/web/ca/public/competition/8077/match_statistics/');
  const $ = cheerio.load(res.data);
  let phase = '';
  $('.breadcrumb li, .title, h1, h2, h3, h4, .bs-callout, .row').each((i, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('jornada') || text.toLowerCase().includes('final')) {
      console.log('Found:', text);
      phase = text;
    }
  });
  console.log('Phase text found:', phase);
}
test();
