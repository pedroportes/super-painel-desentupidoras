const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/1g2snXkPohdDVS75nHTCJJP4JW6XiLOjE8OqxlGiencE/gviz/tq?tqx=out:csv';

https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n').filter(l => l.trim());
    console.log('--- LINHAS 425 a 450 (ONDE COMEÇA A NOTA ZERO) ---');
    for (let i = 420; i < Math.min(450, lines.length); i++) {
      console.log(`Linha ${i}: ${lines[i]}`);
    }
  });
});
