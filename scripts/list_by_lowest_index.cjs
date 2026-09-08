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
      const notaParcial = getVal(4) || 0;
      const status = getVal(5) || '';
      const sociais = getVal(7) || 0;
      const diretorios = getVal(8) || 0;
      const marketplaces = getVal(9) || 0;
      const sitesProprios = getVal(10) || 0;
      const totalSERP = getVal(11) || 0;
      const indiceConc = parseFloat(getFmt(12)) || 0;
      const barra = getVal(13) || '';
      const notaFinal = getVal(14) || 0;

      return {
        ranking,
        cidade,
        uf,
        populacao,
        notaParcial,
        status,
        sociais,
        diretorios,
        marketplaces,
        sitesProprios,
        totalSERP,
        indiceConc,
        barra,
        notaFinal
      };
    });

    console.log('=== CIDADES LIVRES ORDENADAS PELO MENOR ÍNDICE DE CONCORRÊNCIA (COLUNA M / BARRA N) ===');
    const livres = rows.filter(r => {
      if (!r.cidade) return false;
      const norm = r.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return !existingMap.has(norm);
    });

    // Ordenar pelo menor índice de concorrência (coluna M) e desempate por maior população
    livres.sort((a, b) => {
      if (a.indiceConc !== b.indiceConc) {
        return a.indiceConc - b.indiceConc; // Menor índice primeiro (mais baixa)
      }
      return b.populacao - a.populacao; // Maior população em caso de empate
    });

    livres.slice(0, 30).forEach((c, idx) => {
      console.log(`${idx + 1}. [Rank #${c.ranking}] ${c.cidade} - ${c.uf} | Pop: ${c.populacao} | Indice M: ${c.indiceConc} | Barra N: ${c.barra || '░░░░░░░░░░'} | NotaFinal O: ${c.notaFinal}`);
    });
  });
});
