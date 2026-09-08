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
  console.log('🎨 1. Gerando Assets de Identidade Visual para Crato/CE...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'crato');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#ea580c" letter-spacing="1.5">CRATO CE</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo-desentupidora-crato.webp'));
  console.log('   ✅ Logo gerada: logo-desentupidora-crato.webp');

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
    .toFile(path.join(imgDir, 'favicon-desentupidora-crato.webp'));
  console.log('   ✅ Favicon gerado: favicon-desentupidora-crato.webp');

  // Hero Image
  const baseHero = path.join(ASTRO_DIR, 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(imgDir, 'desentupidora-crato-caminhao-limpa-fossa.webp'));
  console.log('   ✅ Hero Image gerada: desentupidora-crato-caminhao-limpa-fossa.webp');
}

const cratoData = {
  id: 'crato',
  slug: 'crato',
  name: 'Crato',
  cidade: 'Crato',
  uf: 'CE',
  ddd: '88',
  populacao: '139.027',
  whatsapp: '88997321540',
  telefoneFixo: '(88) 3521-8490',
  phone: '(88) 3521-8490',
  nomeFantasia: 'Desentupidora Crato 24h',
  empresaNome: 'Desentupidora Crato',
  cnpj: '',
  endereco: 'Rua Doutor João Pessoa, Centro, Crato - CE, 63100-000',
  latitude: '-7.2344',
  longitude: '-39.4094',
  geoCoordinates: {
    latitude: '-7.2344',
    longitude: '-39.4094'
  },
  hospedagem: 'cloudflare',
  dominio: 'desentupidora-crato.pages.dev',
  deployUrl: 'https://desentupidora-crato.pages.dev',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'laranja-construcao',
  heroVariant: 'v3',
  servicesVariant: 'v1',
  logoUrl: '/images/crato/logo-desentupidora-crato.webp',
  logoHeight: 64,
  faviconUrl: '/images/crato/favicon-desentupidora-crato.webp',
  heroImage: '/images/crato/desentupidora-crato-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Crato CE 24 Horas | Atendimento Imediato',
  metaDescription: 'Desentupidora 24h em Crato CE. Desentupimento de esgotos, pias, ralos e fossas com orçamento sem taxa e atendimento rápido no Cariri.',
  h1Title: 'Desentupidora em Crato CE 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Crato CE com atendimento ágil e equipamentos de alta precisão? Nossa frota atende 24 horas por dia em residências, condomínios e comércios de todo o Cariri com orçamento gratuito sem taxa de visita.',
  heroTitle: 'Desentupidora em Crato CE 24 Horas',
  heroSubtitle: 'Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas em todos os bairros de Crato.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Crato CE?',
  ctaButtonText: 'Chamar no WhatsApp (88) 3521-8490',
  aboutCityTitle: 'Desentupidora em Crato - Região do Cariri Cearense',
  aboutCityText: 'Crato é um dos municípios mais importantes do Ceará e polo histórico, cultural e universitário da Região Metropolitana do Cariri, situado ao sopé da Chapada do Araripe. Conhecida pela riqueza de suas fontes naturais de água, clima serrano ameno e relevo com declives acentuados, a cidade combina bairros tradicionais e setores universitários dinâmicos. A proximidade com encostas e o fluxo hídrico natural exigem manutenção contínua e técnica em galerias pluviais, desobstrução de caixas de gordura e esgotamento especializado de fossas sépticas.',
  cityFacts: [
    'Polo cultural, religioso e educacional de destaque histórico na Região do Cariri cearense.',
    'Localizada estrategicamente junto à Floresta Nacional do Araripe, com importantes mananciais hídricos.',
    'Sede da Universidade Regional do Cariri (URCA) e intenso centro de comércio e serviços regionais.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal do Crato', 'URCA - Universidade Regional do Cariri'],
  bairros: [
    'Centro',
    'Pimenta',
    'Seminário',
    'São Miguel',
    'Grangeiro',
    'Parque Grangeiro',
    'Muriti',
    'Alto da Penha',
    'Vila Alta',
    'Mirandão',
    'Novo Lameiro',
    'Lameiro',
    'Belmonte',
    'Cacimbas',
    'São José',
    'Palmeiral',
    'Barro Branco',
    'Independência'
  ],
  neighborhoods: [
    'Centro',
    'Pimenta',
    'Seminário',
    'São Miguel',
    'Grangeiro',
    'Parque Grangeiro',
    'Muriti',
    'Alto da Penha',
    'Vila Alta',
    'Mirandão',
    'Novo Lameiro',
    'Lameiro',
    'Belmonte',
    'Cacimbas',
    'São José',
    'Palmeiral',
    'Barro Branco',
    'Independência'
  ],
  neighborhoodFacts: {
    'Centro': 'Coração comercial e histórico de Crato, com praças históricas, agências bancárias e restaurantes tradicionais na Rua Doutor João Pessoa, exigindo manutenção constante em caixas de gordura e ramais comerciais.',
    'Pimenta': 'Bairro dinâmico que abriga campi da Universidade Regional do Cariri (URCA), com intensa circulação de estudantes e alta demanda de desentupimento em banheiros, copas e repúblicas.',
    'Seminário': 'Região tradicional e histórica no topo de elevação com vistas panorâmicas, onde canalizações antigas exigem raspagem técnica rotativa com cabos especiais sem quebrar alvenaria.',
    'São Miguel': 'Bairro residencial e comercial densamente habitado, demandando desobstrução rápida de ramais de esgoto primário e limpeza preventiva de caixas de inspeção sanitária.',
    'Grangeiro': 'Bairro nobre e bucólico situado junto às encostas do Araripe, com residências amplas e condomínios que demandam esgotamento técnico de fossas sépticas e filtros biológicos.',
    'Parque Grangeiro': 'Setor residencial arborizado de alto padrão, onde raízes de vegetação nativa frequentemente causam estrangulamento de tubulações pluviais e esgoto subterrâneo.',
    'Muriti': 'Bairro estratégico na divisa com Juazeiro do Norte ao longo da Avenida Padre Cícero, com grande concentração de galpões, concessionárias e indústrias que utilizam hidrojato.',
    'Alto da Penha': 'Área residencial elevada com declives acentuados, onde o controle de refluxo sanitário e a desobstrução de caixas sifonadas são essenciais em períodos de chuvas.',
    'Vila Alta': 'Comunidade consolidada com ruas pavimentadas e casas tradicionais, atendida com viaturas rápidas de desentupimento sem taxas de visita técnica.',
    'Mirandão': 'Bairro em forte valorização imobiliária no Crato, com novas edificações residenciais que necessitam de raspagem de resíduos pós-obra em ramais coletores.',
    'Novo Lameiro': 'Setor em plena expansão urbana recente, onde a correta vazão hidrossanitária é assegurada com desentupidoras rotativas K-500 de alta potência.',
    'Lameiro': 'Região famosa por suas fontes de água natural e chácaras de lazer, demandando manutenção periódica em fossas e limpeza de caixas separadoras com caminhão vácuo.',
    'Belmonte': 'Bairro com perfil ecológico aos pés da serra, com clima agradável e necessidade de preservação de mananciais através do esgotamento ecológico de efluentes.',
    'Cacimbas': 'Área tradicional do Crato com residências familiares consolidadas, demandando atendimento emergencial para desentupimento de ralos, pias e vasos sanitários.',
    'São José': 'Bairro populoso com comércio de bairro e residências, onde a equipe técnica atua 24 horas para desobstrução de tubulações primárias com total segurança.',
    'Palmeiral': 'Região residencial tranquila com vias arborizadas, com foco em manutenção limpa e silenciosa em redes prediais e residenciais.',
    'Barro Branco': 'Comunidade tradicional com relevo característico, exigindo equipamentos pressurizados de hidrojateamento para limpeza profunda de galerias.',
    'Independência': 'Bairro residencial com localização estratégica, atendido com agilidade para emergências hidráulicas residenciais e comerciais 24 horas.'
  },
  bairroEvidence: {
    'Centro': 'Polo histórico e comercial de Crato na Rua Doutor João Pessoa e Praça da Sé.',
    'Pimenta': 'Bairro universitário abrigando campi da URCA e alta densidade de serviços.',
    'Seminário': 'Região histórica tradicional sobre elevação com rica arquitetura eclesiástica.',
    'São Miguel': 'Bairro comercial e residencial consolidado de grande importância na cidade.',
    'Grangeiro': 'Bairro nobre e bucólico situado junto às encostas verdes da Chapada do Araripe.',
    'Parque Grangeiro': 'Área residencial nobre arborizada com condomínios de alto padrão.',
    'Muriti': 'Polo comercial e logístico na ligação direta entre Crato e Juazeiro do Norte.',
    'Alto da Penha': 'Bairro em cota elevada com expressiva concentração populacional.',
    'Vila Alta': 'Comunidade tradicional com acesso rápido e comércio de vizinhança.',
    'Mirandão': 'Novo vetor de desenvolvimento habitacional e valorização no município.',
    'Novo Lameiro': 'Loteamento moderno em constante expansão e crescimento residencial.',
    'Lameiro': 'Região turística e balneária conhecida por suas fontes cristalinas do Araripe.',
    'Belmonte': 'Área residencial e de chácaras de lazer junto à Floresta Nacional.',
    'Cacimbas': 'Bairro tradicional do Crato com infraestrutura urbana completa.',
    'São José': 'Comunidade bem estruturada com atendimento prioritário 24 horas.',
    'Palmeiral': 'Setor residencial tranquilo com predominância de moradias familiares.',
    'Barro Branco': 'Bairro tradicional do Crato com forte identidade comunitária.',
    'Independência': 'Bairro bem localizado com ligação direta aos principais eixos viários.'
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
      question: 'Qual o tempo médio de chegada em Crato CE?',
      answer: 'Nossas equipes operacionais circulam pelas principais vias do Crato e Região do Cariri, garantindo chegada ágil entre 20 e 40 minutos em qualquer bairro.'
    },
    {
      question: 'A visita técnica e o orçamento são gratuitos?',
      answer: 'Sim! Realizamos a vistoria técnica no local sem qualquer custo de deslocamento ou cobrança de taxa de visita em toda a cidade de Crato CE.'
    },
    {
      question: 'Vocês atendem sítios, chácaras no Lameiro e empresas no Muriti?',
      answer: 'Sim! Mantemos frota completa com caminhões combinados para atendimento em propriedades rurais, chácaras de lazer e indústrias em todo o Cariri.'
    },
    {
      question: 'O desentupimento quebra pisos ou paredes?',
      answer: 'Não! Nossos equipamentos elétricos com cabos espirais e sondas rotativas trabalham diretamente pelo interior da tubulação, sem quebrar alvenaria.'
    },
    {
      question: 'Como funciona a limpeza de fossa com caminhão a vácuo?',
      answer: 'Acoplamos mangotes de alta sucção ao caminhão auto-vácuo, retirando todo o lodo acumulado na fossa séptica e transportando para tratamento ambiental adequado.'
    },
    {
      question: 'Qual a garantia oferecida após a conclusão do serviço?',
      answer: 'Emitimos laudo de conformidade e garantia formal por escrito para todos os serviços executados em Crato CE, proporcionando total segurança.'
    }
  ],
  testimonials: [
    {
      name: 'Francisco Valmir Bezerra',
      neighborhood: 'Centro',
      role: 'Comerciante no Centro',
      text: 'A caixa de gordura do nosso comércio no Centro do Crato começou a transbordar. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem causar bagunça.',
      content: 'A caixa de gordura do nosso comércio no Centro do Crato começou a transbordar. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem causar bagunça.',
      rating: 5
    },
    {
      name: 'Ana Cláudia Araripe',
      neighborhood: 'Pimenta',
      role: 'Estudante da URCA no Bairro Pimenta',
      text: 'O ralo e o vaso da nossa república no Pimenta entupiram juntos. O técnico foi muito atencioso, utilizou a máquina rotativa e em poucos minutos a água desceu livremente.',
      content: 'O ralo e o vaso da nossa república no Pimenta entupiram juntos. O técnico foi muito atencioso, utilizou a máquina rotativa e em poucos minutos a água desceu livremente.',
      rating: 5
    },
    {
      name: 'Dr. Geraldo Alencar',
      neighborhood: 'Grangeiro',
      role: 'Morador do Bairro Grangeiro',
      text: 'Contratamos a limpeza e esgotamento da fossa da nossa residência no Grangeiro. Caminhão auto-vácuo de primeira linha, pontualidade e serviço impecável.',
      content: 'Contratamos a limpeza e esgotamento da fossa da nossa residência no Grangeiro. Caminhão auto-vácuo de primeira linha, pontualidade e serviço impecável.',
      rating: 5
    }
  ],
  parceiros: [
    {
      nome: 'Desentupidora Tianguá 24h',
      cidade: 'Tianguá',
      uf: 'CE',
      dominio: 'desentupidoratiangua.com.br',
      url: 'https://desentupidora-tiangua.pages.dev',
      descricao: 'Nossa base parceira para suporte técnico em desentupimento e hidrojateamento na região norte do Ceará.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Tucano 24h',
      cidade: 'Tucano',
      uf: 'BA',
      dominio: 'desentupidoratucano.com.br',
      url: 'https://desentupidora-tucano.pages.dev',
      descricao: 'Unidade parceira de atendimento especializado em limpeza de fossas e desobstrução de esgotos no Nordeste.',
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
    estado: 'Ceará',
    uf: city.uf,
    populacao: city.populacao || '139.027',
    ddd: city.ddd || '88',
    whatsapp: city.whatsapp || '88997321540',
    telefoneFixo: city.telefoneFixo || city.phone || '(88) 3521-8490',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'laranja-construcao',
    logoUrl: city.logoUrl || '/images/crato/logo-desentupidora-crato.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/crato/favicon-desentupidora-crato.webp',
    heroImage: city.heroImage || '/images/crato/desentupidora-crato-caminhao-limpa-fossa.webp',
    variants: {
      hero: 'HeroV3',
      services: 'ServicesGridV1',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: {
      latitude: city.latitude || '-7.2344',
      longitude: city.longitude || '-39.4094'
    },
    seo: {
      metaTitle: city.metaTitle || `Desentupidora em ${city.cidade} ${city.uf} 24 Horas | Atendimento Imediato`,
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: CRATO / CE');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Crato no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'crato' || (c.cidade === 'Crato' && c.uf === 'CE'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...cratoData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(cratoData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(cratoData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-crato.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(cratoData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-crato.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'crato');
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
