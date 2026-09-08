const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(process.cwd(), 'dist');
const configPath = path.resolve(process.cwd(), 'src/data/cityConfig.json');
const keyword = 'desentupidora';
const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plainText = (value) => value.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();

if (!fs.existsSync(configPath) || !fs.existsSync(distDir)) {
  console.error('Execute npm run build antes de npm run audit:preview.');
  process.exit(1);
}

const city = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const routes = [
  { path: '/', type: 'home', label: city.cidade },
  ...(city.bairros || []).map((bairro) => ({ path: `/${slugify(bairro)}/`, type: 'bairro', label: bairro })),
  ...(city.services || []).map((service) => ({ path: `/${slugify(service.title)}-em-${slugify(city.cidade)}/`, type: 'servico', label: service.title }))
];
const failures = [];
const pageBodies = new Map();

for (const route of routes) {
  const file = route.path === '/' ? path.join(distDir, 'index.html') : path.join(distDir, route.path.slice(1, -1), 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`${route.path}: arquivo gerado ausente`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1];
  const description = (html.match(/<meta name="description" content="([^"]*)"/i) || [, ''])[1];
  const h1 = plainText((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1]);
  const afterH1 = html.slice(html.indexOf('</h1>') + 5);
  const firstParagraph = plainText((afterH1.match(/<p[^>]*>([\s\S]*?)<\/p>/i) || [, ''])[1]);
  const headings = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => plainText(match[1]));
  const lastH2 = headings.at(-1) || '';
  const problems = [];
  const titleMax = route.type === 'home' ? 60 : 80;

  if (!/<main[\s>]/i.test(html)) problems.push('main ausente');
  if (title.length < 40 || title.length > titleMax || !title.toLowerCase().includes(keyword)) problems.push('title');
  if (description.length < 120 || description.length > 160 || !description.toLowerCase().includes(keyword)) problems.push('meta description');
  if (!h1.toLowerCase().includes(keyword)) problems.push('H1');
  if (!firstParagraph.toLowerCase().includes(keyword)) problems.push('primeiro parágrafo');
  if (!lastH2.toLowerCase().includes(keyword)) problems.push('último H2');
  if (!html.includes('"@type":"FAQPage"')) problems.push('schema FAQPage');
  if ((html.match(/<details(?:\s|>)/g) || []).length < 6) problems.push('FAQ visível');
  if (city.isDraft) {
    if (!/name="robots" content="noindex, nofollow"/i.test(html)) problems.push('noindex de rascunho');
    if (/<link rel="canonical"/i.test(html) || /<meta property="og:url"/i.test(html)) problems.push('canonical/OG falsa no build de rascunho');
    if (/"LocalBusiness"/.test(html)) problems.push('schema comercial em rascunho');
  } else {
    const expected = route.path === '/' ? city.deployUrl : `${city.deployUrl}${route.path}`;
    if (!city.deployUrl || !html.includes(`<link rel="canonical" href="${expected}"`)) problems.push('canonical de produção');
    if (!html.includes(`<meta property="og:url" content="${expected}"`)) problems.push('og:url de produção');
  }
  if (route.type === 'bairro') {
    const evidence = city.bairroEvidence?.[route.label];
    if (!evidence?.url || !html.includes(`href="${evidence.url}"`)) problems.push('fonte verificável do bairro');
  }
  const bodyHash = crypto.createHash('sha256').update(plainText((html.match(/<main[\s\S]*<\/main>/i) || [''])[0])).digest('hex');
  if (pageBodies.has(bodyHash)) problems.push(`conteúdo duplicado de ${pageBodies.get(bodyHash)}`);
  pageBodies.set(bodyHash, route.path);
  if (problems.length) failures.push(`${route.type} ${route.path}: ${problems.join(', ')}`);
}

if (failures.length) {
  console.error('CHECKLIST DE PRÉVIA: PENDÊNCIAS');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`CHECKLIST DE PRÉVIA: TUDO VERDE (${routes.length} rotas de conteúdo).`);
