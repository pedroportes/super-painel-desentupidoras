#!/usr/bin/env node
/**
 * Raspagem em massa da SERP orgânica do Google pra "desentupidora <cidade>",
 * via Serper.dev (https://serper.dev) — mesma finalidade de
 * serp_scrape_dataforseo.mjs, mas nesse provedor (DataForSEO travou numa
 * verificação de conta que não desbloqueou mesmo após ativação; Serper tem
 * 2.500 buscas grátis no cadastro e setup mais simples — 1 chave só, sem
 * verificação extra). Parte do projeto "Mapa de Oportunidades" (ver
 * docs/mapa-oportunidades-expansao.md) — o componente de concorrência que
 * ainda faltava na Nota Oportunidade.
 *
 * Credencial: variável de ambiente SERPER_API_KEY (nunca hardcoded aqui —
 * a chave real fica só em apps/web-dashboard/data/settings.json, que é
 * gitignored).
 *
 * Mesma classificação de domínio de serp_scrape_dataforseo.mjs: social /
 * diretório / marketplace / site_proprio, com Índice de Concorrência Fraca.
 *
 * Uso:
 *   SERPER_API_KEY=xxx node serp_scrape_serper.mjs --cidade "Jaraguá do Sul" --uf SC
 *   SERPER_API_KEY=xxx node serp_scrape_serper.mjs --csv cidades.csv --out resultado.csv
 */

import fs from 'fs';
import path from 'path';

const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!SERPER_API_KEY) {
  console.error('❌ Falta a credencial. Defina SERPER_API_KEY (ver serper.dev/api-key) antes de rodar este script.');
  process.exit(1);
}

// Mesma lista de domínios conhecidos do script DataForSEO — mantida em
// arquivo separado por enquanto pra não acoplar os dois scripts a um só
// import (cada provedor pode sobreviver independente se um sair do ar).
const DIRETORIOS = [
  'akilar.com.br', 'guiamais.com.br', 'telelistas.net', 'solutudo.com.br',
  'apontador.com.br', 'guialocal.com.br', 'listacapital.com.br',
  'guiafone.com.br', 'empresasfaceis.com.br', 'catalogoempresas.com.br',
  'triponon.com', 'iguide.com.br', 'econtreaqui.com.br', 'anunciar-classificados.com.br',
  'getninjas.com.br', 'starofservice.com.br', 'clickdisk.com.br', 'econodata.com.br', 'guiafix.com.br', 'mechameaqui.com.br',
];
const MARKETPLACES = ['olx.com.br', 'mercadolivre.com.br', 'mercadolivre.com', 'wa.me', 'linktr.ee'];
const REDES_SOCIAIS = ['facebook.com', 'instagram.com', 'wa.me', 'linkedin.com', 'youtube.com'];

function classifyDomain(url) {
  let domain;
  try { domain = new URL(url).hostname; } catch { domain = url; }
  const d = (domain || '').toLowerCase().replace(/^www\./, '');
  if (REDES_SOCIAIS.some(s => d === s || d.endsWith('.' + s))) return { tipo: 'social', dominio: d };
  if (MARKETPLACES.some(s => d === s || d.endsWith('.' + s))) return { tipo: 'marketplace', dominio: d };
  if (DIRETORIOS.some(s => d === s || d.endsWith('.' + s))) return { tipo: 'diretorio', dominio: d };
  return { tipo: 'site_proprio', dominio: d };
}

