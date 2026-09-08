const https = require('https');

https.get('https://desentupidora-pousoalegre.pages.dev/fora-da-area-de-cobertura/', res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    console.log('Robots tag em /fora-da-area-de-cobertura/:', robotsMatch ? robotsMatch[1] : 'NÃO ENCONTRADA');
    
    const waMatches = [...html.matchAll(/href=["'](https:\/\/wa\.me\/[^"']+)["']/gi)];
    console.log('Links de WhatsApp encontrados:');
    waMatches.forEach(m => console.log(' -', m[1]));
  });
});
