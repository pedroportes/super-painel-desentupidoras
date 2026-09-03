#!/usr/bin/env node
/**
 * Raspagem em massa da SERP orgânica do Google pra "desentupidora <cidade>",
 * via DataForSEO (SERP API — Google Organic, endpoint `live/regular`, o mais
 * barato: ~US$0,002-0,003 por busca). Parte do projeto "Mapa de
 * Oportunidades" (ver docs/mapa-oportunidades-expansao.md) — o componente de
 * concorrência que ainda faltava na Nota Oportunidade.
 *
 * Credenciais: variáveis de ambiente DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD
 * (mesmo padrão já usado pela skill blog-cannibalization do link-flow, nunca
 * hardcoded aqui). Painel: https://app.dataforseo.com/api-access
 *
 * Classifica cada um dos 10 primeiros resultados orgânicos em:
 *   - social:      facebook.com, instagram.com (negócio sem site próprio)
 *   - diretorio:    domínios conhecidos de diretório/listagem BR
 *   - marketplace:  OLX, Mercado Livre etc.
 *   - site_proprio: qualquer outro domínio (site dedicado do concorrente)
 * E calcula um "Índice de Concorrência Fraca" = (social + diretorio +
 * marketplace) / total de resultados — quanto maior, mais fácil de ranquear.
 *
 * Uso:
 *   DATAFORSEO_LOGIN=xxx DATAFORSEO_PASSWORD=yyy node serp_scrape_dataforseo.mjs --cidade "Jaraguá do Sul" --uf SC
 *   DATAFORSEO_LOGIN=xxx DATAFORSEO_PASSWORD=yyy node serp_scrape_dataforseo.mjs --csv caminho/cidades.csv --out resultado.csv
 *
 * O modo --csv espera um CSV com colunas "Cidade,UF" (mesmo formato da aba
 * Banco_Cidades da planilha BANCO_CIDADES_DESENTUPIDORAS_2026) e roda em
 * lote, 1 chamada por cidade, salvando o resultado incrementalmente (se
 * cair no meio, não perde o que já foi processado — sempre reabre o CSV de
 * saída existente e pula cidades já processadas).
 */

import fs from 'fs';
import path from 'path';

const DFS_LOGIN = process.env.DATAFORSEO_LOGIN;
const DFS_PASSWORD = process.env.DATAFORSEO_PASSWORD;

if (!DFS_LOGIN || !DFS_PASSWORD) {
  console.error('❌ Faltam as credenciais. Defina DATAFORSEO_LOGIN e DATAFORSEO_PASSWORD (ver app.dataforseo.com/api-access) antes de rodar este script.');
  process.exit(1);
}

// location_code 2076 = Brasil (nível país). DataForSEO também tem
// location_name por cidade (ex: "Jaraguá do Sul,Santa Catarina,Brazil"), mas
// cobertura de cidade pequena/média costuma ser incompleta — usar o
// location_name da cidade quando existir dá resultado mais preciso
// geograficamente; cair pro código de país (2076) + o nome da cidade dentro
// da própria keyword é o fallback seguro, testado e usado aqui por padrão.
const LOCATION_CODE_BRASIL = 2076;

// Domínios conhecidos de diretório/listagem de serviços no Brasil — lista
// não-exaustiva, expandir conforme aparecer resultado novo. Nunca inclui
// aqui um site que pareça ser de uma desentupidora de verdade, só
// agregador/diretório genérico de profissionais/empresas.
const DIRETORIOS = [
  'akilar.com.br', 'guiamais.com.br', 'telelistas.net', 'solutudo.com.br',
  'apontador.com.br', 'guialocal.com.br', 'listacapital.com.br',
  'guiafone.com.br', 'empresasfaceis.com.br', 'catalogoempresas.com.br',
  'triponon.com', 'iguide.com.br', 'econtreaqui.com.br', 'anunciar-classificados.com.br',
];
const MARKETPLACES = ['olx.com.br', 'mercadolivre.com.br', 'mercadolivre.com', 'wa.me', 'linktr.ee'];
const REDES_SOCIAIS = ['facebook.com', 'instagram.com', 'wa.me', 'linkedin.com', 'youtube.com'];

function classifyDomain(domain) {
  const d = (domain || '').toLowerCase().replace(/^www\./, '');
  if (REDES_SOCIAIS.some(s => d === s || d.endsWith('.' + s))) return 'social';
  if (MARKETPLACES.some(s => d === s || d.endsWith('.' + s))) return 'marketplace';
  if (DIRETORIOS.some(s => d === s || d.endsWith('.' + s))) return 'diretorio';
  return 'site_proprio';
}

async function fetchSerp(cidade, uf) {
  const keyword = `desentupidora ${cidade}`;
  const auth = Buffer.from(`${DFS_LOGIN}:${DFS_PASSWORD}`).toString('base64');
  const body = [{
    keyword,
    location_code: LOCATION_CODE_BRASIL,
    language_code: 'pt',
    device: 'desktop',
    os: 'windows',
    depth: 10, // só os 10 primeiros — é tudo que precisamos pro sinal de concorrência
  }];

  const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DataForSEO HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const task = json.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO task error: ${task?.status_message || 'resposta inesperada'} — ${JSON.stringify(json).slice(0, 300)}`);
  }
  const items = task.result?.[0]?.items || [];
  // Filtra só resultados orgânicos (a API também devolve local_pack, people_also_ask etc.)
  const organic = items.filter(i => i.type === 'organic').slice(0, 10);

  const classified = organic.map(i => ({
    posicao: i.rank_absolute,
    dominio: i.domain,
    titulo: i.title,
    url: i.url,
    tipo: classifyDomain(i.domain),
  }));

  const fracos = classified.filter(c => c.tipo !== 'site_proprio').length;
  const indiceConcorrenciaFraca = classified.length > 0 ? fracos / classified.length : null;

  return { cidade, uf, keyword, resultados: classified, indiceConcorrenciaFraca, totalResultados: classified.length };
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
    // Modo teste: 1 cidade só.
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

    // Nunca perder progresso: se já existe out.csv, pula cidades já processadas.
    const already = new Set();
    if (fs.existsSync(outPath)) {
      const prevLines = fs.readFileSync(outPath, 'utf8').split(/\r?\n/).filter(Boolean).slice(1);
      for (const line of prevLines) already.add(line.split(',')[0]);
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
      // Respeita rate limit da API — pequena pausa entre chamadas.
      await new Promise(r => setTimeout(r, 300));
    }
    console.log(`\n✅ Concluído. Resultado salvo em ${outPath}`);
    return;
  }

  console.log('Uso:');
  console.log('  node serp_scrape_dataforseo.mjs --cidade "Jaraguá do Sul" --uf SC     # teste com 1 cidade');
  console.log('  node serp_scrape_dataforseo.mjs --csv cidades.csv --out resultado.csv  # lote (CSV com colunas Cidade,UF)');
}

main().catch(e => {
  console.error('❌ Erro fatal:', e.message);
  process.exit(1);
});
