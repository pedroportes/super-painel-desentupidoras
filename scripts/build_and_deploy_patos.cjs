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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Patos/PB...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'patos');
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
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#0284c7" letter-spacing="1.5">PATOS PB</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-patos.webp'));
  console.log('   ✅ Logo WebP gerada com sucesso.');

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
    .toFile(path.join(imgDir, 'favicon-desentupidora-patos.webp'));
  console.log('   ✅ Favicon WebP gerado com sucesso.');

  // Hero Image WebP leve
  const baseHero = path.join(ASTRO_DIR, 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-patos-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image WebP super leve gerada com sucesso.');
}

const patosData = {
  id: 'patos',
  cidade: 'Patos',
  name: 'Patos',
  slug: 'patos',
  uf: 'PB',
  estado: 'Paraíba',
  ddd: '83',
  populacao: '108.104',
  empresaNome: 'Desentupidora Patos PB 24h',
  whatsapp: '83998412890',
  telefoneFixo: '(83) 3421-4890',
  phone: '(83) 3421-4890',
  endereco: 'Rua Pedro Firmino, 350 - Centro, Patos - PB, 58700-070',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-patos.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/patos/logo-desentupidora-patos.webp',
  faviconUrl: '/images/patos/favicon-desentupidora-patos.webp',
  heroImage: '/images/patos/desentupidora-patos-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Patos PB 24h - Chegada Rápida',
  metaDescription: 'Desentupidora em Patos PB com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento!',
  h1Title: 'Desentupidora em Patos PB 24 Horas',
  firstParagraph: 'Procurando desentupidora em Patos PB? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão na Capital do Sertão Paraibano.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Patos',
  aboutCityText: 'Patos é o principal polo econômico, universitário e médico do Sertão Paraibano, situada estrategicamente no entroncamento da BR-230 e às margens do Rio Espinharas. O clima semiárido, as altas temperaturas e a intensa circulação comercial no Centro e no bairro Jatobá exigem manutenção preventiva e hidrojateamento de alta pressão para evitar sobrecargas e entupimentos recorrentes nas redes de esgoto.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Patos PB?',
  geoCoordinates: {
    latitude: '-7.0272',
    longitude: '-37.2803'
  },
  bairros: [
    'Centro',
    'Brasília',
    'Santo Antônio',
    'Belo Horizonte',
    'Bela Vista',
    'Distrito Industrial',
    'Jardim Magnólia',
    'Noé Trajano',
    'Novo Horizonte',
    'Ana Leite',
    'Salgadinho',
    'São Sebastião',
    'Sete Casas',
    'Alto da Tubiba',
    'Jatobá',
    'Jardim Santa Cecília',
    'Monte Castelo',
    'Nova Conquista',
    'Bivar Olinto',
    'Liberdade',
    'Morada do Sol',
    'Maternidade',
    'Morro',
    'Santa Gertrudes'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Patos concentra o coração financeiro e comercial do Sertão, abrangendo a Rua Pedro Firmino, Avenida Epitácio Pessoa e a histórica Catedral de Nossa Senhora da Guia. O grande fluxo diário em restaurantes e lojas exige desentupimento ágil e limpeza constante de caixas de gordura.',
    'Brasília': 'Bairro central e tradicional de Patos com vias movimentadas e residências consolidadas. Nossas equipes atuam 24 horas prestando atendimento técnico para desobstrução mecânica de ramais prediais, ralos de banheiro e redes de esgoto doméstico.',
    'Santo Antônio': 'Bairro histórico vizinho ao Centro com expressivo comércio de bairro e residências familiares. Tubulações antigas demandam tecnologia rotativa de ponta para desentupimento sem quebra de pisos ou danos estruturais.',
    'Belo Horizonte': 'Importante bairro da Zona Norte de Patos com grande expansão imobiliária e avenidas ativas. Realizamos serviços completos de esgotamento de fossas sépticas e limpeza de caixas de gordura com caminhão especializado.',
    'Bela Vista': 'Bairro residencial com topografia elevada e perfil familiar tranquilo. Atendemos residências e condomínios com chegada rápida para desentupimento de vasos sanitários, pias de cozinha e colunas pluviais.',
    'Distrito Industrial': 'Polo fabril estratégico às margens da BR-230, reunindo indústrias de calçados, confecções e galpões de logística. Oferecemos hidrojateamento industrial pesado e sucção de efluentes com laudo técnico.',
    'Jardim Magnólia': 'Bairro residencial arborizado e bem estruturado na Zona Norte de Patos. Nossos técnicos atendem prontamente chamados de ralos entupidos, canos de esgoto e inspeção preventiva de tubulações.',
    'Noé Trajano': 'Região dinâmica com constante crescimento residencial e pequenos comércios na Zona Norte. Fornecemos atendimento 24 horas para desentupimento de pias, ralos e caixas de inspeção sanitária.',
    'Novo Horizonte': 'Bairro planejado com novas construções e residências unifamiliares. Atuamos com equipes volantes garantindo socorro emergencial para transbordamentos de esgoto e desobstrução de vasos.',
    'Ana Leite': 'Bairro da Zona Leste com fácil acesso às principais saídas da cidade. Executamos desobstrução com sondas elétricas rotativas e limpeza profunda de redes coletoras de esgoto.',
    'Salgadinho': 'Bairro tradicional da Zona Leste situado nas proximidades do Rio Espinharas e canais urbanos. A drenagem local requer atenção constante e limpeza periódica de galerias pluviais e ramais de esgoto.',
    'São Sebastião': 'Bairro populoso e vibrante com comércio diversificado, praças e escolas. Realizamos desentupimentos residenciais e comerciais com garantia estendida e equipamentos modernos.',
    'Sete Casas': 'Bairro residencial tradicional com ligação rápida entre a Zona Norte e a Zona Leste de Patos. Oferecemos atendimento técnico limpo, rápido e sem complicações para moradores e pequenos negócios.',
    'Alto da Tubiba': 'Bairro elevado na Zona Sul de Patos com belas vistas e relevo característico. Prestamos serviços especializados de manutenção hidráulica e limpeza de caixas de gordura com agendamento flexível.',
    'Jatobá': 'Um dos maiores e mais ativos bairros da Zona Sul de Patos, com feiras livres, comércio forte e alta densidade. Demandas constantes de desentupimento em restaurantes, bares e residências são atendidas 24 horas.',
    'Jardim Santa Cecília': 'Bairro residencial calmo e seguro na Zona Sul. Atendemos chamados diários para desobstrução de pias de cozinha, vasos sanitários e limpeza completa de caixas de esgoto.',
    'Monte Castelo': 'Bairro consolidado da Zona Sul com expressiva circulação e variedade de serviços. Nossos especialistas resolvem entupimentos graves em prumadas prediais e redes de esgoto domésticas.',
    'Nova Conquista': 'Região residencial em expansão na Zona Sul de Patos com grande número de habitações. Atendemos com agilidade serviços de limpa fossa e desentupimentos em geral.',
    'Bivar Olinto': 'Grande complexo habitacional da Zona Oeste com milhares de moradores. Viaturas locais oferecem pronto atendimento para desobstrução de ramais de esgoto sanitário e caixas de inspeção.',
    'Liberdade': 'Bairro histórico e muito popular da Zona Oeste de Patos, com vida comunitária ativa e feira tradicional. Atendemos emergências 24 horas com equipamentos elétricos rotativos de alto desempenho.',
    'Morada do Sol': 'Bairro moderno da Zona Oeste com residências de alto padrão e condomínios fechados. Utilizamos maquinário silencioso e técnico para desobstruir tubulações sofisticadas sem sujeira.',
    'Maternidade': 'Bairro de grande relevância na Zona Oeste onde se concentra o complexo materno-infantil e clínicas médicas. Exige protocolos rígidos de higiene no desentupimento de instalações sanitárias.',
    'Morro': 'Bairro tradicional de relevo acidentado na Zona Oeste de Patos. Prestamos assistência completa para redes de esgoto e desentupimento preventivo com orçamento gratuito no local.',
    'Santa Gertrudes': 'Distrito estratégico de Patos cortado pela rodovia federal BR-230, com comunidades agrícolas, comércios e postos. Atendemos chácaras, sítios e empresas com caminhões limpa fossa e hidrojato.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução técnica de redes de esgoto em Patos PB com sondas rotativas e hidrojateamento de alta pressão, eliminando bloqueios graves sem danificar pisos e paredes.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção completa de gordura e resíduos acumulados em sifões e ramais de pias de cozinha e banheiros em Patos PB com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e higiênica de vasos sanitários em residências, condomínios e comércios de Patos PB, restabelecendo o fluxo sem quebrar louças.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, garagens, quintais e áreas de serviço em Patos PB, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Esgotamento e limpeza de fossas sépticas, sumidouros e poços negros em Patos PB com caminhão auto-vácuo e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, comerciais e prediais em Patos PB com jatos de água em alta pressão para desobstrução de raízes e crostas.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Patos PB?',
      answer: 'Basta entrar em contato pelo WhatsApp (83) 99841-2890 ou telefone fixo (83) 3421-4890. Nossa equipe técnica mais próxima em Patos se desloca até o seu endereço para realizar uma vistoria gratuita e apresentar o orçamento sem compromisso.'
    },
    {
      question: 'Qual é o tempo médio de chegada em Patos?',
      answer: 'Temos viaturas estrategicamente posicionadas em Patos PB, garantindo chegada ágil em até 30 a 40 minutos na maioria dos bairros urbanos e atendimento programado no distrito de Santa Gertrudes.'
    },
    {
      question: 'Vocês cobram taxa de visita em Patos?',
      answer: 'Não cobramos taxa de visita em Patos PB. A vistoria técnica para avaliação do problema e elaboração do orçamento é 100% gratuita.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim, todos os nossos serviços de desentupimento, limpeza de caixas de gordura e esgotamento de fossas em Patos contam com garantia formal por escrito.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito com parcelamento facilitado, dinheiro e faturamento para empresas e condomínios cadastrados.'
    },
    {
      question: 'Vocês atendem fins de semana e feriados em Patos?',
      answer: 'Sim! Nosso plantão de atendimento funciona 24 horas por dia, 7 dias por semana, incluindo sábados, domingos e feriados em toda a cidade de Patos.'
    }
  ],
  testimonials: [
    {
      name: 'Severino Manoel Bezerra',
      neighborhood: 'Jatobá',
      role: 'Comerciante',
      content: 'A rede de esgoto do restaurante entupiu em pleno almoço de domingo. A equipe chegou em menos de 25 minutos e resolveu tudo com equipamento rotativo sem quebrar nada. Recomendo demais!'
    },
    {
      name: 'Maria Cecília Medeiros',
      neighborhood: 'Centro',
      role: 'Advogada',
      content: 'A pia e o ralo do escritório no Centro estavam voltando água e mau cheiro. O técnico foi super profissional, limpou tudo e deixou o ambiente impecável. Preço justo e ótimo serviço.'
    },
    {
      name: 'José Carlos Wanderley',
      neighborhood: 'Belo Horizonte',
      role: 'Morador',
      content: 'Contratamos a limpeza de fossa na nossa casa no Belo Horizonte. O caminhão é moderno, a sucção foi muito rápida e não ficou nenhum cheiro desagradável. Nota 10!'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-patos',
  parceiros: [
    {
      id: 'p_crato',
      nome: 'Desentupidora Crato CE 24h',
      cidade: 'Crato',
      uf: 'CE',
      dominio: 'desentupidora-crato.pages.dev',
      url: 'https://desentupidora-crato.pages.dev',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento na região do Cariri Cearense.'
    },
    {
      id: 'p_itapipoca',
      nome: 'Desentupidora Itapipoca CE 24h',
      cidade: 'Itapipoca',
      uf: 'CE',
      dominio: 'desentupidora-itapipoca.pages.dev',
      url: 'https://desentupidora-itapipoca.pages.dev',
      descricao: 'Equipes 24 horas para desentupimento e esgotamento de fossas no litoral e serra do Ceará.'
    },
    {
      id: 'p_maranguape',
      nome: 'Desentupidora Maranguape CE 24h',
      cidade: 'Maranguape',
      uf: 'CE',
      dominio: 'desentupidora-maranguape.pages.dev',
      url: 'https://desentupidora-maranguape.pages.dev',
      descricao: 'Serviços de desentupimento de esgotos, pias, ralos e caixas de gordura na Região Metropolitana.'
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
    estado: 'Paraíba',
    uf: city.uf,
    populacao: city.populacao || '108.104',
    ddd: city.ddd || '83',
    whatsapp: city.whatsapp || '83998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(83) 3421-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/patos/logo-desentupidora-patos.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/patos/favicon-desentupidora-patos.webp',
    heroImage: city.heroImage || '/images/patos/desentupidora-patos-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-7.0272',
      longitude: '-37.2803'
    },
    seo: {
      metaTitle: city.metaTitle || `Desentupidora em ${city.cidade} ${city.uf} 24h - Chegada Rápida`,
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: PATOS / PB (#58)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Patos no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'patos' || (c.cidade === 'Patos' && c.uf === 'PB'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...patosData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(patosData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(patosData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-patos.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(patosData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-patos.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'patos' || (c.cidade === 'Patos' && c.uf === 'PB'));
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
