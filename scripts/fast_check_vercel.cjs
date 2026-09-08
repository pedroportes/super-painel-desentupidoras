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
  const queries = cities.map(c => `site:desentupidora-${c.id}.vercel.app`);
  const batchRes = await Promise.all(queries.map(q => searchGoogle(q)));
  
  batchRes.forEach((r, i) => {
    const org = (r.results && r.results.organic) || [];
    const city = cities[i];
    if (org.length > 0) {
      console.log(`✅ [INDEXADO VERCEL] ${city.cidade} (${city.uf}) -> ${r.query} (${org.length} páginas)`);
      org.forEach(o => console.log(`   🔗 ${o.title} -> ${o.link}`));
    }
  });

  const queriesNetlify = ['site:desentupidorapocos.netlify.app', 'site:desentupidorasantabarbaradoeste.netlify.app'];
  const batchNetlify = await Promise.all(queriesNetlify.map(q => searchGoogle(q)));
  batchNetlify.forEach(r => {
    const org = (r.results && r.results.organic) || [];
    if (org.length > 0) {
      console.log(`✅ [INDEXADO NETLIFY] ${r.query} (${org.length} páginas)`);
    }
  });
}

run().catch(console.error);
