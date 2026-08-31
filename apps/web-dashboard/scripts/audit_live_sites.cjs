/**
 * Auditoria real de todas as cidades publicadas — parte da skill
 * checklist-pre-publicacao. Confere, pra cada cidade: HTML 200, CSS 200,
 * imagem 200, title/description com keyword E dentro da faixa numérica
 * certa, canonical/og:url/schema batendo com a URL real. Não confia em
 * nada "provavelmente certo" — busca o HTML de verdade e testa cada
 * asset.
 *
 * Faixas numéricas (regra de ouro 10, achado real 30/08/2026): uma
 * extensão de auditoria SEO marcou em VERMELHO um título de 36
 * caracteres por ser CURTO DEMAIS, não só por estourar um máximo — título
 * "≤60" não basta, tem que ter piso também.
 *
 * 🚫 Regra de ouro 16 (achado real 31/08/2026): este script SEMPRE só
 * checou a home (`url + '/'`) de cada cidade — nunca as páginas de
 * serviço/bairro, que são a maioria das páginas reais do site e foi
 * exatamente onde ficaram escondidos título estourando o teto, meta
 * description sem a palavra-chave e sem o piso de 120 chars, em produção,
 * em várias cidades. Agora também busca 1 página de bairro e 1 de serviço
 * por cidade (as primeiras da lista) com as mesmas checagens de
 * title/description — não é 100% de cobertura como o `seoGeoAuditor.js`
 * (que roda local, contra TODAS as páginas do build), mas já detecta a
 * classe de bug em produção sem multiplicar o tempo de execução por
 * dezenas de páginas × 14 cidades.
 */
const TITLE_MIN = 40;
const TITLE_MAX = 60;
const TITLE_MAX_SUBPAGE = 80;
const DESC_MIN = 120;
const DESC_MAX = 160;

// Cópia fiel de apps/site-template-astro/src/utils/slugify.ts — tem que
// gerar o MESMO slug que o Astro gera de verdade (achado real: uma versão
// simplificada aqui trocava apóstrofo por "-" em vez de remover, gerando
// "santa-barbara-d-oeste" em vez do "santa-barbara-doeste" real, e todo
// sub_servico de Santa Bárbara d'Oeste dava 404 por causa disso — falso
// negativo do auditor, não bug do site).
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

async function auditSubpage(url, routePath, label, result) {
  try {
    const r = await fetch(url + routePath, { redirect: 'follow' });
    if (r.status !== 200) { result.checks[`sub_${label}`] = `HTML ${r.status}`; result.ok = false; return; }
    const html = await r.text();
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
    const description = descMatch ? descMatch[1] : '';
    const titleHasKeyword = title.toLowerCase().includes('desentupidora');
    const titleLenOk = title.length >= TITLE_MIN && title.length <= TITLE_MAX_SUBPAGE;
    const descHasKeyword = description.toLowerCase().includes('desentupidora');
    const descLenOk = description.length >= DESC_MIN && description.length <= DESC_MAX;
    const canonMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
    const canonical = canonMatch ? canonMatch[1] : null;
    const canonicalOk = canonical === `${url}${routePath}`;
    const ok = titleHasKeyword && titleLenOk && descHasKeyword && descLenOk && canonicalOk;
    result.checks[`sub_${label}`] = {
      routePath, title: `${title} (${title.length} chars)`, description: `${description.length} chars`,
      canonical, canonicalOk, ok
    };
    if (!ok) result.ok = false;
  } catch (e) {
    result.checks[`sub_${label}`] = 'ERRO: ' + e.message;
    result.ok = false;
  }
}

const cities = require('../data/cities.json');

