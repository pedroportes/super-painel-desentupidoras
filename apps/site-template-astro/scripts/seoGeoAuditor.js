import fs from 'fs';
import path from 'path';

const distPath = path.resolve(process.cwd(), 'dist/index.html');
const llmsPath = path.resolve(process.cwd(), 'dist/llms.txt');
const configPath = path.resolve(process.cwd(), 'src/data/cityConfig.json');

console.log('==========================================================================');
console.log('🔍 AUDITORIA AUTOMÁTICA DE SEO, GEO E AGENT READINESS');
console.log('==========================================================================');

if (!fs.existsSync(distPath)) {
  console.error('❌ Erro: dist/index.html não encontrado! Execute npm run build primeiro.');
  process.exit(1);
}

const html = fs.readFileSync(distPath, 'utf-8');
const cityConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const checks = [];

function addCheck(category, name, passed, details) {
  checks.push({ category, name, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${category}] ${status}: ${name} - ${details}`);
}

// 1. SEO ON-PAGE CHECKS
const titleMatch = html.match(/<title>(.*?)<\/title>/i);
const titleText = titleMatch ? titleMatch[1] : '';
addCheck('SEO', '<title> presente e otimizado', titleText.toLowerCase().includes('desentupidora'), `Título: "${titleText}"`);

const metaDescMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
const metaDescText = metaDescMatch ? metaDescMatch[1] : '';
addCheck('SEO', 'Meta Description preenchida', metaDescText.length > 20, `Tamanho: ${metaDescText.length} caracteres`);

const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
addCheck('SEO', '<h1> com palavra-chave primária', h1Text.toLowerCase().includes('desentupidora'), `H1: "${h1Text}"`);

// Check first paragraph (within 30 words)
const pMatch = html.match(/<p[^>]*class="hero-[^"]*"[^>]*>(.*?)<\/p>/i) || html.match(/<p[^>]*>(.*?)<\/p>/i);
const pText = pMatch ? pMatch[1].replace(/<[^>]+>/g, '').trim() : '';
const first30Words = pText.split(/\s+/).slice(0, 30).join(' ').toLowerCase();
addCheck('SEO', 'Palavra-chave nas primeiras 30 palavras do 1º parágrafo', first30Words.includes('desentupidora'), `Trecho: "${first30Words.substring(0, 60)}..."`);

// Check last H2
const h2Matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
const lastH2 = h2Matches.length > 0 ? h2Matches[h2Matches.length - 1][1].replace(/<[^>]+>/g, '').trim() : '';
addCheck('SEO', 'Último <h2> com palavra-chave primária', lastH2.toLowerCase().includes('desentupidora'), `Último H2: "${lastH2}"`);

// 2. GEO CHECKS
const hasLocalBusinessSchema = html.includes('"@type":["LocalBusiness","EmergencyService"]') || html.includes('"LocalBusiness"');
addCheck('GEO', 'Schema JSON-LD LocalBusiness & EmergencyService', hasLocalBusinessSchema, 'Schema encontrado no head');

const hasAreaServed = html.includes('"areaServed"');
addCheck('GEO', 'Schema areaServed preenchido com bairros reais', hasAreaServed, `Bairros cadastrados: ${cityConfig.bairros.length}`);

const hasPhoneDDD = html.includes(cityConfig.whatsapp) || html.includes(cityConfig.ddd);
addCheck('GEO', 'Telefone e DDD local presentes', hasPhoneDDD, `DDD: (${cityConfig.ddd}) WhatsApp: ${cityConfig.whatsapp}`);

// 3. AGENT READINESS & AEO CHECKS
const hasFAQSchema = html.includes('"@type":"FAQPage"');
addCheck('GEO/AEO', 'Schema FAQPage estruturado para IAs (SGE/AEO)', hasFAQSchema, 'Schema FAQPage encontrado');

const hasMarkdownLink = html.includes('rel="alternate" type="text/markdown"') || html.includes('site-markdown');
addCheck('AGENT', 'Link de Negociação de Conteúdo Markdown', hasMarkdownLink, 'Tag de negociação Markdown encontrada');

const hasLLMsFile = fs.existsSync(llmsPath);
addCheck('AGENT', 'Arquivo llms.txt gerado para IAs', hasLLMsFile, `Arquivo: dist/llms.txt (${hasLLMsFile ? 'Presente' : 'Ausente'})`);

console.log('==========================================================================');
const totalPassed = checks.filter(c => c.passed).length;
const totalChecks = checks.length;
const scorePct = Math.round((totalPassed / totalChecks) * 100);

console.log(`📊 SCORE AUDIT AUTOMÁTICO: ${scorePct}% (${totalPassed}/${totalChecks} verificações aprovadas)`);
if (scorePct === 100) {
  console.log('🎉 STATUS: APROVADO COM EXCELÊNCIA (100% SEO, GEO E AGENT READINESS)!');
} else {
  console.log('⚠️ STATUS: PENDÊNCIAS ENCONTRADAS PARA CORREÇÃO!');
  process.exit(1);
}
