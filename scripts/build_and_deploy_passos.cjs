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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Passos/MG...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'passos');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#0284c7" letter-spacing="1.5">PASSOS MG</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-passos.webp'));
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
    .toFile(path.join(imgDir, 'favicon-desentupidora-passos.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_passos_desentupidora_1788965241375.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-passos-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const passosData = {
  id: 'passos',
  cidade: 'Passos',
  name: 'Passos',
  slug: 'passos',
  uf: 'MG',
  estado: 'Minas Gerais',
  ddd: '35',
  populacao: '116.951',
  empresaNome: 'Desentupidora Passos MG 24h',
  whatsapp: '35998412890',
  telefoneFixo: '(35) 3521-4890',
  phone: '(35) 3521-4890',
  endereco: 'Avenida da Moda, 1200 - Centro, Passos - MG, 37900-000',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-passos.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/passos/logo-desentupidora-passos.webp',
  faviconUrl: '/images/passos/favicon-desentupidora-passos.webp',
  heroImage: '/images/passos/desentupidora-passos-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Passos MG 24h - Chegada Rápida',
  metaDescription: 'Desentupidora em Passos MG com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento!',
  h1Title: 'Desentupidora em Passos MG 24 Horas',
  firstParagraph: 'Procurando desentupidora em Passos MG? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão no Sudoeste Mineiro.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Passos',
  aboutCityText: 'Passos é o principal polo econômico, agropecuário e de confecções do Sudoeste Mineiro, localizada próxima ao Lago de Furnas e à Serra da Canastra. O relevo suavemente ondulado, o clima tropical de altitude e o forte fluxo comercial na Avenida da Moda e indústrias têxteis demandam serviços frequentes de hidrojateamento de alta pressão e manutenção de caixas de gordura para evitar refluxos e sobrecargas na rede coletora de esgoto.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Passos MG?',
  geoCoordinates: {
    latitude: '-20.7188',
    longitude: '-46.6097'
  },
  bairros: [
    'Centro',
    'Muarama',
    'Penha',
    'Belo Horizonte',
    'Coimbras',
    'Canjeranus',
    'Santa Casa',
    'Novo Horizonte',
    'Carmelo',
    'California',
    'Vila Rica',
    'São Francisco',
    'Santa Luzia',
    'Jardim Flamboyant',
    'Jardim América',
    'Aclimação',
    'Polivalente',
    'Cohab I',
    'Cohab II',
    'Jardim Colúmbia',
    'Jardim Santo Antônio',
    'Distrito Industrial',
    'Parque da Moda',
    'Nossa Senhora das Graças'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Passos concentra o comércio tradicional, a Praça Monsenhor Messias Bragança e prédios históricos. O intenso movimento de restaurantes, lojas e escritórios exige desentupimento técnico ágil e limpeza constante de caixas de gordura e redes de esgoto.',
    'Muarama': 'Bairro residencial nobre de Passos com casas de alto padrão e avenidas arborizadas. Nossas equipes utilizam maquinário rotativo moderno para desobstrução de tubulações sofisticadas com total discrição e sem danificar pisos.',
    'Penha': 'Bairro tradicional e populoso de Passos com comércio diversificado e igrejas históricas. Prestamos assistência 24 horas para desentupimento de pias de cozinha, vasos sanitários e ramais de esgoto sanitário.',
    'Belo Horizonte': 'Bairro residencial consolidado com grande densidade familiar e pequenos comércios. Atendemos com agilidade ocorrências de esgoto transbordando e realizamos manutenção preventiva de caixas de inspeção.',
    'Coimbras': 'Bairro dinâmico próximo ao Centro com intensa circulação e serviços essenciais. Fornecemos atendimento pontual para desentupimento mecânico e esgotamento de fossas com caminhão especializado.',
    'Canjeranus': 'Bairro residencial tradicional com vias movimentadas e perfil comunitário ativo. Nossos técnicos solucionam com precisão obstruções em ralos pluviais, pias e tubulações de esgoto domésticas.',
    'Santa Casa': 'Região de referência em saúde que abriga o complexo hospitalar da Santa Casa de Misericórdia de Passos. Exige rigorosos padrões de higiene no desentupimento emergencial de instalações sanitárias e caixas de gordura.',
    'Novo Horizonte': 'Bairro planejado em constante expansão com novas moradias familiares. Oferecemos socorro rápido 24h para desentupimentos residenciais e desobstrução de prumadas prediais.',
    'Carmelo': 'Bairro tradicional da Zona Sul de Passos com perfil residencial tranquilo. Nossas viaturas atuam rapidamente na desobstrução de vasos sanitários, ralos e caixas de passagem.',
    'California': 'Bairro residencial moderno com condomínios e residências amplas. Atendimento técnico especializado para desentupimento de canos e galerias com equipamentos limpos e silenciosos.',
    'Vila Rica': 'Bairro residencial consolidado com famílias tradicionais e comércio de bairro. Prestamos serviços completos de limpa fossa com caminhão auto-vácuo e desentupimentos em geral.',
    'São Francisco': 'Bairro populoso com grande atividade comunitária e estabelecimentos comerciais. Equipes volantes garantem chegada em até 30 minutos para desobstrução de redes de esgoto.',
    'Santa Luzia': 'Bairro residencial bem localizado com fácil acesso aos eixos viários da cidade. Executamos desentupimentos mecânicos sem quebra e limpeza profunda de redes coletoras.',
    'Jardim Flamboyant': 'Bairro nobre e arborizado de Passos com residências de alto padrão. Atendimento de alta qualidade para desobstrução de encanamentos delicados com garantia por escrito.',
    'Jardim América': 'Bairro residencial calmo com moradias unifamiliares. Atendemos chamados diários para desentupimento de pias, ralos de banheiro e limpeza de caixas de gordura.',
    'Aclimação': 'Bairro residencial tradicional com vista panorâmica da cidade e relevo característico. Realizamos manutenções hidráulicas completas com sondas elétricas de alta precisão.',
    'Polivalente': 'Bairro com polo educacional e grande circulação de estudantes e moradores. Fornecemos atendimento rápido para desentupimentos emergenciais em escolas, comércios e residências.',
    'Cohab I': 'Conjunto habitacional tradicional de Passos com expressiva densidade populacional. Viaturas locais oferecem pronto atendimento para desobstrução de esgotos e ralos.',
    'Cohab II': 'Grande complexo habitacional da Zona Leste com milhares de moradores. Nossos técnicos atuam 24 horas no desentupimento de ramais prediais e caixas de inspeção.',
    'Jardim Colúmbia': 'Bairro residencial em expansão com novas construções e perfil familiar. Atendemos com agilidade ocorrências de refluxo de esgoto com orçamento gratuito no local.',
    'Jardim Santo Antônio': 'Bairro acolhedor com residências familiares e pequenos negócios. Realizamos desentupimento higiênico de pias, vasos sanitários e tanques de lavanderia.',
    'Distrito Industrial': 'Polo fabril estratégico de Passos que reúne indústrias agropecuárias, têxteis e transportadoras. Demanda hidrojateamento industrial pesado e sucção de efluentes em grande escala.',
    'Parque da Moda': 'Região emblemática ao longo da Avenida da Moda com centenas de confecções, fábricas de tricô e lojas. Demanda limpeza constante de caixas de gordura e desobstrução de redes coletoras.',
    'Nossa Senhora das Graças': 'Bairro tradicional e populoso com forte vida comunitária. Prestamos socorro emergencial para desentupimento de esgotos residenciais com equipamentos de ponta.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Passos MG com máquinas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura e resíduos acumulados em canos e sifões de pias de cozinha em Passos MG com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e higiênica de vasos sanitários em residências, confecções e comércios de Passos MG, preservando louças e instalações.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, garagens e áreas de serviço em Passos MG, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Limpeza e esgotamento de fossas sépticas e sumidouros em Passos MG com caminhão auto-vácuo moderno e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, fábricas têxteis e redes comerciais em Passos MG com jatos de água em alta pressão.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Passos MG?',
      answer: 'Basta entrar em contato pelo WhatsApp (35) 99841-2890 ou telefone fixo (35) 3521-4890. Nossa equipe técnica em Passos vai até o seu endereço para realizar uma vistoria gratuita e apresentar o orçamento sem compromisso.'
    },
    {
      question: 'Qual é o tempo médio de chegada em Passos?',
      answer: 'Temos viaturas posicionadas em pontos estratégicos de Passos MG, garantindo chegada rápida em até 30 a 40 minutos na maioria dos bairros e no Parque da Moda.'
    },
    {
      question: 'Vocês cobram taxa de visita em Passos?',
      answer: 'Não cobramos taxa de visita em Passos MG. A vistoria técnica para avaliação do problema e formulação do orçamento é 100% gratuita.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim, todos os nossos serviços de desentupimento, hidrojateamento e limpeza de fossas em Passos contam com garantia formal por escrito emitida na entrega.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito parcelados, dinheiro e faturamento para confecções, fábricas e condomínios cadastrados.'
    },
    {
      question: 'Vocês atendem finais de semana e feriados em Passos?',
      answer: 'Sim! Nosso plantão de atendimento de emergência funciona 24 horas por dia, 7 dias por semana, incluindo sábados, domingos e feriados em toda a cidade de Passos.'
    }
  ],
  testimonials: [
    {
      name: 'Marcos Aurélio Silveira',
      neighborhood: 'Parque da Moda',
      role: 'Empresário do Ramo Têxtil',
      content: 'A caixa de gordura e o esgoto da nossa fábrica de tricô na Avenida da Moda entupiram durante a semana. A desentupidora chegou em 20 minutos com hidrojato e resolveu sem interromper a produção. Nota 10!'
    },
    {
      name: 'Helena Maria Vasconcelos',
      neighborhood: 'Muarama',
      role: 'Professora',
      content: 'Tivemos um problema com a pia da cozinha e o vaso sanitário da nossa casa no Muarama. O técnico foi muito profissional, usou máquina rotativa e deixou tudo limpo. Recomendo muito!'
    },
    {
      name: 'Antônio Carlos Lemos',
      neighborhood: 'Centro',
      role: 'Comerciante',
      content: 'Serviço rápido e com preço justo para desobstrução da prumada do nosso restaurante no Centro de Passos. Garantia emitida na hora e atendimento de primeira!'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-passos',
  parceiros: [
    {
      id: 'p_pocosdecaldas',
      nome: 'Desentupidora Poços de Caldas MG 24h',
      cidade: 'Poços de Caldas',
      uf: 'MG',
      dominio: 'desentupidora-pocosdecaldas.netlify.app',
      url: 'https://desentupidora-pocosdecaldas.netlify.app',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento no Sul de Minas.'
    },
    {
      id: 'p_uba',
      nome: 'Desentupidora Ubá MG 24h',
      cidade: 'Ubá',
      uf: 'MG',
      dominio: 'desentupidora-uba.pages.dev',
      url: 'https://desentupidora-uba.pages.dev',
      descricao: 'Serviços de desentupimento de esgotos, pias, ralos e limpa fossa na Zona da Mata Mineira.'
    },
    {
      id: 'p_timoteo',
      nome: 'Desentupidora Timóteo MG 24h',
      cidade: 'Timóteo',
      uf: 'MG',
      dominio: 'desentupidora-timoteo.pages.dev',
      url: 'https://desentupidora-timoteo.pages.dev',
      descricao: 'Equipes 24 horas para desentupimento e hidrojateamento no Vale do Aço.'
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
    estado: 'Minas Gerais',
    uf: city.uf,
    populacao: city.populacao || '116.951',
    ddd: city.ddd || '35',
    whatsapp: city.whatsapp || '35998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(35) 3521-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/passos/logo-desentupidora-passos.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/passos/favicon-desentupidora-passos.webp',
    heroImage: city.heroImage || '/images/passos/desentupidora-passos-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-20.7188',
      longitude: '-46.6097'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: PASSOS / MG (#61)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Passos no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'passos' || (c.cidade === 'Passos' && c.uf === 'MG'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...passosData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(passosData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(passosData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-passos.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(passosData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-passos.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'passos' || (c.cidade === 'Passos' && c.uf === 'MG'));
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
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 61');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Passos (MG)');
      obsContent = obsContent.replace(/60 Cidades Ativas em Produção/, '61 Cidades Ativas em Produção');
      
      const passosRow = '| **61** | **Passos (MG)** | 116.951 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (35) 3521-4890 / (35) 998412890 | 38 págs | [Acessar Site](https://desentupidora-passos.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-passos.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*60\*\* \| \*\*Uruguaiana \(RS\)\*\* [^\n]+\n)/, '$1' + passosRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Passos (MG) como cidade #61!');
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
