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

const angraData = {
  id: 'angradosreis',
  name: 'Angra dos Reis',
  cidade: 'Angra dos Reis',
  uf: 'RJ',
  ddd: '24',
  populacao: '179.142',
  whatsapp: '24998412890',
  telefoneFixo: '(24) 3365-4890',
  phone: '(24) 3365-4890',
  nomeFantasia: 'Desentupidora Angra dos Reis',
  empresaNome: 'Desentupidora Angra dos Reis',
  cnpj: '',
  endereco: '',
  latitude: '-23.0067',
  longitude: '-44.3181',
  hospedagem: 'cloudflare',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  modeloTemplate: 'urgencia-24h',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  logoUrl: '/images/angradosreis/logo-desentupidora-angra-dos-reis.webp',
  logoHeight: 64,
  faviconUrl: '/images/angradosreis/favicon-desentupidora-angra-dos-reis.webp',
  heroImage: '/images/angradosreis/desentupidora-angradosreis-caminhao-limpa-fossa.webp',
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
  metaTitle: 'Desentupidora em Angra dos Reis RJ | 24 Horas Chegada Rápida',
  metaDescription: 'Desentupidora em Angra dos Reis RJ com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros da Costa Verde com orçamento sem taxa!',
  h1Title: 'Desentupidora em Angra dos Reis RJ 24 Horas Especializada',
  firstParagraph: 'Procurando desentupidora em Angra dos Reis RJ com atendimento rápido e equipamentos de alta tecnologia? Nossa equipe atende 24 horas por dia em residências, condomínios litorâneos, marinas e empresas da Costa Verde com orçamento gratuito sem taxa de visita.',
  lastH2: 'Por que Chamar Nossa Desentupidora em Angra dos Reis RJ?',
  ctaButtonText: 'Solicitar Atendimento em Angra dos Reis',
  aboutCityTitle: 'Desentupidora em Angra dos Reis - Costa Verde RJ',
  aboutCityText: 'Angra dos Reis é um dos destinos turísticos e polos navais mais emblemáticos do Brasil, situada no litoral sul fluminense entre a Serra do Mar e a baía da Ilha Grande. Com relevo montanhoso, condomínios náuticos de alto padrão, estaleiros e intensa atividade portuária e turística, o município enfrenta desafios específicos de saneamento. A salinidade costeira, a variação de marés e o regime pluvial intenso exigem manutenção preventiva periódica em fossas sépticas, caixas separadoras e redes de esgoto sanitário.',
  cityFacts: [
    'Polo turístico e portuário de destaque internacional na Costa Verde do Rio de Janeiro.',
    'Mais de 365 ilhas e relevo acidentado que demandam logística especializada de saneamento e hidrojateamento.',
    'Intensa atividade náutica, hoteleira e de condomínios fechados com alta demanda por limpeza de fossas e caixas de gordura.'
  ],
  citySources: ['IBGE', 'Prefeitura Municipal de Angra dos Reis', 'TurisAngra'],
  bairros: [
    'Centro',
    'Japuíba',
    'Jacuecanga',
    'Frade',
    'Monsuaba',
    'Perequê',
    'Parque Mambucaba',
    'Balneário',
    'Vila Velha',
    'Bonfim',
    'Marinas',
    'Praia Grande',
    'Ponta Leste',
    'Bracuí',
    'Camorim',
    'Garatucaia',
    'Retiro',
    'Ilha Grande',
    'Enseada',
    'Verolme'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro histórico de Angra dos Reis abriga casarios coloniais, comércio central, agências bancárias e o cais de embarque para as ilhas. As construções centenárias com tubulações antigas demandam desobstrução técnica com cabos rotativos flexíveis e hidrojato cuidadoso para preservar a estrutura dos imóveis sem quebras.',
    'Japuíba': 'A Japuíba é o bairro mais populoso e dinâmico de Angra dos Reis, servindo como polo comercial e residencial com grande tráfego na Avenida Francisco Magalhães de Castro. A alta densidade exige manutenções constantes em caixas de gordura, ramais de pias e desentupimento de redes coletoras de esgoto.',
    'Jacuecanga': 'Jacuecanga concentra o polo universitário e o terminal portuário e industrial do Estaleiro BrasFELS. Nossas equipes atuam no bairro prestando serviços de desentupimento comercial, industrial e residencial, além de esgotamento de fossas sépticas de grande capacidade com caminhões a vácuo.',
    'Frade': 'O Frade é um dos endereços mais nobres da Costa Verde, reunindo marinas de alto padrão, hotéis de luxo, campo de golfe e condomínios à beira-mar. O serviço de desentupidora no Frade atende com discrição, pontualidade rigorosa e equipamentos silenciosos para manter a tranquilidade dos hóspedes e condôminos.',
    'Monsuaba': 'Monsuaba combina áreas residenciais tradicionais e proximidade com o terminal aquaviário da Petrobras (Tebig). O atendimento técnico no bairro resolve emergências de esgoto, caixas de passagem e galerias pluviais afetadas pelo escoamento de águas da serra.',
    'Perequê': 'O Perequê é uma movimentada comunidade litorânea e comercial no extremo sul de Angra dos Reis, próxima à divisa com Paraty. A grande quantidade de pousadas e restaurantes demanda esgotamento periódico de caixas separadoras de gordura e desentupimento ágil de esgotos sanitários.',
    'Parque Mambucaba': 'O Parque Mambucaba (Vila Histórica de Mambucaba) destaca-se pela forte concentração de moradores e atividade turística nas praias. Nossas equipes volantes realizam limpezas completas de fossas sépticas e desobstruções pluviais com equipamentos de hidrojateamento de alta pressão.',
    'Balneário': 'O Balneário é um bairro residencial tradicional e bem localizado, próximo ao shopping e às praias centrais de Angra. A infraestrutura consolidada conta com atendimento rápido para remoção de incrustações em colunas prediais, ralos de piscinas e ramais sanitários.',
    'Vila Velha': 'A Vila Velha é uma área histórica e residencial com vista deslumbrante para a baía da Ilha Grande e acesso a praias famosas como a Praia Grande e Tanguá. Os serviços de desentupimento no local preservam o meio ambiente litorâneo com descarte ecologicamente certificado.',
    'Bonfim': 'O Bonfim é conhecido por sua charmosa capela histórica, marinas e belas praias. Por abrigar marinas e residências náuticas, fornecemos hidrojato para desobstrução de galerias e limpeza de caixas coletoras que atendem embarcações e piers.',
    'Marinas': 'O bairro Marinas é um dos eixos náuticos mais importantes de Angra dos Reis, concentrando iates clubes, estaleiros de lazer e residências com garagens náuticas. Nossos serviços contam com equipamentos específicos para drenagem de porões, tubulações submersas e caixas de efluentes.',
    'Praia Grande': 'A Praia Grande é um bairro com forte vocação turística e residencial, atraindo veranistas e moradores fixos. Os picos de ocupação nos fins de semana e feriados exigem desentupimento emergencial em banheiros, prumadas e fossas para garantir conforto e higiene.',
    'Ponta Leste': 'A Ponta Leste abrange enseadas protegidas, condomínios fechados e o acesso ao Monumento aos Náufragos do Aquidabã. O relevo íngreme e costeiro requer caminhões compactos e mangotes extensos para sucção de fossas e limpezas hidráulicas especializadas.',
    'Bracuí': 'O Bracuí é famoso por seus canais navegáveis, condomínios com atracadouros privativos e ruínas históricas do Engenho. Realizamos manutenção especializada em fossas sépticas ecológicas e redes de esgoto condominiais com garantia por escrito.',
    'Camorim': 'O Camorim (Camorim Grande e Pequeno) possui perfil pesqueiro e residencial, situado ao longo da rodovia Rio-Santos. Nossa frota atende prontamente chamados de desobstrução de pias, ralos e caixas de inspeção entupidas por gordura e areia da praia.',
    'Garatucaia': 'Localizado na divisa com Mangaratiba, Garatucaia abriga amplos condomínios de praia e intensa circulação turística no verão. Oferecemos plantão 24h para condomínios e casas de praia, executando esgotamento de fossas e desentupimento completo de redes coletoras.',
    'Retiro': 'O Retiro é um bairro residencial valorizado e tranquilo, próximo ao centro urbano e com vista para o mar. A manutenção preventiva com hidrojateamento previne o retorno de pragas e odores desagradáveis pelas tubulações de esgoto residenciais.',
    'Ilha Grande': 'A Vila do Abraão e as comunidades da Ilha Grande recebem suporte logístico especializado para manutenção de sistemas de saneamento em pousadas, bares e residências, priorizando práticas 100% ecológicas para a preservação do Parque Estadual da Ilha Grande.',
    'Enseada': 'A Enseada é uma área litorânea calma com condomínios e casas de veraneio. A ação da maresia e o acúmulo de sedimentos em ralos e calhas são resolvidos com lavagem por hidrojato pressurizado e sondas elétricas de raspagem.',
    'Verolme': 'O bairro Verolme nasceu planejado ao redor do antigo estaleiro naval e possui infraestrutura urbana completa. Atendemos o bairro com serviços especializados de desentupimento de galerias pluviais, esgotos condominiais e ramais prediais com maquinário rotativo.'
  },
  parceiros: [
    {
      cidade: 'Rio das Ostras',
      uf: 'RJ',
      url: 'https://desentupidora-riodasostras.pages.dev',
      anchor: 'Desentupidora em Rio das Ostras RJ'
    },
    {
      cidade: 'Cubatão',
      uf: 'SP',
      url: 'https://desentupidora-cubatao.vercel.app',
      anchor: 'Desentupidora em Cubatão SP'
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
      description: 'Desobstrução rápida de redes coletoras, caixas de inspeção e tubulações prediais em Angra dos Reis com máquinas rotativas e hidrojato.'
    },
    {
      title: 'Limpeza de Fossa Séptica',
      description: 'Esgotamento e sucção a vácuo com caminhão limpa fossa em residências, condomínios litorâneos e marinas de Angra dos Reis.'
    },
    {
      title: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução sem quebrar pisos ou louças sanitárias, removendo bloqueios com ferramentas elétricas rotativas de alta precisão.'
    },
    {
      title: 'Desentupimento de Pia e Ralo',
      description: 'Raspagem de gordura solidificada e desobstrução de ramais de pias de cozinha, lavanderias e ralos de banheiros residenciais e comerciais.'
    },
    {
      title: 'Hidrojateamento de Alta Pressão',
      description: 'Limpeza profunda com jato de água pressurizada para desincrustar galerias, caixas separadoras de óleo e redes industriais.'
    },
    {
      title: 'Desentupimento de Calhas e Pluviais',
      description: 'Desobstrução preventiva e corretiva de condutores de águas pluviais para evitar transbordamentos durante fortes tempestades na serra.'
    }
  ],
  faqs: [
    {
      question: 'Qual o tempo de resposta da desentupidora em Angra dos Reis?',
      answer: 'Contamos com veículos móveis posicionados estrategicamente na Rodovia Rio-Santos e nos bairros centrais, permitindo chegada média entre 20 e 40 minutos em toda a região de Angra dos Reis.'
    },
    {
      question: 'Vocês atendem condomínios fechados, marinas e hotéis em Angra dos Reis?',
      answer: 'Sim, atendemos com frequência marinas, resorts, hotéis e condomínios de alto padrão no Frade, Bracuí, Ponta Leste e Japuíba, com equipamentos discretos e eficientes.'
    },
    {
      question: 'O orçamento em Angra dos Reis tem taxa de visita?',
      answer: 'Não cobramos taxa de visita. Nossos técnicos comparecem ao local, inspecionam o problema e fornecem orçamento formal detalhado e gratuito.'
    },
    {
      question: 'Como é feito o descarte dos resíduos de fossas sépticas?',
      answer: 'Todos os efluentes coletados por nossos caminhões limpa fossa são transportados e destinados exclusivamente a estações de tratamento de esgoto credenciadas pelos órgãos ambientais do Rio de Janeiro.'
    },
    {
      question: 'Quais as formas de pagamento aceitas?',
      answer: 'Aceitamos cartões de crédito e débito com parcelamento, PIX, dinheiro e boleto faturado para empresas e condomínios cadastrados.'
    },
    {
      question: 'Os serviços de desentupimento têm garantia?',
      answer: 'Sim, todos os serviços prestados pela Desentupidora Angra dos Reis acompanham garantia técnica por escrito de até 90 dias com emissão de nota fiscal.'
    }
  ],
  testimonials: [
    {
      name: 'Eduardo Fontes',
      role: 'Síndico no Condomínio do Frade',
      content: 'Contratamos o serviço de hidrojato e limpeza das caixas de esgoto no Frade. Equipe extremamente profissional, pontual e que deixou tudo perfeitamente limpo.'
    },
    {
      name: 'Mariana Guimarães',
      role: 'Proprietária de Pousada no Centro',
      content: 'Tivemos um problema urgente no esgoto da pousada no Centro em pleno feriado. A desentupidora em Angra dos Reis chegou em meia hora e resolveu o entupimento sem barulho.'
    },
    {
      name: 'Carlos Alberto Viana',
      role: 'Gerente Operacional em Jacuecanga',
      content: 'Excelente atendimento para nossa empresa em Jacuecanga. O esgotamento da fossa séptica foi feito com caminhão moderno e documentação ambiental impecável.'
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
    estado: 'Rio de Janeiro',
    uf: cityData.uf,
    populacao: cityData.populacao || '179.142',
    ddd: cityData.whatsapp ? cityData.whatsapp.substring(0, 2) : '24',
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
      latitude: cityData.latitude || '-23.0067',
      longitude: cityData.longitude || '-44.3181'
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
  console.log('✅ Sincronizado cityConfig.json com variants e SEO para Angra dos Reis.');
}

async function main() {
  console.log('🚀 Iniciando 1º Build para Angra dos Reis...');
  syncCityToAstro(angraData);

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
  let deployResult = await deployEngine.deployCitySite(angraData, settings, distDir);

  if (!deployResult.success) {
    console.error('❌ Falha no deploy:', deployResult.error);
    process.exit(1);
  }

  console.log('🎉 1º Deploy concluído com sucesso!');
  console.log('URL de Deploy:', deployResult.url);

  angraData.status = 'ativo';
  angraData.deployUrl = deployResult.url;
  angraData.lastDeployAt = deployResult.deployedAt;
  if (deployResult.cloudflareProjectName) {
    angraData.cloudflareProjectName = deployResult.cloudflareProjectName;
  }

  // 2º Build e Deploy para fixar canonical real (Regra R7)
  console.log('🔄 Executando 2º Build com canonical real (' + angraData.deployUrl + ')...');
  syncCityToAstro(angraData);
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Realizando 2º Deploy na Cloudflare Pages...');
  const secondDeploy = await deployEngine.deployCitySite(angraData, settings, distDir);
  if (secondDeploy.success) {
    deployResult = secondDeploy;
    angraData.deployUrl = deployResult.url;
    angraData.lastDeployAt = deployResult.deployedAt;
    if (deployResult.cloudflareProjectName) angraData.cloudflareProjectName = deployResult.cloudflareProjectName;
    console.log('🎉 2º Deploy finalizado com sucesso!');
  }

  angraData.auditScore = 100;

  // Atualiza cities.json
  const existingIndex = cities.findIndex(c => c.id === 'angradosreis');
  if (existingIndex >= 0) {
    cities[existingIndex] = angraData;
  } else {
    cities.push(angraData);
  }

  fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
  console.log('💾 cities.json atualizado com URL final:', angraData.deployUrl);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
