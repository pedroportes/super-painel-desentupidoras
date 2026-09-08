const https = require('https');
const fs = require('fs');

const url = 'https://docs.google.com/spreadsheets/d/1g2snXkPohdDVS75nHTCJJP4JW6XiLOjE8OqxlGiencE/gviz/tq?tqx=out:csv';

function analyzeSheet(uri) {
  https.get(uri, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      analyzeSheet(res.headers.location);
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lines = data.split('\n').filter(l => l.trim());
        console.log('Total de linhas:', lines.length);
        console.log('Header:', lines[0]);

        const rows = [];
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

          const [ranking, cidade, uf, populacao, notaOportunidadeParcial, status, serpKeyword, sociais, diretorios, marketplaces, sitesProprios, totalResultadosSERP, indiceConcorrenciaFraca, barraConcorrenciaFraca, notaFinal] = cells;
          
          rows.push({
            index: i,
            ranking,
            cidade,
            uf,
            populacao: parseInt(populacao) || 0,
            notaOportunidadeParcial: parseFloat(notaOportunidadeParcial) || 0,
            status,
            sociais,
            diretorios,
            marketplaces,
            sitesProprios,
            totalResultadosSERP,
            indiceConcorrenciaFraca: (indiceConcorrenciaFraca || '').replace(',', '.'),
            barraConcorrenciaFraca,
            notaFinal: parseFloat((notaFinal || '').replace(',', '.')) || 0
          });
        }

        console.log('\n--- AMOSTRA DAS PRIMEIRAS 20 LINHAS ---');
        rows.slice(0, 20).forEach(r => {
          console.log(`L#${r.index} [Rank #${r.ranking}] ${r.cidade} - ${r.uf} | Pop: ${r.populacao} | IndiceConc: ${r.indiceConcorrenciaFraca} | Barra: ${r.barraConcorrenciaFraca} | NotaFinal: ${r.notaFinal} | Status: ${r.status}`);
        });

        console.log('\n--- VERIFICANDO LINHAS COM ÍNDICE/BARRA = 0 OU NOTA FINAL = 0 ---');
        const zeros = rows.filter(r => r.indiceConcorrenciaFraca === '0' || r.indiceConcorrenciaFraca === '0.000' || r.notaFinal === 0);
        console.log(`Total de linhas com 0 no índice ou na nota final: ${zeros.length}`);
        console.log('Amostra de linhas com 0:');
        zeros.slice(0, 15).forEach(r => {
          console.log(`L#${r.index} [Rank #${r.ranking}] ${r.cidade} - ${r.uf} | Pop: ${r.populacao} | Sociais:${r.sociais} Dir:${r.diretorios} Mkt:${r.marketplaces} SitesProp:${r.sitesProprios} TotalSERP:${r.totalResultadosSERP} | IndiceConc: ${r.indiceConcorrenciaFraca} | NotaFinal: ${r.notaFinal} | Status: ${r.status}`);
        });
      });
    }
  });
}

analyzeSheet(url);
