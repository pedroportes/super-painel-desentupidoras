const https = require('https');

function inspectUrl(url) {
  https.get(url, (res) => {
    console.log(`=== INSPEÇÃO DE ${url} ===`);
    console.log('Status HTTP:', res.statusCode);
    console.log('Headers:', res.headers);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Tamanho do body:', body.length);
      console.log('Title:', (body.match(/<title>(.*?)<\/title>/i) || [])[1]);
      console.log('Meta Description:', (body.match(/name="description"\s+content="(.*?)"/i) || [])[1]);
      console.log('Primeiros 500 caracteres do body:');
      console.log(body.slice(0, 500));
    });
  }).on('error', (e) => console.error(e));
}

inspectUrl('https://desentupidora-curitiba.pages.dev/');
