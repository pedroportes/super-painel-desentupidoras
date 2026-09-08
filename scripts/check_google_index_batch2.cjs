const fs = require('fs');
const https = require('https');

const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const apiKey = settings.serper && settings.serper.apiKey;
const cities = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/cities.json', 'utf8'));

async function checkIndex(query) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ q: query, gl: 'br', hl: 'pt-br' });
    const options = {
      hostname: 'google.serper.dev',
      port: 443,
      path: '/search',
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({ error: e.message }); }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== VERIFICAÇÃO CIDADES 11 A 25 ===\n');
  for (let i = 10; i < Math.min(25, cities.length); i++) {
    const c = cities[i];
    const dom = c.dominio || c.deployUrl || '';
    const cleanDom = dom.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const res1 = await checkIndex(`site:${cleanDom}`);
    const count1 = (res1.organic || []).length;
    
    if (count1 > 0) {
      console.log(`[${i+1}] ✅ ${c.cidade} (${c.uf}) - ${cleanDom}: ${count1} páginas indexadas.`);
      res1.organic.slice(0, 1).forEach(o => console.log(`      🔗 ${o.title} -> ${o.link}`));
    } else {
      console.log(`[${i+1}] ⏳ ${c.cidade} (${c.uf}) - ${cleanDom}: aguardando indexação.`);
    }
  }
}

run().catch(console.error);
