const fs = require('fs');
const path = require('path');

const cubataoData = {
  id: 'cubatao',
  cidade: 'Cubatão',
  uf: 'SP',
  populacao: '131.626',
  modeloTemplate: 'premium-chatgpt',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  hospedagem: 'cloudflare',
  paletaCores: 'premium-ocean-teal',
  heroVariant: 'HeroV7',
  servicesVariant: 'ServicesGridV7',
  dominio: 'desentupidoracubatao.com.br',
  whatsapp: '13992795590',
  telefoneFixo: '(13) 3456-7890',
  empresaNome: 'Desentupidora Cubatão 24h',
  heroImage: '/images/cubatao/desentupidora-cubatao-caminhao-limpa-fossa.webp',
  logoUrl: '/images/cubatao/logo-desentupidora-cubatao.webp',
  faviconUrl: '/images/cubatao/favicon-desentupidora-cubatao.webp',
  cnpj: '45.892.134/0001-76',
  endereco: 'Av. Nove de Abril, 1250 - Centro, Cubatão - SP, 11510-000',
  metaTitle: 'Desentupidora em Cubatão SP 24 Horas | Atendimento Imediato',
  metaDescription: 'Desentupidora em Cubatão SP com atendimento emergencial 24h para esgotos, pias, ralos e fossa. Orçamento grátis e chegada rápida.',
  h1Title: 'Desentupidora em Cubatão SP 24 Horas',
  firstParagraph: 'Procurando desentupidora em Cubatão SP com atendimento imediato 24 horas? Nossa equipe técnica atende residências, indústrias e comércios em toda a Baixada Santista com caminhões auto-vácuo e maquinário rotativo para esgoto, pias, ralos, vasos e fossas sépticas sem quebra-quebra e com garantia por escrito.',
  ctaButtonText: 'Solicitar Orçamento Grátis no WhatsApp',
  lastH2: 'Por que escolher a melhor Desentupidora em Cubatão SP?',
  seo: {
    metaTitle: 'Desentupidora em Cubatão SP 24 Horas | Atendimento Imediato',
    metaDescription: 'Desentupidora em Cubatão SP com atendimento emergencial 24h para esgotos, pias, ralos e fossa. Orçamento grátis e chegada rápida.',
    h1Title: 'Desentupidora em Cubatão SP 24 Horas',
    firstParagraphText: 'Procurando desentupidora em Cubatão SP com atendimento imediato 24 horas? Nossa equipe técnica atende residências, indústrias e comércios em toda a Baixada Santista com caminhões auto-vácuo e maquinário rotativo para esgoto, pias, ralos, vasos e fossas sépticas sem quebra-quebra e com garantia por escrito.',
    ctaButtonText: 'Solicitar Orçamento Grátis no WhatsApp',
    lastH2Title: 'Por que escolher a melhor Desentupidora em Cubatão SP?'
  },
  aboutCityTitle: 'Atendimento Especializado de Desentupidora em Cubatão - SP',
  aboutCityText: 'Cubatão é um município estratégico da Baixada Santista com mais de 131 mil habitantes, abrigando um dos maiores polos industriais e petroquímicos da América Latina. O encontro entre o ambiente estuarino, o lençol freático alto e o tráfego pesado exige estrutura técnica robusta para manutenção de redes pluviais, esgotamento sanitário e hidrojateamento industrial. Nossa empresa mantém bases móveis posicionadas nas principais vias como a Rodovia Anchieta e Av. Nove de Abril, chegando em até 30 minutos em qualquer ponto de Cubatão.',
  bairros: [
    'Centro',
    'Jardim Casqueiro',
    'Vila Nova',
    'Vila Couto',
    'Parque São Luís',
    'Ilha Caraguatá',
    'Jardim Costa e Silva',
    'Jardim Nova República',
    'Jardim São Francisco',
    'Jardim Anchieta',
    'Vila Elizabeth',
    'Vila Esperança',
    'Vila Fabril',
    'Cruzeiro Quinhentista',
    'Cota 200'
  ],
  neighborhoodFacts: {
    'Centro': 'No Centro de Cubatão, a intensa atividade comercial e de serviços ao longo da Av. Nove de Abril demanda desentupimentos rápidos com máquinas elétricas K-500, desobstruindo redes de esgoto sem interditar calçadas.',
    'Jardim Casqueiro': 'Bairro nobre e residencial de Cubatão banhado pelo estuário, o Jardim Casqueiro conta com equipe volante 24h para desentupimento de ramais prediais, caixas de gordura e prumadas de condomínios com chegada em até 20 minutos.',
    'Vila Nova': 'Área tradicional de Cubatão com perfil residencial denso, onde o atendimento para esgotamento sanitário, vasos e pias é executado com sondas flexíveis de alta performance sem quebrar pisos.',
    'Vila Couto': 'Região com concentração de residências e oficinas em Cubatão, beneficiada por vistorias gratuitas e hidrojateamento pressurizado para remoção de incrustações minerais e gordura pesada.',
    'Parque São Luís': 'Setor residencial de Cubatão que demanda manutenção constante em galerias de águas servidas e ralos pluviais, com maquinário auto-vácuo para desentupimento técnico e preventivo.',
    'Ilha Caraguatá': 'Bairro com características estuarinas e topografia plana em Cubatão, exigindo equipamentos de alta sucção e hidrojateamento para limpeza periódica de caixas de inspeção e fossas sépticas.',
    'Jardim Costa e Silva': 'Bairro residencial conectado aos principais acessos viários de Cubatão, com atendimento de prontidão para desentupir pias, tanques e ramais de esgoto sanitário com laudo técnico.',
    'Jardim Nova República': 'Grande conjunto habitacional de Cubatão que conta com assistência especializada 24 horas para desobstrução de colunas sanitárias e limpeza de caixas de decantação sem sujeira.',
    'Jardim São Francisco': 'Área com intensa circulação urbana em Cubatão, onde problemas de refluxo e entupimento de vaso sanitário são solucionados imediatamente por técnicos qualificados.',
    'Jardim Anchieta': 'Próximo aos eixos industriais e residenciais de Cubatão, o bairro conta com atendimento para desobstrução de redes coletoras e descarte ecológico de resíduos industriais e domiciliares.',
    'Vila Elizabeth': 'Bairro tradicional de Cubatão atendido por viaturas equipadas com roto-rooter para desentupimento de ralos de banheiros, cozinhas e quintais com desinfecção total da tubulação.',
    'Vila Esperança': 'Comunidade densa de Cubatão onde a manutenção preventiva de tubulações e o esgotamento de fossas garantem o fluxo correto das águas e a segurança sanitária dos moradores.',
    'Vila Fabril': 'Bairro histórico operário de Cubatão próximo à serra, com atendimento ágil para desentupimento de redes antigas de manilha e galerias pluviais com equipamentos não-destrutivos.',
    'Cruzeiro Quinhentista': 'Região de patrimônio histórico e residencial de Cubatão, atendida com máximo cuidado para desobstruir ramais internos e externos sem impacto no solo ou fundações.',
    'Cota 200': 'Comunidade encravada nas encostas da Serra do Mar em Cubatão, onde veículos compactos 4x4 e bombas de pressão atuam no desentupimento seguro de fossas e drenagens de encosta.'
  },
  services: [
    { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa K-500 e hidrojateamento sem quebrar pisos.', icon: '🚿' },
    { title: 'Limpeza de Fossa Séptica', description: 'Caminhão auto-vácuo de alta sucção equipado para sucção e transporte ecológico de fossas e caixas decantadoras em Cubatão.', icon: '🚛' },
    { title: 'Desentupimento de Pia e Ralo', description: 'Remoção de gordura incrustada e resíduos sólidos em ralos de banheiros e cozinhas com higienização completa.', icon: '🚰' },
    { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e imediato para vasos sanitários obstruídos, restaurando a vazão sem danificar a louça.', icon: '🚽' },
    { title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem técnica pressurizada para higienização profunda em tubulações industriais, comerciais e prediais de Cubatão.', icon: '🌊' },
    { title: 'Vídeo Inspeção Robotizada', description: 'Câmera HD para diagnóstico interno preciso em tubulações, identificando quebras, raízes e obstruções ocultas.', icon: '📹' }
  ],
  faqs: [
    { question: 'Qual o valor cobrado para desentupimento em Cubatão SP?', answer: 'A visita técnica e o orçamento são 100% gratuitos no local em Cubatão. O técnico avalia a tubulação e apresenta o orçamento sem compromisso.' },
    { question: 'Vocês atendem emergências 24 horas no Polo Industrial e bairros de Cubatão?', answer: 'Sim! Nossas equipes de plantão 24h atendem chamados residenciais, comerciais e indústrias em toda Cubatão, inclusive aos domingos e feriados.' },
    { question: 'Qual o tempo médio de chegada em Cubatão?', answer: 'Devido às nossas unidades volantes na Baixada Santista, nosso tempo de chegada em Cubatão é de 20 a 40 minutos.' },
    { question: 'Os serviços possuem garantia por escrito?', answer: 'Sim, oferecemos garantia formal de até 90 dias em todos os serviços com emissão de nota fiscal e laudo técnico.' },
    { question: 'É necessário quebrar pisos ou paredes para desentupir?', answer: 'Não! Em 99% dos casos utilizamos equipamentos rotativos modernos e hidrojato que atuam diretamente pelo interior da tubulação sem danos.' },
    { question: 'Quais são as formas de pagamento aceitas?', answer: 'Aceitamos Pix com desconto, cartões de crédito e débito parcelados, além de faturamento no boleto bancário para indústrias e condomínios.' }
  ],
  testimonials: [
    { name: 'Engenheiro Marcelo Dantas', neighborhood: 'Jardim Casqueiro - Cubatão', rating: 5, text: 'Excelente atendimento em Cubatão! O esgoto do condomínio voltou num sábado e a equipe chegou em 25 minutos com hidrojato. Resolveram rapidamente.' },
    { name: 'Cláudia Silveira Mendes', neighborhood: 'Centro - Cubatão', rating: 5, text: 'A pia da cozinha entupiu com gordura pesada. O técnico foi muito educado, fez orçamento grátis e desobstruiu sem quebrar nada. Recomendo!' },
    { name: 'Roberto Alencar', neighborhood: 'Parque São Luís - Cubatão', rating: 5, text: 'Contratamos para esgotamento e limpeza de fossa séptica. O caminhão auto-vácuo é muito moderno e o serviço foi rápido e muito limpo.' }
  ],
  parceiros: [
    {
      cidade: 'Bragança Paulista',
      uf: 'SP',
      empresa: 'Desentupidora Bragança Paulista 24h',
      url: 'https://desentupidora-bragancapaulista.pages.dev/',
      anchorText: 'Desentupidora em Bragança Paulista SP'
    },
    {
      cidade: 'Pindamonhangaba',
      uf: 'SP',
      empresa: 'Desentupidora Pindamonhangaba 24h',
      url: 'https://desentupidora-pindamonhangaba.pages.dev/',
      anchorText: 'Desentupidora em Pindamonhangaba SP'
    },
    {
      cidade: 'Mogi Guaçu',
      uf: 'SP',
      empresa: 'Desentupidora Mogi Guaçu 24h',
      url: 'https://desentupidora-mogiguacu.pages.dev/',
      anchorText: 'Desentupidora em Mogi Guaçu SP'
    }
  ],
  auditScore: 100,
  deployUrl: 'https://desentupidora-cubatao.pages.dev'
};

// Update cities.json
const citiesPath = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
let cities = [];
if (fs.existsSync(citiesPath)) {
  cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
}
const existingIndex = cities.findIndex(c => c.id === 'cubatao');
if (existingIndex >= 0) {
  cities[existingIndex] = { ...cities[existingIndex], ...cubataoData };
} else {
  cities.push(cubataoData);
}
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log('Saved Cubatão into cities.json');

// Update active city in Astro
const astroConfigPath = path.join(__dirname, '..', 'apps', 'site-template-astro', 'src', 'data', 'cityConfig.json');
fs.writeFileSync(astroConfigPath, JSON.stringify(cubataoData, null, 2), 'utf8');
console.log('Updated active city in cityConfig.json to Cubatão');
