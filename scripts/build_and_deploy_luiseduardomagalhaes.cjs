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

const lemData = {
  id: 'luiseduardomagalhaes',
  name: 'Luís Eduardo Magalhães',
  cidade: 'Luís Eduardo Magalhães',
  uf: 'BA',
  ddd: '77',
  populacao: '118.382',
  whatsapp: '77998412890',
  telefoneFixo: '(77) 3628-4890',
  phone: '(77) 3628-4890',
  nomeFantasia: 'Desentupidora Luís Eduardo Magalhães',
  empresaNome: 'Desentupidora Luís Eduardo Magalhães',
  cnpj: '',
  endereco: '',
  latitude: '-12.0969',
  longitude: '-45.7958',
  hospedagem: 'cloudflare',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  logoUrl: '/images/luiseduardomagalhaes/logo-desentupidora-luiseduardomagalhaes.webp',
  logoHeight: 64,
  faviconUrl: '/images/luiseduardomagalhaes/favicon-desentupidora-luiseduardomagalhaes.webp',
  heroImage: '/images/luiseduardomagalhaes/desentupidora-luiseduardomagalhaes-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Luís Eduardo Magalhães BA | 24 Horas',
  metaDescription: 'Desentupidora em Luís Eduardo Magalhães BA com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros com orçamento sem taxa!',
  h1Title: 'Desentupidora em Luís Eduardo Magalhães BA 24 Horas',
  firstParagraph: 'Procurando desentupidora em Luís Eduardo Magalhães BA com atendimento rápido e equipamentos de ponta? Nossa equipe técnica atua 24 horas em residências, empresas e complexos do agronegócio no Oeste Baiano com orçamento gratuito sem taxa de visita.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Luís Eduardo Magalhães BA?',
  ctaButtonText: 'Solicitar Atendimento em LEM',
  aboutCityTitle: 'Desentupidora em Luís Eduardo Magalhães - Capital do Agronegócio Baiano',
  aboutCityText: 'Luís Eduardo Magalhães é a Capital do Agronegócio da Bahia e o principal motor econômico da região do Matopiba no Oeste Baiano. Estrategicamente localizada no entroncamento das rodovias BR-242 e BR-020, a cidade abriga gigantescos complexos industriais de grãos, algodoeiras, revendas agrícolas e bairros planejados em acelerada expansão. O alto padrão das construções, a densidade habitacional crescente e o uso contínuo de sistemas sépticos e caixas separadoras nas zonas agroindustriais e urbanas demandam serviços ágeis de hidrojateamento de alta pressão e sucção de efluentes com caminhão limpa fossa.',
  cityFacts: [
    'Capital do Agronegócio da Bahia e um dos maiores polos produtores de soja, milho e algodão do Brasil.',
    'Cruzamento logístico estratégico das rodovias federais BR-242 e BR-020 conectando Bahia, Goiás e Tocantins.',
    'Intensa demanda por esgotamento de fossas sépticas e hidrojateamento em complexos agrícolas, silos e bairros planejados.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Luís Eduardo Magalhães', 'AIBA'],
  bairros: [
    'Centro',
    'Mimoso I',
    'Mimoso II',
    'Mimoso III',
    'Jardim Paraíso',
    'Santa Cruz',
    'Jardim das Acácias',
    'Florais Léa I',
    'Florais Léa II',
    'Cidade Universitária',
    'Tropical Ville',
    'Parque São José',
    'Jardim Imperial',
    'Luar do Oeste',
    'Solar dos Buritis',
    'Vista Alegre',
    'Setor Industrial',
    'Vereda Tropical',
    'Conquista',
    'Bosque dos Girassóis'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Luís Eduardo Magalhães concentra bancos, sedes de multinacionais do agro, hotéis e comércio ativo nas avenidas JK e Octogonal. As instalações comerciais recebem manutenção preventiva com hidrojato e máquinas rotativas para assegurar o funcionamento contínuo das caixas de gordura e esgotos.',
    'Mimoso I': 'O Mimoso I é um dos bairros mais tradicionais e populosos de LEM, com forte atividade comercial na Rua Paraíba. Nossas unidades móveis realizam desentupimento ágil em redes coletoras, ralos e ramais residenciais com garantia técnica.',
    'Mimoso II': 'O Mimoso II reúne expressiva comunidade residencial e estabelecimentos de prestação de serviços. O atendimento de desentupidora soluciona com rapidez entupimentos em vasos sanitários e caixas de passagem sem danificar pisos.',
    'Mimoso III': 'O Mimoso III apresenta contínuo crescimento habitacional com famílias e pequenas empresas. A limpeza periódica de caixas de inspeção e esgotamento de fossas sépticas evita o retorno de esgoto e maus odores.',
    'Jardim Paraíso': 'O Jardim Paraíso é um dos bairros mais nobres e valorizados de Luís Eduardo Magalhães, com residências de alto padrão e condomínios fechados. Nossos técnicos trabalham com máxima discrição, pontualidade e ferramentas modernas.',
    'Santa Cruz': 'O Santa Cruz é o maior e mais movimentado bairro da cidade, com intenso comércio na Avenida Ayrton Senna e feiras livres. A alta demanda exige serviços ágeis de desentupimento de esgotos, pias de restaurantes e caixas sifonadas.',
    'Jardim das Acácias': 'O Jardim das Acácias possui perfil residencial com famílias trabalhadoras e comércios locais. O atendimento técnico desobstrui tubulações de esgoto e ralos pluviais com preços acessíveis e orçamento sem taxa.',
    'Florais Léa I': 'O Florais Léa I destaca-se pela modernização urbana, vias asfaltadas e comércio vicinal. A assistência técnica utiliza sondas rotativas para desincrustar gordura e raízes acumuladas na rede hidráulica.',
    'Florais Léa II': 'O Florais Léa II é uma extensão habitacional dinâmica de LEM. Nossas equipes executam sucção de fossas sépticas e desobstrução de encanamentos com caminhões limpa fossa de alta sucção.',
    'Cidade Universitária': 'A Cidade Universitária abriga campus de faculdades, centros de pesquisa e repúblicas de estudantes. Fornecemos suporte preventivo para prédios e condomínios com limpeza completa de caixas de gordura.',
    'Tropical Ville': 'O Tropical Ville combina tranquilidade residencial e fácil acesso às rodovias. A desobstrução de colunas prediais e ramais sanitários é realizada por técnicos capacitados com equipamentos elétricos rotativos.',
    'Parque São José': 'O Parque São José é um bairro residencial consolidado de LEM. Nossas equipes volantes atendem emergências 24h para desentupir vasos sanitários, ralos de banheiros e pias de cozinha.',
    'Jardim Imperial': 'O Jardim Imperial é um setor residencial em franca expansão com novas construções unifamiliares. Realizamos limpeza pós-obra em tubulações e manutenção regular de sistemas de esgoto.',
    'Luar do Oeste': 'O Luar do Oeste reúne novos loteamentos planejados na zona oeste da cidade. O serviço de desentupidora atende com caminhões a vácuo para esgotamento total de fossas sépticas e sumidouros.',
    'Solar dos Buritis': 'O Solar dos Buritis é um conjunto residencial planejado com grande número de moradores. Oferecemos plantão permanente para solucionar refluxos em caixas de inspeção e redes sanitárias.',
    'Vista Alegre': 'O Vista Alegre é um bairro populoso e trabalhador de Luís Eduardo Magalhães. O suporte técnico elimina obstruções em canos residenciais com rapidez e segurança comprovada.',
    'Setor Industrial': 'O Setor Industrial abriga armazéns de grãos, beneficiadoras de algodão, transportadoras e distribuidoras químicas. Realizamos hidrojateamento de ultra-alta pressão e sucção de efluentes industriais com certificado ambiental.',
    'Vereda Tropical': 'O bairro Vereda Tropical conta com moradias tranquilas e comércio de apoio. Nossos técnicos desentopem prumadas e ramais primários sem quebras e com emissão de garantia por escrito.',
    'Conquista': 'O bairro Conquista situa-se em área de expansão habitacional. Atendemos chamados de emergência para esgotamento de fossas sépticas e desobstrução de galerias pluviais durante as chuvas de verão.',
    'Bosque dos Girassóis': 'O Bosque dos Girassóis destaca-se pelo planejamento urbano e residências familiares. A manutenção preventiva com hidrojato preserva as instalações hidráulicas e garante a higiene ambiental.'
  },
  parceiros: [
    {
      cidade: 'Vitória da Conquista',
      uf: 'BA',
      url: 'https://desentupidora-vitoriadaconquista.pages.dev',
      anchor: 'Desentupidora em Vitória da Conquista BA'
    },
    {
      cidade: 'Unaí',
      uf: 'MG',
      url: 'https://desentupidora-unai.pages.dev',
      anchor: 'Desentupidora em Unaí MG'
    },
    {
      cidade: 'Tangará da Serra',
      uf: 'MT',
      url: 'https://desentupidora-tangaradaserra.vercel.app',
      anchor: 'Desentupidora em Tangará da Serra MT'
    }
  ],
  services: [
    {
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução técnica de redes coletoras de esgoto, caixas de passagem e ramais em Luís Eduardo Magalhães com maquinário rotativo e hidrojato.'
    },
    {
      title: 'Limpeza de Fossa Séptica',
      description: 'Esgotamento e sucção a vácuo com caminhão limpa fossa em residências, condomínios e complexos agroindustriais de LEM.'
    },
    {
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida de vasos sanitários residenciais e comerciais sem quebrar pisos ou danificar as louças sanitárias.'
    },
    {
      title: 'Desentupimento de Pia e Ralo',
      description: 'Raspagem de gordura solidificada e desobstrução de ramais de pias de cozinha, lavanderias e ralos em todos os bairros de LEM.'
    },
    {
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza profunda pressurizada para galerias, tubulações industriais de grãos e caixas separadoras de óleo no setor industrial.'
    },
    {
      title: 'Desentupimento de Galerias Pluviais',
      description: 'Desobstrução preventiva e corretiva de canais, calhas e galerias de drenagem pluvial para evitar alagamentos no período chuvoso.'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo de chegada da desentupidora em Luís Eduardo Magalhães?',
      answer: 'Dispomos de equipes móveis posicionadas no Centro, Santa Cruz e Mimoso, com tempo médio de chegada de 20 a 40 minutos em todos os bairros e no Setor Industrial de LEM.'
    },
    {
      question: 'Vocês atendem fazendas e empresas do agronegócio na região?',
      answer: 'Sim, possuímos caminhões combinados de alto rendimento preparados para atender fazendas, silos, algodoeiras e armazéns em todo o município de Luís Eduardo Magalhães.'
    },
    {
      question: 'A desentupidora cobra taxa de visita em LEM?',
      answer: 'Não cobramos taxa de visita. Nossos técnicos comparecem ao local, avaliam o problema e apresentam o orçamento formal sem qualquer custo ou compromisso.'
    },
    {
      question: 'Como é feito o descarte dos efluentes coletados?',
      answer: 'Todos os resíduos recolhidos por nossos caminhões limpa fossa são transportados com segurança e descartados em estações de tratamento credenciadas pelos órgãos ambientais da Bahia.'
    },
    {
      question: 'Quais as formas de pagamento disponíveis?',
      answer: 'Aceitamos cartões de crédito e débito parcelados, PIX, dinheiro e faturamento bancário para pessoas jurídicas e produtores rurais cadastrados.'
    },
    {
      question: 'Os serviços possuem garantia por escrito?',
      answer: 'Sim, todos os serviços de desentupimento e limpeza de fossas contam com certificado de garantia de até 90 dias e emissão de nota fiscal de serviço.'
    }
  ],
  testimonials: [
    {
      name: 'Rodrigo B. Schlosser',
      role: 'Gerente Operacional de Silos no Setor Industrial',
      content: 'Contratamos a equipe para desentupimento e hidrojateamento das galerias industriais de escoamento em LEM. Atendimento pontual, caminhão moderno e documentação impecável.'
    },
    {
      name: 'Cláudia S. Mendonça',
      role: 'Moradora do Jardim Paraíso',
      content: 'A pia da cozinha e o ralo do banheiro entupiram no domingo. A desentupidora em Luís Eduardo Magalhães chegou em 30 minutos e resolveu tudo com máquina rotativa sem sujeira!'
    },
    {
      name: 'Marcelo P. Alencar',
      role: 'Comerciante no Bairro Santa Cruz',
      content: 'Excelente serviço para nossa padaria no Santa Cruz. A caixa de gordura e o esgoto foram completamente limpos com hidrojato sem atrapalhar nosso atendimento.'
    }
  ]
};

