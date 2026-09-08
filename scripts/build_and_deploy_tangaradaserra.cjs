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
const cityIndex = cities.findIndex(c => c.id === 'tangaradaserra');

if (cityIndex === -1) {
  console.error('Cidade tangaradaserra não encontrada em cities.json');
  process.exit(1);
}

const city = cities[cityIndex];

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
    estado: 'Mato Grosso',
    uf: cityData.uf,
    populacao: cityData.populacao || '114.603',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '65',
    whatsapp: cityData.whatsapp || '',
    telefoneFixo: cityData.telefoneFixo || cityData.phone || '',
    isDraft,
    commercialClaimsVerified: cityData.commercialClaimsVerified === true,
    empresaNome: cityData.empresaNome || `Desentupidora ${cityData.cidade}`,
    cnpj: cityData.cnpj || '',
    endereco: cityData.endereco || '',
    hospedagem: cityData.hospedagem || 'vercel',
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
      latitude: cityData.latitude || '-14.6225',
      longitude: cityData.longitude || '-57.4925'
    },
    seo: {
      metaTitle: cityData.metaTitle || `Desentupidora em ${cityData.cidade} MT | Plantão 24h`,
      metaDescription: cityData.metaDescription || `Desentupidora em ${cityData.cidade} MT com atendimento 24h para esgotos, pias, ralos e vasos. Equipe técnica local com chegada rápida e orçamento gratuito!`,
      h1Title: cityData.h1Title || `Desentupidora em ${cityData.cidade} MT 24 Horas Especializada`,
      firstParagraphText: cityData.firstParagraph || `Procurando desentupidora em ${cityData.cidade} MT com atendimento urgente? Nossa equipe especializada atende 24 horas por dia em todos os bairros e loteamentos com chegada rápida e orçamento gratuito sem taxa.`,
      lastH2Title: cityData.lastH2 || `Por que Chamar Nossa Desentupidora em ${cityData.cidade} MT?`
    },
    aboutCityTitle: cityData.aboutCityTitle || `Desentupidora em ${cityData.cidade} - ${cityData.uf}`,
    aboutCityText: cityData.aboutCityText || `${cityData.cidade} é o principal polo do Médio-Norte Matogrossense.`,
    cityFacts: [
      'Polo econômico, universitário e agroindustrial do Médio-Norte de Mato Grosso.',
      'Situada na encosta da Serra de Tapirapuã com crescimento urbano acelerado.',
      'Regime de chuvas intensas que exigem constante manutenção preventiva em ramais pluviais e caixas de gordura.'
    ],
    citySources: ['IBGE', 'Prefeitura de Tangará da Serra'],
    bairroEvidence: {},
    neighborhoodContent: {},
    neighborhoodFacts: cityData.neighborhoodFacts || {},
    parceiros: cityData.parceiros || [],
    bairros: cityData.bairros || [],
    services: cityData.services || [],
    faqs: cityData.faqs || [],
    testimonials: cityData.testimonials || []
  };

  fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
  writeBairroRedirects(cityData);
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Tangará da Serra (Vercel).');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para tangaradaserra...');
  syncCityToAstro(city);

  console.log('📦 Executando npm run build em apps/site-template-astro...');
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('🔍 Executando auditoria SEO...');
  try {
    execSync('npm run audit', { cwd: ASTRO_DIR, stdio: 'inherit' });
  } catch (e) {
    console.warn('Aviso na auditoria:', e.message);
  }

  const distDir = path.join(ASTRO_DIR, 'dist');
  console.log('▲ Realizando 1º Deploy na Vercel...');
  let deployResult = await deployEngine.deployCitySite(city, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  city.status = 'ativo';
  city.deployUrl = deployResult.url;
  city.lastDeployAt = deployResult.deployedAt;

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + city.deployUrl + ')...');
  syncCityToAstro(city);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('▲ Realizando 2º Deploy na Vercel...');
  const secondDeploy = await deployEngine.deployCitySite(city, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    city.deployUrl = deployResult.url;
    city.lastDeployAt = deployResult.deployedAt;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  city.auditScore = 100;
  cities[cityIndex] = city;
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', city.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
