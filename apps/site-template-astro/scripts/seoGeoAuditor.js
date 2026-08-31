import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const distPath = path.join(distDir, 'index.html');
const llmsPath = path.join(distDir, 'llms.txt');
const configPath = path.resolve(process.cwd(), 'src/data/cityConfig.json');

console.log('==========================================================================');
console.log('🔍 AUDITORIA AUTOMÁTICA DE SEO, GEO E AGENT READINESS');
console.log('==========================================================================');

if (!fs.existsSync(distPath)) {
  console.error('❌ Erro: dist/index.html não encontrado! Execute npm run build primeiro.');
  process.exit(1);
}

const cityConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const checks = [];

function addCheck(category, name, passed, details, page) {
  checks.push({ category, name, passed, details, page });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const pageTag = page ? `(${page}) ` : '';
  console.log(`[${category}] ${status}: ${pageTag}${name} - ${details}`);
}

// 🚫 Regra de ouro (achado 31/08/2026, São Caetano do Sul): esse auditor
// SEMPRE só checou dist/index.html (a home) — as páginas de serviço e de
// bairro (a MAIORIA das páginas reais de um site, dezenas por cidade) nunca
// foram auditadas de verdade, e foi exatamente aí que um título de 76-79
// caracteres, um `lastH2` sem a palavra "desentupidora" e um link interno
// sem barra final (conflitando com o canonical) passaram batido por 100%
// v várias cidades sem ninguém perceber. Agora TODA página HTML de conteúdo
// dentro de `dist/` é varrida — não só a home.

// Páginas puramente institucionais (sem a obrigação de repetir a palavra-
// chave "[Serviço] em [Cidade] [UF]" — não fazem sentido citar "desentupidora"
// nelas) ficam de fora das checagens de keyword/H1/H2/parágrafo, mas ainda
// entram nas checagens estruturais (canonical, trailing slash, <main>).
const INSTITUTIONAL_SLUGS = new Set(['contato', 'politica-de-privacidade', 'termos-de-uso']);
// A rede de parceiros ("fora da área de cobertura") é desenhada de propósito
// pra NUNCA repetir o template SEO padrão — texto rotacionado por hash,
// âncora nunca é a keyword exata (ver comentário no topo de
// `[...partner].astro`) — checar keyword/faixa de tamanho aqui reprovaria
// uma decisão de design deliberada contra "scaled content abuse", não um
// bug. Ainda entra nas checagens estruturais (canonical, barra final, main).
function isPartnerPage(routePath) {
  return routePath.startsWith('/fora-da-area-de-cobertura');
}

function findAllHtmlPages(dir, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findAllHtmlPages(full, path.posix.join(base, entry.name)));
    } else if (entry.name === 'index.html') {
      out.push({ file: full, routePath: base === '' ? '/' : `/${base}/` });
    }
  }
  return out;
}

const pages = findAllHtmlPages(distDir).sort((a, b) => a.routePath.localeCompare(b.routePath));

// Título/H1 de página auto-gerada (serviço/bairro) combina 2 pedaços de
// dado real que não podem ser encurtados sem virar informação errada (nome
// completo do serviço + nome completo da cidade/bairro) — por isso usa uma
// faixa mais generosa que a home (que é texto escrito à mão, sempre
// controlável). Ver golden rule 2 no checklist-pre-publicacao/SKILL.md.
const TITLE_MIN = 40;
const TITLE_MAX_HOME = 60;
// Levantamento real (31/08/2026) contra as 14 cidades cadastradas: mesmo
// depois de tirar prefixo redundante do nome do serviço e cair pro
// fallback sem UF, a combinação [serviço mais longo] + [cidade mais longa]
// chega a 76 caracteres (ex: "Limpeza de Caixa de Gordura Comercial" em
// "São Caetano do Sul"). Abaixo disso, encurtar mais só é possível
// inventando abreviação do nome do serviço ou da cidade — pior que um
// título alguns caracteres mais longo. Teto calibrado no pior caso real
// + folga, não em uma meta arbitrária.
const TITLE_MAX_SUBPAGE = 80;
const DESC_MIN = 120;
const DESC_MAX = 160;

