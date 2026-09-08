const fs = require('fs');
const https = require('https');

const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const apiKey = settings.serper && settings.serper.apiKey;
const cities = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/cities.json', 'utf8'));

function searchGoogle(query) {
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
        try { resolve({ query, results: JSON.parse(data) }); } catch (e) { resolve({ query, error: e.message }); }
      });
    });
    req.on('error', (e) => resolve({ query, error: e.message }));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== VARREDURA RÁPIDA DE SUBDOMÍNIOS .pages.dev / .vercel.app ===\n');
  const queries = cities.map(c => `site:desentupidora-${c.id}.pages.dev`);
  
  // Roda em lotes de 10
  const results = [];
  for (let i = 0; i < queries.length; i += 10) {
    const batch = queries.slice(i, i + 10);
    const batchRes = await Promise.all(batch.map(q => searchGoogle(q)));
    results.push(...batchRes);
  }

  const found = [];
  results.forEach((r, i) => {
    const org = (r.results && r.results.organic) || [];
    const city = cities[i];
    if (org.length > 0) {
      found.push({ city, query: r.query, count: org.length, items: org });
      console.log(`✅ [INDEXADO] ${city.cidade} (${city.uf}) -> ${r.query} (${org.length} páginas)`);
      org.forEach(o => console.log(`   🔗 ${o.title} -> ${o.link}`));
    }
  });

  console.log(`\n==============================================`);
  console.log(`Total verificados: ${cities.length}`);
  console.log(`Subdomínios .pages.dev indexados: ${found.length}`);
  console.log(`Subdomínios aguardando rastreamento do Googlebot: ${cities.length - found.length}`);
  console.log(`==============================================`);
}

run().catch(console.error);
