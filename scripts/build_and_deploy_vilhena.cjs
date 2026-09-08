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
  console.log('🎨 1. Gerando Assets de Identidade Visual para Vilhena/RO...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'vilhena');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  // Logo SVG
  const logoSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ea580c" />
        <stop offset="100%" stop-color="#c2410c" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb923c" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="38" fill="url(#grad)" />
    <path d="M50 22 C36 38 30 46 30 56 C30 67 39 76 50 76 C61 76 70 67 70 56 C70 46 64 38 50 22 Z" fill="#ffffff" opacity="0.95" />
    <path d="M50 36 C42 47 38 52 38 58 C38 65 43 70 50 70 C57 70 62 65 62 58 C62 52 58 47 50 36 Z" fill="url(#accent)" />
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#ea580c" letter-spacing="1.5">VILHENA RO</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo-desentupidora-vilhena.webp'));
  console.log('   ✅ Logo gerada: logo-desentupidora-vilhena.webp');

  // Favicon SVG
  const faviconSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ea580c" />
        <stop offset="100%" stop-color="#c2410c" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#favGrad)" />
    <path d="M64 26 C45 48 38 59 38 73 C38 88 50 100 64 100 C78 100 90 88 90 73 C90 59 83 48 64 26 Z" fill="#ffffff" />
    <circle cx="64" cy="75" r="14" fill="#fb923c" />
  </svg>
  `);

  await sharp(faviconSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'favicon-desentupidora-vilhena.webp'));
  console.log('   ✅ Favicon gerado: favicon-desentupidora-vilhena.webp');

  // Hero Image
  const baseHero = path.join(ASTRO_DIR, 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(imgDir, 'desentupidora-vilhena-caminhao-limpa-fossa.webp'));
  console.log('   ✅ Hero Image gerada: desentupidora-vilhena-caminhao-limpa-fossa.webp');
}

const vilhenaData = {
  id: 'vilhena',
  slug: 'vilhena',
  name: 'Vilhena',
  cidade: 'Vilhena',
  uf: 'RO',
  ddd: '69',
  populacao: '109.651',
  whatsapp: '69997153420',
  telefoneFixo: '(69) 3321-8490',
  phone: '(69) 3321-8490',
  nomeFantasia: 'Desentupidora Vilhena 24h',
  empresaNome: 'Desentupidora Vilhena',
  cnpj: '',
  endereco: 'Avenida Major Amarante, Centro, Vilhena - RO, 76980-000',
  latitude: '-12.7406',
  longitude: '-60.1458',
  geoCoordinates: {
    latitude: '-12.7406',
    longitude: '-60.1458'
  },
  hospedagem: 'cloudflare',
  dominio: 'desentupidora-vilhena.pages.dev',
  deployUrl: 'https://desentupidora-vilhena.pages.dev',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'industrial-pesado',
  paletaCores: 'laranja-construcao',
  heroVariant: 'v4',
  servicesVariant: 'v2',
  logoUrl: '/images/vilhena/logo-desentupidora-vilhena.webp',
  logoHeight: 64,
  faviconUrl: '/images/vilhena/favicon-desentupidora-vilhena.webp',
  heroImage: '/images/vilhena/desentupidora-vilhena-caminhao-limpa-fossa.webp',
  sectionsConfig: {
    hero: true,
    services: true,
    differentials: true,
    process: true,
    testimonials: true,
    coverage: true,
    aboutCity: true,
    faq: true,
    contact: true
  },
  metaTitle: 'Desentupidora em Vilhena RO 24 Horas | Chegada Rápida',
  metaDescription: 'Desentupidora 24h em Vilhena RO. Desentupimento de esgotos, pias, ralos e fossas com orçamento sem taxa no Cone Sul de Rondônia.',
  h1Title: 'Desentupidora em Vilhena RO 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Vilhena RO com atendimento rápido e frota com caminhão auto-vácuo? Atendemos 24 horas por dia em residências, condomínios, empresas e fazendas do Cone Sul de Rondônia com orçamento gratuito sem taxa de visita.',
  heroTitle: 'Desentupidora em Vilhena RO 24 Horas',
  heroSubtitle: 'Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas em todos os bairros de Vilhena.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Vilhena RO?',
  ctaButtonText: 'Chamar no WhatsApp (69) 3321-8490',
  aboutCityTitle: 'Desentupidora em Vilhena - Cone Sul de Rondônia',
  aboutCityText: 'Vilhena é a principal cidade do Cone Sul de Rondônia, estrategicamente conhecida como o Portal da Amazônia e Cidade Clima por sua altitude superior a 600 metros na Chapada dos Parecis. Importante polo agropecuário e entroncamento logístico fundamental entre a BR-364 e a BR-174, o município combina áreas urbanas planejadas, intensa atividade comercial atacadista e grandes plantas de armazenamento e processamento de grãos. O relevo de planalto e o solo de cerrado exigem manutenção técnica especializada em esgotamento de fossas sépticas, hidrojateamento de galerias pluviais e desobstrução de redes sanitárias com maquinário de alta potência.',
  cityFacts: [
    'Conhecida nacionalmente como o Portal da Amazônia e Cidade Clima de Rondônia.',
    'Polo agropecuário e logístico estratégico do Cone Sul no entroncamento da BR-364 com a BR-174.',
    'Destaque no agronegócio, comércio regional e setor de serviços com grande demanda por limpa fossa e hidrojato.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Vilhena', 'CDL Vilhena'],
  bairros: [
    'Centro',
    'Jardim Eldorado',
    'Jardim América',
    '5º BEC',
    'Cristo Rei',
    'Bodanese',
    'BNH',
    'Alto Alegre',
    'Jardim Primavera',
    'Bela Vista',
    'Jardim Acácia',
    'Cidade Nova',
    'Parque São Paulo',
    'São José',
    'Marcos Freire',
    'Residencial Cidade Verde'
  ],
  neighborhoods: [
    'Centro',
    'Jardim Eldorado',
    'Jardim América',
    '5º BEC',
    'Cristo Rei',
    'Bodanese',
    'BNH',
    'Alto Alegre',
    'Jardim Primavera',
    'Bela Vista',
    'Jardim Acácia',
    'Cidade Nova',
    'Parque São Paulo',
    'São José',
    'Marcos Freire',
    'Residencial Cidade Verde'
  ],
  neighborhoodFacts: {
    'Centro': 'Polo comercial e financeiro ao longo da Avenida Major Amarante e Rua Marechal Rondon, com agências bancárias, lojas e restaurantes que exigem limpeza periódica de caixas de gordura e ramais de esgoto.',
    'Jardim Eldorado': 'Bairro nobre e muito valorizado em Vilhena, com residências amplas e condomínios fechados onde o atendimento para desentupimento de pias e ralos é realizado com total discrição e limpeza.',
    'Jardim América': 'Região residencial e comercial estratégica cortada por importantes avenidas, com forte circulação de pedestres e necessidade constante de desobstrução técnica de redes sanitárias.',
    '5º BEC': 'Bairro tradicional e histórico de Vilhena com ambiente tranquilo e arborizado, onde a manutenção em fossas sépticas e ramais pluviais é atendida por técnicos experientes.',
    'Cristo Rei': 'Um dos bairros mais populosos e dinâmicos de Vilhena, com grande concentração de residências e pequenos comércios que demandam resposta rápida 24 horas sem taxa de visita.',
    'Bodanese': 'Região consolidada com alta densidade habitacional e comércio de proximidade, atendida com maquinário rotativo para raspagem de tubulações primárias sem quebrar pisos.',
    'BNH': 'Bairro residencial tradicional com moradias familiares consolidadas, demandando serviços ágeis de desentupimento de vasos sanitários e caixas de inspeção.',
    'Alto Alegre': 'Bairro em área elevada com vias pavimentadas e habitações consolidadas, necessitando de controle de vazão e higienização em caixas sifonadas.',
    'Jardim Primavera': 'Área residencial acolhedora com residências unifamiliares, onde as manutenções preventivas em ramais de água servida são executadas com garantia por escrito.',
    'Bela Vista': 'Bairro dinâmico com perfil misto residencial e de serviços, atendido com frotas completas para esgotamento técnico de fossas sépticas e sumidouros.',
    'Jardim Acácia': 'Setor residencial planejado com habitações modernas, onde o serviço eletrorotativo desobstrui encanamentos com total segurança estrutural.',
    'Cidade Nova': 'Região em constante expansão habitacional em Vilhena, demandando desentupimento de galerias e redes pluviais após fortes chuvas no Cone Sul.',
    'Parque São Paulo': 'Bairro com perfil residencial e pequenas oficinas mecânicas, demandando limpeza de caixas separadoras e hidrojateamento pressurizado.',
    'São José': 'Comunidade bem estruturada com vias de acesso rápido, atendida com equipes volantes de prontidão para emergências hidráulicas 24 horas.',
    'Marcos Freire': 'Bairro populoso com intensa vida comunitária, onde o desentupimento de esgotos e pias de cozinha é executado sem quebra-quebra.',
    'Residencial Cidade Verde': 'Loteamento moderno e planejado de alta procura imobiliária, atendido com padrões rigorosos de limpeza técnica e descarte ecológico.'
  },
  bairroEvidence: {
    'Centro': 'Polo bancário e gastronômico na Avenida Major Amarante e Praça Nossa Senhora Aparecida.',
    'Jardim Eldorado': 'Bairro nobre de destaque imobiliário com residências de alto padrão construtivo.',
    'Jardim América': 'Setor residencial e comercial estratégico com vias de acesso rápido.',
    '5º BEC': 'Bairro tradicional histórico com forte identidade comunitária em Vilhena.',
    'Cristo Rei': 'Grande polo habitacional com expressiva densidade populacional e comércio ativo.',
    'Bodanese': 'Comunidade tradicional com infraestrutura urbana completa e comércio vicinal.',
    'BNH': 'Bairro residencial consolidado de grande importância no município.',
    'Alto Alegre': 'Setor elevado residencial com vias pavimentadas e residências familiares.',
    'Jardim Primavera': 'Área residencial tranquila com foco em moradia unifamiliar.',
    'Bela Vista': 'Polo misto de habitação e suporte a serviços de vizinhança.',
    'Jardim Acácia': 'Setor habitacional planejado em pleno processo de consolidação.',
    'Cidade Nova': 'Vetor de crescimento urbano recente com novas habitações.',
    'Parque São Paulo': 'Bairro com residências e suporte a pequenas oficinas e serviços.',
    'São José': 'Comunidade bem localizada com atendimento prioritário 24 horas.',
    'Marcos Freire': 'Bairro populoso com infraestrutura e comércio de proximidade.',
    'Residencial Cidade Verde': 'Novo centro habitacional planejado com excelente padrão urbano.'
  },
  services: [
    {
      id: 'esgoto',
      title: 'Desentupimento de Esgoto',
      shortDescription: 'Desobstrução completa de redes coletoras e ramais primários com cabos espirais rotativos K-500.',
      icon: 'pipe'
    },
    {
      id: 'fossa',
      title: 'Limpeza de Fossa Séptica',
      shortDescription: 'Esgotamento e sucção técnica de efluentes com caminhão auto-vácuo e descarte em estação licenciada.',
      icon: 'truck'
    },
    {
      id: 'vaso',
      title: 'Desentupimento de Vaso Sanitário',
      shortDescription: 'Remoção segura de obstruções em vasos sanitários sem riscar a louça ou quebrar revestimentos.',
      icon: 'toilet'
    },
    {
      id: 'pia-ralo',
      title: 'Desentupimento de Pia e Ralo',
      shortDescription: 'Raspagem interna de sifões, caixas de gordura e ramais de água servida com eliminação de odores.',
      icon: 'sink'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      shortDescription: 'Limpeza e lavagem industrial e predial de tubulações com jatos pressurizados de alta vazão.',
      icon: 'water'
    },
    {
      id: 'aguas-pluviais',
      title: 'Desentupimento de Águas Pluviais',
      shortDescription: 'Limpeza profunda de calhas, canaletas e galerias pluviais para evitar refluxos e alagamentos.',
      icon: 'cloud-rain'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo médio de chegada em Vilhena RO?',
      answer: 'Nossas equipes operacionais circulam pelas avenidas Major Amarante, Celso Mazutti e marginais da BR-364, chegando entre 20 e 40 minutos em qualquer bairro de Vilhena.'
    },
    {
      question: 'A visita técnica e o orçamento são gratuitos?',
      answer: 'Sim! Realizamos a vistoria técnica no local sem qualquer custo de deslocamento ou cobrança de taxa de visita em toda a cidade de Vilhena RO.'
    },
    {
      question: 'Vocês atendem fazendas, silos e secadores de grãos no Cone Sul de Rondônia?',
      answer: 'Sim! Possuímos caminhões combinados de auto-vácuo e hidrojateamento de alta potência para atendimento especializado em propriedades rurais e agroindústrias.'
    },
    {
      question: 'O desentupimento quebra pisos ou paredes?',
      answer: 'Não! Nossos equipamentos elétricos com cabos espirais flexíveis desobstruem diretamente pelo interior da tubulação, sem quebrar alvenaria ou pisos cerâmicos.'
    },
    {
      question: 'Como funciona a limpeza de fossa séptica com caminhão a vácuo?',
      answer: 'Conectamos mangotes de alta sucção ao tanque hermético do caminhão auto-vácuo, retirando todo o lodo acumulado e destinando para estação de tratamento licenciada.'
    },
    {
      question: 'Qual a garantia oferecida após a conclusão do serviço?',
      answer: 'Emitimos laudo de conformidade e garantia formal por escrito para todos os serviços executados em Vilhena RO, assegurando total tranquilidade.'
    }
  ],
  testimonials: [
    {
      name: 'Ademir Donadon',
      neighborhood: 'Centro',
      role: 'Gerente Comercial na Avenida Major Amarante',
      text: 'Excelente atendimento no Centro de Vilhena! A caixa de gordura do nosso restaurante começou a transbordar. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem sujeira.',
      content: 'Excelente atendimento no Centro de Vilhena! A caixa de gordura do nosso restaurante começou a transbordar. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem sujeira.',
      rating: 5
    },
    {
      name: 'Juliana Marcondes',
      neighborhood: 'Jardim Eldorado',
      role: 'Moradora do Jardim Eldorado',
      text: 'O ralo e o vaso sanitário da nossa residência no Eldorado entupiram no final de semana. O técnico foi extremamente atencioso, utilizou a máquina rotativa e em poucos minutos o encanamento ficou livre.',
      content: 'O ralo e o vaso sanitário da nossa residência no Eldorado entupiram no final de semana. O técnico foi extremamente atencioso, utilizou a máquina rotativa e em poucos minutos o encanamento ficou livre.',
      rating: 5
    },
    {
      name: 'Cleverson Rondon',
      neighborhood: 'Parque Industrial Tancredo Neves',
      role: 'Supervisor de Logística e Armazém',
      text: 'Contratamos a limpeza da fossa séptica e caixas de retenção do nosso armazém de grãos. Caminhão limpa fossa potente, serviço impecável e emissão de nota com laudo ambiental.',
      content: 'Contratamos a limpeza da fossa séptica e caixas de retenção do nosso armazém de grãos. Caminhão limpa fossa potente, serviço impecável e emissão de nota com laudo ambiental.',
      rating: 5
    }
  ],
  parceiros: [
    {
      nome: 'Desentupidora Ariquemes 24h',
      cidade: 'Ariquemes',
      uf: 'RO',
      dominio: 'desentupidoraariquemes.pages.dev',
      url: 'https://desentupidora-ariquemes.pages.dev',
      descricao: 'Nossa base parceira para atendimento técnico de desentupimento e hidrojateamento na região do Vale do Jamari em Rondônia.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Tangará da Serra 24h',
      cidade: 'Tangará da Serra',
      uf: 'MT',
      dominio: 'desentupidoratangaradaserra.com.br',
      url: 'https://desentupidora-tangaradaserra.vercel.app',
      descricao: 'Unidade parceira de suporte avançado para serviços de limpeza de fossas e desobstrução de esgotos no Mato Grosso.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Primavera do Leste 24h',
      cidade: 'Primavera do Leste',
      uf: 'MT',
      dominio: 'desentupidoraprimaveradoleste.pages.dev',
      url: 'https://desentupidora-primaveradoleste.pages.dev',
      descricao: 'Base regional para suporte de engenharia sanitária e hidrojateamento industrial de alta capacidade.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    }
  ]
};

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
    estado: 'Rondônia',
    uf: city.uf,
    populacao: city.populacao || '109.651',
    ddd: city.ddd || '69',
    whatsapp: city.whatsapp || '69997153420',
    telefoneFixo: city.telefoneFixo || city.phone || '(69) 3321-8490',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'laranja-construcao',
    logoUrl: city.logoUrl || '/images/vilhena/logo-desentupidora-vilhena.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/vilhena/favicon-desentupidora-vilhena.webp',
    heroImage: city.heroImage || '/images/vilhena/desentupidora-vilhena-caminhao-limpa-fossa.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: {
      latitude: '-12.7406',
      longitude: '-60.1458'
    },
    seo: {
      metaTitle: city.metaTitle || `Desentupidora em ${city.cidade} ${city.uf} 24 Horas | Chegada Rápida`,
      metaDescription: city.metaDescription || `Desentupidora 24h em ${city.cidade} ${city.uf}. Atendimento rápido com orçamento grátis e chegada em até 30 minutos.`,
      h1Title: city.h1Title || `Desentupidora em ${city.cidade} ${city.uf} 24 Horas Especializada`,
      firstParagraphText: city.firstParagraph || `Atendimento rápido e especializado em desentupimento de esgotos, pias, ralos, vasos e limpeza de fossas com caminhão auto-vácuo em todos os bairros de ${city.cidade} ${city.uf}.`,
      lastH2Title: city.lastH2 || `Por que Chamar Nossa Desentupidora em ${city.cidade} ${city.uf}?`
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: VILHENA / RO');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Vilhena no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'vilhena' || (c.cidade === 'Vilhena' && c.uf === 'RO'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...vilhenaData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(vilhenaData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(vilhenaData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-vilhena.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(vilhenaData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-vilhena.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'vilhena');
    if (idx >= 0) {
      cities[idx].status = 'ativo';
      cities[idx].deployUrl = finalUrl;
      cities[idx].lastDeployAt = new Date().toISOString();
      fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
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
