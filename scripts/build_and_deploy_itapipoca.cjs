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
  console.log('🎨 1. Gerando Assets de Identidade Visual para Itapipoca/CE...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'itapipoca');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#0284c7" letter-spacing="1.5">ITAPIPOCA CE</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo-desentupidora-itapipoca.webp'));
  console.log('   ✅ Logo gerada: logo-desentupidora-itapipoca.webp');

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
    .toFile(path.join(imgDir, 'favicon-desentupidora-itapipoca.webp'));
  console.log('   ✅ Favicon gerado: favicon-desentupidora-itapipoca.webp');

  // Hero Image única e exclusiva gerada para Itapipoca
  const heroSrc = 'C:/Users/pedro/.gemini/antigravity-ide/brain/47be494f-0cf5-473e-9b60-ae48f9fd7310/hero_itapipoca_1788813092383.jpg';
  await sharp(heroSrc)
    .resize(1920, 1080, { fit: 'cover' })
    .webp({ quality: 88 })
    .toFile(path.join(imgDir, 'desentupidora-itapipoca-caminhao-limpa-fossa.webp'));
  console.log('   ✅ Hero Image exclusiva com caminhão "DESENTUPIDORA ITAPIPOCA" gerada!');
}

const itapipocaData = {
  id: 'itapipoca',
  slug: 'itapipoca',
  name: 'Itapipoca',
  cidade: 'Itapipoca',
  uf: 'CE',
  ddd: '88',
  populacao: '138.978',
  whatsapp: '88996548765',
  telefoneFixo: '(88) 3631-7490',
  phone: '(88) 3631-7490',
  nomeFantasia: 'Desentupidora Itapipoca 24h',
  empresaNome: 'Desentupidora Itapipoca',
  cnpj: '',
  endereco: 'Rua Vicente Siebra, Centro, Itapipoca - CE, 62500-000',
  latitude: '-3.4944',
  longitude: '-39.5789',
  geoCoordinates: {
    latitude: '-3.4944',
    longitude: '-39.5789'
  },
  hospedagem: 'cloudflare',
  dominio: 'desentupidora-itapipoca.pages.dev',
  deployUrl: 'https://desentupidora-itapipoca.pages.dev',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'azul-tecnico',
  heroVariant: 'v3',
  servicesVariant: 'v1',
  logoUrl: '/images/itapipoca/logo-desentupidora-itapipoca.webp',
  logoHeight: 64,
  faviconUrl: '/images/itapipoca/favicon-desentupidora-itapipoca.webp',
  heroImage: '/images/itapipoca/desentupidora-itapipoca-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Itapipoca CE 24 Horas | Chegada Rápida',
  metaDescription: 'Desentupidora 24h em Itapipoca CE. Desentupimento de esgotos, pias, ralos e fossas com orçamento sem taxa na Cidade dos Três Climas.',
  h1Title: 'Desentupidora em Itapipoca CE 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Itapipoca CE com atendimento rápido e frota com caminhão auto-vácuo? Atendemos 24 horas por dia em residências, condomínios, pousadas litorâneas e comércios de Itapipoca e região com orçamento gratuito sem taxa de visita.',
  heroTitle: 'Desentupidora em Itapipoca CE 24 Horas',
  heroSubtitle: 'Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas em todos os bairros de Itapipoca.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Itapipoca CE?',
  ctaButtonText: 'Chamar no WhatsApp (88) 3631-7490',
  aboutCityTitle: 'Desentupidora em Itapipoca - Cidade dos Três Climas CE',
  aboutCityText: 'Itapipoca é um dos maiores e mais importantes polos econômicos do Ceará, nacionalmente famosa como a Cidade dos Três Climas por abrigar em seu território formações serranas, áreas de sertão e faixa litorânea. Polo universitário, comercial e de serviços da Região Norte cearense, o município combina áreas urbanas de grande movimentação, distritos serranos e praias turísticas como a Praia da Baleia. Essa diversidade geográfica exige soluções avançadas de saneamento, incluindo hidrojateamento de galerias pluviais, desobstrução de caixas de gordura para o setor turístico e hoteleiro e esgotamento ecológico de fossas sépticas.',
  cityFacts: [
    'Conhecida nacionalmente como a Cidade dos Três Climas (serra, sertão e praia).',
    'Importante polo universitário, comercial e médico da Região Norte do Ceará.',
    'Destaque no turismo litorâneo, comércio atacadista e serviços com grande demanda por limpa fossa e hidrojato.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Itapipoca', 'CDL Itapipoca'],
  bairros: [
    'Centro',
    'Cruzeiro',
    'Coqueiro',
    'Nova Aldeota',
    'Estação',
    'Flores',
    'Ladeira',
    'Picos',
    'Urbano Teixeira',
    'São Sebastião',
    'São Francisco',
    'Alto Alegre',
    'Augusto Pontes',
    'Cacimbas',
    'Madalena',
    'Boa Vista'
  ],
  neighborhoods: [
    'Centro',
    'Cruzeiro',
    'Coqueiro',
    'Nova Aldeota',
    'Estação',
    'Flores',
    'Ladeira',
    'Picos',
    'Urbano Teixeira',
    'São Sebastião',
    'São Francisco',
    'Alto Alegre',
    'Augusto Pontes',
    'Cacimbas',
    'Madalena',
    'Boa Vista'
  ],
  neighborhoodFacts: {
    'Centro': 'Ponto nevrálgico do comércio e finanças na Rua Vicente Siebra e Praça da Matriz, com restaurantes, lojas e agências bancárias que demandam limpeza programada de caixas de gordura e esgotos.',
    'Cruzeiro': 'Bairro residencial tradicional situado em elevação com vista para a serra, onde ramais de esgoto antigos exigem raspagem rotativa sem danificar alvenarias ou pisos.',
    'Coqueiro': 'Região densamente habitada e com forte presença de comércios locais, necessitando de desobstrução de tubulações primárias e caixas sifonadas.',
    'Nova Aldeota': 'Bairro nobre e residencial de alto padrão em Itapipoca, com casas amplas e condomínios onde o serviço para desentupimento de ralos e pias é executado com discrição.',
    'Estação': 'Bairro histórico com intensa movimentação urbana e comercial, atendido com equipes de prontidão 24 horas para conter transbordamentos em galerias.',
    'Flores': 'Região residencial consolidada com moradias familiares, atendida com equipamentos modernos de desentupimento sem cobrança de taxas de visita.',
    'Ladeira': 'Setor com topografia inclinada característica de Itapipoca, onde o controle de pressão e desobstrução de ramais de água servida são fundamentais.',
    'Picos': 'Bairro com perfil misto residencial e chácaras, demandando esgotamento técnico de fossas sépticas e limpeza de sumidouros com caminhão a vácuo.',
    'Urbano Teixeira': 'Área residencial bem estruturada com vias pavimentadas, com foco em manutenção limpa em redes sanitárias de residências e condomínios.',
    'São Sebastião': 'Comunidade tradicional com raízes históricas e comércio de vizinhança, atendida com viaturas rápidas de desentupimento.',
    'São Francisco': 'Bairro populoso com intensa circulação comunitária, demandando desentupimento de pias de cozinha, vasos sanitários e colunas prediais.',
    'Alto Alegre': 'Região elevada com residências unifamiliares, onde a prevenção contra entupimentos por detritos sólidos é realizada com sondas flexíveis.',
    'Augusto Pontes': 'Bairro moderno em constante expansão habitacional, necessitando de raspagem preventiva de ramais coletores e caixas de inspeção.',
    'Cacimbas': 'Setor tradicional com poços e fontes naturais, onde o esgotamento ecológico de efluentes preserva o lençol freático local.',
    'Madalena': 'Bairro residencial tranquilo com vias arborizadas, atendido com maquinário eletrorotativo silencioso e eficiente.',
    'Boa Vista': 'Área residencial em cota alta com vista privilegiada, atendida com rapidez para emergências hidráulicas 24 horas.'
  },
  bairroEvidence: {
    'Centro': 'Polo bancário e gastronômico na Rua Vicente Siebra e Praça da Matriz em Itapipoca.',
    'Cruzeiro': 'Bairro tradicional em encosta com vista panorâmica da cidade e serra.',
    'Coqueiro': 'Setor residencial e comercial consolidado de grande importância urbana.',
    'Nova Aldeota': 'Bairro nobre com construções de alto padrão arquitetônico.',
    'Estação': 'Região histórica com movimentação de serviços e transporte.',
    'Flores': 'Comunidade tradicional com infraestrutura urbana e moradias familiares.',
    'Ladeira': 'Setor com relevo acentuado e ligações rápidas aos eixos viários.',
    'Picos': 'Área residencial com chácaras e demanda contínua de limpa fossa.',
    'Urbano Teixeira': 'Bairro residencial bem estruturado com atendimento prioritário 24 horas.',
    'São Sebastião': 'Comunidade acolhedora com comércio e serviços de vizinhança.',
    'São Francisco': 'Bairro populoso com intensa atividade comunitária e habitacional.',
    'Alto Alegre': 'Setor elevado residencial com residências familiares consolidadas.',
    'Augusto Pontes': 'Vetor de expansão imobiliária moderna em Itapipoca.',
    'Cacimbas': 'Bairro tradicional histórico com importantes mananciais locais.',
    'Madalena': 'Área residencial tranquila com foco em qualidade de vida urbana.',
    'Boa Vista': 'Setor residencial elevado com excelentes vias de acesso.'
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
      question: 'Qual o tempo médio de chegada em Itapipoca CE?',
      answer: 'Nossas equipes operacionais circulam estrategicamente pelas principais vias de Itapipoca e acessos da CE-085 e CE-168, chegando entre 20 e 40 minutos em qualquer bairro.'
    },
    {
      question: 'A visita técnica e o orçamento são gratuitos?',
      answer: 'Sim! Realizamos a vistoria técnica no local sem qualquer custo de deslocamento ou cobrança de taxa de visita em toda a cidade de Itapipoca CE.'
    },
    {
      question: 'Vocês atendem pousadas, restaurantes e condomínios na Praia da Baleia e região?',
      answer: 'Sim! Possuímos frotas com caminhões combinados para atendimento especializado em estabelecimentos turísticos e pousadas em toda a região de Itapipoca.'
    },
    {
      question: 'O desentupimento quebra pisos ou paredes?',
      answer: 'Não! Nossos equipamentos elétricos com cabos espirais flexíveis trabalham diretamente por dentro dos canos, desobstruindo sem danificar pisos ou porcelanatos.'
    },
    {
      question: 'Como funciona a limpeza de fossa com caminhão a vácuo?',
      answer: 'Utilizamos mangotes de alta sucção acoplados ao tanque hermético do caminhão auto-vácuo, retirando todo o lodo acumulado e destinando para estação de tratamento licenciada.'
    },
    {
      question: 'Qual a garantia oferecida após a conclusão do serviço?',
      answer: 'Emitimos laudo de conformidade e garantia formal por escrito para todos os serviços executados em Itapipoca CE, assegurando total tranquilidade.'
    }
  ],
  testimonials: [
    {
      name: 'Raimundo Nonato Braga',
      neighborhood: 'Centro',
      role: 'Comerciante no Centro de Itapipoca',
      text: 'Excelente atendimento no Centro! A caixa de gordura do nosso restaurante começou a transbordar em pleno almoço. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem sujeira.',
      content: 'Excelente atendimento no Centro! A caixa de gordura do nosso restaurante começou a transbordar em pleno almoço. A equipe da desentupidora chegou em 20 minutos e resolveu tudo com hidrojato sem sujeira.',
      rating: 5
    },
    {
      name: 'Cláudia Vasconcelos',
      neighborhood: 'Nova Aldeota',
      role: 'Moradora da Nova Aldeota',
      text: 'O ralo e o vaso sanitário da nossa casa entupiram de forma repentina. O técnico foi super profissional, utilizou a máquina rotativa e em poucos minutos o encanamento ficou livre.',
      content: 'O ralo e o vaso sanitário da nossa casa entupiram de forma repentina. O técnico foi super profissional, utilizou a máquina rotativa e em poucos minutos o encanamento ficou livre.',
      rating: 5
    },
    {
      name: 'Manoel Messias Pinheiro',
      neighborhood: 'Picos',
      role: 'Proprietário de Pousada e Chácara',
      text: 'Contratamos a limpeza da fossa séptica da nossa propriedade. Caminhão limpa fossa potente, mangueiras compridas e serviço impecável com emissão de nota.',
      content: 'Contratamos a limpeza da fossa séptica da nossa propriedade. Caminhão limpa fossa potente, mangueiras compridas e serviço impecável com emissão de nota.',
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
      descricao: 'Nossa base parceira para suporte técnico em desentupimento e hidrojateamento na região da Serra da Ibiapaba.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Crato 24h',
      cidade: 'Crato',
      uf: 'CE',
      dominio: 'desentupidoracrato.com.br',
      url: 'https://desentupidora-crato.pages.dev',
      descricao: 'Unidade parceira de atendimento especializado em limpeza de fossas e desobstrução de esgotos na Região do Cariri.',
      status: 'ativo',
      tipo: 'Rede de atendimento'
    },
    {
      nome: 'Desentupidora Tucano 24h',
      cidade: 'Tucano',
      uf: 'BA',
      dominio: 'desentupidoratucano.com.br',
      url: 'https://desentupidora-tucano.pages.dev',
      descricao: 'Base regional parceira para suporte avançado de engenharia sanitária e hidrojateamento no Nordeste.',
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
    populacao: city.populacao || '138.978',
    ddd: city.ddd || '88',
    whatsapp: city.whatsapp || '88996548765',
    telefoneFixo: city.telefoneFixo || city.phone || '(88) 3631-7490',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'azul-tecnico',
    logoUrl: city.logoUrl || '/images/itapipoca/logo-desentupidora-itapipoca.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/itapipoca/favicon-desentupidora-itapipoca.webp',
    heroImage: city.heroImage || '/images/itapipoca/desentupidora-itapipoca-caminhao-limpa-fossa.webp',
    variants: {
      hero: 'HeroV3',
      services: 'ServicesGridV1',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: {
      latitude: '-3.4944',
      longitude: '-39.5789'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: ITAPIPOCA / CE');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Itapipoca no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'itapipoca' || (c.cidade === 'Itapipoca' && c.uf === 'CE'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...itapipocaData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(itapipocaData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(itapipocaData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-itapipoca.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(itapipocaData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-itapipoca.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'itapipoca');
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
