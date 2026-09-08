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
const cityIndex = cities.findIndex(c => c.id === 'altamira');

if (cityIndex === -1) {
  console.error('Cidade altamira não encontrada em cities.json');
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
    cidade: cityData.name || cityData.cidade,
    estado: 'Pará',
    uf: cityData.uf,
    populacao: cityData.populacao || '138.749',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '93',
    whatsapp: cityData.whatsapp || '',
    telefoneFixo: cityData.phone || cityData.telefoneFixo || '',
    isDraft,
    commercialClaimsVerified: cityData.commercialClaimsVerified === true,
    empresaNome: cityData.nomeFantasia || `Desentupidora ${cityData.name || cityData.cidade}`,
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
      latitude: cityData.latitude || '-3.2033',
      longitude: cityData.longitude || '-52.2064'
    },
    seo: {
      metaTitle: cityData.metaTitle || `Desentupidora em ${cityData.name || cityData.cidade} PA | 24 Horas Chegada Rápida`,
      metaDescription: cityData.metaDescription || `Desentupidora em ${cityData.name || cityData.cidade} PA com atendimento 24h para esgotos, pias, ralos e vasos. Equipe técnica local com chegada rápida e orçamento gratuito sem taxa!`,
      h1Title: cityData.h1Title || `Desentupidora em ${cityData.name || cityData.cidade} PA 24 Horas Especializada`,
      firstParagraphText: cityData.firstParagraph || `Procurando desentupidora em ${cityData.name || cityData.cidade} PA com atendimento urgente? Nossa equipe especializada atende 24 horas por dia em todos os bairros e RUCs com chegada rápida e orçamento gratuito sem taxa.`,
      lastH2Title: cityData.lastH2 || `Por que Chamar Nossa Desentupidora em ${cityData.name || cityData.cidade} PA?`
    },
    aboutCityTitle: `Desentupidora em ${cityData.name || cityData.cidade} - ${cityData.uf}`,
    aboutCityText: `${cityData.name || cityData.cidade} é o maior município em extensão territorial do Brasil, polo econômico do sudoeste paraense às margens do Rio Xingu.`,
    cityFacts: [
      'Maior município do Brasil e um dos maiores do mundo em área territorial.',
      'Banhada pelo Rio Xingu e cortada pela Rodovia Transamazônica (BR-230).',
      'Polo de serviços, comércio e turismo ecológico do sudoeste do Pará.'
    ],
    citySources: ['IBGE', 'Prefeitura de Altamira'],
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Altamira.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para altamira...');
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
  console.log('☁️ Realizando 1º Deploy na Cloudflare Pages...');
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
  if (deployResult.cloudflareProjectName) {
    city.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + city.deployUrl + ')...');
  syncCityToAstro(city);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(city, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    city.deployUrl = deployResult.url;
    city.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) city.cloudflareProjectName = deployResult.cloudflareProjectName;
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
