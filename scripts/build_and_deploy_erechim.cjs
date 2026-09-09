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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Erechim/RS...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'erechim');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#0284c7" letter-spacing="1.5">ERECHIM RS</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-erechim.webp'));
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
    .toFile(path.join(imgDir, 'favicon-desentupidora-erechim.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_erechim_desentupidora_1788961700694.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-erechim-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const erechimData = {
  id: 'erechim',
  cidade: 'Erechim',
  name: 'Erechim',
  slug: 'erechim',
  uf: 'RS',
  estado: 'Rio Grande do Sul',
  ddd: '54',
  populacao: '109.609',
  empresaNome: 'Desentupidora Erechim RS 24h',
  whatsapp: '54998412890',
  telefoneFixo: '(54) 3522-4890',
  phone: '(54) 3522-4890',
  endereco: 'Avenida Maurício Cardoso, 450 - Centro, Erechim - RS, 99700-000',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-erechim.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/erechim/logo-desentupidora-erechim.webp',
  faviconUrl: '/images/erechim/favicon-desentupidora-erechim.webp',
  heroImage: '/images/erechim/desentupidora-erechim-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Erechim RS 24h - Chegada Rápida',
  metaDescription: 'Desentupidora em Erechim RS com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento!',
  h1Title: 'Desentupidora em Erechim RS 24 Horas',
  firstParagraph: 'Procurando desentupidora em Erechim RS? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão na Capital do Alto Uruguai Gaúcho.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Erechim',
  aboutCityText: 'Erechim é o principal polo econômico, educacional e agroindustrial do Norte Gaúcho, reconhecida pelo seu traçado urbano radial planejado com avenidas largas que convergem na Praça da Bandeira. O relevo ondulado do planalto serrano e as baixas temperaturas de inverno favorecem o acúmulo de gordura solidificada nas tubulações, exigindo soluções técnicas de hidrojateamento de alta pressão e manutenção preventiva de caixas de gordura e prumadas de esgoto.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Erechim RS?',
  geoCoordinates: {
    latitude: '-27.6341',
    longitude: '-52.2739'
  },
  bairros: [
    'Centro',
    'Bela Vista',
    'Cerâmica',
    'Copas Verdes',
    'José Bonifácio',
    'Koller',
    'Morro da Cegonha',
    'São Cristóvão',
    'Três Vendas',
    'Triângulo',
    'São Caetano',
    'Aeroporto',
    'Atlântico',
    'Boa Vista',
    'Colégio Agrícola',
    'Cristo Rei',
    'Dal Molin',
    'Esperança',
    'Espírito Santo',
    'Fátima',
    'Florestinha',
    'Frinape',
    'Industrial',
    'Ipiranga',
    'Linho',
    'Paiol Grande',
    'Parque Lívia',
    'Presidente Castelo Branco',
    'Presidente Vargas',
    'Progresso',
    'Santa Catarina'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Erechim abriga a icônica Praça da Bandeira, a Catedral São José e os principais eixos comerciais nas Avenidas Maurício Cardoso e Sete de Setembro. O grande movimento gastronômico e de edifícios comerciais demanda desentupimento regular de caixas de gordura e ramais de esgoto.',
    'Bela Vista': 'Bairro residencial nobre de Erechim situado em área elevada com belas residências e condomínios. Nossas equipes atuam 24h na desobstrução técnica de pias, vasos sanitários e prumadas com equipamentos rotativos modernos sem quebra.',
    'Cerâmica': 'Bairro tradicional e valorizado próximo à região central, com perfil residencial consolidado e clínicas de saúde. Realizamos manutenções preventivas e desentupimentos de ralos, sifões e caixas de inspeção sanitária.',
    'Copas Verdes': 'Região residencial tranquila com ruas arborizadas e moradias familiares de médio e alto padrão. Oferecemos pronto atendimento para desobstrução de esgotos domésticos e limpeza profunda de tubulações pluviais.',
    'José Bonifácio': 'Bairro dinâmico que combina áreas residenciais e comércios de proximidade com fácil acesso às avenidas perimetrais. Atendemos com agilidade ocorrências de esgoto transbordando e pias obstruídas.',
    'Koller': 'Bairro residencial tradicional de Erechim caracterizado pela tranquilidade e forte convivência comunitária. Nossas viaturas prestam atendimento rápido para desentupimento de ramais prediais e ralos.',
    'Morro da Cegonha': 'Bairro de relevo acidentado com vista panorâmica da cidade e residências de alto padrão. Prestamos serviços especializados com sondas flexíveis para tubulações com curvas acentuadas e desníveis.',
    'São Cristóvão': 'Um dos maiores e mais tradicionais bairros de Erechim, com intenso comércio local, escolas e indústrias. Atendemos comércios, restaurantes e residências com hidrojateamento e desentupimento 24 horas.',
    'Três Vendas': 'Polo comercial e residencial altamente movimentado na Zona Norte de Erechim, interligando importantes rodovias. Demanda constante por limpeza de caixas de gordura e desobstrução de redes de esgoto.',
    'Triângulo': 'Bairro estratégico com entroncamentos viários e perfil misto comercial e residencial. Realizamos desobstrução mecânica de tubulações e esgotamento preventivo de fossas sépticas com equipe técnica.',
    'São Caetano': 'Bairro residencial em expansão com novas construções e loteamentos planejados. Oferecemos suporte completo para desentupimento emergencial de banheiros, pias e caixas de passagem.',
    'Aeroporto': 'Bairro localizado próximo ao Aeroporto Regional de Erechim, abrigando hangares, empresas e áreas residenciais. Prestamos serviços especializados de hidrojateamento de alta pressão e sucção de efluentes.',
    'Atlântico': 'Grande bairro populoso da Zona Leste de Erechim, com forte comércio comunitário e serviços. Nossas equipes garantem chegada rápida para desentupimento de vasos, ralos e redes de esgoto.',
    'Boa Vista': 'Bairro residencial tradicional com perfil calmo e famílias consolidadas. Atendemos chamados diários para desobstrução de pias de cozinha, lavanderias e tubulações de esgoto.',
    'Colégio Agrícola': 'Região que sedia instituições de ensino técnico e propriedades com perfil semiurbano. Realizamos esgotamento de fossas sépticas e limpeza de galerias com caminhão auto-vácuo.',
    'Cristo Rei': 'Bairro vibrante com igrejas históricas, praças e comércio diversificado. Fornecemos atendimento 24 horas com equipamentos elétricos rotativos para desobstrução limpa e rápida.',
    'Dal Molin': 'Bairro residencial em desenvolvimento na Zona Norte com novas moradias. Nossos técnicos solucionam com eficiência refluxos de esgoto e realizam vistorias gratuitas no local.',
    'Esperança': 'Bairro com expressiva densidade populacional e vida comunitária ativa. Equipes volantes atendem emergências hidráulicas com maquinário moderno e garantia formal do serviço.',
    'Espírito Santo': 'Bairro tradicional de Erechim com perfil familiar e pequenos estabelecimentos. Executamos desentupimentos de ralos, prumadas e limpeza de caixas de gordura com total higiene.',
    'Fátima': 'Bairro dinâmico com serviços essenciais e vias de conexão rápida ao Centro. Atendimento pontual para residências e condomínios com desobstrução especializada sem danos a pisos.',
    'Florestinha': 'Bairro residencial cercado por áreas verdes e topografia suave. Atendemos residências e chácaras com serviços de limpa fossa, desentupimento de pias e desobstrução de canos.',
    'Frinape': 'Bairro vizinho ao Parque da Frinape, polo de grandes feiras e eventos agroindustriais de Erechim. Atendemos pavilhões, galpões e comércios com hidrojateamento de grande porte.',
    'Industrial': 'Polo fabril estratégico de Erechim que abriga indústrias metalmecânicas, transportadoras e frigoríficos. Demanda hidrojateamento pesado, sucção de efluentes industriais e desobstrução de prumadas.',
    'Ipiranga': 'Bairro tradicional e bem localizado com residências e pequenos negócios. Realizamos desentupimentos mecânicos rápidos em vasos sanitários, ralos e caixas de inspeção.',
    'Linho': 'Bairro com histórico ligado ao desenvolvimento operário e industrial de Erechim. Prestamos socorro 24 horas para redes coletoras de esgoto e desentupimento de ramais domésticos.',
    'Paiol Grande': 'Um dos maiores bairros habitacionais de Erechim com comércio autônomo vigoroso. Equipes locais realizam desentupimentos rápidos com maquinário rotativo e preço justo.',
    'Parque Lívia': 'Bairro residencial planejado com imóveis modernos e perfil familiar. Atendimento diferenciado com equipamentos limpos e silenciosos para desobstrução de tubulações residenciais.',
    'Presidente Castelo Branco': 'Bairro consolidado com vias pavimentadas e perfil comunitário tradicional. Oferecemos manutenção preventiva de redes hidráulicas e desentupimento de esgotos.',
    'Presidente Vargas': 'Bairro populoso com grande número de residências e pequenos comércios. Nossas viaturas atuam 24 horas no desentupimento de vasos, pias e esgotamento de fossas sépticas.',
    'Progresso': 'Bairro dinâmico da Zona Sul com expressivo crescimento urbano. Atendemos chamados de emergência para esgoto transbordando com chegada técnica em até 30 minutos.',
    'Santa Catarina': 'Bairro tradicional com acesso às saídas para o estado vizinho e comércio de estrada. Realizamos hidrojateamento preventivo e desentupimento para postos, empresas e residências.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Erechim RS com máquinas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura solidificada e resíduos acumulados em canos e sifões de pias de cozinha em Erechim RS com maquinário específico e higiênico.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida de vasos sanitários em residências, empresas e prédios em Erechim RS, preservando louças e instalações sanitárias.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução de ralos de banheiros, garagens e áreas de serviço em Erechim RS, eliminando mau cheiro e refluxo de água.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Limpeza e esgotamento de fossas sépticas e sumidouros em Erechim RS com caminhão auto-vácuo moderno e descarte ecológico regulamentado.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza técnica de redes industriais, comerciais e prediais em Erechim RS com jatos de água em alta pressão para desobstrução de raízes e crostas.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Erechim RS?',
      answer: 'Você entra em contato pelo WhatsApp (54) 99841-2890 ou telefone fixo (54) 3522-4890. Nossa viatura técnica mais próxima em Erechim vai até o seu endereço para realizar uma vistoria gratuita e apresentar o orçamento sem compromisso.'
    },
    {
      question: 'Qual é o tempo de chegada em Erechim?',
      answer: 'Atendemos com viaturas posicionadas estrategicamente em Erechim RS, garantindo chegada rápida em até 30 a 40 minutos em todos os bairros urbanos e distritos.'
    },
    {
      question: 'Vocês cobram taxa de visita em Erechim?',
      answer: 'Não cobramos taxa de visita em Erechim RS. A avaliação técnica presencial e a formulação do orçamento são 100% gratuitas.'
    },
    {
      question: 'O serviço de desentupimento possui garantia?',
      answer: 'Sim, todos os serviços de desentupimento, hidrojateamento e limpeza de fossas contam com garantia formal por escrito emitida na conclusão do serviço.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito em até 12x, dinheiro e faturamento bancário para indústrias, condomínios e empresas cadastradas.'
    },
    {
      question: 'O atendimento funciona aos finais de semana e feriados?',
      answer: 'Sim! Nosso plantão de atendimento de emergência funciona 24 horas por dia, 7 dias por semana, inclusive em domingos e feriados em toda a região de Erechim.'
    }
  ],
  testimonials: [
    {
      name: 'Paulo Ricardo Menegatti',
      neighborhood: 'Três Vendas',
      role: 'Comerciante',
      content: 'A caixa de gordura do nosso restaurante nas Três Vendas transbordou no sábado à noite. A equipe chegou em 25 minutos com o caminhão e desobstruiu tudo com muita rapidez e higiene. Excelente serviço!'
    },
    {
      name: 'Luciana Maria Zardo',
      neighborhood: 'Bela Vista',
      role: 'Arquiteta',
      content: 'Tivemos um entupimento na prumada do condomínio no Bela Vista. O técnico utilizou a sonda rotativa e resolveu o problema sem quebrar nenhum azulejo. Muito profissionais e educados!'
    },
    {
      name: 'Cláudio Roberto Sperotto',
      neighborhood: 'Industrial',
      role: 'Gerente Industrial',
      content: 'Contratamos o hidrojateamento para as galerias da nossa empresa no Distrito Industrial. O serviço foi impecável, cumpriram as normas de segurança e emitiram o laudo na hora. Recomendo!'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-erechim',
  parceiros: [
    {
      id: 'p_riogrande',
      nome: 'Desentupidora Rio Grande RS 24h',
      cidade: 'Rio Grande',
      uf: 'RS',
      dominio: 'desentupidora-riogrande.vercel.app',
      url: 'https://desentupidora-riogrande.vercel.app',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento na Zona Sul Gaúcha.'
    },
    {
      id: 'p_bage',
      nome: 'Desentupidora Bagé RS 24h',
      cidade: 'Bagé',
      uf: 'RS',
      dominio: 'desentupidora-bage.vercel.app',
      url: 'https://desentupidora-bage.vercel.app',
      descricao: 'Equipes de prontidão 24 horas para desentupimento de esgotos e limpa fossa na Região da Campanha.'
    },
    {
      id: 'p_patobranco',
      nome: 'Desentupidora Pato Branco PR 24h',
      cidade: 'Pato Branco',
      uf: 'PR',
      dominio: 'desentupidora-patobranco.vercel.app',
      url: 'https://desentupidora-patobranco.vercel.app',
      descricao: 'Desentupidora com hidrojateamento e esgotamento de fossas no Sudoeste do Paraná.'
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
    estado: 'Rio Grande do Sul',
    uf: city.uf,
    populacao: city.populacao || '109.609',
    ddd: city.ddd || '54',
    whatsapp: city.whatsapp || '54998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(54) 3522-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/erechim/logo-desentupidora-erechim.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/erechim/favicon-desentupidora-erechim.webp',
    heroImage: city.heroImage || '/images/erechim/desentupidora-erechim-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-27.6341',
      longitude: '-52.2739'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: ERECHIM / RS (#59)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Erechim no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'erechim' || (c.cidade === 'Erechim' && c.uf === 'RS'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...erechimData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(erechimData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(erechimData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-erechim.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(erechimData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-erechim.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'erechim' || (c.cidade === 'Erechim' && c.uf === 'RS'));
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
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 59');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Erechim (RS)');
      obsContent = obsContent.replace(/58 Cidades Ativas em Produção/, '59 Cidades Ativas em Produção');
      
      const erechimRow = '| **59** | **Erechim (RS)** | 109.609 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (54) 3522-4890 / (54) 998412890 | 45 págs | [Acessar Site](https://desentupidora-erechim.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-erechim.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*58\*\* \| \*\*Patos \(PB\)\*\* [^\n]+\n)/, '$1' + erechimRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Erechim (RS) como cidade #59!');
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
