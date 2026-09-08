const https = require('https');

https.get('https://desentupidora-medianeira.pages.dev/frimesa/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const hasIframe = data.includes('<iframe');
    const iframeSrcMatch = data.match(/<iframe[^>]*src="([^"]*)"/i);
    console.log('✅ Bairro Frimesa possui iframe ativo:', hasIframe);
    console.log('📍 Iframe src:', iframeSrcMatch ? iframeSrcMatch[1] : 'não encontrado');
  });
});
