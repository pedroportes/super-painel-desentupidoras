const fs = require('fs');
const https = require('https');

const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const apiKey = settings.serper && settings.serper.apiKey;

async function searchGoogle(query, location = 'Brazil') {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      q: query,
      gl: 'br',
      hl: 'pt-br',
      num: 10
    });

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

async function inspectCity(name, uf, domains, keywords) {
  console.log(`\n======================================================`);
  console.log(`🔎 ANÁLISE DETALHADA: ${name} (${uf})`);
  console.log(`======================================================`);

  // 1. Checar indexação por domínios/URLs
  console.log(`\n--- 1. INDEXAÇÃO DIRETA (site:) ---`);
  for (const dom of domains) {
    const res = await searchGoogle(`site:${dom}`);
    const results = res.organic || [];
    console.log(`▶ site:${dom} -> ${results.length} resultado(s) encontrados`);
    results.forEach((r, idx) => {
      console.log(`   [${idx+1}] ${r.title}`);
      console.log(`       URL: ${r.link}`);
      console.log(`       Snippet: ${r.snippet}\n`);
    });
  }

  // 2. Checar buscas orgânicas por termos de busca
  console.log(`--- 2. PRESENÇA NAS BUSCAS ORGÂNICAS ---`);
  for (const kw of keywords) {
    const res = await searchGoogle(kw);
    const results = res.organic || [];
    console.log(`\n▶ Busca: "${kw}" (Top 10 do Google Brasil):`);
    let found = false;
    results.forEach((r, idx) => {
      const match = domains.some(d => r.link.toLowerCase().includes(d.toLowerCase()));
      if (match) {
        found = true;
        console.log(`   ⭐ POSIÇÃO #${idx+1}: ${r.title} (${r.link})`);
      }
    });
    if (!found) {
      console.log(`   (Nenhum dos nossos domínios apareceu no top 10 para "${kw}" ainda)`);
      console.log(`   Líderes no top 3:`);
      results.slice(0, 3).forEach((r, i) => console.log(`      ${i+1}. ${r.title} - ${r.link}`));
    }
  }
}

async function main() {
  // 1. Linhares - ES
  await inspectCity(
    'Linhares', 'ES',
    ['desentupidoralinhares.com.br', 'desentupidora-linhares.pages.dev'],
    ['desentupidora em linhares', 'desentupidora linhares es', '"desentupidora linhares"']
  );

  // 2. Cachoeiro de Itapemirim - ES
  await inspectCity(
    'Cachoeiro de Itapemirim', 'ES',
    ['desentupidoracachoeiro.com.br', 'desentupidora-cachoeiro.pages.dev', 'desentupidoracachoeirodeitapemirim.com.br'],
    ['desentupidora em cachoeiro de itapemirim', 'desentupidora cachoeiro es', '"desentupidora cachoeiro"']
  );

  // 3. Poços de Caldas - MG
  await inspectCity(
    'Poços de Caldas', 'MG',
    ['desentupidorapocos.com.br', 'desentupidorapocosdecaldas.com.br', 'desentupidora-pocosdecaldas.pages.dev', 'desentupidorapocos.netlify.app'],
    ['desentupidora em pocos de caldas', 'desentupidora pocos de caldas mg', '"desentupidora pocos de caldas"']
  );
}

main().catch(console.error);
