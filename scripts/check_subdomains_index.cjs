const fs = require('fs');
const https = require('https');

const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const apiKey = settings.serper && settings.serper.apiKey;

const cities = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/cities.json', 'utf8'));

async function searchGoogle(query) {
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
  console.log('=== VARREDURA DE SUBDOMÍNIOS REAIS (.pages.dev, .vercel.app, .netlify.app) ===\n');

  const indexed = [];
  const waiting = [];

  for (let i = 0; i < cities.length; i++) {
    const c = cities[i];
    // URLs reais publicadas
    const candidates = [];
    if (c.deployUrl) {
      candidates.push(c.deployUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''));
    }
    candidates.push(`desentupidora-${c.id}.pages.dev`);
    candidates.push(`desentupidora-${c.id}.vercel.app`);
    candidates.push(`desentupidora-${c.id}.netlify.app`);

    const uniqueCandidates = [...new Set(candidates)];
    let cityFound = false;

    for (const sub of uniqueCandidates) {
      const res = await searchGoogle(`site:${sub}`);
      const count = (res.organic || []).length;
      if (count > 0) {
        cityFound = true;
        indexed.push({
          cidade: c.cidade,
          uf: c.uf,
          subdominio: sub,
          paginas: count,
          detalhes: res.organic
        });
        break;
      }
    }

    if (!cityFound) {
      waiting.push({ cidade: c.cidade, uf: c.uf, subdominio: `desentupidora-${c.id}.pages.dev` });
    }
  }

  console.log('----------------------------------------------------');
  console.log(`📊 TOTAL CIDADES VERIFICADAS: ${cities.length}`);
  console.log(`✅ TOTAL INDEXADAS PELO GOOGLE: ${indexed.length}`);
  console.log(`⏳ TOTAL AGUARDANDO RASTREAMENTO DO GOOGLEBOT: ${waiting.length}`);
  console.log('----------------------------------------------------\n');

  if (indexed.length > 0) {
    console.log('🏆 CIDADES JÁ INDEXADAS NO GOOGLE (SUBDOMÍNIOS OFICIAIS):');
    indexed.forEach((item, idx) => {
      console.log(`\n[${idx + 1}] ${item.cidade} (${item.uf}) -> https://${item.subdominio}`);
      console.log(`    Páginas no índice: ${item.paginas}`);
      item.detalhes.forEach(d => console.log(`    🔗 ${d.title} (${d.link})`));
    });
  } else {
    console.log('ℹ️ Nenhum subdomínio (.pages.dev / .vercel.app) apareceu indexado no Google ainda.');
  }
}

run().catch(console.error);
