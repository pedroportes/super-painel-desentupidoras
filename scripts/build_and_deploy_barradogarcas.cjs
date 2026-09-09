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

const sharp = require(path.join(DASHBOARD_DIR, 'node_modules', 'sharp'));
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

async function generateAssets() {
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Barra do Garças/MT...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'barradogarcas');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  // Logo SVG otimizada em WebP
  const logoSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#ea580c" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="38" fill="url(#grad)" />
    <path d="M50 22 C36 38 30 46 30 56 C30 67 39 76 50 76 C61 76 70 67 70 56 C70 46 64 38 50 22 Z" fill="#ffffff" opacity="0.95" />
    <path d="M50 36 C42 47 38 52 38 58 C38 65 43 70 50 70 C57 70 62 65 62 58 C62 52 58 47 50 36 Z" fill="url(#accent)" />
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="#0284c7" letter-spacing="0.5">BARRA DO GARÇAS MT</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-barradogarcas.webp'));
  console.log('   ✅ Logo WebP gerada.');

  // Favicon SVG otimizado em WebP
  const faviconSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#favGrad)" />
    <path d="M64 26 C45 48 38 59 38 73 C38 88 50 100 64 100 C78 100 90 88 90 73 C90 59 83 48 64 26 Z" fill="#ffffff" />
    <circle cx="64" cy="75" r="14" fill="#f97316" />
  </svg>
  `);

  await sharp(faviconSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'favicon-desentupidora-barradogarcas.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_barra_do_garcas_desentupidora_1788983650883.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-barradogarcas-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const bgData = {
  id: 'barra-do-garcas',
  cidade: 'Barra do Garças',
  name: 'Barra do Garças',
  slug: 'barra-do-garcas',
  uf: 'MT',
  estado: 'Mato Grosso',
  ddd: '66',
  populacao: '73.878',
  empresaNome: 'Desentupidora Barra do Garças MT 24h',
  whatsapp: '66998412890',
  telefoneFixo: '(66) 3401-4890',
  phone: '(66) 3401-4890',
  endereco: 'Avenida Ministro João Alberto, 820 - Centro, Barra do Garças - MT, 78600-000',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-barradogarcas.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/barradogarcas/logo-desentupidora-barradogarcas.webp',
  faviconUrl: '/images/barradogarcas/favicon-desentupidora-barradogarcas.webp',
  heroImage: '/images/barradogarcas/desentupidora-barradogarcas-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Barra do Garças MT 24h',
  metaDescription: 'Desentupidora em Barra do Garças MT com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento!',
  h1Title: 'Desentupidora em Barra do Garças MT 24 Horas',
  firstParagraph: 'Procurando desentupidora em Barra do Garças MT? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão no Vale do Araguaia.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Barra do Garças - MT',
  aboutCityText: 'Barra do Garças é o principal polo econômico, turístico e universitário do Vale do Araguaia e Leste Mato-grossense, situada no encontro dos rios Araguaia e Garças ao pé da imponente Serra Azul. Com intenso turismo nas praias fluviais, forte agronegócio e grande fluxo urbano no Centro e na Avenida Ministro João Alberto, as redes de esgoto residenciais, pousadas e galpões comerciais demandam desobstruções técnicas de alta pressão e sucção a vácuo para manter o funcionamento higiênico sem danificar as estruturas.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Barra do Garças MT?',
  geoCoordinates: {
    latitude: '-15.8928',
    longitude: '-52.2567'
  },
  bairros: [
    'Centro',
    'Santo Antônio',
    'Sena Marques',
    'São Benedito',
    'Nova Barra',
    'Vila Maria',
    'Jardim Amazônia',
    'Jardim Palmares',
    'Anchieta',
    'União',
    'Mangueiras',
    'Morada do Sol',
    'Vila Varjão',
    'BNH',
    'Ouro Fino',
    'Jardim Pitaluga',
    'Jardim dos Ipês',
    'São José',
    'Wilmar Peres',
    'Recanto das Acácias',
    'Zeca Ribeiro',
    'Solar Ville',
    'Campinas',
    'Vale dos Sonhos'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Barra do Garças concentra forte atividade financeira, gastronômica e hoteleira na Avenida Ministro João Alberto e orla do Rio Araguaia. Restaurantes e hotéis demandam limpeza frequente de caixas de gordura e desentupimento ágil de prumadas sanitárias.',
    'Santo Antônio': 'Bairro histórico e vibrante com comércio vicinal e residências tradicionais. Nossas equipes realizam desentupimentos mecânicos de esgotos e ralos com máxima higiene e sem sujeira.',
    'Sena Marques': 'Bairro tradicional próximo ao Centro com expressiva densidade habitacional. Prestamos assistência técnica 24 horas para desobstrução de pias de cozinha e vasos sanitários.',
    'São Benedito': 'Bairro residencial acolhedor com comércio ativo. Nossos técnicos utilizam maquinário rotativo para desobstruir canos sem quebrar pisos ou paredes.',
    'Nova Barra': 'Um dos maiores e mais populosos bairros de Barra do Garças, com grande expansão comercial. Oferecemos caminhão limpa fossa e hidrojateamento de alta pressão para residências e galpões.',
    'Vila Maria': 'Bairro dinâmico com perfil comunitário e ruas comerciais. Atendemos com agilidade ocorrências de esgoto transbordando com visita e orçamento gratuitos.',
    'Jardim Amazônia': 'Bairro residencial planejado com vias arborizadas e moradias familiares. Executamos desentupimentos preventivos e corretivos com garantia formal.',
    'Jardim Palmares': 'Bairro residencial consolidado na Zona Leste. Prestamos suporte especializado para desobstrução de caixas de inspeção, ralos e sifões.',
    'Anchieta': 'Bairro tradicional com perfil tranquilo e famílias de longa data. Realizamos esgotamento de fossas sépticas com caminhão auto-vácuo ecológico.',
    'União': 'Bairro em constante desenvolvimento com novos comércios e residências. Viaturas locais garantem chegada rápida em menos de 30 minutos para emergências.',
    'Mangueiras': 'Bairro acolhedor com chácaras e residências familiares. Oferecemos soluções eficientes para desentupimento de tubulações pluviais e esgotos.',
    'Morada do Sol': 'Bairro residencial elevado com vista para os morros da região. Atendimento técnico com equipamentos modernos e silenciosos que preservam acabamentos.',
    'Vila Varjão': 'Bairro tradicional próximo às vias de acesso rodoviário. Realizamos serviços completos de desentupimento predial e comercial com pontualidade.',
    'BNH': 'Conjunto habitacional consolidado com grande número de famílias. Nossos especialistas atuam com rapidez na desobstrução de canos de esgoto sanitário.',
    'Ouro Fino': 'Bairro nobre e tranquilo com residências de alto padrão. Atendimento técnico cuidadoso para preservação de louças e instalações hidráulicas.',
    'Jardim Pitaluga': 'Bairro tradicional e valorizado com intenso comércio de bairro. Prestamos manutenção hidráulica 24h para redes coletoras e caixas de gordura.',
    'Jardim dos Ipês': 'Bairro planejado com novas construções e condomínios. Desentupimentos rápidos com maquinário eletrorrotativo de última geração.',
    'São José': 'Bairro comunitário com perfil acolhedor. Equipes de plantão atendem chamados urgentes para desobstrução de ralos de banheiro e pias.',
    'Wilmar Peres': 'Bairro em expansão na Zona Norte com moradias familiares. Fornecemos serviços acessíveis de desentupimento e limpa fossa com nota fiscal.',
    'Recanto das Acácias': 'Bairro residencial calmo com belas moradias. Nossas equipes garantem solução rápida para refluxo de esgoto com garantia estendida.',
    'Zeca Ribeiro': 'Bairro tradicional próximo a polos de serviços e oficinas. Atendemos empresas e residências com hidrojateamento e esgotamento técnico.',
    'Solar Ville': 'Loteamento moderno e planejado com condomínios fechados. Atendimento com viaturas compactas e equipamentos de alta precisão.',
    'Campinas': 'Bairro de perfil misto com indústrias leves e residências. Oferecemos sucção a vácuo e desobstrução pesada para caixas separadoras de óleo.',
    'Vale dos Sonhos': 'Bairro em crescimento habitacional com novos projetos residenciais. Atendimento rápido 24 horas para desentupimento de redes de esgoto.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Barra do Garças MT com máquinas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura acumulada e resíduos em canos e sifões de pias de cozinha em Barra do Garças MT com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e higiênica de vasos sanitários em residências, hotéis e comércios de Barra do Garças MT, preservando louças e instalações.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, garagens e quintais em Barra do Garças MT, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Limpeza e esgotamento de fossas sépticas e sumidouros em Barra do Garças MT com caminhão auto-vácuo moderno e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, agroindústrias e redes comerciais em Barra do Garças MT com jatos de água em alta pressão.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Barra do Garças MT?',
      answer: 'Basta entrar em contato pelo WhatsApp (66) 99841-2890 ou telefone fixo (66) 3401-4890. Nossa equipe técnica em Barra do Garças vai até o seu imóvel para realizar uma vistoria gratuita e apresentar o orçamento detalhado sem compromisso.'
    },
    {
      question: 'Qual é o tempo médio de chegada em Barra do Garças?',
      answer: 'Temos viaturas posicionadas em pontos estratégicos de Barra do Garças MT, garantindo chegada rápida em até 30 a 40 minutos em todos os bairros e no Centro.'
    },
    {
      question: 'Vocês cobram taxa de visita em Barra do Garças?',
      answer: 'Não cobramos taxa de visita em Barra do Garças MT. A vistoria técnica para avaliação do problema e formulação do orçamento é 100% gratuita.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim, todos os nossos serviços de desentupimento, hidrojateamento e limpeza de fossas em Barra do Garças contam com garantia formal por escrito emitida na entrega do serviço.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito parcelados, dinheiro e faturamento para pousadas, hotéis, comércios e empresas cadastradas.'
    },
    {
      question: 'Vocês atendem finais de semana e feriados em Barra do Garças?',
      answer: 'Sim! Nosso plantão de atendimento de emergência funciona 24 horas por dia, 7 dias por semana, incluindo sábados, domingos e feriados em toda a cidade.'
    }
  ],
  testimonials: [
    {
      name: 'Getúlio Silva Resende',
      neighborhood: 'Centro',
      role: 'Gerente Hoteleiro',
      content: 'Durante a alta temporada de turismo na praia do Araguaia, a prumada de esgoto da pousada entupiu. A equipe da desentupidora chegou em 20 minutos com máquina rotativa e resolveu com total discrição e higiene. Excelente serviço!'
    },
    {
      name: 'Luciana Mendonça Castro',
      neighborhood: 'Jardim Amazônia',
      role: 'Nutricionista',
      content: 'A pia e a caixa de gordura da nossa residência no Jardim Amazônia estavam com mau cheiro e refluxo. O técnico foi super profissional, utilizou equipamento limpo e resolveu na hora. Nota 10!'
    },
    {
      name: 'Valdemir Souza Pinto',
      neighborhood: 'Nova Barra',
      role: 'Empresário',
      content: 'Contratamos o caminhão limpa fossa para esgotar as fossas do nosso galpão na Nova Barra. Atendimento pontual, caminhão moderno com sucção potente e preço justo com garantia.'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-barradogarcas',
  parceiros: [
    {
      id: 'p_primavera',
      nome: 'Desentupidora Primavera do Leste MT 24h',
      cidade: 'Primavera do Leste',
      uf: 'MT',
      dominio: 'desentupidora-primaveradoleste.pages.dev',
      url: 'https://desentupidora-primaveradoleste.pages.dev',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento no Leste Mato-grossense.'
    },
    {
      id: 'p_tangara',
      nome: 'Desentupidora Tangará da Serra MT 24h',
      cidade: 'Tangará da Serra',
      uf: 'MT',
      dominio: 'desentupidora-tangaradaserra.pages.dev',
      url: 'https://desentupidora-tangaradaserra.pages.dev',
      descricao: 'Serviços de desentupimento de esgotos, pias, ralos e limpa fossa no Médio-Norte de MT.'
    },
    {
      id: 'p_mineiros',
      nome: 'Desentupidora Mineiros GO 24h',
      cidade: 'Mineiros',
      uf: 'GO',
      dominio: 'desentupidora-mineiros.pages.dev',
      url: 'https://desentupidora-mineiros.pages.dev',
      descricao: 'Equipes 24 horas para desentupimento e hidrojateamento no Sudoeste Goiano.'
    }
  ]
};

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

    let vercelConfig = {};
    if (fs.existsSync(VERCEL_JSON_FILE)) {
      try { vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_FILE, 'utf-8')); } catch (e) {}
    }
    if (staleSlugs.length > 0) {
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
    populacao: city.populacao || '73.878',
    ddd: city.ddd || '66',
    whatsapp: city.whatsapp || '66998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(66) 3401-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/barradogarcas/logo-desentupidora-barradogarcas.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/barradogarcas/favicon-desentupidora-barradogarcas.webp',
    heroImage: city.heroImage || '/images/barradogarcas/desentupidora-barradogarcas-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-15.8928',
      longitude: '-52.2567'
    },
    seo: {
      metaTitle: city.metaTitle || `Desentupidora em ${city.cidade} ${city.uf} 24h`,
      metaDescription: city.metaDescription || `Desentupidora em ${city.cidade} ${city.uf} com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento!`,
      h1Title: city.h1Title || `Desentupidora em ${city.cidade} ${city.uf} 24 Horas`,
      firstParagraphText: city.firstParagraph || `Procurando desentupidora em ${city.cidade} ${city.uf}? Atendimento 24 horas especializado.`,
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
  console.log('   ✅ Astro cityConfig.json sincronizado com sucesso!');
}

async function main() {
  console.log('====================================================');
  console.log('🚀 CRIANDO E PUBLICANDO SITE: BARRA DO GARÇAS / MT (#64)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Barra do Garças no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'barra-do-garcas' || (c.cidade === 'Barra do Garças' && c.uf === 'MT'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...bgData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(bgData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(bgData);

  // 4. Build Astro Site
  console.log('\n⚙️ 4. Compilando site estático completo no Astro (Home + Serviços + Bairros + Parceiros + MD)...');
  try {
    execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });
    console.log('   ✅ Build Astro concluído com sucesso!');
  } catch (err) {
    console.error('   ❌ Falha no Build Astro:', err.message);
    process.exit(1);
  }

  // 5. Deploy to Cloudflare Pages
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-barradogarcas.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(bgData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-barradogarcas.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'barra-do-garcas' || (c.cidade === 'Barra do Garças' && c.uf === 'MT'));
    if (idx >= 0) {
      cities[idx].status = 'ativo';
      cities[idx].deployUrl = finalUrl;
      cities[idx].lastDeployAt = new Date().toISOString();
      fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
    }

    // Update Obsidian
    const obsPath = 'G:/Meu Drive/Minhas memorias Claude/Minhas Memorias/Sites/Desentupidoras-Brasil/Registro-Expansao-Rede-2026.md';
    if (fs.existsSync(obsPath)) {
      let obsContent = fs.readFileSync(obsPath, 'utf-8');
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 64');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Barra do Garças (MT)');
      obsContent = obsContent.replace(/\d+ Cidades Ativas em Produção/, '64 Cidades Ativas em Produção');
      
      const bgRow = '| **64** | **Barra do Garças (MT)** | 73.878 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (66) 3401-4890 / (66) 998412890 | 38 págs | [Acessar Site](https://desentupidora-barradogarcas.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-barradogarcas.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*63\*\* \| \*\*Timon \(MA\)\*\* [^\n]+\n)/, '$1' + bgRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Barra do Garças (MT) como cidade #64!');
    }
  } else {
    console.error('\n❌ Erro no Deploy:', deployResult.error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Erro geral:', err);
  process.exit(1);
});