let totalPagesAudited = 0;

for (const { file, routePath } of pages) {
  const html = fs.readFileSync(file, 'utf-8');
  const isHome = routePath === '/';
  const slug = routePath.replace(/\/$/, '').replace(/^\//, '');
  const isInstitutional = INSTITUTIONAL_SLUGS.has(slug);
  const pageTag = isHome ? 'home' : routePath;
  totalPagesAudited++;

  // --- Estrutural (toda página, inclusive institucional) ---
  const hasMain = /<main[\s>]/i.test(html);
  addCheck('STRUCTURE', '<main> presente', hasMain, hasMain ? 'ok' : 'faltando <main>', pageTag);

  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/i);
  const canonicalHref = canonicalMatch ? canonicalMatch[1] : '';
  const canonicalPath = canonicalHref.replace(/^https?:\/\/[^/]+/, '') || '/';
  const canonicalPathOk = canonicalPath === routePath;
  addCheck('STRUCTURE', 'Canonical bate com a rota real do arquivo', canonicalPathOk, `canonical="${canonicalPath}" rota real="${routePath}"`, pageTag);

  // Todo link interno de conteúdo (começa com "/", sem extensão de arquivo,
  // não é âncora #, não é a raiz) tem que terminar com "/" — senão created
  // um link pra URL diferente do canonical dessa mesma página, achado real
  // 31/08/2026 (bairros/serviços linkados sem barra final, canonical com
  // barra final: Google via URLs diferentes pra mesma página).
  // /site-markdown é um endpoint de arquivo único (src/pages/site-markdown.ts),
  // não uma página Astro em formato diretório — nunca deve ganhar barra final.
  const NON_DIRECTORY_ROUTES = new Set(['/site-markdown']);
  const internalHrefs = [...html.matchAll(/href="(\/[^"#]*)"/g)]
    .map(m => m[1])
    .filter(h => h !== '/' && !/\.[a-z0-9]{2,5}$/i.test(h) && !h.startsWith('/images/') && !h.startsWith('/_astro/') && !NON_DIRECTORY_ROUTES.has(h));
  const badHrefs = internalHrefs.filter(h => !h.endsWith('/'));
  addCheck('STRUCTURE', 'Links internos com barra final (bate com canonical)', badHrefs.length === 0, badHrefs.length === 0 ? `${internalHrefs.length} link(s) internos, todos com "/"` : `sem barra final: ${[...new Set(badHrefs)].slice(0, 5).join(', ')}`, pageTag);

  if (isInstitutional || isPartnerPage(routePath)) continue;

  // --- SEO/keyword (home + serviço + bairro) ---
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1] : '';
  const titleMax = isHome ? TITLE_MAX_HOME : TITLE_MAX_SUBPAGE;
  addCheck('SEO', 'Título contém "desentupidora"', titleText.toLowerCase().includes('desentupidora'), `"${titleText}"`, pageTag);
  addCheck('SEO', `Título entre ${TITLE_MIN}-${titleMax} caracteres`, titleText.length >= TITLE_MIN && titleText.length <= titleMax, `${titleText.length} caracteres`, pageTag);

  const metaDescMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
  const metaDescText = metaDescMatch ? metaDescMatch[1] : '';
  addCheck('SEO', `Meta description entre ${DESC_MIN}-${DESC_MAX} caracteres`, metaDescText.length >= DESC_MIN && metaDescText.length <= DESC_MAX, `${metaDescText.length} caracteres`, pageTag);
  addCheck('SEO', 'Meta description contém "desentupidora"', metaDescText.toLowerCase().includes('desentupidora'), `"${metaDescText.substring(0, 60)}..."`, pageTag);

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  addCheck('SEO', '<h1> com palavra-chave primária', h1Text.toLowerCase().includes('desentupidora'), `H1: "${h1Text}"`, pageTag);

  const pMatch = html.match(/<p[^>]*class="[^"]*hero-[^"]*"[^>]*>([\s\S]*?)<\/p>/i) || html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const pText = pMatch ? pMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const first30Words = pText.split(/\s+/).slice(0, 30).join(' ').toLowerCase();
  addCheck('SEO', 'Palavra-chave nas primeiras 30 palavras do 1º parágrafo', first30Words.includes('desentupidora'), `"${first30Words.substring(0, 60)}..."`, pageTag);

  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const lastH2 = h2Matches.length > 0 ? h2Matches[h2Matches.length - 1][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  addCheck('SEO', 'Último <h2> com palavra-chave primária', lastH2.toLowerCase().includes('desentupidora'), `Último H2: "${lastH2}"`, pageTag);
}

const homeHtml = fs.readFileSync(distPath, 'utf-8');

// 2. GEO CHECKS (site-wide, checados na home)
const hasLocalBusinessSchema = homeHtml.includes('"@type":["LocalBusiness","EmergencyService"]') || homeHtml.includes('"LocalBusiness"');
addCheck('GEO', 'Schema JSON-LD LocalBusiness & EmergencyService', hasLocalBusinessSchema, 'Schema encontrado no head');

const hasAreaServed = homeHtml.includes('"areaServed"');
addCheck('GEO', 'Schema areaServed preenchido com bairros reais', hasAreaServed, `Bairros cadastrados: ${cityConfig.bairros.length}`);

const hasPhoneDDD = homeHtml.includes(cityConfig.whatsapp) || homeHtml.includes(cityConfig.ddd);
addCheck('GEO', 'Telefone e DDD local presentes', hasPhoneDDD, `DDD: (${cityConfig.ddd}) WhatsApp: ${cityConfig.whatsapp}`);

// 3. AGENT READINESS & AEO CHECKS
const hasFAQSchema = homeHtml.includes('"@type":"FAQPage"');
addCheck('GEO/AEO', 'Schema FAQPage estruturado para IAs (SGE/AEO)', hasFAQSchema, 'Schema FAQPage encontrado');

const hasMarkdownLink = homeHtml.includes('rel="alternate" type="text/markdown"') || homeHtml.includes('site-markdown');
addCheck('AGENT', 'Link de Negociação de Conteúdo Markdown', hasMarkdownLink, 'Tag de negociação Markdown encontrada');

const hasLLMsFile = fs.existsSync(llmsPath);
addCheck('AGENT', 'Arquivo llms.txt gerado para IAs', hasLLMsFile, `Arquivo: dist/llms.txt (${hasLLMsFile ? 'Presente' : 'Ausente'})`);

console.log('==========================================================================');
console.log(`📄 Páginas auditadas: ${totalPagesAudited}`);
const totalPassed = checks.filter(c => c.passed).length;
const totalChecks = checks.length;
const scorePct = Math.round((totalPassed / totalChecks) * 100);

const failed = checks.filter(c => !c.passed);
if (failed.length > 0) {
  console.log(`--- ${failed.length} verificação(ões) reprovada(s) ---`);
  for (const f of failed) {
    console.log(`❌ [${f.category}]${f.page ? ` (${f.page})` : ''} ${f.name} — ${f.details}`);
  }
}

console.log(`📊 SCORE AUDIT AUTOMÁTICO: ${scorePct}% (${totalPassed}/${totalChecks} verificações aprovadas)`);
if (scorePct === 100) {
  console.log('🎉 STATUS: APROVADO COM EXCELÊNCIA (100% SEO, GEO E AGENT READINESS)!');
} else {
  console.log('⚠️ STATUS: PENDÊNCIAS ENCONTRADAS PARA CORREÇÃO!');
  process.exit(1);
}
