const fs = require('fs');
const path = require('path');
const https = require('https');

const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const apiKey = settings.serper && settings.serper.apiKey;

if (!apiKey) {
  console.log('Chave do Serper não configurada');
  process.exit(1);
}

const cities = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/cities.json', 'utf8'));

async function checkIndex(query) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      q: query,
      gl: 'br',
      hl: 'pt-br'
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
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ error: e.message });
        }
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== VERIFICAÇÃO DE INDEXAÇÃO NO GOOGLE (SERPER API) ===\n');

  // Testando primeiras 10 cidades
  for (let i = 0; i < Math.min(10, cities.length); i++) {
    const c = cities[i];
    const dom = c.dominio || c.deployUrl || '';
    const cleanDom = dom.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // 1. site:dominio
    const res1 = await checkIndex(`site:${cleanDom}`);
    const count1 = (res1.organic || []).length;
    
    console.log(`[${i+1}] ${c.cidade} (${c.uf}) - Domínio: ${cleanDom}`);
    if (count1 > 0) {
      console.log(`   ✅ INDEXADO! ${count1} resultado(s) encontrados no Google.`);
      res1.organic.slice(0, 2).forEach(o => {
        console.log(`      🔗 ${o.title} -> ${o.link}`);
      });
    } else {
      console.log(`   ⏳ Ainda não indexado pelo Google via site:${cleanDom}`);
    }

    // 2. Se for domínio próprio, testar também o subdomínio .pages.dev correspondente
    if (cleanDom.includes('.com.br')) {
      const pagesSub = `desentupidora-${c.id}.pages.dev`;
      const resPages = await checkIndex(`site:${pagesSub}`);
      const countPages = (resPages.organic || []).length;
      if (countPages > 0) {
        console.log(`   🌐 Subdomínio Pages.dev (${pagesSub}) está INDEXADO: ${countPages} página(s).`);
        resPages.organic.slice(0, 2).forEach(o => console.log(`      🔗 ${o.title} -> ${o.link}`));
      }
    }

    console.log('----------------------------------------------------');
  }
}

run().catch(console.error);
