const https = require('https');
const fs = require('fs');

const url = 'https://docs.google.com/spreadsheets/d/1g2snXkPohdDVS75nHTCJJP4JW6XiLOjE8OqxlGiencE/gviz/tq?tqx=out:json';

https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const jsonStr = data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonStr);

    const existingCities = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/cities.json', 'utf8'));
    const existingMap = new Set(existingCities.map(c => c.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));

    const rows = parsed.table.rows.map((r, i) => {
      const getVal = idx => (r.c[idx] ? r.c[idx].v : null);
      const getFmt = idx => (r.c[idx] ? (r.c[idx].f || r.c[idx].v) : '');
      
      const ranking = getVal(0);
      const cidade = getVal(1);
      const uf = getVal(2);
      const populacao = getVal(3) || 0;
      const status = getVal(5) || '';
      const indiceFmt = getFmt(12);
      const indiceConc = parseFloat(indiceFmt) || 0;
      const barra = getVal(13) || '';
      const notaFinal = getVal(14) || 0;

      return {
        ranking,
        cidade,
        uf,
        populacao,
        status,
        indiceFmt,
        indiceConc,
        barra,
        notaFinal
      };
    });

    console.log('=== CIDADES LIVRES COM NOTA / ÍNDICE = 1.111 (OU 1.1...) ===');
    const filtered = rows.filter(r => {
      if (!r.cidade) return false;
      const norm = r.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (existingMap.has(norm)) return false;
      return r.indiceFmt && r.indiceFmt.startsWith('1.1');
    });

    // Ordenar pelo ranking da planilha
    filtered.slice(0, 15).forEach((c, idx) => {
      console.log(`${idx + 1}. [Rank #${c.ranking}] ${c.cidade} - ${c.uf} | Pop: ${c.populacao} | Indice M: ${c.indiceFmt} | Barra N: ${c.barra} | NotaFinal O: ${c.notaFinal} | Status: ${c.status}`);
    });
  });
});
