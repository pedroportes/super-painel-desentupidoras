const https = require('https');
const fs = require('fs');
const path = require('path');

const CITIES_FILE = path.join(__dirname, '../apps/web-dashboard/data/cities.json');
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf8'));
const idx = cities.findIndex(c => c.id === 'frutal');
if (idx >= 0) {
  cities[idx].deployUrl = 'https://desentupidora-frutal.pages.dev';
  cities[idx].status = 'ativo';
  cities[idx].lastDeployAt = new Date().toISOString();
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf8');
  console.log('✅ cities.json atualizado com sucesso!');
}

const urls = [
  'https://desentupidora-frutal.pages.dev/',
  'https://desentupidora-frutal.pages.dev/centro/',
  'https://desentupidora-frutal.pages.dev/desentupimento-de-esgoto-em-frutal/',
  'https://desentupidora-frutal.pages.dev/limpeza-de-fossa-septica-em-frutal/',
  'https://desentupidora-frutal.pages.dev/llms.txt',
  'https://desentupidora-frutal.pages.dev/sitemap-index.xml'
];

async function checkUrl(u) {
  return new Promise((resolve) => {
    https.get(u, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : (data.length > 50 ? data.slice(0, 50).trim() : data.trim());
        resolve({ url: u, status: res.statusCode, title });
      });
    }).on('error', (err) => {
      resolve({ url: u, status: 'ERROR', title: err.message });
    });
  });
}

(async () => {
  console.log('🌐 Verificando páginas publicadas ao vivo:');
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(`[HTTP ${res.status}] ${res.url} -> Title: ${res.title}`);
  }
})();
