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

const idx = cities.findIndex(c => c.id === 'frutal');
if (idx >= 0) {
  cities[idx].metaTitle = 'Desentupidora em Frutal MG 24 Horas | Chegada Rápida'; // 53 chars!
  cities[idx].parceiros = [
    {
      nome: 'Desentupidora Patos de Minas 24h',
      cidade: 'Patos de Minas',
      uf: 'MG',
      dominio: 'desentupidorapatosdeminas.com.br',
      url: 'https://desentupidora-patosdeminas.pages.dev',
      descricao: 'Nossa base parceira para atendimento de desentupimento e hidrojateamento na região do Alto Paranaíba.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Unaí 24h',
      cidade: 'Unaí',
      uf: 'MG',
      dominio: 'desentupidoraunai.com.br',
      url: 'https://desentupidora-unai.pages.dev',
      descricao: 'Unidade parceira de atendimento especializado em limpeza de fossas e desobstrução de esgotos no Noroeste de Minas.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    }
  ];
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
}

const frutal = cities.find(c => c.id === 'frutal');

const servicesFormatted = (frutal.services || []).map(s => ({
  id: s.id,
  title: s.title,
  shortDescription: s.shortDescription || s.description || '',
  description: s.description || s.shortDescription || '',
  icon: s.icon || 'pipe'
}));

const astroConfig = {
  cidade: frutal.cidade,
  estado: 'Minas Gerais',
  uf: frutal.uf,
  populacao: frutal.populacao || '61.275',
  ddd: frutal.ddd || '34',
  whatsapp: frutal.whatsapp || '34997184520',
  telefoneFixo: frutal.telefoneFixo || frutal.phone || '(34) 3421-7290',
  isDraft: false,
  commercialClaimsVerified: true,
  empresaNome: frutal.empresaNome || `Desentupidora ${frutal.cidade}`,
  cnpj: frutal.cnpj || '',
  endereco: frutal.endereco || '',
  hospedagem: frutal.hospedagem || 'cloudflare',
  deployUrl: frutal.deployUrl || 'https://desentupidora-frutal.pages.dev',
  paletaCores: frutal.paletaCores || 'azul-tecnico',
  logoUrl: frutal.logoUrl || '/images/frutal/logo-desentupidora-frutal.webp',
  logoHeight: frutal.logoHeight || 64,
  faviconUrl: frutal.faviconUrl || '/images/frutal/favicon-desentupidora-frutal.webp',
  heroImage: frutal.heroImage || '/images/frutal/desentupidora-frutal-caminhao-limpa-fossa.webp',
  variants: {
    hero: 'HeroV4',
    services: 'ServicesGridV2',
    faq: 'FAQV1'
  },
  sectionsConfig: frutal.sectionsConfig || {},
  geoCoordinates: {
    latitude: '-20.0247',
    longitude: '-48.9406'
  },
  seo: {
    metaTitle: frutal.metaTitle,
    metaDescription: frutal.metaDescription,
    h1Title: frutal.h1Title,
    firstParagraphText: frutal.firstParagraph,
    lastH2Title: frutal.lastH2
  },
  aboutCityTitle: frutal.aboutCityTitle,
  aboutCityText: frutal.aboutCityText,
  cityFacts: frutal.cityFacts || [],
  citySources: frutal.citySources || [],
  bairroEvidence: frutal.bairroEvidence || {},
  neighborhoodContent: frutal.neighborhoodContent || {},
  neighborhoodFacts: frutal.neighborhoodFacts || {},
  services: servicesFormatted,
  bairros: frutal.bairros || [],
  faqs: frutal.faqs || [],
  testimonials: frutal.testimonials || [],
  parceiros: frutal.parceiros || []
};

fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');

async function redeploy() {
  console.log('🔄 Reconstruindo e redeployando Frutal com Title 53 chars e Parceiros...');
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });
  const distDir = path.join(ASTRO_DIR, 'dist');
  const res = await deployEngine.deployCitySite(frutal, settings, distDir);
  console.log('Resultado:', res);
}

redeploy().catch(console.error);
