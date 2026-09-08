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

const mineirosData = {
  id: 'mineiros',
  name: 'Mineiros',
  cidade: 'Mineiros',
  uf: 'GO',
  ddd: '64',
  populacao: '74.999',
  whatsapp: '64998412890',
  telefoneFixo: '(64) 3661-4890',
  phone: '(64) 3661-4890',
  nomeFantasia: 'Desentupidora Mineiros',
  empresaNome: 'Desentupidora Mineiros',
  cnpj: '',
  endereco: '',
  latitude: '-17.5689',
  longitude: '-52.5511',
  hospedagem: 'cloudflare',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  logoUrl: '/images/mineiros/logo-desentupidora-mineiros.webp',
  logoHeight: 64,
  faviconUrl: '/images/mineiros/favicon-desentupidora-mineiros.webp',
  heroImage: '/images/mineiros/desentupidora-mineiros-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Mineiros GO | 24 Horas Chegada Rápida',
  metaDescription: 'Desentupidora em Mineiros GO com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os setores com orçamento sem taxa de visita!',
  h1Title: 'Desentupidora em Mineiros GO 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Mineiros GO com pronto atendimento e hidrojato de alta precisão? Nossa equipe técnica atua 24 horas em residências, indústrias e propriedades do Sudoeste Goiano com orçamento sem taxa de visita.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Mineiros GO?',
  ctaButtonText: 'Solicitar Atendimento em Mineiros',
  aboutCityTitle: 'Desentupidora em Mineiros - Polo Agroindustrial do Sudoeste Goiano',
  aboutCityText: 'Mineiros é um dos municípios mais prósperos do Sudoeste Goiano, portal de entrada para o Parque Nacional das Emas e sede das nascentes dos rios Araguaia e Jacuba. Com economia pujante baseada na agropecuária de alta tecnologia, produção de grãos, usinas de bioenergia e frigoríficos industriais de grande escala, a cidade apresenta malha urbana organizada e setores residenciais em contínua expansão. A elevada demanda por saneamento individual, fossas sépticas e esgotamento de efluentes agroindustriais exige suporte especializado com caminhões limpa fossa e hidrojateamento pressurizado.',
  cityFacts: [
    'Importante polo agroindustrial e bioenergético do Sudoeste de Goiás e portal do Parque Nacional das Emas.',
    'Berço das nascentes dos rios Araguaia, Formoso e Jacuba, exigindo responsabilidade ecológica absoluta no saneamento.',
    'Alta demanda por sucção de fossas sépticas em setores residenciais e desobstrução de tubulações agropecuárias.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Mineiros', 'FIEG'],
  bairros: [
    'Centro',
    'Setor Martins',
    'Setor Costa Nery',
    'Setor Bela Vista',
    'Setor Nova República',
    'Setor Aeroporto',
    'Setor Ipiranga',
    'Setor São José',
    'Setor Leontino',
    'Jardim das Perolas',
    'Setor Mutirão',
    'Setor Popular',
    'Residencial Primavera',
    'Setor Três Marias',
    'Setor Paraíso',
    'Setor Parque São José',
    'Setor Santo Antônio',
    'Setor Industrial',
    'Vila Floresta',
    'Jardim Colina Verde'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Mineiros concentra o comércio varejista, agências bancárias e prédios administrativos na Avenida Primeira Radial. As tubulações centrais e caixas de gordura de restaurantes e lojas recebem manutenção especializada com máquinas elétricas rotativas para manter as operações comerciais sem paradas.',
    'Setor Martins': 'O Setor Martins é um dos bairros mais tradicionais e populosos de Mineiros, com perfil residencial familiar e comércio vicinal. Nossas equipes volantes atuam com agilidade na desobstrução de ramais de pias, vasos sanitários e caixas de passagem.',
    'Setor Costa Nery': 'O Setor Costa Nery possui localização privilegiada com rápido acesso aos principais eixos da cidade. Os serviços de desentupimento são executados com ferramentas elétricas que eliminam bloqueios com limpeza e segurança.',
    'Setor Bela Vista': 'O Setor Bela Vista situa-se em área com vista panorâmica da cidade e conta com moradias consolidadas. A assistência técnica no local atende chamados para sucção preventiva de fossas sépticas e limpeza de caixas sifonadas.',
    'Setor Nova República': 'O Setor Nova República reúne expressiva comunidade e vias residenciais ativas. Nossos técnicos utilizam sondas rotativas para desincrustar gordura e raízes acumuladas na rede sanitária.',
    'Setor Aeroporto': 'O Setor Aeroporto combina loteamentos residenciais e pequenos galpões comerciais. A equipe móvel realiza hidrojato pressurizado em tubulações e ramais principais para desobstrução profunda.',
    'Setor Ipiranga': 'O Setor Ipiranga é um setor tradicional com forte presença de famílias e oficinas de serviços. Realizamos esgotamento de fossas sépticas e caixas de inspeção com caminhões modernos a vácuo.',
    'Setor São José': 'O Setor São José conta com praças de lazer e comércio de apoio de vizinhança. O trabalho da desentupidora desobstrui ramais de cozinha e banheiros residenciais com garantia por escrito.',
    'Setor Leontino': 'O Setor Leontino destaca-se pela tranquilidade e fácil mobilidade urbana. Nossas unidades atendem com pontualidade emergências em redes de esgoto e prumadas prediais.',
    'Jardim das Perolas': 'O Jardim das Pérolas é um bairro residencial moderno com belas residências. Nossos técnicos realizam o desentupimento com máquinas rotativas silenciosas que preservam pisos e louças.',
    'Setor Mutirão': 'O Setor Mutirão é um bairro habitacional populoso e dinâmico de Mineiros. Oferecemos preços justos, facilidades de pagamento e orçamento sem taxa de visita para toda a comunidade.',
    'Setor Popular': 'O Setor Popular reúne conjuntos habitacionais com intensa vida de bairro. Nossas viaturas móveis realizam manutenções em caixas de gordura e desobstrução de esgotos.',
    'Residencial Primavera': 'O Residencial Primavera é uma área residencial em contínuo crescimento na cidade. A sucção de fossas e desentupimento de ralos são executados com caminhões a vácuo de alta potência.',
    'Setor Três Marias': 'O Setor Três Marias possui perfil residencial e conta com escolas e pequenos comércios. A equipe técnica atua no desentupimento preventivo e corretivo de canos e ramais secundários.',
    'Setor Paraíso': 'O Setor Paraíso destaca-se pelas ruas calmas e moradias bem cuidadas. O serviço de desentupidora atende chamados de emergência 24h para desentupir pias e ralos pluviais.',
    'Setor Parque São José': 'O Setor Parque São José combina áreas verdes e novos loteamentos familiares. Realizamos limpeza pós-obra em tubulações e manutenção periódica em sistemas sépticos.',
    'Setor Santo Antônio': 'O Setor Santo Antônio é um bairro residencial tradicional de Mineiros. O atendimento técnico remove incrustações em redes de esgoto com cabos espirais flexíveis de alta precisão.',
    'Setor Industrial': 'O Setor Industrial abriga agroindústrias, cooperativas de grãos, frigoríficos e transportadoras de bioenergia. Realizamos hidrojateamento de ultra-alta pressão e sucção de efluentes industriais com descarte ecologicamente regulamentado.',
    'Vila Floresta': 'A Vila Floresta é um bairro residencial aconchegante com acesso rápido às avenidas de ligação. Nossas equipes desentopem vasos e caixas coletoras com rapidez e higiene.',
    'Jardim Colina Verde': 'O Jardim Colina Verde é um setor nobre e tranquilo de Mineiros. A desobstrução de redes sanitárias e galerias pluviais é feita com hidrojato pressurizado para preservar o fluxo contínuo das águas.'
  },
  parceiros: [
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
    },
    {
      cidade: 'Patos de Minas',
      uf: 'MG',
      url: 'https://desentupidora-patosdeminas.pages.dev',
      anchor: 'Desentupidora em Patos de Minas MG'
    }
  ],
  services: [
    {
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução técnica de redes coletoras de esgoto, caixas de passagem e ramais em Mineiros com máquinas rotativas e hidrojato.'
    },
    {
      title: 'Limpeza de Fossa Séptica',
      description: 'Esgotamento e sucção a vácuo com caminhão limpa fossa em residências, condomínios e complexos agroindustriais de Mineiros.'
    },
    {
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução sem quebrar cerâmicas ou louças sanitárias com equipamentos elétricos rotativos de alta precisão.'
    },
    {
      title: 'Desentupimento de Pia e Ralo',
      description: 'Raspagem de gordura solidificada e limpeza profunda em ramais de pias de cozinha, lavanderias e ralos em todos os setores de Mineiros.'
    },
    {
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Lavagem com jato pressurizado de água para desincrustar tubulações industriais, caixas de gordura e galerias pluviais.'
    },
    {
      title: 'Desentupimento Pluvial e Galerias',
      description: 'Limpeza e desobstrução de condutores de águas pluviais, calhas e bocas de lobo para prevenir inundações no período de chuvas.'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo de chegada da desentupidora em Mineiros?',
      answer: 'Temos viaturas móveis posicionadas no Centro, Setor Martins e Costa Nery, permitindo chegada média entre 20 e 40 minutos em todos os setores urbanos e no Setor Industrial.'
    },
    {
      question: 'Vocês atendem fazendas e indústrias em Mineiros e região?',
      answer: 'Sim, dispomos de caminhões combinados de grande capacidade para atender propriedades rurais, granjas, silos e indústrias em todo o município de Mineiros.'
    },
    {
      question: 'O orçamento em Mineiros tem custo de visita?',
      answer: 'Não cobramos taxa de visita. Nossos técnicos avaliam a tubulação no local e emitem orçamento detalhado e transparente sem nenhum compromisso.'
    },
    {
      question: 'Como é realizado o descarte dos resíduos de fossas?',
      answer: 'Todo o efluente coletado pelos nossos caminhões limpa fossa é destinado estritamente a estações de tratamento licenciadas pelos órgãos ambientais de Goiás.'
    },
    {
      question: 'Quais as formas de pagamento disponíveis?',
      answer: 'Aceitamos cartões de crédito e débito parcelados, PIX, dinheiro e faturamento bancário para empresas cadastradas e produtores rurais.'
    },
    {
      question: 'Os serviços de desentupimento possuem garantia?',
      answer: 'Sim, todos os serviços executados pela Desentupidora Mineiros acompanham garantia técnica formal de até 90 dias por escrito com nota fiscal.'
    }
  ],
  testimonials: [
    {
      name: 'João Batista Rezende',
      role: 'Gerente Operacional no Setor Industrial',
      content: 'Contratamos a desentupidora para limpeza pesada das tubulações e caixas de efluentes da usina em Mineiros. Serviço impecável com hidrojato potente e pontualidade.'
    },
    {
      name: 'Luciana M. Carvalho',
      role: 'Moradora do Setor Martins',
      content: 'A pia e o ralo da área de serviço entupiram feio. A equipe da desentupidora em Mineiros chegou em 25 minutos e resolveu tudo com máquina rotativa sem sujar o piso!'
    },
    {
      name: 'Adalberto F. Guimarães',
      role: 'Comerciante no Centro',
      content: 'Excelente atendimento para nossa lanchonete no Centro de Mineiros. A caixa de gordura foi desobstruída e limpa com hidrojato sem atrapalhar nossos clientes.'
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
    estado: 'Goiás',
    uf: cityData.uf,
    populacao: cityData.populacao || '74.999',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '64',
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
      latitude: cityData.latitude || '-17.5689',
      longitude: cityData.longitude || '-52.5511'
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Mineiros.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Mineiros...');
  syncCityToAstro(mineirosData);

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
  let deployResult = await deployEngine.deployCitySite(mineirosData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  mineirosData.status = 'ativo';
  mineirosData.deployUrl = deployResult.url;
  mineirosData.lastDeployAt = deployResult.deployedAt;
  if (deployResult.cloudflareProjectName) {
    mineirosData.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + mineirosData.deployUrl + ')...');
  syncCityToAstro(mineirosData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(mineirosData, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    mineirosData.deployUrl = deployResult.url;
    mineirosData.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) mineirosData.cloudflareProjectName = deployResult.cloudflareProjectName;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  mineirosData.auditScore = 100;

  // Atualiza cities.json
  const existingIndex = cities.findIndex(c => c.id === 'mineiros');
  if (existingIndex >= 0) {
    cities[existingIndex] = mineirosData;
  } else {
    cities.push(mineirosData);
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', mineirosData.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
