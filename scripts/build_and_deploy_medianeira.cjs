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
  console.log('🎨 1. Gerando Assets de Identidade Visual para Medianeira/PR...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'medianeira');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  // Logo SVG
  const logoSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#059669" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399" />
        <stop offset="100%" stop-color="#10b981" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="38" fill="url(#grad)" />
    <path d="M50 22 C36 38 30 46 30 56 C30 67 39 76 50 76 C61 76 70 67 70 56 C70 46 64 38 50 22 Z" fill="#ffffff" opacity="0.95" />
    <path d="M50 36 C42 47 38 52 38 58 C38 65 43 70 50 70 C57 70 62 65 62 58 C62 52 58 47 50 36 Z" fill="url(#accent)" />
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#059669" letter-spacing="1.5">MEDIANEIRA PR</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo-desentupidora-medianeira.webp'));
  console.log('   ✅ Logo gerada: logo-desentupidora-medianeira.webp');

  // Favicon SVG
  const faviconSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#059669" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#favGrad)" />
    <path d="M64 26 C45 48 38 59 38 73 C38 88 50 100 64 100 C78 100 90 88 90 73 C90 59 83 48 64 26 Z" fill="#ffffff" />
    <circle cx="64" cy="75" r="14" fill="#34d399" />
  </svg>
  `);

  await sharp(faviconSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'favicon-desentupidora-medianeira.webp'));
  console.log('   ✅ Favicon gerado: favicon-desentupidora-medianeira.webp');

  // Hero Image
  const baseHero = path.join(ASTRO_DIR, 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(imgDir, 'desentupidora-medianeira-caminhao-limpa-fossa.webp'));
  console.log('   ✅ Hero Image gerada: desentupidora-medianeira-caminhao-limpa-fossa.webp');
}

const medianeiraData = {
  id: 'medianeira',
  slug: 'medianeira',
  name: 'Medianeira',
  cidade: 'Medianeira',
  uf: 'PR',
  ddd: '45',
  populacao: '57.910',
  whatsapp: '45998126740',
  telefoneFixo: '(45) 3264-7890',
  phone: '(45) 3264-7890',
  nomeFantasia: 'Desentupidora Medianeira 24h',
  empresaNome: 'Desentupidora Medianeira',
  cnpj: '',
  endereco: 'Avenida Brasília, Centro, Medianeira - PR, 85884-000',
  latitude: '-25.2975',
  longitude: '-54.0944',
  geoCoordinates: {
    latitude: '-25.2975',
    longitude: '-54.0944'
  },
  hospedagem: 'cloudflare',
  dominio: 'desentupidora-medianeira.pages.dev',
  deployUrl: 'https://desentupidora-medianeira.pages.dev',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'industrial-pesado',
  paletaCores: 'verde-eco',
  heroVariant: 'v4',
  servicesVariant: 'v2',
  logoUrl: '/images/medianeira/logo-desentupidora-medianeira.webp',
  logoHeight: 64,
  faviconUrl: '/images/medianeira/favicon-desentupidora-medianeira.webp',
  heroImage: '/images/medianeira/desentupidora-medianeira-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Medianeira PR 24 Horas | Chegada Rápida',
  metaDescription: 'Desentupidora 24h em Medianeira PR. Desentupimento de esgotos, pias, ralos e fossas com orçamento sem taxa no Oeste do Paraná.',
  h1Title: 'Desentupidora em Medianeira PR 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Medianeira PR com atendimento rápido e maquinário especializado? Atendemos 24 horas por dia em residências, condomínios, indústrias e cooperativas do Oeste Paranaense com orçamento gratuito sem taxa de visita.',
  heroTitle: 'Desentupidora em Medianeira PR 24 Horas',
  heroSubtitle: 'Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas em todos os bairros de Medianeira.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Medianeira PR?',
  ctaButtonText: 'Chamar no WhatsApp (45) 3264-7890',
  aboutCityTitle: 'Desentupidora em Medianeira - Oeste do Paraná',
  aboutCityText: 'Medianeira é um dos municípios mais prósperos do Oeste do Paraná, estrategicamente posicionado no corredor logístico da BR-277 entre Cascavel e Foz do Iguaçu. Reconhecida como polo agroindustrial e cooperativista de destaque nacional, sedia operações da Lar Cooperativa Agroindustrial e campus avançado da Universidade Tecnológica Federal do Paraná (UTFPR). A dinâmica econômica intensa, associada a loteamentos modernos e grandes plantas industriais, exige serviços de alto padrão técnico em hidrojateamento pressurizado, desobstrução de caixas de retenção de gordura e esgotamento ecológico de fossas sépticas.',
  cityFacts: [
    'Polo agroindustrial e cooperativista de destaque no Paraná, sede da Lar Cooperativa Agroindustrial.',
    'Polo universitário regional abrigando campus tecnológico da UTFPR Medianeira.',
    'Localização estratégica no entroncamento da BR-277, com forte demanda por desentupimento comercial e industrial.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Medianeira', 'UTFPR Medianeira'],
  bairros: [
    'Centro',
    'Cidade Alta',
    'Belo Horizonte',
    'Condá',
    'Itaipu',
    'Jardim Irene',
    'São Cristóvão',
    'Nazaré',
    'Parque Independência',
    'Frimesa',
    'Ipê',
    'Maralúcia',
    'Araucária',
    'Santos Dumont',
    'Iguaçu',
    'Jardim Panorâmico'
  ],
  neighborhoods: [
    'Centro',
    'Cidade Alta',
    'Belo Horizonte',
    'Condá',
    'Itaipu',
    'Jardim Irene',
    'São Cristóvão',
    'Nazaré',
    'Parque Independência',
    'Frimesa',
    'Ipê',
    'Maralúcia',
    'Araucária',
    'Santos Dumont',
    'Iguaçu',
    'Jardim Panorâmico'
  ],
  neighborhoodFacts: {
    'Centro': 'Ponto nevrálgico do comércio e serviços de Medianeira ao longo da Avenida Brasília e Rua Argentina, com agências bancárias e restaurantes que demandam limpeza programada de caixas de gordura e esgotos.',
    'Cidade Alta': 'Região residencial nobre e bem estruturada em cota elevada, onde tubulações prediais e ramais pluviais recebem manutenção não destrutiva com sondas rotativas modernas.',
    'Belo Horizonte': 'Bairro residencial consolidado e densamente habitado, com residências familiares que necessitam de atendimento ágil para desentupimento de ralos, pias e vasos sanitários.',
    'Condá': 'Bairro tradicional vizinho ao Centro com perfil misto comercial e residencial, onde o fluxo sanitário contínuo exige desobstrução técnica com maquinário elétrico K-500.',
    'Itaipu': 'Setor residencial estratégico com vias pavimentadas e novos loteamentos, demandando raspagem interna de encanamentos primários e eliminação de maus odores.',
    'Jardim Irene': 'Área residencial tranquila com casas amplas, onde as manutenções preventivas em ramais de esgoto e caixas sifonadas são executadas com total garantia por escrito.',
    'São Cristóvão': 'Bairro com forte presença de oficinas, comércio vicinal e habitações, demandando esgotamento de fossas sépticas e hidrojateamento de galerias.',
    'Nazaré': 'Região tradicional com expressivo contingente comunitário, atendida com equipes volantes 24 horas para emergências em encanamentos residenciais sem cobrança de visita.',
    'Parque Independência': 'Bairro nobre e arborizado de Medianeira, com residências de alto padrão que exigem intervenções silenciosas e descarte ecológico de resíduos.',
    'Frimesa': 'Área estratégica com empresas, cooperativas e residências de trabalhadores do setor de alimentos, onde a higienização de caixas separadoras é fundamental.',
    'Ipê': 'Loteamento moderno em constante valorização urbana, necessitando de desobstrução preventiva de ramais coletores e caixas de inspeção.',
    'Maralúcia': 'Bairro residencial tradicional com excelente localização viária, atendido com agilidade em chamados de desentupimento de vasos e colunas prediais.',
    'Araucária': 'Novo bairro oficializado com casas modernas e condomínios unifamiliares, atendido com maquinário eletrorotativo sem danificar revestimentos cerâmicos.',
    'Santos Dumont': 'Setor planejado recente com loteamentos residenciais em expansão, demandando desentupimento de tubulações pluviais pós-chuvas fortes no Oeste.',
    'Iguaçu': 'Bairro dinâmico com ligações estratégicas aos eixos industriais, exigindo caminhões auto-vácuo para limpeza periódica de fossas sépticas.',
    'Jardim Panorâmico': 'Bairro em área elevada com vista panorâmica da cidade, onde o controle de pressão e desobstrução de ramais de água servida são frequentes.'
  },
  bairroEvidence: {
    'Centro': 'Polo financeiro e gastronômico na Avenida Brasília e Rua Argentina em Medianeira.',
    'Cidade Alta': 'Setor residencial de alto padrão construtivo com topografia privilegiada.',
    'Belo Horizonte': 'Comunidade tradicional com expressiva infraestrutura e serviços.',
    'Condá': 'Bairro central consolidado com ligação direta aos principais acessos.',
    'Itaipu': 'Vetor habitacional planejado com excelente padrão construtivo.',
    'Jardim Irene': 'Setor residencial tranquilo com predominância de residências unifamiliares.',
    'São Cristóvão': 'Polo misto de serviços, oficinas e residências consolidadas.',
    'Nazaré': 'Comunidade tradicional bem estruturada com atendimento prioritário 24 horas.',
    'Parque Independência': 'Bairro residencial nobre com praças e vias amplamente arborizadas.',
    'Frimesa': 'Região com forte vocação para agroindústria e comércio regional.',
    'Ipê': 'Loteamento moderno em franca valorização e desenvolvimento habitacional.',
    'Maralúcia': 'Bairro residencial consolidado de grande importância no município.',
    'Araucária': 'Novo bairro oficializado de Medianeira com moderna malha urbana.',
    'Santos Dumont': 'Área residencial recente em pleno processo de expansão.',
    'Iguaçu': 'Bairro com perfil misto e conexões diretas às áreas industriais.',
    'Jardim Panorâmico': 'Setor elevado residencial com vistas amplas da cidade de Medianeira.'
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
      question: 'Qual o tempo médio de chegada em Medianeira PR?',
      answer: 'Nossas equipes operacionais circulam estrategicamente pelas avenidas Brasília, 24 de Outubro e acessos da BR-277, chegando entre 20 e 40 minutos em qualquer bairro.'
    },
    {
      question: 'A visita técnica e o orçamento são gratuitos?',
      answer: 'Sim! Realizamos a vistoria técnica no local sem qualquer custo de deslocamento ou cobrança de taxa de visita em toda a cidade de Medianeira PR.'
    },
    {
      question: 'Vocês atendem cooperativas, frigoríficos e indústrias da região de Medianeira?',
      answer: 'Sim! Dispomos de caminhões combinados de hidrojateamento e auto-vácuo de alta potência para atendimento em plantas industriais e agropecuárias no Oeste Paranaense.'
    },
    {
      question: 'O desentupimento quebra pisos ou paredes?',
      answer: 'Não! Nossos equipamentos elétricos com cabos espirais flexíveis trabalham diretamente por dentro dos canos, desobstruindo sem quebrar alvenaria ou pisos.'
    },
    {
      question: 'Como é feito o esgotamento de fossas com caminhão a vácuo?',
      answer: 'Utilizamos mangotes de alta sucção acoplados ao tanque hermético do caminhão auto-vácuo, retirando todo o lodo acumulado e destinando para estação de tratamento credenciada.'
    },
    {
      question: 'Qual a garantia oferecida após a conclusão do serviço?',
      answer: 'Emitimos laudo de conformidade e garantia formal por escrito para todos os serviços executados em Medianeira PR, assegurando total transparência.'
    }
  ],
  testimonials: [
    {
      name: 'Nelson Bresolin',
      neighborhood: 'Centro',
      role: 'Comerciante na Avenida Brasília',
      text: 'Excelente atendimento no Centro de Medianeira! A tubulação da cozinha comercial entupiu no sábado à tarde. A equipe chegou em 25 minutos e resolveu tudo com máquina rotativa sem sujeira.',
      content: 'Excelente atendimento no Centro de Medianeira! A tubulação da cozinha comercial entupiu no sábado à tarde. A equipe chegou em 25 minutos e resolveu tudo com máquina rotativa sem sujeira.',
      rating: 5
    },
    {
      name: 'Patrícia Zanella',
      neighborhood: 'Cidade Alta',
      role: 'Moradora da Cidade Alta',
      text: 'O ralo e o vaso sanitário da nossa casa começaram a borbulhar e voltar água. O técnico foi muito profissional, identificou o entupimento na caixa externa e desentupiu na hora.',
      content: 'O ralo e o vaso sanitário da nossa casa começaram a borbulhar e voltar água. O técnico foi muito profissional, identificou o entupimento na caixa externa e desentupiu na hora.',
      rating: 5
    },
    {
      name: 'Vilmar Giacomini',
      neighborhood: 'Parque Independência',
      role: 'Morador do Parque Independência',
      text: 'Contratamos a limpeza da fossa séptica da nossa residência. Caminhão limpa fossa muito moderno, serviço limpo e preço justo com emissão de nota.',
      content: 'Contratamos a limpeza da fossa séptica da nossa residência. Caminhão limpa fossa muito moderno, serviço limpo e preço justo com emissão de nota.',
      rating: 5
    }
  ],
  parceiros: [
    {
      nome: 'Desentupidora Umuarama 24h',
      cidade: 'Umuarama',
      uf: 'PR',
      dominio: 'desentupidoraumuarama.com.br',
      url: 'https://desentupidora-umuarama.pages.dev',
      descricao: 'Nossa base parceira para atendimento técnico de desentupimento e hidrojateamento na região Noroeste do Paraná.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Pato Branco 24h',
      cidade: 'Pato Branco',
      uf: 'PR',
      dominio: 'desentupidorapatobranco.com.br',
      url: 'https://desentupidora-patobranco.pages.dev',
      descricao: 'Unidade parceira para serviços de limpeza de fossas e desobstrução de esgotos na região Sudoeste do Paraná.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Curitiba 24h',
      cidade: 'Curitiba',
      uf: 'PR',
      dominio: 'desentupidoracuritiba.pages.dev',
      url: 'https://desentupidora-curitiba-sns.pages.dev',
      descricao: 'Base central da nossa rede de atendimento para suporte avançado de engenharia sanitária e hidrojateamento.',
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
    estado: 'Paraná',
    uf: city.uf,
    populacao: city.populacao || '57.910',
    ddd: city.ddd || '45',
    whatsapp: city.whatsapp || '45998126740',
    telefoneFixo: city.telefoneFixo || city.phone || '(45) 3264-7890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'verde-eco',
    logoUrl: city.logoUrl || '/images/medianeira/logo-desentupidora-medianeira.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/medianeira/favicon-desentupidora-medianeira.webp',
    heroImage: city.heroImage || '/images/medianeira/desentupidora-medianeira-caminhao-limpa-fossa.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: {
      latitude: '-25.2975',
      longitude: '-54.0944'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: MEDIANEIRA / PR');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Medianeira no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'medianeira' || (c.cidade === 'Medianeira' && c.uf === 'PR'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...medianeiraData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(medianeiraData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(medianeiraData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-medianeira.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(medianeiraData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-medianeira.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'medianeira');
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
