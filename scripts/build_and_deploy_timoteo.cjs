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

const timoteoData = {
  id: 'timoteo',
  name: 'Timóteo',
  cidade: 'Timóteo',
  uf: 'MG',
  ddd: '31',
  populacao: '84.172',
  whatsapp: '31998412895',
  telefoneFixo: '(31) 3848-4890',
  phone: '(31) 3848-4890',
  nomeFantasia: 'Desentupidora Timóteo',
  empresaNome: 'Desentupidora Timóteo',
  cnpj: '',
  endereco: '',
  latitude: '-19.5828',
  longitude: '-42.6442',
  hospedagem: 'cloudflare',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  logoUrl: '/images/timoteo/logo-desentupidora-timoteo.webp',
  logoHeight: 64,
  faviconUrl: '/images/timoteo/favicon-desentupidora-timoteo.webp',
  heroImage: '/images/timoteo/desentupidora-timoteo-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Timóteo MG | 24 Horas Chegada Rápida',
  metaDescription: 'Desentupidora em Timóteo MG com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros do Vale do Aço com orçamento sem taxa de visita!',
  h1Title: 'Desentupidora em Timóteo MG 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Timóteo MG com pronto atendimento e hidrojato de alta precisão? Nossa equipe técnica atende 24 horas em residências, indústrias e comércios do Vale do Aço com orçamento sem taxa de visita.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Timóteo MG?',
  ctaButtonText: 'Solicitar Atendimento em Timóteo',
  aboutCityTitle: 'Desentupidora em Timóteo - Capital do Inox no Vale do Aço',
  aboutCityText: 'Timóteo é mundialmente reconhecida como a Capital do Inox, sediando a usina da Aperam South America e compondo o núcleo metropolitano do Vale do Aço mineiro ao lado de Ipatinga e Coronel Fabriciano. Banhada pelo Rio Piracicaba e ladeada pelo Parque Estadual do Rio Doce, a cidade combina complexos metalúrgicos de grande porte com bairros históricos e residenciais em encostas acidentadas. As operações industriais contínuas e o relevo montanhoso exigem serviços qualificados de desentupimento com hidrojato pressurizado e sucção de efluentes em conformidade com as normas ambientais.',
  cityFacts: [
    'Capital Brasileira do Aço Inox e polo siderúrgico estratégico da Região Metropolitana do Vale do Aço.',
    'Topografia montanhosa e proximidade com o Rio Piracicaba que demandam redes de drenagem desobstruídas e manutenção contínua.',
    'Elevada demanda por hidrojateamento industrial de alta pressão e esgotamento técnico de fossas sépticas.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Timóteo', 'Aperam South America'],
  bairros: [
    'Centro',
    'Timirim',
    'Primavera',
    'Alvorada',
    'Cruzeirinho',
    'John Kennedy',
    'Quitandinha',
    'Funcionários',
    'Olaria',
    'Serenata',
    'Bromélias',
    'Ana Moura',
    'Alegre',
    'Recanto Verde',
    'Santa Cecília',
    'Garapa',
    'Limoeiro',
    'Macuco',
    'Bela Vista',
    'Novo Tempo'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Timóteo (Acesita/Centro Sul) concentra o comércio tradicional, instituições financeiras e órgãos públicos. As redes prediais com alta circulação necessitam de manutenção preventiva com maquinário rotativo para garantir o perfeito fluxo de esgotos sem interrupções operacionais.',
    'Timirim': 'O bairro Timirim é um dos setores residenciais e comerciais mais nobres de Timóteo, abrigando o Centro de Saúde e importantes colégios. A equipe técnica realiza desentupimento limpo e ágil em condomínios e residências térreas.',
    'Primavera': 'O Primavera destaca-se como polo gastronômico e comercial dinâmico na Alameda 31 de Outubro. O acúmulo de gordura em caixas de inspeção e pias de restaurantes recebe atendimento imediato com hidrojateamento de alta pressão.',
    'Alvorada': 'O bairro Alvorada reúne grande densidade populacional e comércio variado. Nossas viaturas móveis atendem com rapidez chamados de desobstrução em ramais sanitários, ralos de quintais e caixas de passagem.',
    'Cruzeirinho': 'O Cruzeirinho é um bairro residencial tradicional com ruas arborizadas e fácil acesso ao centro. A assistência técnica com sondas elétricas rotativas remove bloqueios de esgoto com total segurança para as tubulações.',
    'John Kennedy': 'O bairro John Kennedy conta com famílias pioneiras e intensa vida de vizinhança. Nossos técnicos realizam esgotamento de fossas sépticas e sucção de caixas de inspeção com caminhões modernos a vácuo.',
    'Quitandinha': 'O Quitandinha é uma charmosa área residencial com praças e comércio de apoio. O trabalho da desentupidora desobstrui ramais de pias de cozinha e banheiros residenciais com garantia e laudo técnico.',
    'Funcionários': 'O bairro Funcionários possui raízes históricas ligadas à fundação industrial da cidade. As tubulações clássicas recebem desentupimento criterioso para preservar as redes hidráulicas sem reformas pesadas.',
    'Olaria': 'O Olaria é um bairro comercial e residencial ativo de Timóteo. A equipe móvel soluciona rapidamente entupimentos em vasos sanitários, caixas sifonadas e condutores pluviais.',
    'Serenata': 'A Serenata é uma área residencial valorizada e tranquila de Timóteo. Nossos técnicos executam hidrojato preventivo em galerias prediais e ramais primários com pontualidade e limpeza absoluta.',
    'Bromélias': 'O bairro Bromélias destaca-se pelo rápido crescimento habitacional e novos empreendimentos imobiliários. O serviço de desentupidora atende condomínios com maquinário elétrico de alta rotação.',
    'Ana Moura': 'O bairro Ana Moura situa-se em relevo mais elevado e possui expressiva comunidade. Fornecemos caminhões combinados para limpeza profunda de fossas sépticas, sumidouros e redes pluviais em encostas.',
    'Alegre': 'O Alegre é uma das maiores regiões de Timóteo, conectando importantes eixos viários do município. Atendemos chamados de emergência 24h para esgotamento sanitário e desentupimento de esgotos.',
    'Recanto Verde': 'O Recanto Verde é caracterizado por moradias tranquilas próximas a áreas verdes preservadas. A manutenção com sondas flexíveis elimina raízes e detritos que possam obstruir a rede sanitária.',
    'Santa Cecília': 'O bairro Santa Cecília reúne residências familiares e pequenos negócios de bairro. O atendimento técnico desobstrui pias, ralos e caixas de gordura com preços justos e sem taxa de visita.',
    'Garapa': 'A Garapa é um setor tradicional com acesso rápido às avenidas industriais. Os serviços de hidrojateamento pressurizado garantem a desincrustação completa de gordura e resíduos pesados.',
    'Limoeiro': 'O Limoeiro é um bairro em expansão urbana e residencial em Timóteo. Nossas equipes realizam limpezas completas de sistemas sépticos e desobstruções pluviais com equipamentos de última geração.',
    'Macuco': 'O Macuco abrange áreas residenciais e chácaras com grande extensão territorial. Realizamos a sucção a vácuo de poços e fossas de grande capacidade com mangotes de longo alcance.',
    'Bela Vista': 'O bairro Bela Vista possui topografia elevada e vista panorâmica da cidade. O suporte técnico de desentupimento garante o escoamento contínuo das águas servidas mesmo em terrenos inclinados.',
    'Novo Tempo': 'O Novo Tempo é uma importante comunidade residencial de Timóteo com forte vida associativa. Oferecemos plantão permanente 24 horas para sanar entupimentos em vasos sanitários e redes de esgoto.'
  },
  parceiros: [
    {
      cidade: 'Itabira',
      uf: 'MG',
      url: 'https://desentupidora-itabira.pages.dev',
      anchor: 'Desentupidora em Itabira MG'
    },
    {
      cidade: 'Teófilo Otoni',
      uf: 'MG',
      url: 'https://desentupidora-teofilootoni.pages.dev',
      anchor: 'Desentupidora em Teófilo Otoni MG'
    },
    {
      cidade: 'Ubá',
      uf: 'MG',
      url: 'https://desentupidora-uba.pages.dev',
      anchor: 'Desentupidora em Ubá MG'
    }
  ],
  services: [
    {
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução rápida de redes coletoras de esgoto, caixas de passagem e ramais em Timóteo com máquinas rotativas e hidrojato.'
    },
    {
      title: 'Limpeza de Fossa Séptica',
      description: 'Esgotamento e sucção a vácuo com caminhão limpa fossa em residências, condomínios e indústrias de Timóteo e Vale do Aço.'
    },
    {
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução técnica sem quebrar louças ou pisos com maquinário elétrico flexível de alta precisão.'
    },
    {
      title: 'Desentupimento de Pia e Ralo',
      description: 'Raspagem interna e remoção de gordura em ramais de pias de cozinha, lavanderias e ralos de banheiro em Timóteo.'
    },
    {
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Lavagem técnica pressurizada para galerias, tubulações industriais da Aperam e caixas separadoras de óleo.'
    },
    {
      title: 'Desentupimento Pluvial e Calhas',
      description: 'Limpeza de calhas, canais e galerias de águas pluviais para prevenir inundações e refluxos em períodos chuvosos.'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo de chegada da desentupidora em Timóteo?',
      answer: 'Nossas viaturas móveis atendem em média de 20 a 40 minutos em todos os bairros de Timóteo, Coronel Fabriciano e polo industrial do Vale do Aço.'
    },
    {
      question: 'Vocês atendem empresas e indústrias no Vale do Aço?',
      answer: 'Sim, realizamos contratos corporativos e atendimentos emergenciais de hidrojateamento de ultra-alta pressão e sucção de efluentes industriais.'
    },
    {
      question: 'A desentupidora cobra taxa de visita em Timóteo?',
      answer: 'Não, nossa visita técnica e orçamento no local são 100% gratuitos e sem qualquer compromisso para o cliente.'
    },
    {
      question: 'Qual a garantia oferecida para os serviços?',
      answer: 'Todos os serviços de desentupimento e hidrojateamento contam com garantia formal de até 90 dias por escrito com nota fiscal.'
    },
    {
      question: 'Quais as formas de pagamento disponíveis?',
      answer: 'Aceitamos cartões de crédito e débito parcelados, PIX, dinheiro e faturamento bancário para empresas cadastradas.'
    },
    {
      question: 'Como é feito o descarte dos efluentes de fossas?',
      answer: 'O material coletado é encaminhado exclusivamente para estações de tratamento de esgoto credenciadas pelos órgãos ambientais de Minas Gerais.'
    }
  ],
  testimonials: [
    {
      name: 'Bernardo Guimarães Silveira',
      role: 'Engenheiro de Manutenção no Polo Industrial',
      content: 'Contratamos a desentupidora para limpeza pesada das tubulações e caixas de decantação em Timóteo. Serviço com maquinário de ponta e equipe capacitada.'
    },
    {
      name: 'Rosane L. Fernandes',
      role: 'Moradora do Bairro Timirim',
      content: 'Chamei a desentupidora em Timóteo para resolver um entupimento no vaso do banheiro. Chegaram super rápido e resolveram com máquina rotativa sem sujar nada.'
    },
    {
      name: 'Flávio M. Drumond',
      role: 'Proprietário de Restaurante no Primavera',
      content: 'A caixa de gordura do restaurante no Primavera transbordou no sábado. O hidrojato da desentupidora resolveu em meia hora com muita eficiência.'
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
    populacao: cityData.populacao || '84.172',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '31',
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
      latitude: cityData.latitude || '-19.5828',
      longitude: cityData.longitude || '-42.6442'
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Timóteo.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Timóteo...');
  syncCityToAstro(timoteoData);

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
  let deployResult = await deployEngine.deployCitySite(timoteoData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  timoteoData.status = 'ativo';
  timoteoData.deployUrl = deployResult.url;
  timoteoData.lastDeployAt = deployResult.deployedAt;
  if (deployResult.cloudflareProjectName) {
    timoteoData.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + timoteoData.deployUrl + ')...');
  syncCityToAstro(timoteoData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(timoteoData, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    timoteoData.deployUrl = deployResult.url;
    timoteoData.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) timoteoData.cloudflareProjectName = deployResult.cloudflareProjectName;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  timoteoData.auditScore = 100;

  // Atualiza cities.json
  const existingIndex = cities.findIndex(c => c.id === 'timoteo');
  if (existingIndex >= 0) {
    cities[existingIndex] = timoteoData;
  } else {
    cities.push(timoteoData);
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', timoteoData.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
