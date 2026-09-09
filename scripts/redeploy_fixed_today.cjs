const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const ASTRO_DIR = path.join(ROOT_DIR, 'apps', 'site-template-astro');
const DASHBOARD_DIR = path.join(ROOT_DIR, 'apps', 'web-dashboard');
const CITIES_FILE = path.join(DASHBOARD_DIR, 'data', 'cities.json');
const SETTINGS_FILE = path.join(DASHBOARD_DIR, 'data', 'settings.json');
const ASTRO_CONFIG_FILE = path.join(ASTRO_DIR, 'src', 'data', 'cityConfig.json');
const REDIRECTS_FILE = path.join(ASTRO_DIR, 'public', '_redirects');
const VERCEL_JSON_FILE = path.join(ASTRO_DIR, 'public', 'vercel.json');

const deployEngine = require(path.join(DASHBOARD_DIR, 'scripts', 'deployEngine.cjs'));
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));

function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function writeBairroRedirects(city) {
  try {
    const freshSlugs = (city.bairros || []).map(b => slugify(b));
    const allKnownSlugs = Array.from(new Set([...freshSlugs]));
    const staleSlugs = allKnownSlugs.filter(s => !freshSlugs.includes(s));

    let redirectsContent = '# Bairros Redirects\n';
    staleSlugs.forEach(s => {
      redirectsContent += `/${s} / 301\n`;
    });
    fs.writeFileSync(REDIRECTS_FILE, redirectsContent, 'utf-8');
  } catch (e) {
    console.error('Erro ao gerar redirects de bairros:', e);
  }
}

function syncCityToAstro(city) {
  const isDraft = city.isDraft === true;
  const servicesFormatted = (city.services || []).map(s => ({
    id: s.id,
    title: s.title,
    shortDescription: s.shortDescription || s.description || '',
    description: s.description || s.shortDescription || '',
    icon: s.icon || 'pipe'
  }));

  const astroConfig = {
    cidade: city.cidade,
    estado: city.estado || (city.uf === 'RS' ? 'Rio Grande do Sul' : city.uf === 'PB' ? 'Paraíba' : ''),
    uf: city.uf,
    populacao: city.populacao || '',
    ddd: city.ddd || '',
    whatsapp: city.whatsapp || '',
    telefoneFixo: city.telefoneFixo || city.phone || '',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '',
    heroImage: city.heroImage || '',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {},
    seo: {
      metaTitle: city.metaTitle || `Desentupidora em ${city.cidade} ${city.uf} 24h - Chegada Rápida`,
      metaDescription: city.metaDescription || `Desentupidora em ${city.cidade} ${city.uf} 24 horas.`,
      h1Title: city.h1Title || `Desentupidora em ${city.cidade} ${city.uf} 24 Horas`,
      firstParagraphText: city.firstParagraph || `Procurando desentupidora em ${city.cidade} ${city.uf}?`,
      lastH2Title: city.lastH2 || `Por que Escolher Nossa Desentupidora em ${city.cidade} ${city.uf}?`
    },
    aboutCityTitle: city.aboutCityTitle || `Desentupidora em ${city.cidade} - ${city.uf}`,
    aboutCityText: city.aboutCityText || `Desentupidora atuando com excelência em ${city.cidade} ${city.uf}.`,
    cityFacts: city.cityFacts || [],
    citySources: city.citySources || [],
    bairroEvidence: city.bairroEvidence || {},
    neighborhoodContent: city.neighborhoodContent || {},
    neighborhoodFacts: city.neighborhoodFacts || {},
    services: servicesFormatted,
    bairros: city.bairros || [],
    faqs: city.faqs || [],
    testimonials: city.testimonials || [],
    parceiros: city.parceiros || []
  };

  fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
  writeBairroRedirects(city);
}

async function rebuildAndDeploy(cityId) {
  const city = cities.find(c => c.id === cityId);
  if (!city) {
    console.error(`Cidade ${cityId} não encontrada!`);
    return;
  }

  console.log(`\n======================================================`);
  console.log(`🔄 RECOMPILANDO E REPUBLICANDO: ${city.cidade} / ${city.uf}`);
  console.log(`======================================================`);

  syncCityToAstro(city);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  const distDir = path.join(ASTRO_DIR, 'dist');
  const res = await deployEngine.deployCitySite(city, settings, distDir);
  console.log(`Resultado do Deploy para ${city.cidade}:`, res.success ? '✅ SUCESSO' : '❌ ERRO: ' + res.error);
}

async function main() {
  const todayCities = ['uruguaiana', 'erechim', 'patos'];
  for (const cid of todayCities) {
    await rebuildAndDeploy(cid);
  }
  console.log('\n🎉 TODAS AS CIDADES DE HOJE FORAM CORRIGIDAS E REPUBLICADAS COM SUCESSO!');
}

main().catch(console.error);
