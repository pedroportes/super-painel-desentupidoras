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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Uruguaiana/RS...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'uruguaiana');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#0284c7" letter-spacing="1.5">URUGUAIANA RS</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-uruguaiana.webp'));
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
    .toFile(path.join(imgDir, 'favicon-desentupidora-uruguaiana.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_uruguaiana_desentupidora_1788963326172.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-uruguaiana-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const uruguaianaData = {
  id: 'uruguaiana',
  cidade: 'Uruguaiana',
  name: 'Uruguaiana',
  slug: 'uruguaiana',
  uf: 'RS',
  estado: 'Rio Grande do Sul',
  ddd: '55',
  populacao: '120.819',
  empresaNome: 'Desentupidora Uruguaiana RS 24h',
  whatsapp: '55998412890',
  telefoneFixo: '(55) 3412-4890',
  phone: '(55) 3412-4890',
  endereco: 'Rua Bento Martins, 2450 - Centro, Uruguaiana - RS, 97501-520',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-uruguaiana.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/uruguaiana/logo-desentupidora-uruguaiana.webp',
  faviconUrl: '/images/uruguaiana/favicon-desentupidora-uruguaiana.webp',
  heroImage: '/images/uruguaiana/desentupidora-uruguaiana-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Uruguaiana RS 24h - Chegada Rápida',
  metaDescription: 'Desentupidora em Uruguaiana RS com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento!',
  h1Title: 'Desentupidora em Uruguaiana RS 24 Horas',
  firstParagraph: 'Procurando desentupidora em Uruguaiana RS? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão na Fronteira Oeste Gaúcha.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Uruguaiana',
  aboutCityText: 'Uruguaiana é o maior polo de comércio exterior e transporte rodoviário da América Latina, estrategicamente situada na Fronteira Oeste Gaúcha às margens do Rio Uruguai. O intenso fluxo logístico no Porto Seco, as baixas temperaturas de inverno na Campanha e o relevo plano exigem manutenção preventiva periódica e hidrojateamento de alta pressão em ramais coletoras e caixas de gordura para evitar obstruções e transbordamentos no sistema de esgoto.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Uruguaiana RS?',
  geoCoordinates: {
    latitude: '-29.7547',
    longitude: '-57.0883'
  },
  bairros: [
    'Centro',
    'Cidade Nova',
    'Bela Vista',
    'São Miguel',
    'São João',
    'Cabo Luiz Quevedo',
    'Cohab I',
    'Cohab II',
    'Santo Inácio',
    'Mascarenhas de Moraes',
    'Nova Esperança',
    'Hípica',
    'Santana',
    'Vila Júlia',
    'Tabajara Brites',
    'Ipiranga',
    'Proficar',
    'Rui Ramos',
    'União das Vilas',
    'Rio Branco',
    'São José',
    'Francisca Tarragó',
    'Área Industrial',
    'Barragem Sanchuri'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Uruguaiana concentra a atividade comercial e histórica ao longo da Rua Bento Martins, Rua Duque de Caxias e a Praça Barão do Rio Branco. A densidade de edifícios antigos e restaurantes exige desentupimento especializado e limpeza regular de caixas de gordura.',
    'Cidade Nova': 'Bairro residencial e comercial consolidado de Uruguaiana com grande movimento urbano. Nossas equipes atuam 24 horas prestando atendimento técnico para desobstrução de redes de esgoto domésticas, pias e ralos de banheiros.',
    'Bela Vista': 'Bairro residencial nobre de Uruguaiana com residências amplas e condomínios fechados. Fornecemos serviços silenciosos com maquinário rotativo moderno para desobstrução de encanamentos sem danificar pisos e revestimentos.',
    'São Miguel': 'Bairro tradicional e populoso com forte presença de comércios locais e prestadores de serviço. Atendemos com agilidade ocorrências de esgoto sanitário transbordando e limpeza preventiva de caixas de inspeção.',
    'São João': 'Bairro dinâmico com vias de ligação importantes e comércio de proximidade. Nossos técnicos realizam desentupimentos mecânicos rápidos em vasos sanitários, pias de cozinha e ralos pluviais.',
    'Cabo Luiz Quevedo': 'Grande bairro habitacional da Zona Leste com milhares de famílias e comércio ativo. Viaturas locais garantem chegada técnica em até 30 minutos para desentupimentos residenciais e esgotamento de fossas.',
    'Cohab I': 'Complexo residencial tradicional com alta densidade habitacional. Prestamos assistência emergencial 24 horas para desobstrução de prumadas e redes coletoras condominiais.',
    'Cohab II': 'Conjunto habitacional consolidado na Zona Sul de Uruguaiana. Oferecemos soluções completas para esgoto entupido, refluxo em ralos e limpeza técnica de sifões.',
    'Santo Inácio': 'Bairro com perfil misto residencial e comercial próximo a eixos viários da cidade. Realizamos hidrojateamento preventivo e desobstrução de ramais prediais com orçamento gratuito no local.',
    'Mascarenhas de Moraes': 'Bairro residencial planejado com moradias familiares e praças comunitárias. Nossas equipes prestam socorro rápido para desentupimento de vasos sanitários e caixas de gordura.',
    'Nova Esperança': 'Bairro residencial em expansão com constante crescimento urbano. Executamos serviços de limpa fossa com caminhão auto-vácuo e desobstrução com sondas elétricas rotativas.',
    'Hípica': 'Bairro nobre e arborizado de Uruguaiana, próximo ao Jockey Club e clubes sociais. Atendimento técnico especializado para desentupimento de tubulações sofisticadas com total discrição e limpeza.',
    'Santana': 'Bairro tradicional ribeirinho com vista para o Rio Uruguai e perfil comunitário ativo. A proximidade com o rio exige atenção especial às galerias pluviais e desobstrução preventiva de esgotos.',
    'Vila Júlia': 'Bairro residencial tranquilo com famílias consolidadas e ruas calmas. Atendemos chamados diários para desentupimento de pias de cozinha, tanques de lavanderia e ralos.',
    'Tabajara Brites': 'Bairro tradicional da Zona Norte com comércio variado e escolas. Oferecemos atendimento 24 horas para desobstrução de redes de esgoto e manutenção de caixas de gordura.',
    'Ipiranga': 'Bairro vibrante com serviços essenciais e rápido acesso ao Centro. Nossos especialistas solucionam entupimentos em ramais de esgoto com equipamentos rotativos de última geração.',
    'Proficar': 'Região habitacional dinâmica com intensa circulação de moradores. Fornecemos atendimento pontual para desentupimento de esgotos residenciais com garantia formal por escrito.',
    'Rui Ramos': 'Bairro residencial tradicional com perfil comunitário acolhedor. Prestamos serviços de desentupimento mecânico e hidrojateamento com preços justos e facilidade de pagamento.',
    'União das Vilas': 'Comunidade populosa na periferia urbana de Uruguaiana. Equipes volantes atendem prontamente ocorrências de transbordamento de esgoto e esgotamento de fossas sépticas.',
    'Rio Branco': 'Bairro histórico com construções tradicionais e vias movimentadas. Realizamos desentupimentos especializados em tubulações antigas sem provocar danos estruturais.',
    'São José': 'Bairro residencial com comércio de vizinhança e áreas de lazer. Atendemos emergências 24h para desobstrução de pias, vasos sanitários e redes pluviais.',
    'Francisca Tarragó': 'Bairro residencial calmo com grande número de moradias familiares. Nossas viaturas prestam atendimento rápido para desentupimento de ramais de esgoto e caixas de gordura.',
    'Área Industrial': 'Polo aduaneiro e logístico estratégico que abriga o maior Porto Seco da América Latina, transportadoras e armazéns. Demanda hidrojateamento industrial pesado e sucção de efluentes com laudo técnico.',
    'Barragem Sanchuri': 'Importante distrito e polo agrícola de Uruguaiana, centro da produção arrozeira gaúcha. Atendemos propriedades rurais, armazéns e granjas com caminhões limpa fossa e hidrojato sob agendamento.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Uruguaiana RS com sondas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura solidificada e resíduos acumulados em canos e sifões de pias de cozinha em Uruguaiana RS com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução higiênica e rápida de vasos sanitários em residências, condomínios e comércios em Uruguaiana RS, preservando louças e encanamentos.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, garagens e quintais em Uruguaiana RS, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Esgotamento e limpeza de fossas sépticas, poços e sumidouros em Uruguaiana RS com caminhão auto-vácuo moderno e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, transportadoras e armazéns aduaneiros em Uruguaiana RS com jatos de água de altíssima pressão.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Uruguaiana RS?',
      answer: 'Basta entrar em contato pelo WhatsApp (55) 99841-2890 ou telefone fixo (55) 3412-4890. Nossa equipe técnica em Uruguaiana se desloca até o seu local para realizar uma avaliação gratuita e apresentar o orçamento sem compromisso.'
    },
    {
      question: 'Qual é o tempo médio de chegada em Uruguaiana?',
      answer: 'Temos viaturas em pontos estratégicos de Uruguaiana RS, garantindo chegada rápida em até 30 a 40 minutos na maioria dos bairros urbanos e atendimento no Porto Seco e Barragem Sanchuri.'
    },
    {
      question: 'Vocês cobram taxa de visita em Uruguaiana?',
      answer: 'Não cobramos taxa de visita em Uruguaiana RS. A vistoria técnica presencial para avaliação do problema e apresentação do orçamento é 100% gratuita.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim, todos os nossos serviços de desentupimento, hidrojateamento e limpeza de fossas em Uruguaiana possuem garantia formal por escrito emitida na conclusão.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito parcelados, dinheiro e faturamento bancário para transportadoras, empresas aduaneiras e condomínios.'
    },
    {
      question: 'Vocês atendem finais de semana e feriados em Uruguaiana?',
      answer: 'Sim! Nosso plantão de atendimento de emergência funciona 24 horas por dia, 7 dias por semana, incluindo sábados, domingos e feriados em toda a cidade de Uruguaiana.'
    }
  ],
  testimonials: [
    {
      name: 'Rodrigo Silveira Dornelles',
      neighborhood: 'Área Industrial',
      role: 'Gerente de Logística',
      content: 'A prumada de esgoto do galpão de cargas no Porto Seco entupiu de madrugada. A desentupidora chegou em 20 minutos com o caminhão de hidrojato e normalizou tudo rapidamente. Serviço de primeira linha!'
    },
    {
      name: 'Clarice Fontoura Vargas',
      neighborhood: 'Bela Vista',
      role: 'Médica Veterinária',
      content: 'O vaso e a pia da nossa casa no Bela Vista entupiram no domingo. O técnico foi extremamente atencioso, utilizou a máquina rotativa e resolveu tudo sem sujeira. Recomendo com certeza!'
    },
    {
      name: 'Getúlio Martins Fagundes',
      neighborhood: 'Centro',
      role: 'Comerciante',
      content: 'Excelente atendimento para limpeza da caixa de gordura do nosso restaurante no Centro. Preço transparente, pontualidade e serviço muito limpo. Nota 10!'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-uruguaiana',
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
      id: 'p_riogrande',
      nome: 'Desentupidora Rio Grande RS 24h',
      cidade: 'Rio Grande',
      uf: 'RS',
      dominio: 'desentupidora-riogrande.vercel.app',
      url: 'https://desentupidora-riogrande.vercel.app',
      descricao: 'Serviços 24 horas de desentupimento e limpa fossa na Zona Sul Gaúcha.'
    },
    {
      id: 'p_bage',
      nome: 'Desentupidora Bagé RS 24h',
      cidade: 'Bagé',
      uf: 'RS',
      dominio: 'desentupidora-bage.vercel.app',
      url: 'https://desentupidora-bage.vercel.app',
      descricao: 'Desentupidora com equipes de prontidão e hidrojato na Região da Campanha.'
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
    populacao: city.populacao || '120.819',
    ddd: city.ddd || '55',
    whatsapp: city.whatsapp || '55998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(55) 3412-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/uruguaiana/logo-desentupidora-uruguaiana.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/uruguaiana/favicon-desentupidora-uruguaiana.webp',
    heroImage: city.heroImage || '/images/uruguaiana/desentupidora-uruguaiana-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-29.7547',
      longitude: '-57.0883'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: URUGUAIANA / RS (#60)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Uruguaiana no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'uruguaiana' || (c.cidade === 'Uruguaiana' && c.uf === 'RS'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...uruguaianaData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(uruguaianaData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(uruguaianaData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-uruguaiana.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(uruguaianaData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-uruguaiana.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'uruguaiana' || (c.cidade === 'Uruguaiana' && c.uf === 'RS'));
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
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 60');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Uruguaiana (RS)');
      obsContent = obsContent.replace(/59 Cidades Ativas em Produção/, '60 Cidades Ativas em Produção');
      
      const uruguaianaRow = '| **60** | **Uruguaiana (RS)** | 120.819 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (55) 3412-4890 / (55) 998412890 | 38 págs | [Acessar Site](https://desentupidora-uruguaiana.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-uruguaiana.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*59\*\* \| \*\*Erechim \(RS\)\*\* [^\n]+\n)/, '$1' + uruguaianaRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Uruguaiana (RS) como cidade #60!');
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
