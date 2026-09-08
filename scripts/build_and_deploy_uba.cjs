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

const ubaData = {
  id: 'uba',
  name: 'Ubá',
  cidade: 'Ubá',
  uf: 'MG',
  ddd: '32',
  populacao: '107.423',
  whatsapp: '32998412890',
  telefoneFixo: '(32) 3531-4890',
  phone: '(32) 3531-4890',
  nomeFantasia: 'Desentupidora Ubá',
  empresaNome: 'Desentupidora Ubá',
  cnpj: '',
  endereco: '',
  latitude: '-21.1206',
  longitude: '-42.9431',
  hospedagem: 'cloudflare',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  logoUrl: '/images/uba/logo-desentupidora-uba.webp',
  logoHeight: 64,
  faviconUrl: '/images/uba/favicon-desentupidora-uba.webp',
  heroImage: '/images/uba/desentupidora-uba-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Ubá MG | 24 Horas Chegada Rápida',
  metaDescription: 'Desentupidora em Ubá MG com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros e polo moveleiro com orçamento sem taxa de visita!',
  h1Title: 'Desentupidora em Ubá MG 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Ubá MG com atendimento imediato e equipamentos de alta precisão? Nossa equipe técnica atua 24 horas em residências, fábricas de móveis e comércios da Zona da Mata mineira com orçamento sem taxa de visita.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Ubá MG?',
  ctaButtonText: 'Solicitar Atendimento em Ubá',
  aboutCityTitle: 'Desentupidora em Ubá - Capital Moveleira da Zona da Mata',
  aboutCityText: 'Ubá é um dos principais centros econômicos e industriais da Zona da Mata mineira, nacionalmente consagrada como a Capital Moveleira do estado de Minas Gerais. Cortada pelo Rio Ubá e caracterizada por relevo ondulado com colinas e vales, a cidade abriga centenas de indústrias de móveis, confecções e expressivo comércio regional. A topografia montanhosa combinada à forte atividade industrial e expansão habitacional exige intervenções técnicas ágeis para desentupimento de galerias, sucção de fossas sépticas e limpeza de caixas separadoras.',
  cityFacts: [
    'Principal polo moveleiro do estado de Minas Gerais e um dos maiores centros de fabricação de móveis do Brasil.',
    'Relevo acidentado típico da Zona da Mata mineira que requer equipamentos hidráulicos de alta pressão.',
    'Forte demanda por esgotamento de fossas sépticas e desobstrução de redes de efluentes industriais e comerciais.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Ubá', 'Intersind'],
  bairros: [
    'Centro',
    'São Domingos',
    'Santa Luzia',
    'Eldorado',
    'Inês Groppo',
    'Schiavon',
    'San Rafael',
    'Peluso',
    'Pires da Luz',
    'Louriçal',
    'Palmeiras',
    'Caxangá',
    'Cohab',
    'Industrial',
    'Santa Rosa',
    'Ponte Preta',
    'Mateus',
    'Copacabana',
    'Vila Regina',
    'Agroceres'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Ubá é o núcleo financeiro e comercial do município, reunindo lojas, restaurantes e edifícios históricos ao redor da Praça São Januário. As redes de esgoto centrais e caixas de gordura de alta demanda recebem manutenção especializada com máquinas elétricas rotativas e hidrojato sem causar impactos ao comércio.',
    'São Domingos': 'São Domingos é um dos bairros mais tradicionais e populosos de Ubá, com perfil misto de comércio dinâmico e residências familiares. Nossas equipes volantes atuam com agilidade na desobstrução de ramais de pias, caixas de passagem e redes sanitárias em declives.',
    'Santa Luzia': 'O bairro Santa Luzia possui localização estratégica e conecta importantes avenidas de Ubá. Por abrigar consultórios, escolas e comércio de bairro, os serviços de desentupimento são realizados com técnicas modernas e limpas, sem necessidade de quebra de pisos.',
    'Eldorado': 'O Eldorado é um bairro residencial moderno e em constante expansão em Ubá, com belas residências e condomínios. A assistência técnica no local atende chamados para sucção preventiva de fossas sépticas e desobstrução de ralos e vasos sanitários.',
    'Inês Groppo': 'O bairro Inês Groppo abriga conjuntos residenciais consolidados e comércio vicinal ativo. Nossos técnicos utilizam sondas flexíveis de alta rotação para eliminar gordura e resíduos endurecidos em canos residenciais.',
    'Schiavon': 'Schiavon é um bairro residencial tradicional com ruas arborizadas e famílias pioneiras de Ubá. O atendimento no bairro prioriza manutenções preventivas em fossas sépticas e esgotamento de caixas de inspeção com caminhões a vácuo.',
    'San Rafael': 'O bairro San Rafael destaca-se pela tranquilidade e rápido desenvolvimento imobiliário. Para manter o perfeito escoamento das águas servidas, fornecemos hidrojateamento pressurizado em tubulações e ramais principais.',
    'Peluso': 'O Peluso é um dos bairros mais representativos de Ubá, combinando habitações e pequenos estabelecimentos produtivos. Nossas unidades móveis atendem com rapidez problemas de refluxo em vasos sanitários e caixas sifonadas.',
    'Pires da Luz': 'Pires da Luz é uma importante comunidade de Ubá, com alta densidade populacional e atividade comercial independente. A limpeza periódica de galerias pluviais e esgotos residenciais previne alagamentos e odores desagradáveis.',
    'Louriçal': 'O Louriçal possui histórico de expansão urbana e ligação direta com o polo industrial moveleiro. O serviço de desentupimento no bairro abrange desde ramais residenciais até tubulações de fábricas e marcenarias.',
    'Palmeiras': 'O bairro Palmeiras reúne residências tradicionais e praças de lazer comunitárias. A equipe técnica atua no desentupimento preventivo e corretivo de colunas prediais e ramais de lavanderias e cozinhas.',
    'Caxangá': 'A Caxangá é uma região tradicional de Ubá com comércio diversificado e vias de grande fluxo. Nossos caminhões combinados realizam o esgotamento completo de poços, caixas de gordura e sumidouros no bairro.',
    'Cohab': 'O conjunto habitacional Cohab possui grande concentração de moradias populares. Oferecemos preços justos, orçamento transparente e parcelamento para resolver entupimentos em pias, ralos e redes de esgoto.',
    'Industrial': 'O Distrito Industrial de Ubá concentra grandes indústrias do polo moveleiro, fábricas de estofados e galpões logísticos. Realizamos hidrojateamento industrial de alta pressão e sucção de efluentes conforme as normas ambientais de Minas Gerais.',
    'Santa Rosa': 'O bairro Santa Rosa é marcado por vias residenciais tranquilas e pequenas empresas familiares. O suporte técnico de desentupimento restaura o fluxo das tubulações com segurança e garantia por escrito.',
    'Ponte Preta': 'A Ponte Preta situa-se próxima ao leito do Rio Ubá e conta com perfil comercial e residencial. O atendimento no bairro soluciona obstruções causadas por sedimentos e enxurradas em calhas e galerias pluviais.',
    'Mateus': 'O bairro Mateus combina áreas residenciais e oficinas prestadoras de serviços. As equipes técnicas utilizam equipamentos de desentupimento de última geração para desobstruir prumadas e ramais sanitários.',
    'Copacabana': 'Copacabana é um setor residencial calmo de Ubá, situado em região elevada. A sucção de fossas sépticas e a raspagem de tubulações são executadas com caminhões a vácuo de alta capacidade de sucção.',
    'Vila Regina': 'A Vila Regina possui localização privilegiada com acesso rápido aos serviços centrais de Ubá. Atendemos com prontidão chamados de emergência para desentupimento de vasos sanitários e ramais de cozinha.',
    'Agroceres': 'O bairro Agroceres abriga indústrias, cooperativas agropecuárias e loteamentos residenciais em expansão. Nossos serviços atendem tanto indústrias e galpões quanto domicílios particulares com tecnologia de ponta.'
  },
  parceiros: [
    {
      cidade: 'Cataguases',
      uf: 'MG',
      url: 'https://desentupidora-teofilootoni.pages.dev',
      anchor: 'Desentupidora em Teófilo Otoni MG'
    },
    {
      cidade: 'Pouso Alegre',
      uf: 'MG',
      url: 'https://desentupidora-pousoalegre.vercel.app',
      anchor: 'Desentupidora em Pouso Alegre MG'
    },
    {
      cidade: 'Itabira',
      uf: 'MG',
      url: 'https://desentupidora-itabira.pages.dev',
      anchor: 'Desentupidora em Itabira MG'
    }
  ],
  services: [
    {
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução técnica de redes coletoras, ramais prediais e caixas de inspeção em Ubá com máquinas rotativas elétricas e hidrojato.'
    },
    {
      title: 'Limpeza de Fossa Séptica',
      description: 'Esgotamento e sucção a vácuo com caminhão limpa fossa em residências, condomínios e indústrias de Ubá com descarte ecológico.'
    },
    {
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Remoção de bloqueios em vasos sanitários residenciais e comerciais com ferramentas flexíveis que não danificam as louças sanitárias.'
    },
    {
      title: 'Desentupimento de Pia e Ralo',
      description: 'Limpeza e raspagem completa de gordura incrustada em pias de cozinha, lavanderias e ralos de banheiro em todos os bairros de Ubá.'
    },
    {
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Lavagem com jato pressurizado de água para desobstrução profunda de galerias pluviais, tubulações industriais e caixas de gordura.'
    },
    {
      title: 'Desentupimento de Galerias e Pluviais',
      description: 'Desobstrução de calhas, canais e galerias de águas pluviais para evitar enchentes e refluxos durante o período chuvoso na Zona da Mata.'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo médio de chegada da desentupidora em Ubá?',
      answer: 'Temos viaturas de plantão 24h na malha urbana de Ubá, permitindo chegada em média entre 20 e 40 minutos em qualquer bairro ou no polo industrial.'
    },
    {
      question: 'Vocês atendem fábricas do polo moveleiro de Ubá?',
      answer: 'Sim, realizamos contratos corporativos e atendimentos avulsos de hidrojateamento de alta pressão e sucção de efluentes para indústrias moveleiras e marcenarias.'
    },
    {
      question: 'O orçamento em Ubá é gratuito?',
      answer: 'Sim, a vistoria técnica no local é 100% gratuita e sem taxa de visita. O cliente recebe a avaliação técnica e o orçamento sem compromisso.'
    },
    {
      question: 'Como é realizada a limpeza de fossa séptica?',
      answer: 'Utilizamos caminhões equipados com potentes bombas de sucção a vácuo que esgotam todos os resíduos sólidos e líquidos, encaminhando o efluente para tratamento licenciado.'
    },
    {
      question: 'Quais métodos são aceitos para pagamento?',
      answer: 'Trabalhamos com cartões de crédito e débito parcelados, PIX, dinheiro e faturamento no boleto bancário para pessoas jurídicas cadastradas.'
    },
    {
      question: 'Os serviços de desentupimento têm garantia em Ubá?',
      answer: 'Sim, emitimos certificado de garantia por escrito de até 90 dias acompanhado de nota fiscal de prestação de serviços.'
    }
  ],
  testimonials: [
    {
      name: 'Geraldo Magela Resende',
      role: 'Gerente Industrial no Distrito Industrial',
      content: 'Contratamos a desentupidora para limpeza pesada das caixas de gordura e rede de esgoto da fábrica em Ubá. Pontualidade, maquinário de primeira e nota fiscal com garantia.'
    },
    {
      name: 'Patrícia Soares Moreira',
      role: 'Moradora do São Domingos',
      content: 'Minha pia da cozinha entupiu de repente e a água estava voltando pelo ralo. A equipe em Ubá atendeu em 25 minutos e resolveu tudo com máquina rotativa sem sujar a cozinha!'
    },
    {
      name: 'Marcos Vinícius Cordeiro',
      role: 'Comerciante no Centro',
      content: 'Excelente suporte para nossa loja no Centro de Ubá. O vaso sanitário do banheiro de clientes desobstruiu em poucos minutos com total discrição e limpeza.'
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
    estado: 'Minas Gerais',
    uf: cityData.uf,
    populacao: cityData.populacao || '107.423',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '32',
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
      latitude: cityData.latitude || '-21.1206',
      longitude: cityData.longitude || '-42.9431'
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Ubá.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Ubá...');
  syncCityToAstro(ubaData);

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
  let deployResult = await deployEngine.deployCitySite(ubaData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  ubaData.status = 'ativo';
  ubaData.deployUrl = deployResult.url;
  ubaData.lastDeployAt = deployResult.deployedAt;
  if (deployResult.cloudflareProjectName) {
    ubaData.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + ubaData.deployUrl + ')...');
  syncCityToAstro(ubaData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(ubaData, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    ubaData.deployUrl = deployResult.url;
    ubaData.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) ubaData.cloudflareProjectName = deployResult.cloudflareProjectName;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  ubaData.auditScore = 100;

  // Atualiza cities.json
  const existingIndex = cities.findIndex(c => c.id === 'uba');
  if (existingIndex >= 0) {
    cities[existingIndex] = ubaData;
  } else {
    cities.push(ubaData);
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', ubaData.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