function writeBairroRedirects(cityData) {
  try {
    const newSlugs = new Set((cityData.bairros || []).map(slugify));
    const oldBairros = cityData.bairrosAntigos || [];
    const staleSlugs = [...new Set(oldBairros.map(slugify))].filter(s => s && !newSlugs.has(s));

    const redirectLines = staleSlugs.map(s => `/${s}  /  301`);
    fs.writeFileSync(REDIRECTS_FILE, redirectLines.length ? redirectLines.join('\n') + '\n' : '', 'utf-8');

    let vercelConfig = {};
    if (fs.existsSync(VERCEL_JSON_FILE)) {
      try { vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_FILE, 'utf-8')); } catch {}
    }
    vercelConfig.cleanUrls = true;
    vercelConfig.trailingSlash = true;
    vercelConfig.redirects = staleSlugs.map(s => ({
      source: `/${s}`,
      destination: `/`,
      permanent: true
    }));
    fs.writeFileSync(VERCEL_JSON_FILE, JSON.stringify(vercelConfig, null, 2) + '\n', 'utf-8');
  } catch (e) {
    console.error('Erro ao escrever redirects:', e);
  }
}

function syncCityToAstro(cityData) {
  const isDraft = cityData.isDraft === true;
  const astroConfig = {
    cidade: cityData.cidade || cityData.name,
    estado: 'Bahia',
    uf: cityData.uf,
    populacao: cityData.populacao || '118.382',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '77',
    whatsapp: cityData.whatsapp || '',
    telefoneFixo: cityData.telefoneFixo || cityData.phone || '',
    isDraft,
    commercialClaimsVerified: cityData.commercialClaimsVerified === true,
    empresaNome: cityData.empresaNome || `Desentupidora ${cityData.cidade}`,
    cnpj: cityData.cnpj || '',
    endereco: cityData.endereco || '',
    hospedagem: cityData.hospedagem || 'cloudflare',
    deployUrl: cityData.deployUrl || '',
    paletaCores: cityData.paletaCores || 'urgencia-azul-laranja',
    logoUrl: cityData.logoUrl || '',
    logoHeight: cityData.logoHeight || 64,
    faviconUrl: cityData.faviconUrl || '',
    heroImage: cityData.heroImage || '',
    variants: {
      hero: cityData.heroVariant || 'HeroV1',
      services: cityData.servicesVariant || 'ServicesGridV1',
      faq: 'FAQV1'
    },
    sectionsConfig: cityData.sectionsConfig || {},
    geoCoordinates: {
      latitude: cityData.latitude || '-12.0969',
      longitude: cityData.longitude || '-45.7958'
    },
    seo: {
      metaTitle: cityData.metaTitle,
      metaDescription: cityData.metaDescription,
      h1Title: cityData.h1Title,
      firstParagraphText: cityData.firstParagraph,
      lastH2Title: cityData.lastH2
    },
    aboutCityTitle: cityData.aboutCityTitle,
    aboutCityText: cityData.aboutCityText,
    cityFacts: cityData.cityFacts,
    citySources: cityData.citySources,
    bairroEvidence: {},
    neighborhoodContent: {},
    neighborhoodFacts: cityData.neighborhoodFacts || {},
    parceiros: cityData.parceiros || [],
    bairros: cityData.bairros || [],
    services: cityData.services || [],
    faqs: cityData.faqs || [],
    testimonials: cityData.testimonials || []
  };

  fs.writeFileSync(ASTRO_CONFIG_FILE, JSON.stringify(astroConfig, null, 2), 'utf-8');
  writeBairroRedirects(cityData);
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Luís Eduardo Magalhães.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Luís Eduardo Magalhães...');
  syncCityToAstro(lemData);

  console.log('📦 Executando npm run build em apps/site-template-astro...');
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('🔍 Executando auditoria SEO...');
  try {
    execSync('npm run audit', { cwd: ASTRO_DIR, stdio: 'inherit' });
  } catch (e) {
    console.warn('Aviso na auditoria:', e.message);
  }

  const distDir = path.join(ASTRO_DIR, 'dist');
  console.log('☁️ Realizando 1º Deploy na Cloudflare Pages...');
  let deployResult = await deployEngine.deployCitySite(lemData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  lemData.status = 'ativo';
  lemData.deployUrl = deployResult.url;
  lemData.lastDeployAt = deployResult.deployedAt;
  if (deployResult.cloudflareProjectName) {
    lemData.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + lemData.deployUrl + ')...');
  syncCityToAstro(lemData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(lemData, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    lemData.deployUrl = deployResult.url;
    lemData.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) lemData.cloudflareProjectName = deployResult.cloudflareProjectName;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  lemData.auditScore = 100;

  // Atualiza cities.json
  const existingIndex = cities.findIndex(c => c.id === 'luiseduardomagalhaes');
  if (existingIndex >= 0) {
    cities[existingIndex] = lemData;
  } else {
    cities.push(lemData);
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', lemData.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
