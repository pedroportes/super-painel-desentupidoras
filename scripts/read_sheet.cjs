const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/12fOKqAh5fL6OqKxAr9y0nF7UyH5_IBAT4R0k8ksNkp0/gviz/tq?tqx=out:csv';

function fetchCsv(uri) {
  https.get(uri, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      fetchCsv(res.headers.location);
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lines = data.split('\n').filter(l => l.trim());
        console.log('--- TODAS AS CIDADES LIVRES (ORDEM DE PONTUAÇÃO/RANKING) ---');
        lines.slice(1).forEach(line => {
          // Parse CSV line
          const regex = /"([^"]*)"|([^,]+)/g;
          const matches = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            matches.push(match[1] !== undefined ? match[1] : match[2]);
          }
          const [ranking, cidade, uf, populacao, notaOportunidade, status, keyword, sociais, diretorios, marketplaces, sitesProprios, totalResultados, indiceConcorrencia, barra, notaFinal] = matches;
          if (status && status.includes('livre')) {
            console.log(`Rank #${ranking}: ${cidade} - ${uf} | Pop: ${populacao} | Nota Final: ${notaFinal} | Concorrência Fraca: ${barra || ''}`);
          }
        });
      });
    }
  });
}

fetchCsv(url);
