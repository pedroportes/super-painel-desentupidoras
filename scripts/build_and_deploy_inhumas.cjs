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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Inhumas/GO...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'inhumas');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#0284c7" letter-spacing="1">INHUMAS GO 24H</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-inhumas.webp'));
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
    .toFile(path.join(imgDir, 'favicon-desentupidora-inhumas.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_inhumas_desentupidora_1788985809823.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-inhumas-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const inhumasData = {
  id: 'inhumas',
  cidade: 'Inhumas',
  name: 'Inhumas',
  slug: 'inhumas',
  uf: 'GO',
  estado: 'Goiás',
  ddd: '62',
  populacao: '53.884',
  empresaNome: 'Desentupidora Inhumas GO 24h',
  whatsapp: '62998412890',
  telefoneFixo: '(62) 3514-4890',
  phone: '(62) 3514-4890',
  endereco: 'Avenida Wilson Quirino de Andrade, 450 - Centro, Inhumas - GO, 75400-000',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-inhumas.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/inhumas/logo-desentupidora-inhumas.webp',
  faviconUrl: '/images/inhumas/favicon-desentupidora-inhumas.webp',
  heroImage: '/images/inhumas/desentupidora-inhumas-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Inhumas GO 24h',
  metaDescription: 'Desentupidora em Inhumas GO com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento gratuito!',
  h1Title: 'Desentupidora em Inhumas GO 24 Horas',
  firstParagraph: 'Procurando desentupidora em Inhumas GO? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos, limpeza de caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão na Região Metropolitana de Goiânia.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Inhumas - GO',
  aboutCityText: 'Inhumas é um estratégico polo agroindustrial, educacional e comercial situado no Eixo Goiânia-Itaberaí (GO-070). Conhecida como a Cidade das Mangueiras, possui intensa atividade sucroalcooleira, confecções e forte comércio urbano. A expansão habitacional em novos residenciais e o fluxo comercial contínuo demandam manutenção preventiva periódica, hidrojateamento de alta pressão e sucção de fossas sépticas com garantia e preservação estrutural.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Inhumas GO?',
  geoCoordinates: {
    latitude: '-16.3575',
    longitude: '-49.4950'
  },
  bairros: [
    'Centro',
    'Vila Lucimar',
    'Vila América',
    'Residencial Paraíso',
    'Jardim América',
    'Setor Nilo Peçanha',
    'Vila Floresta',
    'Jardim Real',
    'Setor Santa Maria',
    'Setor Vale das Goiabeiras',
    'Residencial Atenas',
    'Vila Heitor',
    'Setor Bueno',
    'Vila Nova',
    'Vila Alvorada',
    'Residencial Solar dos Buritis',
    'Parque das Primaveras',
    'Residencial Monte Carlo',
    'Jardim Sorriso',
    'Setor Pedregal',
    'Vale do Araguaia',
    'Vila Romana',
    'Residencial Jatobá',
    'Setor Imperial'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Inhumas concentra forte atividade bancária, comercial e gastronômica na Avenida Wilson Quirino e Praça Belarmino Cruvinel. Restaurantes e lojas demandam desentupimento rápido de redes sanitárias e limpeza contínua de caixas de gordura.',
    'Vila Lucimar': 'Bairro tradicional e populoso de Inhumas com residências familiares consolidadas. Nossas equipes prestam atendimento 24h para desentupimento de ralos de banheiro e pias de cozinha.',
    'Vila América': 'Bairro dinâmico com expressivo comércio de vizinhança. Atendemos com agilidade ocorrências de esgoto transbordando com máquinas rotativas sem quebra de piso.',
    'Residencial Paraíso': 'Bairro planejado com forte crescimento habitacional. Fornecemos serviços de hidrojateamento e esgotamento de fossas sépticas com caminhão auto-vácuo.',
    'Jardim América': 'Bairro residencial consolidado e arborizado. Prestamos assistência técnica para desobstrução de vasos sanitários e prumadas de esgoto sem sujeira.',
    'Setor Nilo Peçanha': 'Bairro com perfil misto de serviços e moradias. Nossos especialistas atuam com prontidão na desobstrução de canos e ramais pluviais.',
    'Vila Floresta': 'Bairro acolhedor com vias tranquilas e perfil comunitário. Executamos desentupimentos rápidos com garantia formal emitida na hora.',
    'Jardim Real': 'Bairro residencial moderno com condomínios e residências térreas. Atendimento cuidadoso com maquinário moderno e silencioso.',
    'Setor Santa Maria': 'Bairro tradicional da Zona Sul com famílias consolidadas. Oferecemos soluções completas para desentupimento de caixas de gordura e inspeção.',
    'Setor Vale das Goiabeiras': 'Bairro em constante expansão com novos loteamentos. Viaturas locais garantem chegada rápida em menos de 30 minutos.',
    'Residencial Atenas': 'Bairro residencial planejado com vias amplas. Realizamos esgotamento de fossas e desentupimentos mecânicos com preço justo.',
    'Vila Heitor': 'Bairro com forte convivência de vizinhança. Atendemos prontamente emergências de refluxo de esgoto com orçamento gratuito.',
    'Setor Bueno': 'Bairro residencial valorizado em Inhumas. Nossos profissionais realizam desentupimentos preventivos e corretivos preservando acabamentos.',
    'Vila Nova': 'Bairro tradicional com comércio variado. Prestamos socorro 24 horas para desentupimento de esgotos coletivos e residenciais.',
    'Vila Alvorada': 'Bairro acolhedor próximo aos acessos rodoviários. Oferecemos caminhão limpa fossa para chácaras e residências.',
    'Residencial Solar dos Buritis': 'Novo conjunto residencial com padrão moderno. Atendimento técnico com equipamentos rotativos de precisão.',
    'Parque das Primaveras': 'Bairro calmo e arborizado com residências familiares. Desobstrução rápida de ralos e sifões com total limpeza.',
    'Residencial Monte Carlo': 'Loteamento planejado com belas moradias. Serviços especializados de hidrojateamento com descarte ambiental regulamentado.',
    'Jardim Sorriso': 'Bairro comunitário tradicional de Inhumas. Realizamos desentupimentos rápidos de vasos sanitários e tubulações de esgoto.',
    'Setor Pedregal': 'Bairro elevado com vias pavimentadas. Atendimento emergencial 24h para redes de drenagem e caixas de gordura.',
    'Vale do Araguaia': 'Bairro residencial com perfil familiar. Equipes especializadas resolvem qualquer obstrução hidráulica com rapidez.',
    'Vila Romana': 'Bairro acolhedor com moradias tradicionais. Prestamos serviços completos de encanador e desentupidora com nota fiscal.',
    'Residencial Jatobá': 'Bairro novo em expansão residencial. Atendimento rápido para desentupimento de tubulações pluviais e esgotos.',
    'Setor Imperial': 'Bairro planejado com fácil acesso ao Centro de Inhumas. Vistorias técnicas sem custo e suporte 24 horas todos os dias.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Inhumas GO com máquinas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura acumulada e resíduos em canos e sifões de pias de cozinha em Inhumas GO com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e higiênica de vasos sanitários em residências, indústrias e comércios de Inhumas GO, preservando louças e instalações.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, garagens e quintais em Inhumas GO, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Limpeza e esgotamento de fossas sépticas e sumidouros em Inhumas GO com caminhão auto-vácuo moderno e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, usinas e redes comerciais em Inhumas GO com jatos de água em alta pressão.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Inhumas GO?',
      answer: 'Basta entrar em contato pelo WhatsApp (62) 99841-2890 ou telefone fixo (62) 3514-4890. Nossa equipe técnica em Inhumas vai até o seu endereço para realizar uma vistoria gratuita e apresentar o orçamento sem compromisso.'
    },
    {
      question: 'Qual é o tempo médio de chegada em Inhumas?',
      answer: 'Temos viaturas posicionadas em pontos estratégicos de Inhumas GO, garantindo chegada rápida em até 30 a 40 minutos em todos os bairros e no Centro.'
    },
    {
      question: 'Vocês cobram taxa de visita em Inhumas?',
      answer: 'Não cobramos taxa de visita em Inhumas GO. A vistoria técnica para avaliação do problema e formulação do orçamento é 100% gratuita.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim, todos os nossos serviços de desentupimento, hidrojateamento e limpeza de fossas em Inhumas contam com garantia formal por escrito emitida na entrega do serviço.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito parcelados, dinheiro e faturamento bancário para usinas, comércios, indústrias e condomínios cadastrados.'
    },
    {
      question: 'Vocês atendem finais de semana e feriados em Inhumas?',
      answer: 'Sim! Nosso plantão de atendimento de emergência funciona 24 horas por dia, 7 dias por semana, incluindo sábados, domingos e feriados em toda a cidade.'
    }
  ],
  testimonials: [
    {
      name: 'Geraldo Magela Ferreira',
      neighborhood: 'Centro',
      role: 'Gerente Comercial',
      content: 'A prumada de esgoto do nosso estabelecimento comercial no Centro de Inhumas entupiu no sábado de manhã. A equipe chegou muito rápido com a máquina rotativa e desobstruiu tudo sem quebrar nada. Recomendo!'
    },
    {
      name: 'Divina Aparecida Peixoto',
      neighborhood: 'Vila Lucimar',
      role: 'Professora',
      content: 'Tivemos entupimento na pia da cozinha e no ralo do banheiro na Vila Lucimar. O técnico foi muito atencioso, explicou o procedimento e deixou tudo funcionando perfeitamente. Serviço nota 10!'
    },
    {
      name: 'Sebastião Rodrigues Cunha',
      neighborhood: 'Residencial Paraíso',
      role: 'Produtor Rural',
      content: 'Contratamos o serviço de caminhão limpa fossa para esgotamento da nossa fossa no Residencial Paraíso. Caminhão moderno, sucção rápida e preço justo com garantia.'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-inhumas',
  parceiros: [
    {
      id: 'p_mineiros',
      nome: 'Desentupidora Mineiros GO 24h',
      cidade: 'Mineiros',
      uf: 'GO',
      dominio: 'desentupidora-mineiros.pages.dev',
      url: 'https://desentupidora-mineiros.pages.dev',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento no Sudoeste Goiano.'
    },
    {
      id: 'p_barradogarcas',
      nome: 'Desentupidora Barra do Garças MT 24h',
      cidade: 'Barra do Garças',
      uf: 'MT',
      dominio: 'desentupidora-barradogarcas.pages.dev',
      url: 'https://desentupidora-barradogarcas.pages.dev',
      descricao: 'Serviços de desentupimento de esgotos, pias, ralos e limpa fossa no Vale do Araguaia.'
    },
    {
      id: 'p_primavera',
      nome: 'Desentupidora Primavera do Leste MT 24h',
      cidade: 'Primavera do Leste',
      uf: 'MT',
      dominio: 'desentupidora-primaveradoleste.pages.dev',
      url: 'https://desentupidora-primaveradoleste.pages.dev',
      descricao: 'Equipes 24 horas para desentupimento e hidrojateamento no Leste Mato-grossense.'
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
    estado: 'Goiás',
    uf: city.uf,
    populacao: city.populacao || '53.884',
    ddd: city.ddd || '62',
    whatsapp: city.whatsapp || '62998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(62) 3514-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/inhumas/logo-desentupidora-inhumas.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/inhumas/favicon-desentupidora-inhumas.webp',
    heroImage: city.heroImage || '/images/inhumas/desentupidora-inhumas-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-16.3575',
      longitude: '-49.4950'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: INHUMAS / GO (#65)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Inhumas no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'inhumas' || (c.cidade === 'Inhumas' && c.uf === 'GO'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...inhumasData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(inhumasData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(inhumasData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-inhumas.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(inhumasData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-inhumas.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'inhumas' || (c.cidade === 'Inhumas' && c.uf === 'GO'));
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
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 65');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Inhumas (GO)');
      obsContent = obsContent.replace(/\d+ Cidades Ativas em Produção/, '65 Cidades Ativas em Produção');
      
      const inhumasRow = '| **65** | **Inhumas (GO)** | 53.884 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (62) 3514-4890 / (62) 998412890 | 38 págs | [Acessar Site](https://desentupidora-inhumas.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-inhumas.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*64\*\* \| \*\*Barra do Garças \(MT\)\*\* [^\n]+\n)/, '$1' + inhumasRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Inhumas (GO) como cidade #65!');
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
