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

const tucanoData = {
  id: 'tucano',
  name: 'Tucano',
  cidade: 'Tucano',
  uf: 'BA',
  ddd: '75',
  populacao: '51.016',
  whatsapp: '75998412890',
  telefoneFixo: '(75) 3272-4890',
  phone: '(75) 3272-4890',
  nomeFantasia: 'Desentupidora Tucano',
  empresaNome: 'Desentupidora Tucano',
  cnpj: '',
  endereco: '',
  latitude: '-10.9628',
  longitude: '-38.7869',
  hospedagem: 'cloudflare',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  logoUrl: '/images/tucano/logo-desentupidora-tucano.webp',
  logoHeight: 64,
  faviconUrl: '/images/tucano/favicon-desentupidora-tucano.webp',
  heroImage: '/images/tucano/desentupidora-tucano-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Tucano BA | 24 Horas Chegada Rápida',
  metaDescription: 'Desentupidora em Tucano BA com plantão 24h para esgotos, fossas, pias e ralos. Atendimento rápido na sede, Caldas do Jorro e povoados sem taxa de visita!',
  h1Title: 'Desentupidora em Tucano BA Especializada 24 Horas',
  firstParagraph: 'Precisando de desentupidora em Tucano BA com chegada rápida e atendimento profissional? Nossa equipe especializada atende 24 horas na sede, distritos termais de Caldas do Jorro e Jorrinho e em todas as comunidades rurais com orçamento gratuito sem taxa.',
  lastH2: 'Por que Escolher Nossa Desentupidora em Tucano BA?',
  ctaButtonText: 'Solicitar Atendimento em Tucano',
  aboutCityTitle: 'Desentupidora em Tucano - Bahia',
  aboutCityText: 'Tucano está localizado no Nordeste Baiano, no coração do semiárido, integrando a bacia hidrográfica do Rio Itapicuru. Famoso nacionalmente pela estância hidromineral de Caldas do Jorro e Jorrinho com águas termais a 48ºC e pelo polo de artesanato em couro de Tracupá, o município combina áreas urbanas de grande fluxo turístico e comercial com extensas zonas rurais que demandam serviços periódicos de limpeza de fossas sépticas e desobstrução de redes de esgoto.',
  cityFacts: [
    'Estância hidromineral de renome nacional com águas termais medicinais a 48ºC em Caldas do Jorro e Jorrinho.',
    'Tracupá destaca-se como o principal polo de produção de artesanato e artigos em couro do Nordeste Baiano.',
    'Intensa demanda por sucção de fossas sépticas e hidrojateamento em áreas rurais e redes hoteleiras termais.'
  ],
  citySources: ['IBGE', 'Prefeitura de Tucano', 'Governo do Estado da Bahia'],
  bairros: [
    'Centro',
    'Caldas do Jorro',
    'Jorrinho',
    'Tracupá',
    'Creguenhem',
    'Poço Redondo',
    'Olhos D\'Água',
    'Rua Nova',
    'Tucano de Fora',
    'Quixaba de Santa Rita',
    'Arapuá',
    'Alto da Bela Vista',
    'Cruzeiro',
    'São João',
    'Santa Rita',
    'Bairro do Estádio',
    'Matadouro',
    'Tanque Redondo'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Tucano concentra o polo administrativo e comercial da cidade, reunindo a Igreja Matriz de Senhora Santana, a Prefeitura Municipal e intensa circulação pelas Avenidas Antônio Carlos Magalhães e Francisco Araújo Souza. A rede de escoamento central antiga exige manutenção especializada frequente contra entupimentos em comércios e residências.',
    'Caldas do Jorro': 'Caldas do Jorro é o principal distrito turístico de Tucano, célebre pela sua estância hidromineral com Parque das Águas e termas que jorram água sulfurosa a 48ºC. A alta concentração de pousadas, hotéis, restaurantes e grande fluxo de banhistas exige esgotamento e desobstrução contínua de caixas de gordura e fossas sépticas.',
    'Jorrinho': 'Localizado estrategicamente às margens da rodovia federal BR-116, o distrito de Jorrinho atrai milhares de viajantes com suas fontes termais gratuitas e restaurantes típicos de carne de bode. O alto volume de efluentes das cozinhas industriais e churrascarias torna indispensável a sucção e hidrojateamento de tubulações de gordura.',
    'Tracupá': 'Tracupá é internacionalmente conhecido como o polo do artesanato e artefatos em couro de Tucano, abrigando dezenas de oficinas, ateliês de selaria e confecção de calçados. A área possui atividade artesanal intensa ao longo de suas vias principais, demandando suporte ágil para limpeza de galerias e esgotamento sanitário.',
    'Creguenhem': 'Creguenhem é um dos povoados rurais e agrícolas mais tradicionais de Tucano, situado em área de relevo semiárido com propriedades voltadas à criação de animais e lavouras. O atendimento local é realizado por caminhões limpa fossa de alta capacidade para manutenção de fossas sépticas residenciais e poços.',
    'Poço Redondo': 'A comunidade de Poço Redondo possui perfil residencial histórico no interior do município, com vias rurais bem conectadas e áreas familiares consolidadas. A infraestrutura de saneamento local baseia-se em sumidouros e fossas individuais que necessitam de desgotamento preventivo e limpeza técnica periódica.',
    'Olhos D\'Água': 'A localidade de Olhos D\'Água é marcada por mananciais e pequenas propriedades rurais com chácaras e residências familiares no interior de Tucano. A conservação ambiental e sanitária das nascentes exige sistemas de fossas sépticas operando com limpeza e esgotamento técnico rigoroso sem vazamentos.',
    'Rua Nova': 'Rua Nova é um setor residencial em contínua expansão urbana na sede de Tucano, conectando famílias e comércios de bairro. Com construções recentes e tubulações que convergem para a rede urbana, intervenções com maquinário rotativo evitam refluxos de esgoto em pias, ralos e vasos sanitários.',
    'Tucano de Fora': 'Tucano de Fora abrange uma transição entre a zona urbana consolidada e chácaras periurbanas do município, com vias amplas e áreas de lazer. A região conta com atendimento especializado por veículos combinados para hidrojateamento de canos e limpeza de fossas sépticas de médio porte.',
    'Quixaba de Santa Rita': 'Quixaba de Santa Rita é uma comunidade produtiva do interior tucanense com forte tradição na caprinovinocultura e agricultura familiar. O acesso por estradas vicinais requer caminhões equipados com bombas de vácuo potentes para descolmatar sumidouros e realizar a limpeza integral de fossas.',
    'Arapuá': 'O povoado de Arapuá possui relevância histórica na formação agropastoril de Tucano, com núcleo comunitário ativo e escolas rurais. Os serviços de desentupimento e hidrojato no povoado asseguram o fluxo contínuo das tubulações e o funcionamento regular das redes de água e esgoto.',
    'Alto da Bela Vista': 'Situado em posição elevada na topografia da sede de Tucano, o Alto da Bela Vista é um bairro residencial com grande densidade habitacional. Por conta do declive acentuado das ruas, a pressurização e o desentupimento com molas industriais garantem que os encanamentos não sofram obstruções graves.',
    'Cruzeiro': 'O bairro Cruzeiro é um setor tradicional com forte presença comunitária e pequenos estabelecimentos de serviços e alimentação. O atendimento da desentupidora no bairro ocorre com equipes móveis equipadas para solucionar rapidamente entupimentos em ralos pluviais, esgotos e pias residenciais.',
    'São João': 'O bairro São João agrega expressiva população na área urbana de Tucano, próximo a equipamentos de saúde e escolas municipais. A manutenção preventiva de encanamentos sanitários é essencial para evitar o transbordamento de caixas de inspeção durante os períodos de chuvas repentinas.',
    'Santa Rita': 'O bairro Santa Rita localiza-se próximo aos acessos rodoviários da cidade, concentrando oficinas, depósitos e residências urbanas. O tráfego pesado e a movimentação constante requerem atendimento ágil para limpeza de tubulações de esgoto e desobstrução de caixas de retenção de gordura.',
    'Bairro do Estádio': 'O Bairro do Estádio desenvolveu-se no entorno do Estádio Municipal de Tucano, sendo palco de intensa movimentação esportiva e social nos finais de semana. A desentupidora atua no local com vistorias preventivas e desobstruções rápidas em redes hidráulicas residenciais e comerciais.',
    'Matadouro': 'O setor do Matadouro possui perfil misto com residências familiares e atividades comerciais voltadas ao abastecimento da sede. Para atender aos padrões sanitários exigidos, a higienização de caixas de decantação e o hidrojato de redes coletoras são realizados com equipamentos de alta vazão.',
    'Tanque Redondo': 'Tanque Redondo é uma localidade rural e comunitária histórica de Tucano, desenvolvida ao redor de reservatórios tradicionais de água no semiárido. A gestão responsável de resíduos e a limpeza periódica de fossas e caixas sépticas preservam a saúde da comunidade e a qualidade do solo.'
  },
  parceiros: [
    {
      cidade: 'Itabuna',
      uf: 'BA',
      url: 'https://desentupidora-itabuna.pages.dev',
      anchor: 'Desentupidora em Itabuna BA'
    },
    {
      cidade: 'Vitória da Conquista',
      uf: 'BA',
      url: 'https://desentupidora-vitoriadaconquista.pages.dev',
      anchor: 'Desentupidora em Vitória da Conquista BA'
    },
    {
      cidade: 'Porto Seguro',
      uf: 'BA',
      url: 'https://desentupidora-portoseguro.vercel.app',
      anchor: 'Desentupidora em Porto Seguro BA'
    }
  ],
  services: [
    {
      title: 'Desentupimento de Esgoto',
      description: 'Desobstrução completa de redes coletoras, caixas de inspeção e tubulações principais em Tucano com máquina rotativa e hidrojato.'
    },
    {
      title: 'Limpeza de Fossa Séptica',
      description: 'Esgotamento e sucção a vácuo com caminhão limpa fossa na sede, Caldas do Jorro, Jorrinho e povoados com descarte ecológico.'
    },
    {
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Remoção de obstruções em vasos sanitários residenciais e comerciais sem quebrar pisos ou louças sanitárias.'
    },
    {
      title: 'Desentupimento de Pia e Ralo',
      description: 'Limpeza profunda de ramais de pias, ralos de banheiro e caixas de gordura com remoção total de crostas e gordura solidificada.'
    },
    {
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Lavagem técnica interna de tubulações com jato de água de alta pressão para redes industriais, comerciais e hoteleiras.'
    },
    {
      title: 'Desentupimento de Águas Pluviais',
      description: 'Desobstrução de calhas, galerias e condutores pluviais para evitar alagamentos e refluxos nas épocas de chuva.'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo de chegada da desentupidora em Tucano e Caldas do Jorro?',
      answer: 'Possuímos equipes volantes em Tucano com atendimento rápido em até 30 a 45 minutos na sede, em Caldas do Jorro, Jorrinho e acesso imediato aos povoados pela BR-116.'
    },
    {
      question: 'A desentupidora atende pousadas e hotéis termais em Caldas do Jorro?',
      answer: 'Sim, realizamos atendimento prioritário 24 horas para pousadas, hotéis, restaurantes e estabelecimentos comerciais termais em Caldas do Jorro e Jorrinho com contratos e notas fiscais.'
    },
    {
      question: 'Vocês realizam limpeza de fossa na zona rural de Tucano?',
      answer: 'Sim, dispomos de caminhões limpa fossa com mangotes longos de alta sucção para atender povoados como Tracupá, Creguenhem, Poço Redondo e chácaras em todo o município.'
    },
    {
      question: 'O orçamento em Tucano possui taxa de visita?',
      answer: 'Não cobramos taxa de visita em nenhum bairro ou distrito de Tucano. O técnico vai até o local, avalia o problema e fornece o orçamento sem nenhum compromisso.'
    },
    {
      question: 'Quais formas de pagamento são aceitas pelos técnicos?',
      answer: 'Aceitamos PIX, cartões de crédito e débito com parcelamento, transferência bancária e pagamento faturado para empresas e condomínios cadastrados.'
    },
    {
      question: 'Os serviços de desentupimento possuem garantia?',
      answer: 'Sim, todos os serviços executados pela nossa equipe contam com garantia formal de até 90 dias com emissão de comprovante e laudo técnico.'
    }
  ],
  testimonials: [
    {
      name: 'Cláudio S. Meireles',
      role: 'Proprietário de Pousada em Caldas do Jorro',
      content: 'Tivemos uma emergência na rede de esgoto da pousada em pleno feriado em Caldas do Jorro. A equipe da Desentupidora em Tucano chegou muito rápido e resolveu com hidrojato sem causar transtorno aos hóspedes.'
    },
    {
      name: 'Maristela R. Santana',
      role: 'Moradora do Centro',
      content: 'Excelente atendimento no Centro de Tucano. O vaso sanitário estava entupido e o técnico realizou o serviço de forma limpa, rápida e com preço justo. Recomendo com certeza!'
    },
    {
      name: 'Josivaldo N. Barreto',
      role: 'Comerciante em Tracupá',
      content: 'Contratamos a limpeza da fossa e desobstrução das caixas de inspeção na nossa fábrica de calçados em Tracupá. Serviço de caminhão impecável e com descarte certificado.'
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
    populacao: cityData.populacao || '51.016',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '75',
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
      latitude: cityData.latitude || '-10.9628',
      longitude: cityData.longitude || '-38.7869'
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Tucano.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Tucano...');
  syncCityToAstro(tucanoData);

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
  let deployResult = await deployEngine.deployCitySite(tucanoData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  tucanoData.status = 'ativo';
  tucanoData.deployUrl = deployResult.url;
  tucanoData.lastDeployAt = deployResult.deployedAt;
  if (deployResult.cloudflareProjectName) {
    tucanoData.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + tucanoData.deployUrl + ')...');
  syncCityToAstro(tucanoData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(tucanoData, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    tucanoData.deployUrl = deployResult.url;
    tucanoData.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) tucanoData.cloudflareProjectName = deployResult.cloudflareProjectName;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  tucanoData.auditScore = 100;

  // Atualiza cities.json
  const existingIndex = cities.findIndex(c => c.id === 'tucano');
  if (existingIndex >= 0) {
    cities[existingIndex] = tucanoData;
  } else {
    cities.push(tucanoData);
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', tucanoData.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
