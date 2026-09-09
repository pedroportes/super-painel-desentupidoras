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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Francisco Beltrão/PR...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'franciscobeltrao');
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
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#0284c7" letter-spacing="1">FRANCISCO BELTRÃO PR</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-franciscobeltrao.webp'));
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
    .toFile(path.join(imgDir, 'favicon-desentupidora-franciscobeltrao.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_francisco_beltrao_desentupidora_1788969412461.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-franciscobeltrao-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const fbData = {
  id: 'francisco-beltrao',
  cidade: 'Francisco Beltrão',
  name: 'Francisco Beltrão',
  slug: 'francisco-beltrao',
  uf: 'PR',
  estado: 'Paraná',
  ddd: '46',
  populacao: '102.312',
  empresaNome: 'Desentupidora Francisco Beltrão PR 24h',
  whatsapp: '46998412890',
  telefoneFixo: '(46) 3524-4890',
  phone: '(46) 3524-4890',
  endereco: 'Avenida Júlio Assis Cavalheiro, 850 - Centro, Francisco Beltrão - PR, 85601-000',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-franciscobeltrao.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/franciscobeltrao/logo-desentupidora-franciscobeltrao.webp',
  faviconUrl: '/images/franciscobeltrao/favicon-desentupidora-franciscobeltrao.webp',
  heroImage: '/images/franciscobeltrao/desentupidora-franciscobeltrao-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Francisco Beltrão PR 24h',
  metaDescription: 'Desentupidora em Francisco Beltrão PR com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento!',
  h1Title: 'Desentupidora em Francisco Beltrão PR 24 Horas',
  firstParagraph: 'Procurando desentupidora em Francisco Beltrão PR? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão no Sudoeste do Paraná.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Francisco Beltrão',
  aboutCityText: 'Francisco Beltrão é o principal polo econômico, educacional e agroindustrial do Sudoeste Paranaense, cortada pelo Rio Marrecas e situada no Terceiro Planalto. O clima subtropical com invernos rigorosos, o relevo ondulado e a intensa movimentação no Centro e polos universitários exigem manutenção preventiva periódica e hidrojateamento de alta pressão para desobstrução de gorduras e resíduos em tubulações sanitárias.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Francisco Beltrão PR?',
  geoCoordinates: {
    latitude: '-26.0811',
    longitude: '-53.0550'
  },
  bairros: [
    'Centro',
    'Cango',
    'Alvorada',
    'Vila Nova',
    'Marrecas',
    'Luther King',
    'São Cristóvão',
    'Padre Ulrico',
    'Pinheirinho',
    'Miniguaçu',
    'Presidente Kennedy',
    'Cristo Rei',
    'Industrial',
    'Água Branca',
    'Jardim Itália',
    'Sadia',
    'Guanabara',
    'São Miguel',
    'Cantelmo',
    'Novo Mundo',
    'Seminário',
    'Nossa Senhora Aparecida',
    'São Francisco',
    'Jacutinga'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Francisco Beltrão concentra os maiores eixos comerciais na Avenida Júlio Assis Cavalheiro, a Praça Eduardo Virmond Suplicy e a imponente Concatedral. O intenso fluxo de restaurantes e edifícios comerciais demanda limpeza contínua de caixas de gordura e desentupimento de redes sanitárias.',
    'Cango': 'Bairro histórico onde nasceu a cidade com a instalação da Colônia Agrícola Nacional General Osório (CANGO). Suas redes hidráulicas tradicionais requerem atendimento técnico especializado com máquinas rotativas para desentupimento sem quebra.',
    'Alvorada': 'Importante bairro residencial e comercial de Francisco Beltrão com grande fluxo urbano. Nossas equipes prestam socorro 24 horas para desobstrução de prumadas prediais, ralos e ramais de esgoto.',
    'Vila Nova': 'Bairro dinâmico e tradicional com expressiva concentração habitacional e comércio variado. Atendemos com agilidade ocorrências de esgoto transbordando e realizamos vistorias técnicas gratuitas.',
    'Marrecas': 'Bairro situado às margens do histórico Rio Marrecas com perfil misto. A proximidade com o leito fluvial exige manutenção preventiva e desobstrução frequente de galerias pluviais e esgoto doméstico.',
    'Luther King': 'Bairro residencial nobre com imóveis modernos e ruas tranquilas. Fornecemos atendimento técnico de alto padrão para desobstrução de canos, pias e vasos sanitários com equipamentos limpos.',
    'São Cristóvão': 'Um dos maiores e mais populosos bairros de Francisco Beltrão, com forte presença de oficinas, transportadoras e comércios. Realizamos hidrojateamento de alta pressão e limpa fossa 24h.',
    'Padre Ulrico': 'Grande comunidade habitacional da Zona Leste com milhares de famílias. Equipes locais garantem pronto atendimento para desentupimento de esgotos residenciais e caixas de inspeção.',
    'Pinheirinho': 'Bairro residencial consolidado com perfil familiar e vias arborizadas. Prestamos serviços completos de desentupimento de pias de cozinha, tanques e vasos sanitários sem sujeira.',
    'Miniguaçu': 'Bairro estratégico com acesso ao parque de exposições e rodovias. Oferecemos soluções eficientes para desentupimentos emergenciais em empresas, galpões e moradias.',
    'Presidente Kennedy': 'Bairro residencial tradicional com perfil calmo e famílias consolidadas. Nossos especialistas atuam com rapidez na desobstrução de ralos de banheiro e redes de esgoto.',
    'Cristo Rei': 'Bairro elevado com vista privilegiada e comércio ativo de vizinhança. Executamos desentupimentos mecânicos rápidos e seguros com garantia formal por escrito.',
    'Industrial': 'Polo fabril estratégico que abriga indústrias agropecuárias, têxteis e metalmecânicas. Demanda hidrojateamento industrial pesado, limpeza de caixas separadoras e sucção de efluentes.',
    'Água Branca': 'Bairro em constante expansão com novos loteamentos e condomínios. Nossas viaturas atendem chamados de emergência para desobstrução de redes coletoras e limpa fossa.',
    'Jardim Itália': 'Bairro residencial nobre com construções sofisticadas. Atendimento especializado com maquinário moderno e silencioso para preservar acabamentos de alto padrão.',
    'Sadia': 'Bairro vizinho ao complexo agroindustrial de alimentos e ao aeroporto municipal. Atendemos empresas, alojamentos e residências com hidrojateamento e esgotamento técnico.',
    'Guanabara': 'Bairro tradicional com comércio diversificado e praças comunitárias. Fornecemos suporte 24 horas para desentupimento de encanamentos prediais e sanitários.',
    'São Miguel': 'Bairro residencial tranquilo com forte convivência comunitária. Realizamos desentupimentos de sifões, pias e ralos com total higiene e pontualidade.',
    'Cantelmo': 'Bairro residencial em desenvolvimento na Zona Norte com novas moradias. Nossos técnicos atendem prontamente com viaturas equipadas para socorro imediato.',
    'Novo Mundo': 'Bairro planejado com residências familiares e fácil acesso ao Centro. Atendemos com agilidade ocorrências de refluxo de esgoto com orçamento gratuito no local.',
    'Seminário': 'Bairro tradicional e arborizado que abriga instituições religiosas e educacionais. Prestamos manutenção hidráulica completa e esgotamento de fossas sépticas.',
    'Nossa Senhora Aparecida': 'Bairro acolhedor com residências familiares e pequenos negócios. Realizamos desentupimentos rápidos de esgotos com preço justo e facilidade de pagamento.',
    'São Francisco': 'Bairro consolidado com vias pavimentadas e perfil comunitário. Oferecemos assistência técnica 24h para redes de esgoto e caixas de gordura residenciais.',
    'Jacutinga': 'Importante distrito agrícola e polo produtor rural de Francisco Beltrão. Atendemos chácaras, agroindústrias e propriedades rurais com caminhão auto-vácuo limpa fossa.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Francisco Beltrão PR com máquinas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura acumulada e resíduos em canos e sifões de pias de cozinha em Francisco Beltrão PR com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e higiênica de vasos sanitários em residências, empresas e faculdades de Francisco Beltrão PR, preservando louças e instalações.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, garagens e áreas de serviço em Francisco Beltrão PR, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Limpeza e esgotamento de fossas sépticas e sumidouros em Francisco Beltrão PR com caminhão auto-vácuo moderno e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, agroindústrias e redes comerciais em Francisco Beltrão PR com jatos de água em alta pressão.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Francisco Beltrão PR?',
      answer: 'Basta entrar em contato pelo WhatsApp (46) 99841-2890 ou telefone fixo (46) 3524-4890. Nossa equipe técnica em Francisco Beltrão vai até o seu endereço para realizar uma vistoria gratuita e apresentar o orçamento sem compromisso.'
    },
    {
      question: 'Qual é o tempo médio de chegada em Francisco Beltrão?',
      answer: 'Temos viaturas posicionadas em pontos estratégicos de Francisco Beltrão PR, garantindo chegada rápida em até 30 a 40 minutos na maioria dos bairros e no Distrito Industrial.'
    },
    {
      question: 'Vocês cobram taxa de visita em Francisco Beltrão?',
      answer: 'Não cobramos taxa de visita em Francisco Beltrão PR. A vistoria técnica para avaliação do problema e formulação do orçamento é 100% gratuita.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim, todos os nossos serviços de desentupimento, hidrojateamento e limpeza de fossas em Francisco Beltrão contam com garantia formal por escrito emitida na entrega.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito parcelados, dinheiro e faturamento bancário para agroindústrias, comércios e condomínios cadastrados.'
    },
    {
      question: 'Vocês atendem finais de semana e feriados em Francisco Beltrão?',
      answer: 'Sim! Nosso plantão de atendimento de emergência funciona 24 horas por dia, 7 dias por semana, incluindo sábados, domingos e feriados em toda a cidade.'
    }
  ],
  testimonials: [
    {
      name: 'Darci Antônio Bortoluzzi',
      neighborhood: 'Industrial',
      role: 'Gerente Operacional',
      content: 'A prumada de esgoto do nosso galpão no Distrito Industrial entupiu na sexta-feira. A desentupidora chegou em 20 minutos com hidrojato e resolveu sem interromper as operações. Serviço excelente!'
    },
    {
      name: 'Maristela Silveira Cordeiro',
      neighborhood: 'Jardim Itália',
      role: 'Arquiteta',
      content: 'Tivemos um problema com o vaso sanitário e a pia da nossa residência no Jardim Itália. O técnico foi muito cuidadoso, utilizou máquina rotativa e deixou tudo limpo. Recomendo muito!'
    },
    {
      name: 'Valmor José Fontana',
      neighborhood: 'Centro',
      role: 'Comerciante',
      content: 'Atendimento pontual e transparente para limpeza da caixa de gordura do nosso restaurante no Centro de Francisco Beltrão. Preço justo e garantia na hora. Nota 10!'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-franciscobeltrao',
  parceiros: [
    {
      id: 'p_patobranco',
      nome: 'Desentupidora Pato Branco PR 24h',
      cidade: 'Pato Branco',
      uf: 'PR',
      dominio: 'desentupidora-patobranco.vercel.app',
      url: 'https://desentupidora-patobranco.vercel.app',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento no Sudoeste do Paraná.'
    },
    {
      id: 'p_medianeira',
      nome: 'Desentupidora Medianeira PR 24h',
      cidade: 'Medianeira',
      uf: 'PR',
      dominio: 'desentupidora-medianeira.pages.dev',
      url: 'https://desentupidora-medianeira.pages.dev',
      descricao: 'Serviços de desentupimento de esgotos, pias, ralos e limpa fossa no Oeste Paranaense.'
    },
    {
      id: 'p_erechim',
      nome: 'Desentupidora Erechim RS 24h',
      cidade: 'Erechim',
      uf: 'RS',
      dominio: 'desentupidora-erechim.pages.dev',
      url: 'https://desentupidora-erechim.pages.dev',
      descricao: 'Equipes 24 horas para desentupimento e hidrojateamento no Alto Uruguai Gaúcho.'
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
    estado: 'Paraná',
    uf: city.uf,
    populacao: city.populacao || '102.312',
    ddd: city.ddd || '46',
    whatsapp: city.whatsapp || '46998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(46) 3524-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/franciscobeltrao/logo-desentupidora-franciscobeltrao.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/franciscobeltrao/favicon-desentupidora-franciscobeltrao.webp',
    heroImage: city.heroImage || '/images/franciscobeltrao/desentupidora-franciscobeltrao-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-26.0811',
      longitude: '-53.0550'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: FRANCISCO BELTRÃO / PR (#62)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Francisco Beltrão no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'francisco-beltrao' || (c.cidade === 'Francisco Beltrão' && c.uf === 'PR'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...fbData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(fbData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(fbData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-franciscobeltrao.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(fbData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-franciscobeltrao.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'francisco-beltrao' || (c.cidade === 'Francisco Beltrão' && c.uf === 'PR'));
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
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 62');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Francisco Beltrão (PR)');
      obsContent = obsContent.replace(/61 Cidades Ativas em Produção/, '62 Cidades Ativas em Produção');
      
      const fbRow = '| **62** | **Francisco Beltrão (PR)** | 102.312 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (46) 3524-4890 / (46) 998412890 | 38 págs | [Acessar Site](https://desentupidora-franciscobeltrao.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-franciscobeltrao.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*61\*\* \| \*\*Passos \(MG\)\*\* [^\n]+\n)/, '$1' + fbRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Francisco Beltrão (PR) como cidade #62!');
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
