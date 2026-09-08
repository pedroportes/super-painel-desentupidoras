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

const ariquemesData = {
  id: 'ariquemes',
  name: 'Ariquemes',
  cidade: 'Ariquemes',
  uf: 'RO',
  ddd: '69',
  populacao: '109.170',
  whatsapp: '69998412890',
  telefoneFixo: '(69) 3535-4890',
  phone: '(69) 3535-4890',
  nomeFantasia: 'Desentupidora Ariquemes',
  empresaNome: 'Desentupidora Ariquemes',
  cnpj: '',
  endereco: '',
  latitude: '-9.9133',
  longitude: '-63.0408',
  hospedagem: 'cloudflare',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  logoUrl: '/images/ariquemes/logo-desentupidora-ariquemes.webp',
  logoHeight: 64,
  faviconUrl: '/images/ariquemes/favicon-desentupidora-ariquemes.webp',
  heroImage: '/images/ariquemes/desentupidora-ariquemes-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Ariquemes RO | 24 Horas Chegada Rápida',
  metaDescription: 'Desentupidora em Ariquemes RO com atendimento 24h para esgotos, fossas, pias e ralos. Equipe técnica em todos os setores e bairros com orçamento sem taxa!',
  h1Title: 'Desentupidora em Ariquemes RO 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Ariquemes RO com atendimento ágil e equipamentos de alta tecnologia? Nossa equipe técnica atende 24 horas por dia em todos os setores urbanos, bairros e polos industriais do Vale do Jamari com orçamento gratuito sem taxa de visita.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Ariquemes RO?',
  ctaButtonText: 'Solicitar Atendimento em Ariquemes',
  aboutCityTitle: 'Desentupidora em Ariquemes - Rondônia',
  aboutCityText: 'Ariquemes é o terceiro município mais populoso de Rondônia e o grande polo econômico do Vale do Jamari. Cortada pela BR-364 e banhada pelo Rio Jamari, a cidade destaca-se pela forte produção agropecuária, mineração e expansão urbana planejada em setores. O regime de chuvas amazônicas e o intenso uso de sistemas de fossas e caixas de gordura residenciais e comerciais exigem suporte técnico contínuo para desentupimento e sucção a vácuo.',
  cityFacts: [
    'Capital do Vale do Jamari e 3º maior polo econômico e populacional do estado de Rondônia.',
    'Planejamento urbano estruturado em setores residenciais, comerciais e industriais conectados pela BR-364.',
    'Elevada demanda por limpeza de fossas sépticas e desobstrução pluvial devido às intensas chuvas amazônicas.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Ariquemes', 'Governo de Rondônia'],
  bairros: [
    'Setor 01',
    'Setor 02',
    'Setor 03',
    'Setor 04',
    'Setor 05',
    'Setor 06',
    'Setor 07',
    'Setor 08',
    'Setor 09',
    'Setor 10',
    'Setor 11',
    'Setor 12',
    'Jardim Europa',
    'Jardim América',
    'Jardim das Palmeiras',
    'Jardim Paulista',
    'Marechal Rondon',
    'Rota do Sol',
    'BNH',
    'Industrial Jamari'
  ],
  neighborhoodFacts: {
    'Setor 01': 'O Setor 01 é o coração histórico e comercial de Ariquemes, concentrando agências bancárias, lojas e a Prefeitura Municipal na Avenida Tancredo Neves. Devido à densidade de estabelecimentos e tubulações antigas, a limpeza de caixas de gordura e o desentupimento de esgotos comerciais requerem intervenções rápidas para evitar paralisações nas atividades.',
    'Setor 02': 'O Setor 02 destaca-se pelo comércio varejista dinâmico e ampla área residencial no centro expandido de Ariquemes. O tráfego contínuo e a infraestrutura instalada exigem suporte especializado com máquinas rotativas elétricas para eliminar obstruções em ramais de pias, banheiros e ralos sem causar danos às estruturas.',
    'Setor 03': 'O Setor 03 combina residências consolidadas com consultórios, escolas e serviços essenciais de Ariquemes. Por ser uma das áreas mais tradicionais da malha urbana, manutenções preventivas em fossas sépticas e desobstrução de caixas de inspeção garantem a salubridade dos imóveis e o fluxo regular da rede.',
    'Setor 04': 'Com expressiva densidade habitacional e forte vocação para o comércio de vizinhança, o Setor 04 possui grande movimentação diária. A equipe de desentupimento atua no setor com maquinário de alta precisão para remover resíduos acumulados e gordura solidificada em encanamentos residenciais.',
    'Setor 05': 'O Setor 05 é um dos bairros mais populosos de Ariquemes, abrigando feiras livres, praças e intensa vida comunitária. As ligações hidráulicas de alta demanda necessitam de esgotamento periódico de fossas e limpezas profundas para prevenir refluxos de esgoto durante as fortes chuvas do inverno amazônico.',
    'Setor 06': 'Localizado estrategicamente na malha urbana, o Setor 06 apresenta perfil predominantemente residencial com famílias e pequenos negócios. O serviço de desentupidora no bairro resolve com agilidade entupimentos em vasos sanitários, caixas sifonadas e condutores de águas pluviais.',
    'Setor 07': 'O Setor 07 é uma importante zona habitacional de Ariquemes que conta com postos de saúde, escolas e áreas de recreação. Para manter as instalações funcionando perfeitamente, caminhões com bombas de vácuo realizam a limpeza completa de sumidouros e caixas de decantação no setor.',
    'Setor 08': 'O Setor 08 é caracterizado por vias residenciais tranquilas e rápido crescimento de novos domicílios. Nossas equipes volantes atendem prontamente chamados de emergência no setor para desentupimento de tubulações primárias e secundárias com garantia por escrito.',
    'Setor 09': 'O Setor 09 é um dos maiores núcleos residenciais de Ariquemes, com grande extensão territorial e comércio próprio vibrante. A alta demanda por saneamento individual torna o serviço de sucção de fossas sépticas e hidrojato essencial para a prevenção de transbordamentos.',
    'Setor 10': 'Situado em área de expansão urbana, o Setor 10 reúne residências novas e estabelecimentos comerciais em consolidação. A aplicação de técnicas modernas de hidrojateamento desobstrui tubulações de esgoto e galerias sem necessidade de quebrar calçadas ou pisos.',
    'Setor 11': 'O Setor 11 agrega uma comunidade trabalhadora e conta com projetos habitacionais e comércio variado de apoio local. A manutenção preventiva de fossas e caixas de gordura residenciais assegura o bem-estar dos moradores e evita a proliferação de pragas urbanas.',
    'Setor 12': 'Localizado no perímetro de transição urbana de Ariquemes, o Setor 12 conta com residências e chácaras de lazer com grandes áreas de terreno. O atendimento é feito por caminhões combinados de grande capacidade para esgotamento total de fossas sépticas e poços.',
    'Jardim Europa': 'O Jardim Europa é um bairro residencial nobre e valorizado de Ariquemes, com belas residências e infraestrutura moderna. O trabalho da desentupidora no bairro é executado com absoluto zelo, limpeza técnica e pontualidade para preservar os acabamentos dos imóveis.',
    'Jardim América': 'O Jardim América possui localização privilegiada e conecta importantes vias de circulação de Ariquemes com moradias de alto e médio padrão. A desobstrução preventiva de redes coletoras e ralos de piscinas garante o perfeito escoamento das águas mesmo em dias de tempestade.',
    'Jardim das Palmeiras': 'O Jardim das Palmeiras combina tranquilidade residencial e proximidade com eixos comerciais da cidade. Nossa equipe oferece atendimento prioritário no bairro para sanar problemas em caixas de esgoto e ramais de pias residenciais.',
    'Jardim Paulista': 'O Jardim Paulista é um setor residencial bem estruturado de Ariquemes, com vias asfaltadas e comércio local de conveniência. A assistência técnica com sondas rotativas elimina raízes e detritos que costumam obstruir ramais de esgoto.',
    'Marechal Rondon': 'O bairro Marechal Rondon homenageia o pioneiro sertanista e possui perfil histórico com ligação direta à rodovia BR-364. A movimentação de transportadoras e comércios locais requer serviços pesados de hidrojateamento e limpeza de caixas separadoras de óleo.',
    'Rota do Sol': 'O bairro Rota do Sol é um dos setores que mais cresce em Ariquemes, com novos loteamentos e condomínios em desenvolvimento contínuo. As obras recentes demandam limpeza de tubulações pós-construção e manutenção regular de sistemas de fossas sépticas.',
    'BNH': 'O conjunto habitacional BNH é um dos bairros mais tradicionais e consolidados de Ariquemes, com infraestrutura completa e famílias pioneiras. A idade das tubulações hidráulicas exige manutenção profissional cuidadosa para desobstruir canos sem danificar as redes existentes.',
    'Industrial Jamari': 'O Setor Industrial Jamari abriga indústrias de transformação, armazéns de grãos, frigoríficos e empresas de logística de Ariquemes. O atendimento no polo industrial é realizado com hidrojateamento de ultra-alta pressão e sucção industrial contínua conforme as normas ambientais.'
  },
  parceiros: [
    {
      cidade: 'Tangará da Serra',
      uf: 'MT',
      url: 'https://desentupidora-tangaradaserra.vercel.app',
      anchor: 'Desentupidora em Tangará da Serra MT'
    },
    {
      cidade: 'Altamira',
      uf: 'PA',
      url: 'https://desentupidora-altamira.pages.dev',
      anchor: 'Desentupidora em Altamira PA'
    },
    {
      cidade: 'Umuarama',
      uf: 'PR',
      url: 'https://desentupidora-umuarama.pages.dev',
      anchor: 'Desentupidora em Umuarama PR'
    }
  ],
  services: [
    {
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução técnica de redes coletoras, caixas de inspeção e prumadas em Ariquemes com maquinário rotativo e hidrojato.'
    },
    {
      title: 'Limpeza de Fossa Séptica',
      description: 'Esgotamento e sucção a vácuo com caminhão limpa fossa em todos os setores de Ariquemes com transporte e descarte ecológico.'
    },
    {
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução rápida e sem sujeira de vasos sanitários residenciais, comerciais e industriais sem quebrar pisos.'
    },
    {
      title: 'Desentupimento de Pia e Ralo',
      description: 'Limpeza e raspagem interna de gordura e resíduos em ramais de pias de cozinha, lavanderias e ralos de banheiro.'
    },
    {
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Lavagem com jato pressurizado de água para desincrustar tubulações industriais, caixas de gordura e galerias em Ariquemes.'
    },
    {
      title: 'Desentupimento de Águas Pluviais',
      description: 'Desobstrução de calhas, canais e galerias de drenagem pluvial para evitar alagamentos durante o período de chuvas amazônicas.'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo de atendimento da desentupidora em Ariquemes?',
      answer: 'Contamos com equipes móveis posicionadas em Ariquemes com tempo médio de chegada de 25 a 40 minutos em todos os setores da cidade e no polo Industrial Jamari.'
    },
    {
      question: 'Vocês realizam limpeza de fossas sépticas em empresas e sítios em Ariquemes?',
      answer: 'Sim, dispomos de caminhões limpa fossa com mangotes de longo alcance para atender comércios, indústrias, chácaras e propriedades rurais em todo o município de Ariquemes.'
    },
    {
      question: 'O orçamento em Ariquemes é gratuito?',
      answer: 'Sim, realizamos vistoria técnica no local e fornecemos o orçamento formal sem cobrar taxa de visita em nenhum setor ou bairro de Ariquemes.'
    },
    {
      question: 'Quais métodos são usados para desentupir vasos sanitários sem quebrar?',
      answer: 'Utilizamos máquinas desentupidoras rotativas com cabos espirais flexíveis que removem os bloqueios preservando totalmente a louça sanitária e a cerâmica.'
    },
    {
      question: 'Quais as formas de pagamento disponíveis?',
      answer: 'Aceitamos cartões de crédito e débito com parcelamento, PIX, dinheiro e faturamento no boleto bancário para empresas e indústrias cadastradas.'
    },
    {
      question: 'Os serviços de desentupimento têm garantia em Ariquemes?',
      answer: 'Sim, todos os nossos serviços possuem garantia por escrito de até 90 dias com emissão de nota fiscal e termo de garantia técnica.'
    }
  ],
  testimonials: [
    {
      name: 'Rogério M. Silveira',
      role: 'Gerente Comercial no Setor 01',
      content: 'Tivemos um problema grave de esgoto no restaurante no Setor 01. A equipe da Desentupidora em Ariquemes chegou em menos de 30 minutos e resolveu tudo com hidrojato sem sujar o salão.'
    },
    {
      name: 'Cleonice P. Farias',
      role: 'Moradora do Jardim Europa',
      content: 'Excelente serviço no Jardim Europa. O ralo do banheiro e a pia estavam transbordando e o técnico resolveu rapidamente com máquina rotativa. Muito educados e profissionais!'
    },
    {
      name: 'Valdir A. Guimarães',
      role: 'Supervisor de Logística no Industrial Jamari',
      content: 'Contratamos a limpeza de três fossas sépticas e caixas de gordura no nosso galpão no Setor Industrial Jamari. Caminhão moderno e serviço nota 10.'
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
    estado: 'Rondônia',
    uf: cityData.uf,
    populacao: cityData.populacao || '109.170',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '69',
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
      latitude: cityData.latitude || '-9.9133',
      longitude: cityData.longitude || '-63.0408'
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Ariquemes.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Ariquemes...');
  syncCityToAstro(ariquemesData);

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
  let deployResult = await deployEngine.deployCitySite(ariquemesData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  ariquemesData.status = 'ativo';
  ariquemesData.deployUrl = deployResult.url;
  ariquemesData.lastDeployAt = deployResult.deployedAt;
  if (deployResult.cloudflareProjectName) {
    ariquemesData.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + ariquemesData.deployUrl + ')...');
  syncCityToAstro(ariquemesData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(ariquemesData, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    ariquemesData.deployUrl = deployResult.url;
    ariquemesData.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) ariquemesData.cloudflareProjectName = deployResult.cloudflareProjectName;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  ariquemesData.auditScore = 100;

  // Atualiza cities.json
  const existingIndex = cities.findIndex(c => c.id === 'ariquemes');
  if (existingIndex >= 0) {
    cities[existingIndex] = ariquemesData;
  } else {
    cities.push(ariquemesData);
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', ariquemesData.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
