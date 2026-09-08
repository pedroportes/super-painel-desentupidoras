const https = require('https');
const fs = require('fs');

const url = 'https://docs.google.com/spreadsheets/d/1g2snXkPohdDVS75nHTCJJP4JW6XiLOjE8OqxlGiencE/gviz/tq?tqx=out:csv';

function fetchCsv(uri) {
  https.get(uri, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      fetchCsv(res.headers.location);
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lines = data.split('\n').filter(l => l.trim());
        console.log('Total linhas na planilha nova:', lines.length);
        console.log('Header:', lines[0]);
        console.log('\n=== TOP 25 CIDADES DA NOVA PLANILHA ===');

        const existingCities = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/cities.json', 'utf8'));
        const existingMap = new Set(existingCities.map(c => c.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));

        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cells = [];
          let inQuotes = false;
          let token = '';
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cells.push(token.trim());
              token = '';
            } else {
              token += char;
            }
          }
          cells.push(token.trim());

          const ranking = cells[0];
          const cidade = cells[1];
          const uf = cells[2];
          const pop = cells[3];
          const notaOportunidade = cells[4];
          const status = cells[5] || '';
          const notaFinal = cells[14] || cells[4];

          const normName = (cidade || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const isAlreadyDone = existingMap.has(normName);

          if (!isAlreadyDone && count < 20) {
            count++;
            console.log(`${count}. [Rank #${ranking}] ${cidade} - ${uf} | Pop: ${pop} | Pontuação/Nota: ${notaFinal} | Status Planilha: ${status}`);
          }
        }
      });
    }
  });
}

fetchCsv(url);
