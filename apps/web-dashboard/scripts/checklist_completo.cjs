/**
 * O CHECKLIST — comando único que substitui toda checagem manual (curl
 * avulso, "acho que tá tudo bem", extensão de SEO no navegador) por uma
 * verificação determinística contra o site PUBLICADO de verdade.
 *
 * Por que este arquivo existe (achado real 31/08/2026, checklist-pre-
 * publicacao/SKILL.md regra de ouro 16): a skill já documentava tudo isso
 * em prosa há dias, mas nada rodava a checklist inteira com um comando só
 * — cada sessão reconstruía verificação manual (curl no title, depois no
 * canonical, depois...) e sempre esquecia algum ponto: bairro/serviço
 * nunca eram auditados de verdade, description nunca era checada por
 * keyword, links sem barra final passavam batido. O usuário pediu
 * explicitamente pra isso parar de se repetir. Este script É o checklist
 * — rodar ele (não reinventar checagem na hora) é o jeito certo de
 * confirmar "está no ar de verdade" antes de dizer isso ao usuário.
 *
 * Cobertura: TODA página real de uma cidade (home + cada bairro + cada
 * serviço + as 3 institucionais), não uma amostra — ao contrário de
 * `audit_live_sites.cjs` (que só amostra 1 bairro + 1 serviço por cidade
 * pra rodar rápido contra as 14 cidades de uma vez). Use este script pra
 * validar UMA cidade de ponta a ponta (cidade nova, ou depois de mexer em
 * template que afeta todas); use `audit_live_sites.cjs` pra um pente-fino
 * rápido em todas as cidades de uma vez.
 *
 * Uso:
 *   node scripts/checklist_completo.cjs <cityId>       # 1 cidade, todas as páginas
 *   node scripts/checklist_completo.cjs --all           # todas as cidades, todas as páginas (demorado)
 *   node scripts/checklist_completo.cjs --all --sample  # todas as cidades, 1 bairro + 1 serviço cada (rápido)
 *
 * Sai com código 1 se qualquer checagem falhar (uso em CI/script futuro).
 */
const cities = require('../data/cities.json');

// Faixas numéricas — regra de ouro 2 (checklist-pre-publicacao/SKILL.md).
// Subpágina (serviço/bairro) tem teto maior: nome de serviço/cidade
// composto não pode ser encurtado sem virar dado errado (ver regra 16).
const TITLE_MIN = 40;
const TITLE_MAX_HOME = 60;
const TITLE_MAX_SUBPAGE = 80;
const DESC_MIN = 120;
const DESC_MAX = 160;

const INSTITUTIONAL_SLUGS = ['contato', 'politica-de-privacidade', 'termos-de-uso'];

// Cópia fiel de apps/site-template-astro/src/utils/slugify.ts — tem que
// gerar o MESMO slug que o Astro gera de verdade (achado real: uma versão
// simplificada trocava apóstrofo por "-" em vez de remover, gerando 404
// falso-positivo pra Santa Bárbara d'Oeste).
function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function buildRoutes(city, { sample }) {
  const cidadeSlug = slugify(city.cidade);
  const routes = [{ path: '/', type: 'home' }];

  const bairros = (city.bairros || []).map(b => ({ path: `/${slugify(b)}/`, type: 'bairro', label: b }));
  const services = (city.services || []).map(s => ({ path: `/${slugify(s.title)}-em-${cidadeSlug}/`, type: 'servico', label: s.title }));

  routes.push(...(sample ? bairros.slice(0, 1) : bairros));
  routes.push(...(sample ? services.slice(0, 1) : services));

  for (const slug of INSTITUTIONAL_SLUGS) {
    routes.push({ path: `/${slug}/`, type: 'institucional', label: slug });
  }
  return routes;
}

