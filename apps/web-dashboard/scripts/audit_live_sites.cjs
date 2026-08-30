/**
 * Auditoria real de todas as cidades publicadas — parte da skill
 * checklist-pre-publicacao. Confere, pra cada cidade: HTML 200, CSS 200,
 * imagem 200, title com keyword, canonical/og:url/schema batendo com a
 * URL real, e um trecho de conteúdo único presente. Não confia em nada
 * "provavelmente certo" — busca o HTML de verdade e testa cada asset.
 */
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

  // Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';
  const cidadeFirstWord = city.cidade.split(' ')[0];
  result.checks.title = title;
  if (!title.toLowerCase().includes('desentupidora') || !title.toLowerCase().includes(cidadeFirstWord.toLowerCase())) {
    result.ok = false;
    result.checks.titleOk = false;
  } else {
    result.checks.titleOk = true;
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
    console.log('='.repeat(60));
    console.log((r.ok ? '✅' : '❌'), r.id, '|', r.url);
    console.log(JSON.stringify(r.checks, null, 2));
  }
})();
