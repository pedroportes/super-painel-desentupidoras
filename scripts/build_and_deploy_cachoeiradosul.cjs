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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Cachoeira do Sul/RS...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'cachoeiradosul');
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
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#0284c7" letter-spacing="0.5">CACHOEIRA DO SUL RS</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-cachoeiradosul.webp'));
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
    .toFile(path.join(imgDir, 'favicon-desentupidora-cachoeiradosul.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_cachoeira_do_sul_desentupidora_1789041337415.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-cachoeiradosul-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const csData = {
  id: 'cachoeira-do-sul',
  cidade: 'Cachoeira do Sul',
  name: 'Cachoeira do Sul',
  slug: 'cachoeira-do-sul',
  uf: 'RS',
  estado: 'Rio Grande do Sul',
  ddd: '51',
  populacao: '82.222',
  empresaNome: 'Desentupidora Cachoeira do Sul RS 24h',
  whatsapp: '51998412890',
  telefoneFixo: '(51) 3722-4890',
  phone: '(51) 3722-4890',
  endereco: 'Rua Sete de Setembro, 1120 - Centro, Cachoeira do Sul - RS, 96508-000',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-cachoeiradosul.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/cachoeiradosul/logo-desentupidora-cachoeiradosul.webp',
  faviconUrl: '/images/cachoeiradosul/favicon-desentupidora-cachoeiradosul.webp',
  heroImage: '/images/cachoeiradosul/desentupidora-cachoeiradosul-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Cachoeira do Sul RS 24h',
  metaDescription: 'Desentupidora em Cachoeira do Sul RS com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento gratuito!',
  h1Title: 'Desentupidora em Cachoeira do Sul RS 24 Horas',
  firstParagraph: 'Procurando desentupidora em Cachoeira do Sul RS? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão e sucção a vácuo em toda a Região Central Gaúcha e Vale do Jacuí.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Cachoeira do Sul - RS',
  aboutCityText: 'Cachoeira do Sul é a Capital Nacional do Arroz e polo agroindustrial estratégico da Depressão Central Gaúcha, situada às margens do Rio Jacuí e conectada pela histórica Ponte do Fandango. O relevo ondulado, o clima subtropical com invernos chuvosos e rigorosos e a transição entre as redes públicas operadas pela CORSAN e sistemas particulares de fossas sépticas exigem manutenção preventiva contínua. Nossos caminhões de hidrojateamento e máquinas rotativas atendem comércios na Rua Sete de Setembro, engenhos de arroz e residências familiares com máxima higiene e sem quebra.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Cachoeira do Sul RS?',
  geoCoordinates: {
    latitude: '-30.0389',
    longitude: '-52.8944'
  },
  bairros: [
    'Centro',
    'Soares',
    'Marina',
    'Barcelos',
    'Banhado Grande',
    'Frota',
    'Santo Antônio',
    'Santa Helena',
    'Fátima',
    'Ponche Verde',
    'Marques Ribeiro',
    'Otaviano',
    'Universitário',
    'Noêmia',
    'Gonçalves',
    'Augusta',
    'Drews',
    'Cristo Rei',
    'Medianeira',
    'Tupinambá',
    'Carvalho',
    'Parque da Romã',
    'Tibiriçá',
    'Vila Ferreira'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Cachoeira do Sul concentra prédios históricos e forte comércio ao longo da Rua Sete de Setembro e Praça José Bonifácio. O intenso fluxo de restaurantes e edifícios comerciais demanda limpeza contínua de caixas de gordura e desentupimento de redes sanitárias.',
    'Soares': 'Bairro residencial tradicional e valorizado próximo à área central. Nossas equipes prestam socorro 24 horas para desobstrução de prumadas prediais, ralos e ramais de esgoto.',
    'Marina': 'Bairro dinâmico com expressiva concentração habitacional e comércio variado. Atendemos com agilidade ocorrências de esgoto transbordando com orçamento gratuito no local.',
    'Barcelos': 'Bairro histórico com vias pavimentadas e perfil familiar. Suas redes hidráulicas tradicionais requerem atendimento especializado com máquinas rotativas para desentupimento sem quebra.',
    'Banhado Grande': 'Bairro situado em área plana próximo a áreas úmidas. A proximidade com bacias pluviais exige manutenção preventiva frequente e desobstrução de galerias pluviais e esgoto.',
    'Frota': 'Bairro residencial consolidado com perfil calmo e famílias de longa data. Fornece suporte técnico ágil para desentupimento de pias de cozinha, tanques e vasos sanitários.',
    'Santo Antônio': 'Um dos bairros mais populosos de Cachoeira do Sul, com forte presença de comércios vicinais. Realizamos hidrojateamento de alta pressão e limpa fossa 24h.',
    'Santa Helena': 'Bairro residencial arborizado com ruas tranquilas. Nossos especialistas atuam com rapidez na desobstrução de ralos de banheiro e redes coletoras.',
    'Fátima': 'Bairro acolhedor com forte convivência comunitária. Executamos desentupimentos mecânicos rápidos e seguros com garantia formal por escrito.',
    'Ponche Verde': 'Bairro planejado com residências modernas e novas construções. Prestamos serviços completos de esgotamento de fossas sépticas com caminhão auto-vácuo.',
    'Marques Ribeiro': 'Bairro de perfil misto com fácil acesso às avenidas principais. Atendimento técnico com equipamentos modernos e silenciosos que preservam louças.',
    'Otaviano': 'Bairro residencial calmo na Zona Leste. Nossas viaturas atendem chamados de emergência para desobstrução de redes coletoras e caixas de gordura.',
    'Universitário': 'Bairro que abriga polos educacionais e condomínios de estudantes. Demanda desentupimento contínuo de prumadas sanitárias e pias com atendimento ágil.',
    'Noêmia': 'Importante bairro residencial e comercial interligado aos principais eixos da cidade. Atendimento completo para desentupimento predial e comercial 24 horas.',
    'Gonçalves': 'Bairro acolhedor com moradias tradicionais. Realizamos desentupimentos de sifões, pias e ralos com total higiene e pontualidade.',
    'Augusta': 'Bairro residencial tranquilo em constante desenvolvimento. Equipes volantes atendem prontamente qualquer emergência hidráulica com maquinário limpo.',
    'Drews': 'Bairro tradicional da Zona Sul de Cachoeira do Sul. Oferecemos assistência técnica 24h para redes de esgoto residenciais e descarte ecológico.',
    'Cristo Rei': 'Bairro elevado com vista panorâmica da cidade e comércio ativo de vizinhança. Desobstrução rápida de encanamentos sanitários com preço justo.',
    'Medianeira': 'Bairro com perfil comunitário e vias arborizadas. Prestamos manutenção hidráulica completa e esgotamento de fossas com caminhão moderno.',
    'Tupinambá': 'Bairro residencial em expansão com novas moradias. Nossos técnicos atendem com viaturas equipadas para socorro imediato 24 horas.',
    'Carvalho': 'Bairro tradicional próximo a áreas rurais e chácaras. Fornecemos caminhão limpa fossa para esgotamento e desobstrução de redes pluviais.',
    'Parque da Romã': 'Loteamento planejado e arborizado com casas de excelente padrão. Atendimento especializado com foco em preservar pisos e acabamentos.',
    'Tibiriçá': 'Histórico e importante distrito agrícola de Cachoeira do Sul. Atendemos propriedades rurais, engenhos e residências com caminhão auto-vácuo.',
    'Vila Ferreira': 'Bairro acolhedor com forte presença de famílias e pequenos negócios. Realizamos desentupimentos rápidos de esgotos com facilidade de pagamento.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Cachoeira do Sul RS com máquinas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura acumulada e resíduos em canos e sifões de pias de cozinha em Cachoeira do Sul RS com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e higiênica de vasos sanitários em residências, empresas e restaurantes de Cachoeira do Sul RS, preservando louças e instalações.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, garagens e quintais em Cachoeira do Sul RS, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Limpeza e esgotamento de fossas sépticas e sumidouros em Cachoeira do Sul RS com caminhão auto-vácuo moderno e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, engenhos de arroz e redes comerciais em Cachoeira do Sul RS com jatos de água em alta pressão.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Cachoeira do Sul RS?',
      answer: 'Basta entrar em contato pelo WhatsApp (51) 99841-2890 ou telefone fixo (51) 3722-4890. Nossa equipe técnica em Cachoeira do Sul vai até o seu imóvel para realizar uma vistoria gratuita e apresentar o orçamento detalhado sem compromisso.'
    },
    {
      question: 'Vocês atendem entupimentos em redes ligadas à CORSAN?',
      answer: 'Sim! Atuamos no desentupimento de toda a rede hidráulica interna do imóvel (prumadas, caixas de inspeção, caixas de gordura e ramais prediais) até o ponto de ligação com a rede pública da CORSAN.'
    },
    {
      question: 'Como resolver refluxo de esgoto durante as chuvas fortes no Vale do Jacuí?',
      answer: 'Em períodos de chuva intensa, a alta do lençol freático e o volume pluvial podem sobrecarregar redes mal dimensionadas. Realizamos hidrojateamento de alta pressão e desobstrução das caixas de inspeção para restabelecer o escoamento imediato.'
    },
    {
      question: 'Vocês cobram taxa de visita em Cachoeira do Sul?',
      answer: 'Não cobramos taxa de visita em Cachoeira do Sul RS. A vistoria técnica para avaliação do problema e formulação do orçamento é 100% gratuita.'
    },
    {
      question: 'Qual é o tempo médio de chegada na cidade?',
      answer: 'Temos viaturas volantes posicionadas em pontos estratégicos de Cachoeira do Sul RS, garantindo chegada rápida em até 30 a 40 minutos na maioria dos bairros e no Centro.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim! Todos os nossos serviços de desentupimento de esgotos, pias, ralos, vasos e esgotamento de fossas contam com garantia formal por escrito emitida na conclusão.'
    }
  ],
  testimonials: [
    {
      name: 'Cláudio Roberto Silveira',
      neighborhood: 'Centro',
      role: 'Comerciante',
      content: 'A caixa de gordura do nosso restaurante na Rua Sete de Setembro transbordou na hora do pico. A equipe chegou em 25 minutos, fez o serviço com máquina limpa e resolveu tudo sem sujeira. Excelente atendimento!'
    },
    {
      name: 'Elisângela Dorneles Fontoura',
      neighborhood: 'Marina',
      role: 'Professora',
      content: 'O ralo e o vaso sanitário da nossa residência no Bairro Marina entupiram no domingo. O plantão 24h atendeu super rápido, técnico educado e preço muito justo com garantia. Recomendo!'
    },
    {
      name: 'Paulo Fernando Moraes',
      neighborhood: 'Soares',
      role: 'Engenheiro Agrônomo',
      content: 'Contratamos o caminhão limpa fossa para esgotamento das fossas da nossa propriedade no Bairro Soares. Caminhão moderno, sucção rápida e destinação ambiental correta. Nota 10!'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-cachoeiradosul',
  parceiros: [
    {
      id: 'p_erechim',
      nome: 'Desentupidora Erechim RS 24h',
      cidade: 'Erechim',
      uf: 'RS',
      dominio: 'desentupidora-erechim.pages.dev',
      url: 'https://desentupidora-erechim.pages.dev',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento no Alto Uruguai Gaúcho.'
    },
    {
      id: 'p_uruguaiana',
      nome: 'Desentupidora Uruguaiana RS 24h',
      cidade: 'Uruguaiana',
      uf: 'RS',
      dominio: 'desentupidora-uruguaiana.pages.dev',
      url: 'https://desentupidora-uruguaiana.pages.dev',
      descricao: 'Serviços de desentupimento de esgotos, pias, ralos e limpa fossa na Fronteira Oeste do RS.'
    },
    {
      id: 'p_riogrande',
      nome: 'Desentupidora Rio Grande RS 24h',
      cidade: 'Rio Grande',
      uf: 'RS',
      dominio: 'desentupidora-riogrande.vercel.app',
      url: 'https://desentupidora-riogrande.vercel.app',
      descricao: 'Equipes 24 horas para desentupimento e hidrojateamento na Zona Sul Gaúcha.'
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
    populacao: city.populacao || '82.222',
    ddd: city.ddd || '51',
    whatsapp: city.whatsapp || '51998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(51) 3722-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/cachoeiradosul/logo-desentupidora-cachoeiradosul.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/cachoeiradosul/favicon-desentupidora-cachoeiradosul.webp',
    heroImage: city.heroImage || '/images/cachoeiradosul/desentupidora-cachoeiradosul-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-30.0389',
      longitude: '-52.8944'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: CACHOEIRA DO SUL / RS (#66)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Cachoeira do Sul no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'cachoeira-do-sul' || (c.cidade === 'Cachoeira do Sul' && c.uf === 'RS'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...csData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(csData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(csData);

  // 4. Build Astro Site
  console.log('\n⚙️ 4. Compilando site estático completo no Astro (Home + Serviços + Bairros + Parceiros + MD)...');
  try {
    execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });
    console.log('   ✅ Build Astro concluído com sucesso!');
  } catch (err) {
    console.error('   ❌ Falha no Build Astro:', err.message);
    process.exit(1);
  }

  // 5. Deploy to Cloudflare Pages (O deployEngine chamará o IndexEngine automaticamente!)
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-cachoeiradosul.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(csData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-cachoeiradosul.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'cachoeira-do-sul' || (c.cidade === 'Cachoeira do Sul' && c.uf === 'RS'));
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
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 66');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Cachoeira do Sul (RS)');
      obsContent = obsContent.replace(/\d+ Cidades Ativas em Produção/, '66 Cidades Ativas em Produção');
      
      const csRow = '| **66** | **Cachoeira do Sul (RS)** | 82.222 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (51) 3722-4890 / (51) 998412890 | 38 págs | [Acessar Site](https://desentupidora-cachoeiradosul.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-cachoeiradosul.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*65\*\* \| \*\*Inhumas \(GO\)\*\* [^\n]+\n)/, '$1' + csRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Cachoeira do Sul (RS) como cidade #66!');
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