function extract(html) {
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [, ''])[1];
  const description = (html.match(/<meta name="description" content="([^"]*)"/i) || [, ''])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/i) || [, null])[1];
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]*)"/i) || [, null])[1];
  const schemaUrl = (html.match(/"url":"([^"]*)"/i) || [, null])[1];
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const lastH2 = h2Matches.length ? h2Matches[h2Matches.length - 1][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const hasMain = /<main[\s>]/i.test(html);
  const internalHrefs = [...html.matchAll(/href="(\/[^"#]*)"/g)]
    .map(m => m[1])
    .filter(h => h !== '/' && !/\.[a-z0-9]{2,5}$/i.test(h) && !h.startsWith('/images/') && !h.startsWith('/_astro/') && h !== '/site-markdown');
  const badHrefs = [...new Set(internalHrefs.filter(h => !h.endsWith('/')))];
  return { title, description, canonical, ogUrl, schemaUrl, h1, lastH2, hasMain, badHrefs };
}

async function checkPage(baseUrl, route, city) {
  const url = baseUrl + route.path;
  const problems = [];
  let r;
  try {
    r = await fetch(url, { redirect: 'follow' });
  } catch (e) {
    return { route, ok: false, problems: [`fetch falhou: ${e.message}`] };
  }
  if (r.status !== 200) return { route, ok: false, problems: [`HTTP ${r.status}`] };
  const html = await r.text();
  const d = extract(html);

  // Home é caso especial: Layout.astro nunca acrescenta "/" pro path raiz
  // (canonicalUrl = productionBaseUrl + (currentPath === '/' ? '' : currentPath)),
  // então o canonical da home é sempre o deployUrl puro, sem barra final.
  const expectedCanonical = route.path === '/' ? baseUrl : baseUrl + route.path;
  if (d.canonical !== expectedCanonical) problems.push(`canonical="${d.canonical}" esperado="${expectedCanonical}"`);
  if (!d.hasMain) problems.push('<main> ausente');
  if (d.badHrefs.length) problems.push(`link(s) interno(s) sem barra final: ${d.badHrefs.slice(0, 5).join(', ')}`);

  if (route.type === 'institucional') {
    return { route, ok: problems.length === 0, problems };
  }

  const titleMax = route.type === 'home' ? TITLE_MAX_HOME : TITLE_MAX_SUBPAGE;
  if (!d.title.toLowerCase().includes('desentupidora')) problems.push(`título sem "desentupidora": "${d.title}"`);
  if (d.title.length < TITLE_MIN || d.title.length > titleMax) problems.push(`título fora de ${TITLE_MIN}-${titleMax} chars (tem ${d.title.length}): "${d.title}"`);
  if (!d.description.toLowerCase().includes('desentupidora')) problems.push(`description sem "desentupidora": "${d.description.substring(0, 60)}..."`);
  if (d.description.length < DESC_MIN || d.description.length > DESC_MAX) problems.push(`description fora de ${DESC_MIN}-${DESC_MAX} chars (tem ${d.description.length})`);
  if (!d.h1.toLowerCase().includes('desentupidora')) problems.push(`H1 sem "desentupidora": "${d.h1}"`);
  if (!d.lastH2.toLowerCase().includes('desentupidora')) problems.push(`último H2 sem "desentupidora": "${d.lastH2}"`);
  if (d.ogUrl !== expectedCanonical) problems.push(`og:url="${d.ogUrl}" esperado="${expectedCanonical}"`);
  if (route.type === 'home' && d.schemaUrl !== expectedCanonical) problems.push(`schema url="${d.schemaUrl}" esperado="${expectedCanonical}"`);

  return { route, ok: problems.length === 0, problems };
}

async function checkAssets(baseUrl) {
  const problems = [];
  let html;
  try {
    html = await (await fetch(baseUrl + '/')).text();
  } catch (e) {
    return [`home inacessível pra checar assets: ${e.message}`];
  }
  const cssMatch = html.match(/(\/_astro\/[a-zA-Z0-9_.-]+\.css)/);
  if (cssMatch) {
    const r = await fetch(baseUrl + cssMatch[1]).catch(() => null);
    if (!r || r.status !== 200) problems.push(`CSS ${cssMatch[1]} não retornou 200`);
  } else {
    problems.push('nenhum CSS encontrado no HTML da home');
  }
  const imgMatch = html.match(/(\/images\/[a-zA-Z0-9_.\/-]+\.(webp|png|jpg))/);
  if (imgMatch) {
    const r = await fetch(baseUrl + imgMatch[1]).catch(() => null);
    if (!r || r.status !== 200) problems.push(`Imagem ${imgMatch[1]} não retornou 200`);
  }
  return problems;
}

async function checkCity(city, opts) {
  console.log('='.repeat(70));
  console.log(`🏙️  ${city.id} — ${city.cidade} ${city.uf} (${city.hospedagem})`);
  if (!city.deployUrl) {
    console.log('❌ deployUrl FALTANDO — cidade nunca foi publicada de verdade.');
    return false;
  }
  console.log(`   ${city.deployUrl}`);

  const routes = buildRoutes(city, opts);
  console.log(`   ${routes.length} página(s) a checar${opts.sample ? ' (amostra: 1 bairro + 1 serviço)' : ' (TODAS)'}...`);

  let cityOk = true;
  for (const route of routes) {
    const res = await checkPage(city.deployUrl, route, city);
    if (!res.ok) {
      cityOk = false;
      console.log(`   ❌ ${route.type.padEnd(13)} ${route.path}`);
      for (const p of res.problems) console.log(`      - ${p}`);
    }
  }

  const assetProblems = await checkAssets(city.deployUrl);
  if (assetProblems.length) {
    cityOk = false;
    console.log('   ❌ assets:');
    for (const p of assetProblems) console.log(`      - ${p}`);
  }

  console.log(cityOk ? '   ✅ tudo verde' : '   ❌ tem pendência (ver acima)');
  return cityOk;
}

(async () => {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const sample = args.includes('--sample');
  const cityId = args.find(a => !a.startsWith('--'));

  let targets;
  if (all) {
    targets = cities;
  } else if (cityId) {
    const c = cities.find(x => x.id === cityId);
    if (!c) {
      console.error(`Cidade "${cityId}" não encontrada em cities.json.`);
      process.exit(1);
    }
    targets = [c];
  } else {
    console.log('Uso: node checklist_completo.cjs <cityId> | --all [--sample]');
    process.exit(1);
  }

  let allOk = true;
  for (const city of targets) {
    const ok = await checkCity(city, { sample });
    if (!ok) allOk = false;
  }

  console.log('='.repeat(70));
  console.log(allOk ? '🎉 CHECKLIST: TUDO VERDE.' : '⚠️  CHECKLIST: TEM PENDÊNCIA — não dizer "está no ar" até corrigir.');
  console.log('Lembrete (não automatizável aqui): bairros reais confirmados por');
  console.log('busca, conteúdo único por cidade, PageSpeed/isitagentready rodados');
  console.log('pelo menos 1x na leva — ver checklist-pre-publicacao/SKILL.md.');
  process.exit(allOk ? 0 : 1);
})();
