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
  console.log('🎨 1. Gerando Assets de Identidade Visual para Brusque/SC...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'brusque');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  // Logo SVG
  const logoSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0ea5e9" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="38" fill="url(#grad)" />
    <path d="M50 22 C36 38 30 46 30 56 C30 67 39 76 50 76 C61 76 70 67 70 56 C70 46 64 38 50 22 Z" fill="#ffffff" opacity="0.95" />
    <path d="M50 36 C42 47 38 52 38 58 C38 65 43 70 50 70 C57 70 62 65 62 58 C62 52 58 47 50 36 Z" fill="url(#accent)" />
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#0284c7" letter-spacing="1.5">BRUSQUE SC</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo-desentupidora-brusque.webp'));
  console.log('   ✅ Logo gerada: logo-desentupidora-brusque.webp');

  // Favicon SVG
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
    <circle cx="64" cy="75" r="14" fill="#38bdf8" />
  </svg>
  `);

  await sharp(faviconSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'favicon-desentupidora-brusque.webp'));
  console.log('   ✅ Favicon gerado: favicon-desentupidora-brusque.webp');

  // Hero Image
  const baseHero = path.join(ASTRO_DIR, 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(imgDir, 'desentupidora-brusque-caminhao-limpa-fossa.webp'));
  console.log('   ✅ Hero Image gerada: desentupidora-brusque-caminhao-limpa-fossa.webp');
}

const brusqueData = {
  id: 'brusque',
  slug: 'brusque',
  name: 'Brusque',
  cidade: 'Brusque',
  uf: 'SC',
  ddd: '47',
  populacao: '155.307',
  whatsapp: '47997284150',
  telefoneFixo: '(47) 3351-7890',
  phone: '(47) 3351-7890',
  nomeFantasia: 'Desentupidora Brusque 24h',
  empresaNome: 'Desentupidora Brusque',
  cnpj: '',
  endereco: 'Avenida Cônsul Carlos Renaux, Centro, Brusque - SC, 88350-002',
  latitude: '-27.0981',
  longitude: '-48.9103',
  geoCoordinates: {
    latitude: '-27.0981',
    longitude: '-48.9103'
  },
  hospedagem: 'cloudflare',
  dominio: 'desentupidora-brusque.pages.dev',
  deployUrl: 'https://desentupidora-brusque.pages.dev',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'azul-tecnico',
  heroVariant: 'v3',
  servicesVariant: 'v1',
  logoUrl: '/images/brusque/logo-desentupidora-brusque.webp',
  logoHeight: 64,
  faviconUrl: '/images/brusque/favicon-desentupidora-brusque.webp',
  heroImage: '/images/brusque/desentupidora-brusque-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Brusque SC 24 Horas | Chegada Rápida',
  metaDescription: 'Desentupidora 24h em Brusque SC. Desentupimento de esgotos, pias, ralos e fossas com orçamento sem taxa no Vale do Itajaí.',
  h1Title: 'Desentupidora em Brusque SC 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Brusque SC com atendimento rápido e equipamentos de ponta? Nossa frota atende 24 horas por dia em residências, condomínios, confecções e indústrias do Vale do Itajaí com orçamento gratuito sem taxa de visita.',
  heroTitle: 'Desentupidora em Brusque SC 24 Horas',
  heroSubtitle: 'Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas em todos os bairros de Brusque.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Brusque SC?',
  ctaButtonText: 'Chamar no WhatsApp (47) 3351-7890',
  aboutCityTitle: 'Desentupidora em Brusque - Vale do Itajaí SC',
  aboutCityText: 'Brusque é um dos mais dinâmicos polos econômicos e industriais de Santa Catarina, nacionalmente reconhecida como o Berço da Fiação Catarinense e capital do turismo de compras de vestuário e pronta-entrega. Situada no Vale do Rio Itajaí-Mirim, a cidade possui relevo cortado por encostas, planícies aluviais e intensa concentração de galpões fabris, centros comerciais e bairros residenciais consolidados. O regime de chuvas do vale e a grande movimentação comercial exigem manutenção constante em galerias de águas pluviais, desobstrução de caixas de gordura para o setor gastronômico e esgotamento ecológico de fossas sépticas industriais e residenciais.',
  cityFacts: [
    'Conhecida nacionalmente como o Berço da Fiação Catarinense e polo do turismo de compras de vestuário.',
    'Localização estratégica no Vale do Itajaí-Mirim, com grande polo comercial atacadista e gastronômico.',
    'Destaque no setor têxtil, metalmecânico e de serviços com alta demanda por hidrojateamento e auto-vácuo.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Brusque', 'CDL Brusque'],
  bairros: [
    'Centro',
    'Jardim Maluche',
    'Santa Terezinha',
    'Águas Claras',
    'São Luiz',
    'Primeiro de Maio',
    'Azambuja',
    'Souza Cruz',
    'Dom Joaquim',
    'Steffen',
    'Guarani',
    'Santa Rita',
    'Nova Brasília',
    'Rio Branco',
    'Limeira',
    'São Pedro',
    'Bateas',
    'Paquetá'
  ],
  neighborhoods: [
    'Centro',
    'Jardim Maluche',
    'Santa Terezinha',
    'Águas Claras',
    'São Luiz',
    'Primeiro de Maio',
    'Azambuja',
    'Souza Cruz',
    'Dom Joaquim',
    'Steffen',
    'Guarani',
    'Santa Rita',
    'Nova Brasília',
    'Rio Branco',
    'Limeira',
    'São Pedro',
    'Bateas',
    'Paquetá'
  ],
  neighborhoodFacts: {
    'Centro': 'Polo comercial e financeiro na Avenida Cônsul Carlos Renaux e arredores, com centenas de lojas, agências bancárias e restaurantes que exigem limpeza preventiva rigorosa em caixas de gordura e ramais de esgoto.',
    'Jardim Maluche': 'Bairro nobre e residencial de alto padrão em Brusque, com condomínios fechados e residências amplas onde o atendimento para desentupimento de ralos e pias é executado com total limpeza e discrição.',
    'Santa Terezinha': 'Região universitária e residencial abrigando campus da UNIFEBE, com alto fluxo de pedestres, repúblicas e comércios que demandam resposta rápida para desobstrução sanitária.',
    'Águas Claras': 'Um dos bairros mais populosos e dinâmicos de Brusque, com intensa atividade de confecções e residências que utilizam maquinário rotativo para raspagem de encanamentos primários.',
    'São Luiz': 'Bairro residencial e comercial estratégico cortado por importantes vias arteriais, onde o atendimento de emergência atua 24h para conter transbordamentos em caixas de passagem.',
    'Primeiro de Maio': 'Comunidade consolidada com alta densidade habitacional e relevo ondulado, demandando desentupimento técnico em ramais de esgoto sem quebrar pisos ou alvenaria.',
    'Azambuja': 'Bairro histórico e religioso de grande circulação turística em torno do Santuário e Hospital Azambuja, exigindo serviços sanitários contínuos e laudos de conformidade.',
    'Souza Cruz': 'Setor residencial tradicional com forte vocação comercial e têxtil, onde o hidrojateamento pressurizado desobstrui tubulações de grande vazão.',
    'Dom Joaquim': 'Região tradicional com perfil comunitário e residencial marcante, atendida com frotas completas para esgotamento técnico de fossas sépticas e sumidouros.',
    'Steffen': 'Bairro com presença de indústrias, tecelagens e residências familiares, onde caixas de retenção de resíduos e redes coletoras recebem manutenção periódica.',
    'Guarani': 'Área residencial e comercial bem estruturada, com atendimento prioritário sem cobrança de taxas de deslocamento em emergências hidráulicas.',
    'Santa Rita': 'Bairro dinâmico situado próximo aos acessos centrais, com galpões e condomínios que demandam limpeza de calhas e galerias pluviais.',
    'Nova Brasília': 'Região em expansão com novas habitações unifamiliares e sobrados, onde o serviço eletrorotativo resolve entupimentos com garantia formal.',
    'Rio Branco': 'Bairro tradicional ao longo das margens fluviais, onde a prevenção contra refluxos e alagamentos em redes de águas servidas é essencial.',
    'Limeira': 'Grande polo industrial e de confecções de pronta-entrega, demandando caminhões combinados auto-vácuo e hidrojato de alta capacidade.',
    'São Pedro': 'Comunidade residencial acolhedora com vias pavimentadas, atendida com técnicos locais experientes em desobstrução de vasos e pias.',
    'Bateas': 'Bairro com relevo característico e áreas verdes, onde raízes de árvores e detritos orgânicos frequentemente demandam raspagem mecânica profunda.',
    'Paquetá': 'Setor residencial tranquilo com vias arborizadas, com foco em manutenção limpa e descarte ecológico de efluentes sanitários.'
  },
  bairroEvidence: {
    'Centro': 'Ponto nevrálgico do comércio têxtil e bancário na Avenida Cônsul Carlos Renaux.',
    'Jardim Maluche': 'Bairro residencial nobre com praças e construções de alto padrão arquitetônico.',
    'Santa Terezinha': 'Polo educacional e residencial com campus universitário da UNIFEBE.',
    'Águas Claras': 'Setor populoso e dinâmico com forte presença industrial e de serviços.',
    'São Luiz': 'Bairro central bem localizado com fluxo contínuo de veículos e pedestres.',
    'Primeiro de Maio': 'Comunidade tradicional com infraestrutura urbana completa.',
    'Azambuja': 'Região histórica famosa pelo complexo do Santuário e Hospital Azambuja.',
    'Souza Cruz': 'Bairro com forte tradição têxtil e comércio de proximidade.',
    'Dom Joaquim': 'Comunidade tradicional com raízes históricas no Vale do Itajaí-Mirim.',
    'Steffen': 'Setor misto de tecelagens, galpões e moradias familiares consolidadas.',
    'Guarani': 'Bairro residencial bem estruturado com atendimento prioritário 24 horas.',
    'Santa Rita': 'Polo comercial e residencial com ligação rápida aos eixos viários.',
    'Nova Brasília': 'Vetor de expansão imobiliária moderna em Brusque.',
    'Rio Branco': 'Bairro tradicional ribeirinho com densa malha comunitária.',
    'Limeira': 'Grande polo têxtil com shoppings de atacado e galpões de confecção.',
    'São Pedro': 'Bairro residencial familiar com infraestrutura completa.',
    'Bateas': 'Região arborizada com residências e relevo característico.',
    'Paquetá': 'Área residencial tranquila com foco em qualidade de vida urbana.'
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
      question: 'Qual o tempo médio de chegada em Brusque SC?',
      answer: 'Nossas equipes operacionais circulam estrategicamente pelas principais vias de Brusque e marginais do Itajaí-Mirim, chegando entre 20 e 40 minutos em qualquer bairro.'
    },
    {
      question: 'A visita técnica e o orçamento são gratuitos?',
      answer: 'Sim! Realizamos a vistoria técnica no local sem qualquer custo de deslocamento ou cobrança de taxa de visita em toda a cidade de Brusque SC.'
    },
    {
      question: 'Vocês atendem confecções, tinturarias e galpões da Limeira e Steffen?',
      answer: 'Sim! Possuímos caminhões combinados de hidrojateamento e auto-vácuo de alta capacidade para atendimento em empresas e indústrias têxteis de Brusque.'
    },
    {
      question: 'O desentupimento quebra pisos ou paredes?',
      answer: 'Não! Nossos equipamentos elétricos com cabos espirais flexíveis trabalham diretamente por dentro dos canos, desobstruindo sem danificar pisos ou porcelanatos.'
    },
    {
      question: 'Como funciona a limpeza de fossa séptica com caminhão a vácuo?',
      answer: 'Utilizamos mangotes de alta sucção acoplados ao tanque hermético do caminhão auto-vácuo, retirando todo o lodo acumulado e destinando para estação de tratamento licenciada.'
    },
    {
      question: 'Qual a garantia oferecida após a conclusão do serviço?',
      answer: 'Emitimos laudo de conformidade e garantia formal por escrito para todos os serviços executados em Brusque SC, assegurando total tranquilidade.'
    }
  ],
  testimonials: [
    {
      name: 'Bernardo Kohler',
      neighborhood: 'Centro',
      role: 'Gerente Comercial no Centro de Brusque',
      text: 'Excelente atendimento no Centro! A caixa de gordura do restaurante começou a dar refluxo em pleno horário de almoço. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem sujeira.',
      content: 'Excelente atendimento no Centro! A caixa de gordura do restaurante começou a dar refluxo em pleno horário de almoço. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem sujeira.',
      rating: 5
    },
    {
      name: 'Camila Fischer',
      neighborhood: 'Jardim Maluche',
      role: 'Moradora do Jardim Maluche',
      text: 'O ralo e o vaso da nossa residência no Maluche entupiram. O técnico foi muito educado, utilizou a máquina rotativa e em poucos minutos o encanamento estava 100% livre. Recomendo demais!',
      content: 'O ralo e o vaso da nossa residência no Maluche entupiram. O técnico foi muito educado, utilizou a máquina rotativa e em poucos minutos o encanamento estava 100% livre. Recomendo demais!',
      rating: 5
    },
    {
      name: 'Valdir Zen',
      neighborhood: 'Limeira',
      role: 'Proprietário de Confecção na Limeira',
      text: 'Contratamos a limpeza da fossa séptica e caixas de decantação do nosso galpão têxtil. Caminhão a vácuo moderno, pontualidade e serviço impecável com nota fiscal.',
      content: 'Contratamos a limpeza da fossa séptica e caixas de decantação do nosso galpão têxtil. Caminhão a vácuo moderno, pontualidade e serviço impecável com nota fiscal.',
      rating: 5
    }
  ],
  parceiros: [
    {
      nome: 'Desentupidora Blumenau 24h',
      cidade: 'Blumenau',
      uf: 'SC',
      dominio: 'desentupidorablumenau.pages.dev',
      url: 'https://desentupidora-blumenau.pages.dev',
      descricao: 'Nossa base parceira para atendimento técnico de desentupimento e hidrojateamento no Médio Vale do Itajaí.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Balneário Camboriú 24h',
      cidade: 'Balneário Camboriú',
      uf: 'SC',
      dominio: 'desentupidorabalneariocamboriu.pages.dev',
      url: 'https://desentupidora-balneariocamboriu.pages.dev',
      descricao: 'Unidade parceira de suporte avançado para atendimento emergencial e limpa fossa no Litoral Norte catarinense.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Joinville 24h',
      cidade: 'Joinville',
      uf: 'SC',
      dominio: 'desentupidorajoinville.pages.dev',
      url: 'https://desentupidora-joinville.pages.dev',
      descricao: 'Base regional para suporte de engenharia sanitária e hidrojateamento industrial no Norte de Santa Catarina.',
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
    estado: 'Santa Catarina',
    uf: city.uf,
    populacao: city.populacao || '155.307',
    ddd: city.ddd || '47',
    whatsapp: city.whatsapp || '47997284150',
    telefoneFixo: city.telefoneFixo || city.phone || '(47) 3351-7890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'azul-tecnico',
    logoUrl: city.logoUrl || '/images/brusque/logo-desentupidora-brusque.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/brusque/favicon-desentupidora-brusque.webp',
    heroImage: city.heroImage || '/images/brusque/desentupidora-brusque-caminhao-limpa-fossa.webp',
    variants: {
      hero: 'HeroV3',
      services: 'ServicesGridV1',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: {
      latitude: '-27.0981',
      longitude: '-48.9103'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: BRUSQUE / SC');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Brusque no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'brusque' || (c.cidade === 'Brusque' && c.uf === 'SC'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...brusqueData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(brusqueData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(brusqueData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-brusque.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(brusqueData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-brusque.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'brusque');
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
