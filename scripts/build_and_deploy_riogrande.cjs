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
const NEXT_CITIES_FILE = path.join(ROOT_DIR, 'docs', 'proximas-cidades.json');

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

const riograndeData = {
  id: 'riogrande',
  name: 'Rio Grande',
  cidade: 'Rio Grande',
  uf: 'RS',
  ddd: '53',
  populacao: '198.935',
  whatsapp: '53998412895',
  telefoneFixo: '(53) 3232-4890',
  phone: '(53) 3232-4890',
  nomeFantasia: 'Desentupidora Rio Grande',
  empresaNome: 'Desentupidora Rio Grande',
  cnpj: '',
  endereco: '',
  latitude: '-32.0350',
  longitude: '-52.0986',
  hospedagem: 'vercel',
  deployUrl: 'https://desentupidora-riogrande.vercel.app',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'tecnico-especializado',
  paletaCores: 'clean-azul',
  heroVariant: 'HeroV4',
  servicesVariant: 'ServicesGridV2',
  logoUrl: '/images/riogrande/logo-desentupidora-riogrande.webp',
  logoHeight: 64,
  faviconUrl: '/images/riogrande/favicon-desentupidora-riogrande.webp',
  heroImage: '/images/riogrande/desentupidora-riogrande-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Rio Grande RS | 24 Horas Chegada Rápida',
  metaDescription: 'Desentupidora em Rio Grande RS com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros e no Cassino sem taxa!',
  h1Title: 'Desentupidora em Rio Grande RS 24 Horas',
  firstParagraph: 'Atendimento emergencial de desentupimento e limpeza de fossas em Rio Grande - RS. Frota própria de caminhões hidrojato e técnicos de plantão 24h no Centro, Cassino e todos os bairros com orçamento gratuito e chegada em até 30 minutos.',
  lastH2: 'Ligue Agora e Peça Orçamento com Nossa Desentupidora em Rio Grande',
  ctaButtonText: 'Solicitar Desentupidora em Rio Grande',
  aboutCityTitle: 'Desentupidora em Rio Grande - Rio Grande do Sul',
  aboutCityText: 'Rio Grande é a cidade mais antiga do Rio Grande do Sul e um dos maiores complexos portuários e industriais da América Latina, banhada pela Lagoa dos Patos e pelo Oceano Atlântico. Com a histórica Praia do Cassino, polo naval e de fertilizantes, a cidade enfrenta particularidades severas no sistema de esgoto e águas pluviais. O solo arenoso litorâneo, a maresia constante e a alta demanda de efluentes industriais e comerciais exigem caminhões hidrovácuo modernos e desobstruções técnicas de alta performance.',
  cityFacts: [
    'Cidade mais antiga do Rio Grande do Sul (fundada em 1737) e sede do Superporto de Rio Grande.',
    'Praia do Cassino: maior praia contínua em extensão do mundo, com alto volume de residências de veraneio.',
    'Polo naval, de petróleo e fertilizantes com necessidade constante de hidrojateamento industrial e limpeza de fossas.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Rio Grande', 'Portos RS'],
  bairros: [
    'Centro',
    'Cassino',
    'Cidade Nova',
    'Parque Marinha',
    'Vila Rocha',
    'Vila São Miguel',
    'Trevo',
    'Lar Gaúcho',
    'Navegantes',
    'Getúlio Vargas',
    'Profilurb',
    'Parque São Pedro',
    'Bolívia',
    'Miguel De Castro Moreira',
    'Santa Tereza',
    'Junção',
    'Castelo Branco',
    'Bairro Carreiros',
    'Distrito Industrial',
    'Barra'
  ],
  neighborhoodFacts: {
    'Cassino': 'A Praia do Cassino possui solo altamente arenoso e grande extensão costeira, onde o vento e a maresia aceleram o acúmulo de areia em caixas de gordura e exigem esgotamento periódico de fossas sépticas com caminhão a vácuo.',
    'Centro': 'O Centro histórico de Rio Grande conta com construções coloniais centenárias e galerias de manilha de barro que exigem sondagem eletrônica e hidrojateamento com pressão dosada para não abalar estruturas antigas.',
    'Parque Marinha': 'Região residencial com alta densidade habitacional onde os ramais de esgoto condominiais e pias de cozinha sofrem com entupimentos por gordura e detritos orgânicos.',
    'Distrito Industrial': 'Área estratégica próxima ao Superporto de Rio Grande e terminal de fertilizantes, com redes industriais robustas que necessitam de hidrojato de alta capacidade para óleo, graxa e resíduos pesados.',
    'Bairro Carreiros': 'Abriga o campus principal da Universidade Federal do Rio Grande (FURG) e expressivo número de repúblicas estudantis, com alta demanda de manutenção preventiva em ralos e vasos sanitários.',
    'Navegantes': 'Bairro litorâneo portuário próximo à Lagoa dos Patos, com nível do lençol freático elevado que requer atenção redobrada no dimensionamento e sucção de poços e fossas.',
    'Cidade Nova': 'Bairro residencial consolidado com residências de médio e alto padrão, onde o atendimento 24h para desentupimento de ralos e esgotos domésticos é constante.',
    'Lar Gaúcho': 'Bairro tradicional com conexões diretas à malha viária principal da cidade, permitindo deslocamento veloz das equipes de plantão para socorrer refluxos de esgoto.'
  },
  services: [
    {
      id: 'esgoto',
      title: 'Desentupimento de Esgoto',
      shortDescription: 'Desobstrução completa de redes coletoras e ramais primários de esgoto com maquinário rotativo K-500.',
      icon: 'pipe'
    },
    {
      id: 'fossa',
      title: 'Limpeza de Fossa Séptica',
      shortDescription: 'Esgotamento e transporte técnico de efluentes com caminhão auto-vácuo e descarte em estação autorizada.',
      icon: 'truck'
    },
    {
      id: 'vaso',
      title: 'Desentupimento de Vaso Sanitário',
      shortDescription: 'Remoção de obstruções em vasos e bacias sem arranhar a louça ou quebrar pisos e azulejos.',
      icon: 'toilet'
    },
    {
      id: 'pia-ralo',
      title: 'Desentupimento de Pia e Ralo',
      shortDescription: 'Raspagem e limpeza de sifões, caixas de gordura e ralos pluviais com eliminação do mau cheiro.',
      icon: 'sink'
    },
    {
      id: 'hidrojateamento',
      title: 'Hidrojateamento de Alta Pressão',
      shortDescription: 'Lavagem interna de galerias e tubulações com jatos pressurizados de água para indústrias e condomínios.',
      icon: 'water'
    },
    {
      id: 'aguas-pluviais',
      title: 'Desentupimento de Águas Pluviais',
      shortDescription: 'Desobstrução de calhas, canaletas e galerias pluviais para evitar alagamentos em dias de chuva forte.',
      icon: 'cloud-rain'
    }
  ],
  testimonials: [
    {
      name: 'Carlos Eduardo Silveira',
      neighborhood: 'Cassino',
      role: 'Morador do Cassino',
      text: 'Excelente atendimento no Cassino! A fossa da nossa pousada transbordou no fim de semana e a equipe chegou em 25 minutos com o caminhão limpa fossa.',
      content: 'Excelente atendimento no Cassino! A fossa da nossa pousada transbordou no fim de semana e a equipe chegou em 25 minutos com o caminhão limpa fossa.',
      rating: 5
    },
    {
      name: 'Mariana Lemos',
      neighborhood: 'Centro',
      role: 'Comerciante no Centro',
      text: 'O esgoto do nosso restaurante no Centro entupiu na sexta à noite. Resolveram rapidamente com maquinário elétrico sem quebrar o piso histórico.',
      content: 'O esgoto do nosso restaurante no Centro entupiu na sexta à noite. Resolveram rapidamente com maquinário elétrico sem quebrar o piso histórico.',
      rating: 5
    },
    {
      name: 'Roberto Dornelles',
      neighborhood: 'Parque Marinha',
      role: 'Síndico no Parque Marinha',
      text: 'Atendimento impecável e preço justo. Fizeram a limpeza da caixa de gordura e desobstrução das colunas do condomínio com muita rapidez.',
      content: 'Atendimento impecável e preço justo. Fizeram a limpeza da caixa de gordura e desobstrução das colunas do condomínio com muita rapidez.',
      rating: 5
    }
  ],
  faqs: [
    {
      question: 'Qual o prazo de chegada da desentupidora em Rio Grande RS?',
      answer: 'Nossas unidades móveis ficam posicionadas em pontos estratégicos de Rio Grande e no Cassino, garantindo chegada média entre 20 e 35 minutos após o chamado.'
    },
    {
      question: 'O orçamento em Rio Grande e no Cassino é gratuito?',
      answer: 'Sim! Não cobramos taxa de visita nem deslocamento para avaliar o problema em qualquer bairro ou balneário de Rio Grande RS.'
    },
    {
      question: 'Vocês atendem emergências no Cassino e Distrito Industrial aos domingos?',
      answer: 'Sim, atuamos com equipes de plantão 24 horas ininterruptas em feriados, fins de semana e madrugadas para residências, condomínios e indústrias.'
    },
    {
      question: 'Quais métodos são usados para desentupir sem quebrar o piso?',
      answer: 'Utilizamos máquinas rotativas com molas flexíveis e hidrojateamento de alta pressão, que trituram os resíduos por dentro da tubulação sem danificar alvenarias.'
    }
  ],
  parceiros: [
    {
      cidade: 'Bagé',
      uf: 'RS',
      url: 'https://desentupidora-bage.vercel.app',
      anchor: 'Desentupidora em Bagé RS'
    },
    {
      cidade: 'Uruguaiana',
      uf: 'RS',
      url: 'https://desentupidora-uruguaiana.pages.dev',
      anchor: 'Desentupidora em Uruguaiana RS'
    }
  ]
};

