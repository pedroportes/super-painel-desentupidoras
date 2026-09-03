const fs = require('fs');

function parseCsvLine(line) {
  const out = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

const rawPath = 'banco_cidades_raw.csv';
const raw = fs.readFileSync(rawPath, 'utf8');
const rawLines = raw.split('\n').filter(l => l.trim().length > 0);

const rows = [];
for (let i = 1; i < rawLines.length; i++) {
  const cols = parseCsvLine(rawLines[i]);
  const cidade = (cols[0] || '').trim();
  const uf = (cols[1] || '').trim();
  const populacao = (cols[2] || '').trim();
  const notaOportunidade = (cols[34] || '').trim();
  const rankingParcial = (cols[35] || '').trim();
  if (!cidade || !rankingParcial) continue;
  rows.push({ cidade, uf, populacao, notaOportunidade, rankingParcial: parseInt(rankingParcial, 10) });
}
rows.sort((a, b) => a.rankingParcial - b.rankingParcial);

const statusMap = new Map(Object.entries({
  'Cachoeiro de Itapemirim': 'cadastrada', 'Guarapuava': 'cadastrada',
  "Santa Bárbara d'Oeste": 'cadastrada', 'Itabuna': 'cadastrada',
  'São Caetano do Sul': 'cadastrada', 'Poços de Caldas': 'cadastrada',
  'Ferraz de Vasconcelos': 'cadastrada', 'Jaraguá do Sul': 'cadastrada',
  'Linhares': 'cadastrada', 'Araucária': 'cadastrada', 'Porto Seguro': 'cadastrada',
}));

const cidadeUfToUf = {};
rows.forEach(r => { cidadeUfToUf[r.cidade] = r.uf; });

const serpData = {
  'Cachoeiro de Itapemirim|ES': { social: 2, dir: 1, market: 0, site: 6, total: 9 },
  'Guarapuava|PR': { social: 1, dir: 1, market: 0, site: 6, total: 8 },
  "Santa Bárbara d'Oeste|SP": { social: 1, dir: 0, market: 0, site: 8, total: 9 },
  'Itabuna|BA': { social: 2, dir: 2, market: 0, site: 5, total: 9 },
  'São Caetano do Sul|SP': { social: 0, dir: 0, market: 0, site: 9, total: 9 },
  'Poços de Caldas|MG': { social: 0, dir: 3, market: 0, site: 6, total: 9 },
  'Ferraz de Vasconcelos|SP': { social: 0, dir: 0, market: 0, site: 9, total: 9 },
  'Jaraguá do Sul|SC': { social: 2, dir: 0, market: 0, site: 7, total: 9 },
  'Pindamonhangaba|SP': { social: 0, dir: 0, market: 0, site: 9, total: 9 },
  'Fazenda Rio Grande|PR': { social: 1, dir: 0, market: 0, site: 8, total: 9 },
  'Linhares|ES': { social: 1, dir: 1, market: 0, site: 6, total: 8 },
  'Mogi Guaçu|SP': { social: 1, dir: 0, market: 0, site: 8, total: 9 },
};

const resultFiles = ['lote1_resultado.csv', 'lote2_resultado.csv', 'lote3_resultado.csv', 'lote4_resultado.csv', 'lote5_todas_restantes_resultado.csv'];
for (const file of resultFiles) {
  if (!fs.existsSync(file)) continue;
  const rlines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(1);
  for (const line of rlines) {
    const cols = parseCsvLine(line);
    const cidade = cols[0].trim();
    const uf = cols[1].trim() || cidadeUfToUf[cidade] || '';
    if (cols[2] === 'ERRO' || cols[2] === '') continue;
    const total = parseInt(cols[3], 10);
    const social = parseInt(cols[4], 10);
    const dir = parseInt(cols[5], 10);
    const market = parseInt(cols[6], 10);
    const site = parseInt(cols[7], 10);
    serpData[cidade + '|' + uf] = { social, dir, market, site, total };
  }
}

function csvField(v) {
  v = String(v);
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}

// Versao compacta: SEM formulas do Sheets — valores ja calculados em JS.
// Motivo: a versao com formulas REPT()/IF() por linha (x522) gerou um CSV
// grande demais pra caber em uma unica resposta do modelo (o upload anterior
// cortou na metade). Trocando formula por valor plano reduz o tamanho do
// arquivo em mais da metade, sem perder nenhuma informacao (o Sheets ainda
// mostra os numeros e a barra de texto — so deixam de ser "vivos"/editaveis
// via formula, o que nao importa aqui pois e um snapshot de analise).
const header = [
  'Ranking', 'Cidade', 'UF', 'Populacao', 'NotaOportunidadeParcial', 'Status',
  'SERP_Keyword', 'Sociais', 'Diretorios', 'Marketplaces', 'SitesProprios',
  'TotalResultadosSERP', 'IndiceConcorrenciaFraca', 'BarraConcorrenciaFraca',
  'NotaFinal', 'Observacoes'
];
const outLines = [header.map(csvField).join(',')];

function barra(pct) {
  const n = Math.round(pct * 10);
  return '█'.repeat(n) + '░'.repeat(10 - n);
}

rows.forEach((r) => {
  const status = statusMap.get(r.cidade) || 'livre';
  const statusVisual = status === 'cadastrada' ? '🟢 cadastrada' : '🟡 livre';
  const key = r.cidade + '|' + r.uf;
  const serp = serpData[key];

  let sociais = '', diretorios = '', marketplaces = '', sitesProprios = '', total = '';
  let indice = '', barraTxt = '';
  const notaOp = parseFloat(r.notaOportunidade) || 0;
  let notaFinal = notaOp;
  if (serp) {
    sociais = serp.social; diretorios = serp.dir; marketplaces = serp.market;
    sitesProprios = serp.site; total = serp.total;
    const idx = (serp.social + serp.dir + serp.market) / serp.total;
    indice = idx.toFixed(4);
    barraTxt = barra(idx);
    notaFinal = notaOp * (1 + idx);
  }

  const row = [
    r.rankingParcial, r.cidade, r.uf, r.populacao, r.notaOportunidade, statusVisual,
    serp ? ('desentupidora ' + r.cidade) : '',
    sociais, diretorios, marketplaces, sitesProprios, total,
    indice, barraTxt, Math.round(notaFinal), ''
  ];
  outLines.push(row.map(csvField).join(','));
});

const extraCidades = [
  { cidade: 'Joinville', uf: 'SC', pop: '~600000', serp: { social: 1, dir: 0, market: 0, site: 8, total: 9 } },
  { cidade: 'Maringá', uf: 'PR', pop: '~430000', serp: { social: 1, dir: 0, market: 0, site: 6, total: 7 } },
];
extraCidades.forEach((e) => {
  const idx = (e.serp.social + e.serp.dir + e.serp.market) / e.serp.total;
  const row = [
    'fora-do-universo', e.cidade, e.uf, e.pop, '', '🟢 cadastrada',
    'desentupidora ' + e.cidade,
    e.serp.social, e.serp.dir, e.serp.market, e.serp.site, e.serp.total,
    idx.toFixed(4), barra(idx), '',
    'Fora do universo de 524 cidades (populacao > 200k) - publicada mesmo assim'
  ];
  outLines.push(row.map(csvField).join(','));
});

const outPath = 'scoring_concorrencia_serp_2026-09-03.csv';
const content = outLines.join('\n') + '\n';
fs.writeFileSync(outPath, content, 'utf8');
console.log('Total de linhas:', outLines.length);
console.log('Tamanho do arquivo (bytes):', Buffer.byteLength(content, 'utf8'));
console.log('Cidades com dados SERP preenchidos:', Object.keys(serpData).length);
