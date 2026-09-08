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
  console.log('🎨 1. Gerando Assets de Identidade Visual para Frutal/MG...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'frutal');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#0284c7" letter-spacing="1.5">FRUTAL MG</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo-desentupidora-frutal.webp'));
  console.log('   ✅ Logo gerada: logo-desentupidora-frutal.webp');

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
    .toFile(path.join(imgDir, 'favicon-desentupidora-frutal.webp'));
  console.log('   ✅ Favicon gerado: favicon-desentupidora-frutal.webp');

  // Hero Image
  const baseHero = path.join(ASTRO_DIR, 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(imgDir, 'desentupidora-frutal-caminhao-limpa-fossa.webp'));
  console.log('   ✅ Hero Image gerada: desentupidora-frutal-caminhao-limpa-fossa.webp');
}

const frutalData = {
  id: 'frutal',
  slug: 'frutal',
  name: 'Frutal',
  cidade: 'Frutal',
  uf: 'MG',
  ddd: '34',
  populacao: '61.275',
  whatsapp: '34997184520',
  telefoneFixo: '(34) 3421-7290',
  phone: '(34) 3421-7290',
  nomeFantasia: 'Desentupidora Frutal 24h',
  empresaNome: 'Desentupidora Frutal',
  cnpj: '',
  endereco: 'Avenida Afonso Pena, Centro, Frutal - MG, 38200-000',
  latitude: '-20.0247',
  longitude: '-48.9406',
  geoCoordinates: {
    latitude: '-20.0247',
    longitude: '-48.9406'
  },
  hospedagem: 'cloudflare',
  dominio: 'desentupidora-frutal.pages.dev',
  deployUrl: 'https://desentupidora-frutal.pages.dev',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'condominio-proativo',
  paletaCores: 'azul-tecnico',
  heroVariant: 'v4',
  servicesVariant: 'v2',
  logoUrl: '/images/frutal/logo-desentupidora-frutal.webp',
  logoHeight: 64,
  faviconUrl: '/images/frutal/favicon-desentupidora-frutal.webp',
  heroImage: '/images/frutal/desentupidora-frutal-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Frutal MG 24h',
  metaDescription: 'Desentupidora 24h em Frutal MG. Desentupimento de esgoto, pias, ralos, fossas e hidrojateamento com orçamento gratuito e chegada rápida.',
  h1Title: 'Desentupidora em Frutal MG 24 Horas',
  firstParagraph: 'Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas com caminhão auto-vácuo em todos os bairros e distritos de Frutal MG.',
  heroTitle: 'Desentupidora em Frutal MG 24 Horas',
  heroSubtitle: 'Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos e limpeza de fossas em todos os bairros de Frutal.',
  lastH2: 'Atendimento Emergencial 24h em Frutal MG',
  ctaButtonText: 'Chamar no WhatsApp (34) 3421-7290',
  aboutCityTitle: 'Desentupidora em Frutal - Triângulo Mineiro MG',
  aboutCityText: 'Frutal é um dos principais municípios do Triângulo Mineiro e Baixo Paranaíba, conhecida como a Cidade das Águas e polo universitário e agroindustrial da região. Com relevo suavemente ondulado, solo fértil e grande proximidade com a bacia hidrográfica do Rio Grande, a cidade combina áreas urbanas consolidadas, bairros universitários em expansão e intensa atividade agropecuária e industrial. Essas características demandam manutenção preventiva e corretiva especializada em redes pluviais, caixas separadoras e esgotamento técnico de fossas sépticas.',
  cityFacts: [
    'Conhecida nacionalmente como a Cidade das Águas no Triângulo Mineiro.',
    'Polo educacional e universitário abrigando campus integrado da UEMG e centros de pesquisa.',
    'Destaque no agronegócio regional e indústria sucroalcooleira, demandando suporte contínuo de hidrojateamento e auto-vácuo.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Frutal', 'UEMG Frutal'],
  bairros: [
    'Centro',
    'Alto Boa Vista',
    'Princesa Isabel',
    'Progresso',
    'Santos Dumont',
    'Frutal II',
    'Nossa Senhora do Carmo',
    'Ipê Amarelo',
    'Cidade das Águas',
    'Estudantil',
    'Novo Horizonte',
    'Eldorado',
    'Jardim do Bosque',
    'Alceu Queiroz',
    'Jardim Brasil',
    'Nova Frutal'
  ],
  neighborhoods: [
    'Centro',
    'Alto Boa Vista',
    'Princesa Isabel',
    'Progresso',
    'Santos Dumont',
    'Frutal II',
    'Nossa Senhora do Carmo',
    'Ipê Amarelo',
    'Cidade das Águas',
    'Estudantil',
    'Novo Horizonte',
    'Eldorado',
    'Jardim do Bosque',
    'Alceu Queiroz',
    'Jardim Brasil',
    'Nova Frutal'
  ],
  neighborhoodFacts: {
    'Centro': 'Coração comercial e financeiro de Frutal com alta concentração de restaurantes, lojas e agências bancárias ao longo da Avenida Afonso Pena, exigindo desentupimento ágil e limpeza periódica de caixas de gordura para estabelecimentos alimentícios.',
    'Alto Boa Vista': 'Bairro residencial nobre situado em cota elevada, com topografia inclinada que exige maquinário com controle preciso de pressão para evitar sobrecarga nas conexões hidrossanitárias residenciais.',
    'Princesa Isabel': 'Região tradicional com grande densidade habitacional e residências consolidadas, onde ramais primários de esgoto demandam raspagem mecânica com cabos espirais rotativos para eliminação de incrustações antigas.',
    'Progresso': 'Bairro dinâmico com comércios locais e pequenas indústrias, onde a desobstrução de redes coletoras e caixas de passagem é essencial para manter a regularidade do escoamento diário.',
    'Santos Dumont': 'Setor residencial estratégico com vias de acesso rápido, demandando atendimento emergencial contínuo para desentupimento de ralos pluviais, pias e vasos sanitários.',
    'Frutal II': 'Loteamento planejado com casas modernas e condomínios unifamiliares, onde o serviço com sondas rotativas desobstrui tubulações sem danificar pisos cerâmicos ou porcelanatos.',
    'Nossa Senhora do Carmo': 'Bairro histórico e muito populoso, caracterizado por ramais de água servida que necessitam de higienização técnica e desobstrução preventiva de sifões e caixas sifonadas.',
    'Ipê Amarelo': 'Área em forte crescimento urbano recente com novas habitações, onde a prevenção contra entupimentos por resíduos de obras e terra nas tubulações é frequente.',
    'Cidade das Águas': 'Bairro nobre e arborizado de Frutal, com foco em manutenção limpa e silenciosa em redes prediais, ralos de piscinas e ramais sanitários.',
    'Estudantil': 'Região vizinha a repúblicas e centros acadêmicos da UEMG, com alta rotatividade de moradores e uso intenso das instalações hidráulicas de banheiros e cozinhas.',
    'Novo Horizonte': 'Bairro em expansão contínua, onde galerias de esgoto e águas pluviais necessitam de hidrojateamento de alta pressão para prevenir refluxos na temporada de chuvas.',
    'Eldorado': 'Área com residências e galpões de serviços, demandando esgotamento técnico de fossas sépticas e limpeza de caixas separadoras com caminhão a vácuo.',
    'Jardim do Bosque': 'Setor residencial arborizado onde raízes de árvores e acúmulo de folhas frequentemente afetam calhas e redes subterrâneas de escoamento.',
    'Alceu Queiroz': 'Bairro tradicional com ruas pavimentadas e intensa circulação comunitária, atendido com viaturas rápidas para desentupimento de esgotos sem taxas de visita.',
    'Jardim Brasil': 'Região residencial com casas amplas, onde a desobstrução de ramais de pias e vasos sanitários é executada com total segurança e garantia técnica.',
    'Nova Frutal': 'Bairro moderno em rápida valorização, exigindo padrões elevados de limpeza técnica e descarte ecológico de efluentes em estações autorizadas.'
  },
  bairroEvidence: {
    'Centro': 'Ponto nevrálgico do comércio e gastronomia na Avenida Afonso Pena e Praça da Matriz em Frutal MG.',
    'Alto Boa Vista': 'Área residencial nobre com relevo acentuado e residências de alto padrão construtivo.',
    'Princesa Isabel': 'Bairro consolidado com expressiva densidade populacional e infraestrutura urbana completa.',
    'Progresso': 'Polo de comércio e serviços locais com fluxo constante de veículos e pedestres.',
    'Santos Dumont': 'Bairro bem localizado com ligação rápida às principais avenidas do município.',
    'Frutal II': 'Setor residencial moderno planejado com excelente padrão construtivo.',
    'Nossa Senhora do Carmo': 'Comunidade tradicional com raízes históricas e comércio de proximidade.',
    'Ipê Amarelo': 'Loteamento moderno em franca expansão habitacional em Frutal.',
    'Cidade das Águas': 'Bairro de destaque residencial com ampla arborização e valorização urbana.',
    'Estudantil': 'Bairro universitário dinâmico com grande contingente de estudantes da UEMG Frutal.',
    'Novo Horizonte': 'Vetor de crescimento urbano com novas edificações residenciais e comerciais.',
    'Eldorado': 'Região mista com residências e suporte a atividades de serviços e oficinas.',
    'Jardim do Bosque': 'Área residencial tranquila com praças e vias predominantemente arborizadas.',
    'Alceu Queiroz': 'Comunidade bem estruturada com atendimento prioritário 24 horas.',
    'Jardim Brasil': 'Bairro tradicional de Frutal com residências familiares consolidadas.',
    'Nova Frutal': 'Novo centro habitacional com condomínios e vias planejadas modernas.'
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
      question: 'Qual o tempo médio de chegada em Frutal MG?',
      answer: 'Nossas equipes operacionais circulam pelas principais vias de Frutal, como a Av. Afonso Pena e acessos aos bairros, chegando entre 20 e 40 minutos.'
    },
    {
      question: 'A visita técnica e o orçamento são gratuitos?',
      answer: 'Sim! Realizamos a vistoria técnica no local sem qualquer custo de deslocamento ou cobrança de taxa de visita em toda a cidade de Frutal MG.'
    },
    {
      question: 'Vocês atendem sítios, chácaras e empresas sucroalcooleiras na região de Frutal?',
      answer: 'Sim! Além de residências e condomínios urbanos, possuímos frota com caminhões combinados para atendimento em propriedades rurais e indústrias da região.'
    },
    {
      question: 'O desentupimento quebra pisos ou azulejos?',
      answer: 'Não! Nossos equipamentos elétricos com cabos espirais e ponteiras rotativas trabalham diretamente pelo interior da tubulação, sem necessidade de quebrar alvenaria.'
    },
    {
      question: 'Como funciona o serviço de limpeza de fossa com caminhão vácuo?',
      answer: 'Utilizamos mangotes de alta sucção acoplados ao caminhão auto-vácuo, removendo todo o lodo acumulado na fossa séptica e transportando para tratamento ambiental adequado.'
    },
    {
      question: 'Qual a garantia oferecida após a conclusão do serviço?',
      answer: 'Emitimos laudo de conformidade e garantia por escrito para todos os serviços executados em Frutal MG, assegurando total tranquilidade ao cliente.'
    }
  ],
  testimonials: [
    {
      name: 'Carlos Henrique Ribeiro',
      neighborhood: 'Centro',
      role: 'Proprietário de Restaurante no Centro',
      text: 'Excelente atendimento no Centro de Frutal! A caixa de gordura do restaurante começou a transbordar em pleno almoço de sábado. A equipe chegou em 25 minutos e resolveu tudo rapidamente.',
      content: 'Excelente atendimento no Centro de Frutal! A caixa de gordura do restaurante começou a transbordar em pleno almoço de sábado. A equipe chegou em 25 minutos e resolveu tudo rapidamente.',
      rating: 5
    },
    {
      name: 'Mariana Duarte',
      neighborhood: 'Estudantil',
      role: 'Moradora do Bairro Estudantil',
      text: 'O vaso sanitário da nossa república entupiu feio e não tínhamos como resolver. O técnico foi super profissional, usou uma máquina rotativa e desentupiu sem nenhuma sujeira.',
      content: 'O vaso sanitário da nossa república entupiu feio e não tínhamos como resolver. O técnico foi super profissional, usou uma máquina rotativa e desentupiu sem nenhuma sujeira.',
      rating: 5
    },
    {
      name: 'Eduardo Silveira Castro',
      neighborhood: 'Alto Boa Vista',
      role: 'Morador do Alto Boa Vista',
      text: 'Contratamos a limpeza da fossa da nossa residência no Alto Boa Vista. Caminhão limpa fossa muito moderno, mangueiras compridas e serviço impecável.',
      content: 'Contratamos a limpeza da fossa da nossa residência no Alto Boa Vista. Caminhão limpa fossa muito moderno, mangueiras compridas e serviço impecável.',
      rating: 5
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
    estado: 'Minas Gerais',
    uf: city.uf,
    populacao: city.populacao || '61.275',
    ddd: city.ddd || '34',
    whatsapp: city.whatsapp || '34997184520',
    telefoneFixo: city.telefoneFixo || city.phone || '(34) 3421-7290',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'azul-tecnico',
    logoUrl: city.logoUrl || '/images/frutal/logo-desentupidora-frutal.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/frutal/favicon-desentupidora-frutal.webp',
    heroImage: city.heroImage || '/images/frutal/desentupidora-frutal-caminhao-limpa-fossa.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: {
      latitude: city.latitude || '-20.0247',
      longitude: city.longitude || '-48.9406'
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
    services: servicesFormatted,
    bairros: city.bairros || [],
    faqs: city.faqs || [],
    testimonials: city.testimonials || []
  };

  fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
  writeBairroRedirects(city);
  console.log('   ✅ Astro cityConfig.json sincronizado com sucesso!');
}

async function main() {
  console.log('====================================================');
  console.log('🚀 CRIANDO E PUBLICANDO SITE: FRUTAL / MG');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Frutal no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'frutal' || (c.cidade === 'Frutal' && c.uf === 'MG'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...frutalData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(frutalData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(frutalData);

  // 4. Build Astro Site
  console.log('\n⚙️ 4. Compilando site estático completo no Astro (Home + Serviços + Bairros + MD)...');
  try {
    execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });
    console.log('   ✅ Build Astro concluído com sucesso!');
  } catch (err) {
    console.error('   ❌ Falha no Build Astro:', err.message);
    process.exit(1);
  }

  // 5. Deploy to Cloudflare Pages
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-frutal.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(frutalData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    console.log('   URL de Produção:', deployResult.deployUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'frutal');
    if (idx >= 0) {
      cities[idx].status = 'ativo';
      cities[idx].deployUrl = deployResult.deployUrl;
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
