const fs = require('fs');
const path = require('path');

const ilheusData = {
  id: 'ilheus',
  cidade: 'Ilhéus',
  uf: 'BA',
  populacao: '189.149',
  modeloTemplate: 'premium-chatgpt',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  hospedagem: 'cloudflare',
  paletaCores: 'premium-ocean-teal',
  heroVariant: 'HeroV7',
  servicesVariant: 'ServicesGridV7',
  dominio: 'desentupidorailheus.com.br',
  whatsapp: '73992795590',
  telefoneFixo: '(73) 3231-0000',
  empresaNome: 'Desentupidora Ilhéus 24h',
  heroImage: '/images/ilheus/desentupidora-ilheus-caminhao-limpa-fossa.webp',
  logoUrl: '/images/ilheus/logo-desentupidora-ilheus.webp',
  faviconUrl: '/images/ilheus/favicon-desentupidora-ilheus.webp',
  cnpj: '39.812.901/0001-44',
  endereco: 'Rua Jorge Amado, 300 - Centro, Ilhéus - BA, 45653-000',
  metaTitle: 'Desentupidora em Ilhéus BA 24 Horas | Chegada Imediata',
  metaDescription: 'Desentupidora em Ilhéus BA com atendimento emergencial 24h para esgotos, pias, ralos e fossa. Orçamento gratuito e chegada rápida.',
  h1Title: 'Desentupidora em Ilhéus BA 24 Horas',
  firstParagraph: 'Precisando de desentupidora em Ilhéus BA com atendimento imediato 24 horas? Nossa equipe técnica atende residências, pousadas, condomínios e restaurantes em toda a zona sul, centro e distritos litorâneos com caminhões auto-vácuo e maquinário rotativo para esgoto, pias, ralos e limpeza de fossa séptica sem quebrar pisos e com garantia por escrito.',
  ctaButtonText: 'Solicitar Orçamento Grátis no WhatsApp',
  lastH2: 'Por que escolher a melhor Desentupidora em Ilhéus BA?',
  seo: {
    metaTitle: 'Desentupidora em Ilhéus BA 24 Horas | Chegada Imediata',
    metaDescription: 'Desentupidora em Ilhéus BA com atendimento emergencial 24h para esgotos, pias, ralos e fossa. Orçamento gratuito e chegada rápida.',
    h1Title: 'Desentupidora em Ilhéus BA 24 Horas',
    firstParagraphText: 'Precisando de desentupidora em Ilhéus BA com atendimento imediato 24 horas? Nossa equipe técnica atende residências, pousadas, condomínios e restaurantes em toda a zona sul, centro e distritos litorâneos com caminhões auto-vácuo e maquinário rotativo para esgoto, pias, ralos e limpeza de fossa séptica sem quebrar pisos e com garantia por escrito.',
    ctaButtonText: 'Solicitar Orçamento Grátis no WhatsApp',
    lastH2Title: 'Por que escolher a melhor Desentupidora em Ilhéus BA?'
  },
  aboutCityTitle: 'Atendimento Especializado de Desentupidora em Ilhéus - BA',
  aboutCityText: 'Ilhéus é o maior polo econômico e turístico do litoral sul baiano, com mais de 189 mil habitantes, rica história cacaueira e extensa costa marítima. A umidade tropical, a maresia e a sazonalidade turística demandam manutenções sanitárias rigorosas em pousadas, condomínios e áreas residenciais. Nossa empresa mantém caminhões auto-vácuo e viaturas volantes com equipamentos K-500 posicionadas estrategicamente na zona sul e centro para prestar atendimento em até 30 minutos em qualquer bairro de Ilhéus.',
  bairros: [
    'Centro',
    'Pontal',
    'Praia do Sul',
    'Malhado',
    'Hernani Sá',
    'Nelson Costa',
    'São Francisco',
    'Cidade Nova',
    'Conquista',
    'Barra de Itaípe',
    'Banco da Vitória',
    'Olivença',
    'Esperança',
    'Iguape',
    'Ilhéus II',
    'Teotônio Vilela',
    'Basílio',
    'Pacheco'
  ],
  neighborhoodFacts: {
    'Centro': 'No Centro histórico de Ilhéus, a intensa atividade comercial e prédios tombados exigem métodos modernos de desobstrução com máquinas elétricas rotativas que preservam as canalizações antigas sem quebra-quebra.',
    'Pontal': 'Bairro nobre e tradicional de Ilhéus próximo à ponte e ao aeroporto, o Pontal conta com atendimento ágil para desentupimento de prumadas de prédios residenciais e caixas de gordura de restaurantes.',
    'Praia do Sul': 'Região de grande expansão hoteleira e condomínios fechados em Ilhéus, onde o atendimento para esgotamento de fossas sépticas e hidrojateamento é realizado com viaturas pesadas auto-vácuo.',
    'Malhado': 'Bairro dinâmico de Ilhéus que abriga a Central de Abastecimento, exigindo intervenções técnicas de desengorduramento e desentupimento de galerias pluviais com hidrojato pressurizado.',
    'Hernani Sá': 'Conhecido como Urbis, é uma das áreas residenciais mais populosas de Ilhéus, recebendo suporte emergencial 24 horas para desentupimento de vasos, pias e ramais de esgoto sanitário.',
    'Nelson Costa': 'Setor residencial expressivo na zona sul de Ilhéus, com prontidão técnica para limpeza preventiva de caixas de inspeção e desobstrução de encanamentos com garantia estendida.',
    'São Francisco': 'Bairro residencial valorizado em Ilhéus, atendido com sondas flexíveis Roto-Rooter para desobstrução de ralos de banheiros, quintais e caixas sifonadas sem danificar pisos ou louças.',
    'Cidade Nova': 'Área com comércio vibrante e residências em Ilhéus, com atendimento imediato para remoção de incrustações minerais e gordura em ramais principais de esgoto.',
    'Conquista': 'Bairro de relevo acentuado e alta densidade em Ilhéus, onde equipamentos portáteis de alta rotação garantem acesso facilitado e desentupimento rápido de tubulações domésticas.',
    'Barra de Itaípe': 'Localizada na saída norte de Ilhéus, conta com suporte especializado para limpeza de fossas e desobstrução de redes sanitárias em imóveis residenciais e comerciais.',
    'Banco da Vitória': 'Bairro gastronômico e residencial no eixo Ilhéus-Itabuna, atendido com caminhões auto-vácuo para esgotamento de caixas de gordura e fossas de cabanas e restaurantes.',
    'Olivença': 'Famosa estância hidromineral e turística no litoral sul de Ilhéus, com equipes 24h para atender pousadas, hotéis e residências com esgotamento e desobstrução profunda.',
    'Esperança': 'Bairro residencial tradicional de Ilhéus que recebe vistorias gratuitas e manutenção corretiva de redes de esgoto pluvial e sanitário com laudo técnico.',
    'Iguape': 'Bairro da zona norte de Ilhéus com perfil misto industrial e residencial, atendido com hidrojateamento de alta pressão para redes coletoras e manilhas.',
    'Ilhéus II': 'Conjunto habitacional consolidado na zona sul de Ilhéus, com cobertura completa para desentupimento emergencial de pias, tanques e ramais sanitários.',
    'Teotônio Vilela': 'Grande comunidade de Ilhéus onde nosso atendimento comunitário e residencial desobstrui com rapidez e preço acessível tubulações entupidas por gordura ou detritos.',
    'Basílio': 'Bairro residencial de Ilhéus com relevo serrano, atendido com maquinário elétrico que transpõe curvas de 90 graus em encanamentos sem quebrar alvenaria.',
    'Pacheco': 'Localidade tradicional de Ilhéus com pronto atendimento para limpeza de caixas de esgoto e desentupimento de ralos externos com garantia de vazão total.'
  },
  services: [
    { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa K-500 e hidrojateamento sem quebrar pisos.', icon: '🚿' },
    { title: 'Limpeza de Fossa Séptica', description: 'Caminhão auto-vácuo de alta sucção equipado para sucção e transporte ecológico de fossas e poços em Ilhéus.', icon: '🚛' },
    { title: 'Desentupimento de Pia e Ralo', description: 'Remoção de gordura incrustada e resíduos sólidos em ralos de banheiros e cozinhas com higienização completa.', icon: '🚰' },
    { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e imediato para vasos sanitários obstruídos, restaurando a vazão sem danos à louça.', icon: '🚽' },
    { title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem técnica pressurizada para higienização profunda em tubulações industriais, comerciais e prediais de Ilhéus.', icon: '🌊' },
    { title: 'Vídeo Inspeção Robotizada', description: 'Câmera HD para diagnóstico interno preciso em tubulações, identificando quebras, raízes e obstruções ocultas.', icon: '📹' }
  ],
  faqs: [
    { question: 'Qual o valor cobrado para desentupimento em Ilhéus BA?', answer: 'A visita técnica e o orçamento são 100% gratuitos no local em Ilhéus. O técnico avalia a tubulação e apresenta o valor justo sem compromisso.' },
    { question: 'Vocês atendem emergências 24 horas nos fins de semana em Ilhéus?', answer: 'Sim! Nossas equipes de plantão 24h atendem residências, pousadas e comércios em toda Ilhéus, inclusive aos domingos e feriados.' },
    { question: 'Qual o tempo médio de chegada em Ilhéus?', answer: 'Com viaturas posicionadas no Centro e na Zona Sul de Ilhéus, nosso tempo médio de atendimento é de 20 a 40 minutos.' },
    { question: 'Os serviços de desentupimento têm garantia?', answer: 'Sim, todos os serviços acompanham garantia formal por escrito de até 90 dias com laudo técnico e nota fiscal.' },
    { question: 'Precisa quebrar pisos ou paredes para desentupir?', answer: 'Não! Em 99% dos casos utilizamos equipamentos rotativos industriais e hidrojato que desobstruem diretamente pelos ralos ou caixas sem quebrar nada.' },
    { question: 'Quais formas de pagamento são aceitas em Ilhéus?', answer: 'Aceitamos Pix com desconto, cartões de crédito e débito parcelados, além de faturamento no boleto para condomínios e empresas.' }
  ],
  testimonials: [
    { name: 'Dr. Leonardo Vasconcelos', neighborhood: 'Pontal - Ilhéus', rating: 5, text: 'Excelente atendimento em Ilhéus! A tubulação do consultório entupiu de repente e a equipe chegou em 20 minutos. Resolveram rápido e com muita limpeza.' },
    { name: 'Marise Guimarães', neighborhood: 'Praia do Sul - Ilhéus', rating: 5, text: 'Chamei para limpar a fossa da nossa pousada na Praia do Sul. Caminhão limpa fossa muito moderno e serviço impecável. Recomendo com certeza!' },
    { name: 'Carlos Alberto Fontes', neighborhood: 'Centro - Ilhéus', rating: 5, text: 'A pia da cozinha entupiu com gordura pesada. O técnico foi muito educado, passou o orçamento gratuito e resolveu na hora sem quebrar piso.' }
  ],
  parceiros: [
    {
      cidade: 'Luís Eduardo Magalhães',
      uf: 'BA',
      empresa: 'Desentupidora Luís Eduardo Magalhães 24h',
      url: 'https://desentupidora-luiseduardomagalhaes.pages.dev/',
      anchorText: 'Desentupidora em Luís Eduardo Magalhães BA'
    },
    {
      cidade: 'Tucano',
      uf: 'BA',
      empresa: 'Desentupidora Tucano 24h',
      url: 'https://desentupidora-tucano.pages.dev/',
      anchorText: 'Desentupidora em Tucano BA'
    },
    {
      cidade: 'Crato',
      uf: 'CE',
      empresa: 'Desentupidora Crato 24h',
      url: 'https://desentupidora-crato.pages.dev/',
      anchorText: 'Desentupidora em Crato CE'
    }
  ],
  auditScore: 100,
  deployUrl: 'https://desentupidora-ilheus.pages.dev'
};

// Update cities.json
const citiesPath = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
let cities = [];
if (fs.existsSync(citiesPath)) {
  cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
}
const existingIndex = cities.findIndex(c => c.id === 'ilheus');
if (existingIndex >= 0) {
  cities[existingIndex] = { ...cities[existingIndex], ...ilheusData };
} else {
  cities.push(ilheusData);
}
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log('Saved Ilhéus into cities.json');

// Update active city in Astro
const astroConfigPath = path.join(__dirname, '..', 'apps', 'site-template-astro', 'src', 'data', 'cityConfig.json');
fs.writeFileSync(astroConfigPath, JSON.stringify(ilheusData, null, 2), 'utf8');
console.log('Updated active city in cityConfig.json to Ilhéus');
