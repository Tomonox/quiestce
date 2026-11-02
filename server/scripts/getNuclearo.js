import https from 'node:https';
import fs from 'node:fs';
import { URL } from 'node:url';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    };
    https.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(data), text: Buffer.concat(data).toString('utf8'), status: res.statusCode }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Searching Fandom API for Nuclearo...');
  const apiRes = await fetchUrl('https://stealabr.fandom.com/api.php?action=query&list=search&srsearch=Nuclearo&format=json');
  console.log('API Status:', apiRes.status);
  console.log('Search text:', apiRes.text);
  
  // Also search for images matching nuclearo
  const imgSearch = await fetchUrl('https://stealabr.fandom.com/api.php?action=query&list=allimages&aifrom=Nuclearo&ailimit=10&format=json');
  console.log('Images query:', imgSearch.text);
}

run().catch(console.error);