async function fetchSerp(cidade, uf) {
  const q = `desentupidora ${cidade}`;
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    // gl=br (país) + hl=pt-br (idioma) — sem isso o Serper tende a devolver
    // resultados em inglês/EUA por padrão.
    body: JSON.stringify({ q, gl: 'br', hl: 'pt-br', num: 10 }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Serper HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const organic = (json.organic || []).slice(0, 10);

  const classified = organic.map(item => {
    const { tipo, dominio } = classifyDomain(item.link);
    return { posicao: item.position, dominio, titulo: item.title, url: item.link, tipo };
  });

  const fracos = classified.filter(c => c.tipo !== 'site_proprio').length;
  const indiceConcorrenciaFraca = classified.length > 0 ? fracos / classified.length : null;

  return { cidade, uf, keyword: q, resultados: classified, indiceConcorrenciaFraca, totalResultados: classified.length };
}

function printResult(r) {
  console.log('='.repeat(70));
  console.log(`🔎 "${r.keyword}"${r.uf ? ` (${r.uf})` : ''}`);
  for (const item of r.resultados) {
    const tag = { social: '🟢 rede social', diretorio: '🟢 diretório', marketplace: '🟢 marketplace', site_proprio: '⚪ site próprio' }[item.tipo];
    console.log(`  #${item.posicao} ${tag.padEnd(18)} ${item.dominio}`);
  }
  const pct = r.indiceConcorrenciaFraca !== null ? Math.round(r.indiceConcorrenciaFraca * 100) : 'N/A';
  console.log(`📊 Índice de Concorrência Fraca: ${pct}% (${r.resultados.filter(x => x.tipo !== 'site_proprio').length}/${r.totalResultados} resultados não são site dedicado)`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.cidade) {
    const r = await fetchSerp(args.cidade, args.uf);
    printResult(r);
    return;
  }

  if (args.csv) {
    const csvPath = path.resolve(args.csv);
    const outPath = path.resolve(args.out || 'serp_resultado.csv');
    const raw = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(Boolean);
    const header = raw[0].split(',');
    const cidadeIdx = header.findIndex(h => h.trim().toLowerCase() === 'cidade');
    const ufIdx = header.findIndex(h => h.trim().toLowerCase() === 'uf');
    if (cidadeIdx === -1) throw new Error('CSV precisa de uma coluna "Cidade".');

    const rows = raw.slice(1).map(line => {
      const cols = line.split(',');
      return { cidade: cols[cidadeIdx]?.trim(), uf: ufIdx !== -1 ? cols[ufIdx]?.trim() : '' };
    }).filter(r => r.cidade);

    const already = new Set();
    if (fs.existsSync(outPath)) {
      const prevLines = fs.readFileSync(outPath, 'utf8').split(/\r?\n/).filter(Boolean).slice(1);
      for (const line of prevLines) already.add(line.split(',')[0].replace(/^"|"$/g, ''));
    } else {
      fs.writeFileSync(outPath, 'Cidade,UF,IndiceConcorrenciaFraca,TotalResultados,Sociais,Diretorios,Marketplaces,SitesProprios\n');
    }

    for (const { cidade, uf } of rows) {
      if (already.has(cidade)) { console.log(`⏭️  ${cidade} já processada, pulando.`); continue; }
      try {
        const r = await fetchSerp(cidade, uf);
        printResult(r);
        const counts = { social: 0, diretorio: 0, marketplace: 0, site_proprio: 0 };
        for (const item of r.resultados) counts[item.tipo]++;
        const pct = r.indiceConcorrenciaFraca !== null ? (r.indiceConcorrenciaFraca * 100).toFixed(1) : '';
        fs.appendFileSync(outPath, `"${cidade}","${uf}",${pct},${r.totalResultados},${counts.social},${counts.diretorio},${counts.marketplace},${counts.site_proprio}\n`);
      } catch (e) {
        console.error(`❌ Erro em ${cidade}: ${e.message}`);
        fs.appendFileSync(outPath, `"${cidade}","${uf}",ERRO,,,,,\n`);
      }
      // Intervalo maior entre requisições sequenciais pra não sobrecarregar a API.
      await new Promise(r => setTimeout(r, 800));
    }
    console.log(`\n✅ Concluído. Resultado salvo em ${outPath}`);
    return;
  }

  console.log('Uso:');
  console.log('  node serp_scrape_serper.mjs --cidade "Jaraguá do Sul" --uf SC     # teste com 1 cidade');
  console.log('  node serp_scrape_serper.mjs --csv cidades.csv --out resultado.csv  # lote');
}

main().catch(e => {
  console.error('❌ Erro fatal:', e.message);
  process.exit(1);
});
