const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/12fOKqAh5fL6OqKxAr9y0nF7UyH5_IBAT4R0k8ksNkp0/gviz/tq?tqx=out:csv';

https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n').filter(l => l.trim());
    console.log('=== TOP 20 CIDADES LIVRES DA PLANILHA (POR ORDEM DE RANKING/PONTUAÇÃO) ===');
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex parsing for CSV quotes
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
      const status = cells[5];
      const barra = cells[13];
      const notaFinal = cells[14];

      if (status && status.includes('livre')) {
        count++;
        console.log(`${count}. [Rank #${ranking}] ${cidade} - ${uf} | Pop: ${pop} | Nota Final: ${notaFinal} | Concorrência Fraca: ${barra || 'Nenhum'}`);
        if (count >= 20) break;
      }
    }
  });
});
