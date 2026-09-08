const https = require('https');
const fs = require('fs');
const path = require('path');

https.get('https://desentupidora-curitiba.pages.dev/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const file = path.join(__dirname, 'curitiba_original.html');
    fs.writeFileSync(file, body, 'utf8');
    console.log('Salvo curitiba_original.html com', body.length, 'bytes');
  });
});