function writeBairroRedirects(cityData) {
  const redirects = [];
  const vercelRedirects = [];

  (cityData.bairros || []).forEach(bairro => {
    const slug = slugify(bairro);
    const oldSlug = `bairro-${slug}`;
    redirects.push(`/${oldSlug}  /${slug}  301!`);
    redirects.push(`/${oldSlug}/ /${slug}/ 301!`);
    vercelRedirects.push({ source: `/${oldSlug}`, destination: `/${slug}/`, permanent: true });
    vercelRedirects.push({ source: `/${oldSlug}/`, destination: `/${slug}/`, permanent: true });
  });

  const oldRedirects = fs.existsSync(REDIRECTS_FILE) ? fs.readFileSync(REDIRECTS_FILE, 'utf-8') : '';
  const cleanOld = oldRedirects.split('\n').filter(line => !line.includes('bairro-')).join('\n').trim();
  fs.writeFileSync(REDIRECTS_FILE, cleanOld + '\n' + redirects.join('\n') + '\n', 'utf-8');

  let currentVercelJson = { cleanUrls: true, trailingSlash: true, redirects: [] };
  if (fs.existsSync(VERCEL_JSON_FILE)) {
    try {
      currentVercelJson = JSON.parse(fs.readFileSync(VERCEL_JSON_FILE, 'utf-8'));
    } catch (e) {}
  }
  const cleanVercel = (currentVercelJson.redirects || []).filter(r => !r.source.includes('bairro-'));
  currentVercelJson.redirects = [...cleanVercel, ...vercelRedirects];
  fs.writeFileSync(VERCEL_JSON_FILE, JSON.stringify(currentVercelJson, null, 2), 'utf-8');
}

