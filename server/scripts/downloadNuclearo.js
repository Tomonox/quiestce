import https from 'node:https';
import fs from 'node:fs';
import { URL } from 'node:url';

function downloadFile(url, destPaths) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://stealabr.fandom.com/'
      }
    };
    https.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPaths).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed status code: ' + res.statusCode));
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        for (const dest of destPaths) {
          const dir = dest.substring(0, dest.lastIndexOf('/'));
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(dest, buffer);
          console.log(`Saved to ${dest} (${buffer.length} bytes)`);
        }
        resolve(buffer);
      });
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://static.wikia.nocookie.net/stealabr/images/b/b5/Nuclearo_Dinossauro.png';
  console.log('Downloading Nuclearo Dinossauro from:', url);
  await downloadFile(url, [
    'client/public/images/brainrots/nuclearo_dinossauro.png',
    'server/data/images/nuclearo_dinossauro.png',
    'client/dist/images/brainrots/nuclearo_dinossauro.png'
  ]);
  console.log('All destinations written successfully!');
}

main().catch(console.error);
