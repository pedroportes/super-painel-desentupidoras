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

const estadoMap = {
  'RJ': 'Rio de Janeiro',
  'MG': 'Minas Gerais',
  'BA': 'Bahia',
  'GO': 'Goiás',
  'RO': 'Rondônia',
  'PR': 'Paraná',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'RS': 'Rio Grande do Sul',
  'ES': 'Espírito Santo',
  'PA': 'Pará',
  'CE': 'Ceará',
  'MT': 'Mato Grosso'
};

function writeBairroRedirects(cityData) {
  try {
    const newSlugs = new Set((cityData.bairros || []).map(slugify));
    const oldBairros = cityData.bairrosAntigos || [];
    const staleSlugs = [...new Set(oldBairros.map(slugify))].filter(s => s && !newSlugs.has(s));

    const redirectLines = staleSlugs.map(s => `/${s}  /  301`);
    fs.writeFileSync(REDIRECTS_FILE, redirectLines.length ? redirectLines.join('\n') + '\n' : '', 'utf-8');

    let vercelConfig = {};
    if (fs.existsSync(VERCEL_JSON_FILE)) {
      try { vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_FILE, 'utf-8')); } catch {}
    }
    vercelConfig.cleanUrls = true;
    vercelConfig.trailingSlash = true;
    vercelConfig.redirects = staleSlugs.map(s => ({
      source: `/${s}`,
      destination: `/`,
      permanent: true
    }));
    fs.writeFileSync(VERCEL_JSON_FILE, JSON.stringify(vercelConfig, null, 2) + '\n', 'utf-8');
  } catch (e) {
    console.error('Erro ao escrever redirects:', e);
  }
}

function syncCityToAstro(cityData) {
  const isDraft = cityData.isDraft === true;
  const astroConfig = {
    cidade: cityData.cidade || cityData.name,
    estado: estadoMap[cityData.uf] || cityData.estado || '',
    uf: cityData.uf,
    populacao: cityData.populacao || '',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : cityData.ddd || '',
    whatsapp: cityData.whatsapp || '',
    telefoneFixo: cityData.telefoneFixo || cityData.phone || '',
    isDraft,
    commercialClaimsVerified: cityData.commercialClaimsVerified === true,
    empresaNome: cityData.empresaNome || `Desentupidora ${cityData.cidade}`,
    cnpj: cityData.cnpj || '',
    endereco: cityData.endereco || '',
    hospedagem: cityData.hospedagem || 'cloudflare',
    deployUrl: cityData.deployUrl || '',
    paletaCores: cityData.paletaCores || 'urgencia-azul-laranja',
    logoUrl: cityData.logoUrl || '',
    logoHeight: cityData.logoHeight || 64,
    faviconUrl: cityData.faviconUrl || '',
    heroImage: cityData.heroImage || '',
    variants: {
      hero: cityData.heroVariant || 'HeroV1',
      services: cityData.servicesVariant || 'ServicesGridV1',
      faq: 'FAQV1'
    },
    sectionsConfig: cityData.sectionsConfig || {},
    geoCoordinates: {
      latitude: cityData.latitude || '',
      longitude: cityData.longitude || ''
    },
    seo: {
      metaTitle: cityData.metaTitle || cityData.seo?.metaTitle,
      metaDescription: cityData.metaDescription || cityData.seo?.metaDescription,
      h1Title: cityData.h1Title || cityData.seo?.h1Title,
      firstParagraphText: cityData.firstParagraph || cityData.seo?.firstParagraphText,
      lastH2Title: cityData.lastH2 || cityData.seo?.lastH2Title
    },
    aboutCityTitle: cityData.aboutCityTitle,
    aboutCityText: cityData.aboutCityText,
    cityFacts: cityData.cityFacts,
    citySources: cityData.citySources,
    bairroEvidence: {},
    neighborhoodContent: {},
    neighborhoodFacts: cityData.neighborhoodFacts || {},
    parceiros: cityData.parceiros || [],
    bairros: cityData.bairros || [],
    services: cityData.services || [],
    faqs: cityData.faqs || [],
    testimonials: (cityData.testimonials || []).map(t => ({
      name: t.name,
      neighborhood: t.neighborhood || t.role || '',
      role: t.role || t.neighborhood || '',
      text: t.text || t.content || '',
      content: t.content || t.text || ''
    }))
  };

  fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
  writeBairroRedirects(cityData);
  console.log(`✅ Sincronizado cityConfig.json para ${cityData.cidade}.`);
}

async function deployCity(cityId) {
  const cityData = cities.find(c => c.id === cityId);
  if (!cityData) {
    console.error(`Cidade não encontrada: ${cityId}`);
    return;
  }

  console.log(`\n======================================================`);
  console.log(`🚀 REBUILD & REDEPLOY: ${cityData.cidade} (${cityData.uf})`);
  console.log(`======================================================`);

  syncCityToAstro(cityData);

  console.log('📦 Executando npm run build...');
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('🔍 Executando auditoria SEO com novo teto de 150 chars...');
  try {
    execSync('npm run audit', { cwd: ASTRO_DIR, stdio: 'inherit' });
  } catch (e) {
    console.warn('Aviso auditoria:', e.message);
  }

  const distDir = path.join(ASTRO_DIR, 'dist');
  console.log('☁️ Realizando Deploy na Cloudflare Pages...');
  const deployResult = await deployEngine.deployCitySite(cityData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    return;
  }

  console.log('🎉 Deploy concluído:', deployResult.url);
  cityData.deployUrl = deployResult.url;
  cityData.lastDeployAt = deployResult.deployedAt;

  // 2º build e deploy para fixar canonical
  console.log('🔄 Executando 2º Build com canonical fixado...');
  syncCityToAstro(cityData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });
  await deployEngine.deployCitySite(cityData, settings, distDir);

  console.log('✅ Verificando com checklist_completo...');
  try {
    execSync(`node apps/web-dashboard/scripts/checklist_completo.cjs ${cityId}`, { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (e) {
    console.error('Erro no checklist:', e.message);
  }
}

async function main() {
  const targetCities = process.argv.slice(2);
  const citiesToProcess = targetCities.length ? targetCities : [
    'mineiros',
    'luiseduardomagalhaes',
    'timoteo',
    'uba',
    'angradosreis',
    'ariquemes',
    'tucano'
  ];

  for (const cityId of citiesToProcess) {
    await deployCity(cityId);
  }

  // Salva cities.json atualizado
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('\n💾 cities.json sincronizado com sucesso!');
}

main().catch(console.error);