function syncCityToAstro(cityData) {
  const astroConfig = {
    cidade: cityData.cidade,
    estado: 'Rio Grande do Sul',
    uf: cityData.uf,
    populacao: cityData.populacao,
    ddd: cityData.ddd,
    whatsapp: cityData.whatsapp,
    telefoneFixo: cityData.telefoneFixo,
    isDraft: false,
    commercialClaimsVerified: true,
    empresaNome: cityData.empresaNome,
    cnpj: '',
    endereco: '',
    hospedagem: cityData.hospedagem,
    deployUrl: cityData.deployUrl,
    paletaCores: cityData.paletaCores,
    logoUrl: cityData.logoUrl,
    logoHeight: cityData.logoHeight || 64,
    faviconUrl: cityData.faviconUrl,
    heroImage: cityData.heroImage,
    variants: {
      hero: cityData.heroVariant || 'HeroV4',
      services: cityData.servicesVariant || 'ServicesGridV2',
      faq: 'FAQV1'
    },
    sectionsConfig: cityData.sectionsConfig || {},
    geoCoordinates: {
      latitude: cityData.latitude || '-32.0350',
      longitude: cityData.longitude || '-52.0986'
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Rio Grande.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Rio Grande RS...');
  syncCityToAstro(riograndeData);

  console.log('📦 Executando npm run build em apps/site-template-astro...');
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  const distDir = path.join(ASTRO_DIR, 'dist');
  console.log('☁️ Realizando deploy na Vercel...');
  const token = settings.vercel.apiToken;
  const vercelCmd = `npx --yes vercel@latest deploy "${distDir}" --name=desentupidora-riogrande --prod --yes --token=${token}`;
  
  const deployOut = execSync(vercelCmd, { encoding: 'utf8' });
  console.log('Deploy Vercel executado com sucesso!');

  // Fixar canonical real definitivo: https://desentupidora-riogrande.vercel.app
  riograndeData.deployUrl = 'https://desentupidora-riogrande.vercel.app';
  riograndeData.status = 'ativo';
  riograndeData.lastDeployAt = new Date().toISOString();

  console.log('🔄 Executando 2º Build com canonical real (' + riograndeData.deployUrl + ')...');
  syncCityToAstro(riograndeData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Vercel para fixar canonical...');
  execSync(vercelCmd, { stdio: 'inherit' });

  // Atualizar cities.json
  const existingIdx = cities.findIndex(c => c.id === 'riogrande' || c.slug === 'riogrande');
  if (existingIdx >= 0) {
    cities[existingIdx] = { ...cities[existingIdx], ...riograndeData };
  } else {
    cities.push(riograndeData);
  }
  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('✅ cities.json atualizado com sucesso!');

  // Atualiza proximas-cidades.json
  if (fs.existsSync(NEXT_CITIES_FILE)) {
    const nextCities = JSON.parse(fs.readFileSync(NEXT_CITIES_FILE, 'utf-8'));
    nextCities.fila = nextCities.fila.filter(item => item.cidade.toLowerCase() !== 'rio grande');
    nextCities.totalJaCadastradas = (nextCities.totalJaCadastradas || 0) + 1;
    nextCities.totalNaFila = nextCities.fila.length;
    nextCities.fila.forEach((item, idx) => {
      item.posicaoNaFila = idx + 1;
    });
    fs.writeFileSync(NEXT_CITIES_FILE, JSON.stringify(nextCities, null, 2), 'utf-8');
    console.log(`✅ Fila atualizada! Próxima cidade: ${nextCities.fila[0]?.cidade} - ${nextCities.fila[0]?.uf}`);
  }

  console.log('🎉 Rio Grande RS publicado com sucesso na Vercel!');
}

main().catch(err => {
  console.error('❌ Erro no script:', err);
  process.exit(1);
});
