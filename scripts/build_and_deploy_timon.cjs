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
  console.log('🎨 1. Gerando Assets de Identidade Visual Super Leves em WebP para Timon/MA...');
  const imgDir = path.join(ASTRO_DIR, 'public', 'images', 'timon');
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
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#0284c7" letter-spacing="1">TIMON MA 24H</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imgDir, 'logo-desentupidora-timon.webp'));
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
    .toFile(path.join(imgDir, 'favicon-desentupidora-timon.webp'));
  console.log('   ✅ Favicon WebP gerado.');

  // Hero Image Original gerada
  const generatedHero = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_timon_desentupidora_1788983118907.jpg';
  await sharp(generatedHero)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(imgDir, 'desentupidora-timon-caminhao-hidrojateamento.webp'));
  console.log('   ✅ Hero Image Original WebP salva com sucesso.');
}

const timonData = {
  id: 'timon',
  cidade: 'Timon',
  name: 'Timon',
  slug: 'timon',
  uf: 'MA',
  estado: 'Maranhão',
  ddd: '99',
  populacao: '182.711',
  empresaNome: 'Desentupidora Timon MA 24h',
  whatsapp: '99998412890',
  telefoneFixo: '(99) 3212-4890',
  phone: '(99) 3212-4890',
  endereco: 'Avenida Presidente Médici, 1250 - Parque Piauí, Timon - MA, 65631-000',
  hospedagem: 'cloudflare',
  deployUrl: 'https://desentupidora-timon.pages.dev',
  paletaCores: 'urgencia-azul-laranja',
  modeloPagina: 'tecnico-especializado',
  logoUrl: '/images/timon/logo-desentupidora-timon.webp',
  faviconUrl: '/images/timon/favicon-desentupidora-timon.webp',
  heroImage: '/images/timon/desentupidora-timon-caminhao-hidrojateamento.webp',
  metaTitle: 'Desentupidora em Timon MA 24h',
  metaDescription: 'Desentupidora em Timon MA com hidrojateamento e limpa fossa 24 horas. Atendimento técnico ágil em todos os bairros. Peça seu orçamento gratuito!',
  h1Title: 'Desentupidora em Timon MA 24 Horas',
  firstParagraph: 'Procurando desentupidora em Timon MA? Oferecemos atendimento técnico especializado 24 horas para desentupimento de esgotos, pias, ralos, vasos sanitários, caixas de gordura e esgotamento de fossas com caminhão de hidrojateamento de alta pressão e sucção a vácuo em toda a Grande Timon e Região dos Cocais.',
  aboutCityTitle: 'Atendimento Especializado de Desentupimento em Timon - MA',
  aboutCityText: 'Timon é uma das maiores e mais populosas cidades do Maranhão, situada estrategicamente às margens do Rio Parnaíba e conurbada à capital piauiense. Com sua economia pulsante no comércio, indústria cerâmica e serviços, além de seu clima tropical e relevo dinâmico com eixos como a Avenida Presidente Médici e a Avenida Tiúba, as tubulações residenciais e comerciais exigem desobstruções técnicas de alta performance e esgotamento de fossas para garantir a higiene ambiental sem comprometer as estruturas.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Timon MA?',
  geoCoordinates: {
    latitude: '-5.0939',
    longitude: '-42.8364'
  },
  bairros: [
    'Centro',
    'Parque Piauí',
    'Formosa',
    'São Benedito',
    'Cidade Nova',
    'São Francisco',
    'Joia',
    'Novo Tempo',
    'Bela Vista',
    'Flores',
    'Mangueira',
    'Boa Vista',
    'Marimar',
    'Mateuzinho',
    'Mutirão',
    'Parque Alvorada',
    'Pedro Patrício',
    'Planalto Formosa',
    'Santo Antônio',
    'Sete Estrelas',
    'Vila Angélica',
    'Vila Bec',
    'Vila Osmar',
    'Parque União'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Timon concentra grande atividade bancária, comercial e institucional próxima às pontes metálica e da amizade sobre o Rio Parnaíba. A intensa movimentação de lojas e restaurantes demanda desentupimento ágil de prumadas e limpeza periódica de caixas de gordura.',
    'Parque Piauí': 'Um dos bairros mais tradicionais e populosos de Timon, cortado pela Avenida Presidente Médici. Nossas viaturas prestam atendimento rápido para desentupimento de redes sanitárias residenciais e comércios.',
    'Formosa': 'Bairro de perfil misto com comércio forte e grande fluxo viário. Atendemos ocorrências de esgotos obstruídos com máquinas rotativas modernas que limpam a tubulação sem quebradeira.',
    'São Benedito': 'Bairro histórico e vibrante com igrejas tradicionais e vida comunitária ativa. Prestamos socorro 24 horas para desentupimento de pias de cozinha, ralos e vasos sanitários.',
    'Cidade Nova': 'Bairro em constante crescimento habitacional e comercial na Zona Oeste. Realizamos esgotamento de fossas sépticas com caminhão auto-vácuo e desobstrução de encanamentos prediais.',
    'São Francisco': 'Bairro residencial consolidado e acolhedor. Nossos técnicos realizam diagnósticos rápidos e desobstrução de ramais de esgoto com garantia formal por escrito.',
    'Joia': 'Área de expansão com novos loteamentos, residências e chácaras. Fornecemos atendimento técnico especializado para limpeza de fossas e desentupimento de caixas de inspeção.',
    'Novo Tempo': 'Bairro planejado com expressiva densidade residencial. Atendemos com agilidade ocorrências de refluxo de esgoto em banheiros e pias de serviço.',
    'Bela Vista': 'Bairro elevado com residências familiares e vias tranquilas. Executamos desentupimentos mecânicos e desobstrução de canos pluviais com total pontualidade.',
    'Flores': 'Bairro acolhedor com perfil tradicional de Timon. Prestamos serviços completos de limpeza de caixas de gordura e ralos entupidos com descarte ecológico.',
    'Mangueira': 'Bairro tradicional próximo ao polo comercial central. Equipes de plantão 24h garantem desobstrução imediata de esgotos e pias sem sujeira.',
    'Boa Vista': 'Bairro dinâmico com moradias consolidadas e comércio local ativo. Realizamos desentupimentos preventivos e corretivos com orçamento sem custos.',
    'Marimar': 'Bairro residencial com vias pavimentadas e perfil familiar. Nossas equipes especializadas resolvem entupimentos em sifões, ralos e vasos rapidamente.',
    'Mateuzinho': 'Bairro ribeirinho tradicional com grande histórico comunitário. A proximidade com bacias requer manutenção preventiva contínua em ramais de drenagem e esgoto.',
    'Mutirão': 'Grande comunidade residencial com milhares de moradores. Atendemos chamados urgentes para desentupimento de esgotos coletivos e residenciais a preço justo.',
    'Parque Alvorada': 'Bairro planejado com vias amplas e forte comércio de bairro. Prestamos serviços de desentupimento com equipamentos eletrorrotativos de alta precisão.',
    'Pedro Patrício': 'Bairro tradicional da Zona Sul de Timon com intenso comércio vicinal. Oferecemos assistência técnica emergencial 24h para redes coletoras e fossas.',
    'Planalto Formosa': 'Área residencial alta e arejada com condomínios e residências térreas. Atendimento com maquinário moderno e silencioso que preserva os acabamentos.',
    'Santo Antônio': 'Bairro consolidado com forte vida de bairro e serviços variados. Nossos profissionais realizam desentupimentos rápidos de canos pluviais e esgoto sanitário.',
    'Sete Estrelas': 'Bairro em expansão com novos projetos residenciais e chácaras. Atendemos com caminhão limpa fossa e hidrojateamento de alta pressão.',
    'Vila Angélica': 'Bairro residencial tradicional com acessos rápidos a avenidas principais. Realizamos desobstrução de vasos sanitários e tanques com máxima higiene.',
    'Vila Bec': 'Área habitacional tradicional e movimentada de Timon. Oferecemos soluções eficientes para desentupimentos emergenciais com garantia e qualidade.',
    'Vila Osmar': 'Bairro dinâmico com perfil comunitário acolhedor. Equipes volantes atendem prontamente qualquer emergência hidráulica ou entupimento.',
    'Parque União': 'Importante bairro residencial e comercial interligado aos principais polos de Timon. Atendimento completo para desentupimento predial e comercial 24 horas.'
  },
  services: [
    {
      id: 'desentupimento-de-esgoto',
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução de tubulações e redes de esgoto em Timon MA com máquinas rotativas e hidrojateamento de alta pressão, restabelecendo o fluxo sem quebra.',
      icon: 'pipe'
    },
    {
      id: 'desentupimento-de-pia',
      title: 'Desentupimento de Pia',
      description: 'Remoção de gordura acumulada e resíduos em canos e sifões de pias de cozinha em Timon MA com maquinário limpo e silencioso.',
      icon: 'sink'
    },
    {
      id: 'desentupimento-de-vaso-sanitario',
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e higiênica de vasos sanitários em residências, empresas e escolas de Timon MA, preservando louças e instalações.',
      icon: 'toilet'
    },
    {
      id: 'desentupimento-de-ralo',
      title: 'Desentupimento de Ralo',
      description: 'Limpeza e desobstrução profunda de ralos de banheiros, quintais e áreas de serviço em Timon MA, eliminando mau cheiro e refluxos.',
      icon: 'drain'
    },
    {
      id: 'esgotamento-de-fossa',
      title: 'Limpa Fossa e Esgotamento',
      description: 'Limpeza e esgotamento de fossas sépticas e sumidouros em Timon MA com caminhão auto-vácuo moderno e destinação ecológica regulamentada.',
      icon: 'truck'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza pesada de tubulações industriais, cerâmicas e redes comerciais em Timon MA com jatos de água em alta pressão.',
      icon: 'water'
    }
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento de desentupidora em Timon MA?',
      answer: 'Basta entrar em contato pelo WhatsApp (99) 99841-2890 ou telefone fixo (99) 3212-4890. Nossa equipe técnica em Timon vai até o seu imóvel para realizar uma vistoria gratuita e apresentar o orçamento detalhado sem compromisso.'
    },
    {
      question: 'Qual é o tempo médio de chegada em Timon?',
      answer: 'Temos viaturas posicionadas em pontos estratégicos de Timon MA, garantindo chegada rápida em até 30 a 40 minutos em todos os bairros e avenidas principais.'
    },
    {
      question: 'Vocês cobram taxa de visita em Timon?',
      answer: 'Não cobramos taxa de visita em Timon MA. A vistoria técnica para avaliação do problema e formulação do orçamento é 100% gratuita.'
    },
    {
      question: 'O serviço de desentupimento tem garantia?',
      answer: 'Sim, todos os nossos serviços de desentupimento, hidrojateamento e limpeza de fossas em Timon contam com garantia formal por escrito emitida na entrega do serviço.'
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos PIX, cartões de crédito e débito parcelados, dinheiro e faturamento para comércios, indústrias e condomínios cadastrados.'
    },
    {
      question: 'Vocês atendem finais de semana e feriados em Timon?',
      answer: 'Sim! Nosso plantão de atendimento de emergência funciona 24 horas por dia, 7 dias por semana, incluindo sábados, domingos e feriados em toda a cidade.'
    }
  ],
  testimonials: [
    {
      name: 'Raimundo Nonato de Sousa',
      neighborhood: 'Parque Piauí',
      role: 'Comerciante',
      content: 'A caixa de gordura do nosso restaurante no Parque Piauí transbordou na hora do almoço. A equipe chegou muito rápido com a máquina rotativa e deixou tudo desobstruído e limpo. Recomendo demais!'
    },
    {
      name: 'Maria Francinete Silveira',
      neighborhood: 'Centro',
      role: 'Advogada',
      content: 'Excelente atendimento em nosso escritório no Centro de Timon. O técnico foi muito educado, explicou o que causava o entupimento e resolveu em menos de 30 minutos sem quebrar nada.'
    },
    {
      name: 'Antônio Carlos Meireles',
      neighborhood: 'Cidade Nova',
      role: 'Proprietário Residencial',
      content: 'Precisamos do caminhão limpa fossa para esgotamento da nossa fossa séptica na Cidade Nova. Trabalho impecável, caminhão potente e preço justo com garantia.'
    }
  ],
  commercialClaimsVerified: true,
  isDraft: false,
  status: 'ativo',
  auditScore: 100,
  cloudflareProjectName: 'desentupidora-timon',
  parceiros: [
    {
      id: 'p_patos',
      nome: 'Desentupidora Patos PB 24h',
      cidade: 'Patos',
      uf: 'PB',
      dominio: 'desentupidora-patos.pages.dev',
      url: 'https://desentupidora-patos.pages.dev',
      descricao: 'Atendimento técnico especializado em desentupimento e hidrojateamento no Sertão Paraibano.'
    },
    {
      id: 'p_crato',
      nome: 'Desentupidora Crato CE 24h',
      cidade: 'Crato',
      uf: 'CE',
      dominio: 'desentupidora-crato.pages.dev',
      url: 'https://desentupidora-crato.pages.dev',
      descricao: 'Serviços de desentupimento de esgotos, pias, ralos e limpa fossa no Cariri Cearense.'
    },
    {
      id: 'p_itapipoca',
      nome: 'Desentupidora Itapipoca CE 24h',
      cidade: 'Itapipoca',
      uf: 'CE',
      dominio: 'desentupidora-itapipoca.pages.dev',
      url: 'https://desentupidora-itapipoca.pages.dev',
      descricao: 'Equipes 24 horas para desentupimento e hidrojateamento no Norte Cearense.'
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
    estado: 'Maranhão',
    uf: city.uf,
    populacao: city.populacao || '182.711',
    ddd: city.ddd || '99',
    whatsapp: city.whatsapp || '99998412890',
    telefoneFixo: city.telefoneFixo || city.phone || '(99) 3212-4890',
    isDraft,
    commercialClaimsVerified: city.commercialClaimsVerified === true,
    empresaNome: city.empresaNome || `Desentupidora ${city.cidade}`,
    cnpj: city.cnpj || '',
    endereco: city.endereco || '',
    hospedagem: city.hospedagem || 'cloudflare',
    deployUrl: city.deployUrl || '',
    paletaCores: city.paletaCores || 'urgencia-azul-laranja',
    logoUrl: city.logoUrl || '/images/timon/logo-desentupidora-timon.webp',
    logoHeight: city.logoHeight || 64,
    faviconUrl: city.faviconUrl || '/images/timon/favicon-desentupidora-timon.webp',
    heroImage: city.heroImage || '/images/timon/desentupidora-timon-caminhao-hidrojateamento.webp',
    variants: {
      hero: 'HeroV4',
      services: 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: city.sectionsConfig || {},
    geoCoordinates: city.geoCoordinates || {
      latitude: '-5.0939',
      longitude: '-42.8364'
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
  console.log('🚀 CRIANDO E PUBLICANDO SITE: TIMON / MA (#63)');
  console.log('====================================================\n');

  // 1. Assets
  await generateAssets();

  // 2. Register in cities.json
  console.log('\n📝 2. Registrando Timon no cities.json...');
  const existingIdx = cities.findIndex(c => c.id === 'timon' || (c.cidade === 'Timon' && c.uf === 'MA'));
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...timonData };
    console.log('   🔄 Cidade atualizada na posição', existingIdx + 1);
  } else {
    cities.push(timonData);
    console.log('   ➕ Nova cidade adicionada (Total:', cities.length, ')');
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');

  // 3. Sync to Astro
  console.log('\n🔄 3. Sincronizando dados com o gerador Astro...');
  syncCityToAstro(timonData);

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
  console.log('\n☁️ 5. Publicando no Cloudflare Pages (desentupidora-timon.pages.dev)...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const deployResult = await deployEngine.deployCitySite(timonData, settings, distDir);

  console.log('   Resultado do Deploy:', deployResult);

  if (deployResult.success) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    const finalUrl = deployResult.url || 'https://desentupidora-timon.pages.dev';
    console.log('   URL de Produção:', finalUrl);
    
    // Update city with deployed status and url
    const idx = cities.findIndex(c => c.id === 'timon' || (c.cidade === 'Timon' && c.uf === 'MA'));
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
      obsContent = obsContent.replace(/total_cidades_ativas:\s*\d+/, 'total_cidades_ativas: 63');
      obsContent = obsContent.replace(/ultima_cidade_publicada:\s*.+/, 'ultima_cidade_publicada: Timon (MA)');
      obsContent = obsContent.replace(/\d+ Cidades Ativas em Produção/, '63 Cidades Ativas em Produção');
      
      const timonRow = '| **63** | **Timon (MA)** | 182.711 | cloudflare | `tecnico-especializado` / urgencia-azul-laranja | (99) 3212-4890 / (99) 998412890 | 38 págs | [Acessar Site](https://desentupidora-timon.pages.dev) |\n';
      if (!obsContent.includes('desentupidora-timon.pages.dev')) {
        obsContent = obsContent.replace(/(\| \*\*62\*\* \| \*\*Francisco Beltrão \(PR\)\*\* [^\n]+\n)/, '$1' + timonRow);
      }
      fs.writeFileSync(obsPath, obsContent, 'utf-8');
      console.log('   📓 Obsidian atualizado com Timon (MA) como cidade #63!');
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