async function auditCity(city) {
  const url = city.deployUrl;
  const result = { id: city.id, url, checks: {}, ok: true };
  if (!url) {
    result.ok = false;
    result.checks.deployUrl = 'FALTANDO';
    return result;
  }

  let html = '';
  try {
    const r = await fetch(url + '/', { redirect: 'follow' });
    result.checks.html = r.status;
    if (r.status !== 200) result.ok = false;
    html = await r.text();
  } catch (e) {
    result.checks.html = 'ERRO: ' + e.message;
    result.ok = false;
    return result;
  }

  // Title — keyword E faixa numérica (40-60 chars)
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';
  const cidadeFirstWord = city.cidade.split(' ')[0];
  result.checks.title = `${title} (${title.length} chars)`;
  const titleHasKeyword = title.toLowerCase().includes('desentupidora') && title.toLowerCase().includes(cidadeFirstWord.toLowerCase());
  const titleLenOk = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
  result.checks.titleOk = titleHasKeyword && titleLenOk;
  if (!titleHasKeyword) result.checks.titleProblema = 'sem keyword/cidade no title';
  if (!titleLenOk) result.checks.titleProblema = `tamanho fora de ${TITLE_MIN}-${TITLE_MAX} (tem ${title.length})`;
  if (!result.checks.titleOk) result.ok = false;

  // Meta description — faixa numérica (120-160 chars)
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
  const description = descMatch ? descMatch[1] : '';
  result.checks.description = `${description.length} chars`;
  const descLenOk = description.length >= DESC_MIN && description.length <= DESC_MAX;
  result.checks.descriptionOk = descLenOk;
  if (!descLenOk) {
    result.checks.descriptionProblema = `tamanho fora de ${DESC_MIN}-${DESC_MAX} (tem ${description.length})`;
    result.ok = false;
  }

  // Canonical
  const canonMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
  const canonical = canonMatch ? canonMatch[1] : null;
  result.checks.canonical = canonical;
  result.checks.canonicalOk = canonical === url;
  if (!result.checks.canonicalOk) result.ok = false;

  // og:url
  const ogMatch = html.match(/<meta property="og:url" content="([^"]*)"/);
  const ogUrl = ogMatch ? ogMatch[1] : null;
  result.checks.ogUrl = ogUrl;
  result.checks.ogUrlOk = ogUrl === url;
  if (!result.checks.ogUrlOk) result.ok = false;

  // schema JSON-LD url
  const schemaMatch = html.match(/"url":"([^"]*)"/);
  const schemaUrl = schemaMatch ? schemaMatch[1] : null;
  result.checks.schemaUrl = schemaUrl;
  result.checks.schemaUrlOk = schemaUrl === url;
  if (!result.checks.schemaUrlOk) result.ok = false;

  // CSS asset
  const cssMatch = html.match(/(\/_astro\/[a-zA-Z0-9_.-]+\.css)/);
  if (cssMatch) {
    try {
      const r = await fetch(url + cssMatch[1]);
      result.checks.css = r.status;
      if (r.status !== 200) result.ok = false;
    } catch (e) {
      result.checks.css = 'ERRO';
      result.ok = false;
    }
  } else {
    result.checks.css = 'NAO ENCONTRADO NO HTML';
    result.ok = false;
  }

  // Imagem (logo ou hero)
  const imgMatch = html.match(/(\/images\/[a-zA-Z0-9_.\/-]+\.(webp|png|jpg))/);
  if (imgMatch) {
    try {
      const r = await fetch(url + imgMatch[1]);
      result.checks.image = r.status;
      result.checks.imagePath = imgMatch[1];
      if (r.status !== 200) result.ok = false;
    } catch (e) {
      result.checks.image = 'ERRO';
      result.ok = false;
    }
  } else {
    result.checks.image = 'sem imagem cadastrada (nao é bug se logoUrl/heroImage vazios)';
  }

  return result;
}

(async () => {
  for (const city of cities) {
    const r = await auditCity(city);
    if (r.url && city.bairros && city.bairros[0]) {
      await auditSubpage(r.url, `/${slugify(city.bairros[0])}/`, 'bairro', r);
    }
    if (r.url && city.services && city.services[0]) {
      const cidadeSlug = slugify(city.cidade);
      await auditSubpage(r.url, `/${slugify(city.services[0].title)}-em-${cidadeSlug}/`, 'servico', r);
    }
    console.log('='.repeat(60));
    console.log((r.ok ? '✅' : '❌'), r.id, '|', r.url);
    console.log(JSON.stringify(r.checks, null, 2));
  }
})();
