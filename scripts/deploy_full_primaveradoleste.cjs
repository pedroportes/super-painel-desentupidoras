const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { deployCitySite } = require('../apps/web-dashboard/scripts/deployEngine.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASTRO_DIR = path.join(ROOT_DIR, 'apps/site-template-astro');
const CITIES_FILE = path.join(ROOT_DIR, 'apps/web-dashboard/data/cities.json');
const SETTINGS_FILE = path.join(ROOT_DIR, 'apps/web-dashboard/data/settings.json');
const ASTRO_CONFIG_FILE = path.join(ASTRO_DIR, 'src/data/cityConfig.json');
const REDIRECTS_FILE = path.join(ASTRO_DIR, 'public/_redirects');
const VERCEL_JSON_FILE = path.join(ASTRO_DIR, 'vercel.json');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function writeBairroRedirects(city) {
  try {
    const newSlugs = new Set((city.bairros || []).map(slugify));
    const oldBairros = city.bairrosAntigos || [];
    const staleSlugs = [...new Set(oldBairros.map(slugify))].filter(s => s && !newSlugs.has(s));

    const redirectLines = staleSlugs.map(s => `/${s}  /  301`);
    fs.writeFileSync(REDIRECTS_FILE, redirectLines.length ? redirectLines.join('\n') + '\n' : '', 'utf-8');

    let vercelConfig = {};
    try { vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_FILE, 'utf-8')); } catch (_) {}
    delete vercelConfig.redirects;
    if (staleSlugs.length) {
      vercelConfig.redirects = staleSlugs.map(s => ({ source: `/${s}`, destination: '/', permanent: true }));
    }
    fs.writeFileSync(VERCEL_JSON_FILE, JSON.stringify(vercelConfig, null, 2), 'utf-8');
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
    estado: 'Mato Grosso',
    uf: city.uf,
    populacao: city.populacao || '96.006',
    ddd: city.ddd || '66',
    whatsapp: city.whatsapp || '6634981250',
    telefoneFixo: city.telefoneFixo || city.phone || '(66) 3498-1250',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'azul-tecnico',
    logoUrl: city.logoUrl || '/images/primaveradoleste/logo-desentupidora-primaveradoleste.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/primaveradoleste/favicon-desentupidora-primaveradoleste.webp',
    heroImage: city.heroImage || '/images/primaveradoleste/desentupidora-primaveradoleste-caminhao-limpa-fossa.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: {
      latitude: city.latitude || '-15.5586',
      longitude: city.longitude || '-54.2961'
    },
    seo: {
      metaTitle: city.metaTitle || `Desentupidora em ${city.cidade} ${city.uf} 24h`,
      metaDescription: city.metaDescription || `Desentupidora 24h em ${city.cidade} ${city.uf}. Atendimento rápido com orçamento grátis e chegada em até 30 minutos.`,
      h1Title: city.h1Title || `Desentupidora em ${city.cidade} ${city.uf} 24 Horas`,
      firstParagraphText: city.firstParagraph || `Atendimento rápido e especializado em desentupimento de esgotos, pias, ralos, vasos e limpeza de fossas com caminhão auto-vácuo em todos os bairros de ${city.cidade} ${city.uf}.`,
      lastH2Title: city.lastH2 || `Atendimento Emergencial 24h em ${city.cidade} ${city.uf}`
    },
    aboutCityTitle: city.aboutCityTitle || `Desentupidora em ${city.cidade} - ${city.uf}`,
    aboutCityText: city.aboutCityText || `Desentupidora atuando com excelência em ${city.cidade} ${city.uf}.`,
    cityFacts: city.cityFacts || [],
    citySources: city.citySources || [],
    bairroEvidence: city.bairroEvidence || {},
    neighborhoodContent: city.neighborhoodContent || {},
    neighborhoodFacts: city.neighborhoodFacts || {},
    parceiros: city.parceiros || [],
    bairros: city.bairros && city.bairros.length > 0 ? city.bairros : city.neighborhoods || [],
    services: servicesFormatted,
    faqs: city.faqs || [],
    testimonials: city.testimonials || []
  };

  fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
  writeBairroRedirects(city);
  console.log('✅ Sincronizado cityConfig.json e redirects para Astro');
}

function runCommand(cmd, cwd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd, maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout || '', stderr: stderr || '' });
    });
  });
}

async function main() {
  const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
  const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  const city = cities.find(c => c.id === 'primaveradoleste');

  if (!city) {
    throw new Error('Cidade primaveradoleste não encontrada');
  }

  console.log('--- 1. Sincronizando dados no Astro ---');
  syncCityToAstro(city);

  console.log('--- 2. Compilando Site Astro (npm run build) ---');
  const build1 = await runCommand('npm run build', ASTRO_DIR);
  if (build1.error) {
    console.error('Erro no build 1:', build1.stderr || build1.stdout);
    process.exit(1);
  }
  console.log('Build 1 concluído com sucesso!');

  console.log('--- 3. Publicando no Provedor ---', city.hospedagem);
  const distDir = path.join(ASTRO_DIR, 'dist');
  let deployResult = await deployCitySite(city, settings, distDir);

  if (!deployResult.success) {
    console.error('Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('Deploy 1 bem-sucedido! URL:', deployResult.url);
  city.status = 'ativo';
  city.deployUrl = deployResult.url;
  city.lastDeployAt = deployResult.deployedAt || new Date().toISOString();
  if (deployResult.cloudflareProjectName) city.cloudflareProjectName = deployResult.cloudflareProjectName;

  console.log('--- 4. Re-sincronizando canonical com deployUrl oficial e re-buildando ---');
  syncCityToAstro(city);
  const build2 = await runCommand('npm run build', ASTRO_DIR);
  if (!build2.error) {
    const deployResult2 = await deployCitySite(city, settings, distDir);
    if (deployResult2.success) {
      deployResult = deployResult2;
      city.deployUrl = deployResult2.url;
      city.lastDeployAt = deployResult2.deployedAt || new Date().toISOString();
    }
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('✅ cities.json atualizado com sucesso com status ativo e deployUrl:', city.deployUrl);
}

main().catch(console.error);
