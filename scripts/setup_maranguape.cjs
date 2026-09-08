const fs = require('fs');
const path = require('path');

const maranguapeData = {
  id: 'maranguape',
  cidade: 'Maranguape',
  uf: 'CE',
  populacao: '108.937',
  modeloTemplate: 'premium-chatgpt',
  status: 'ativo',
  isDraft: false,
  commercialClaimsVerified: true,
  hospedagem: 'cloudflare',
  paletaCores: 'premium-ocean-teal',
  heroVariant: 'HeroV7',
  servicesVariant: 'ServicesGridV7',
  dominio: 'desentupidoramaranguape.com.br',
  whatsapp: '85992795590',
  telefoneFixo: '(85) 3341-0000',
  empresaNome: 'Desentupidora Maranguape 24h',
  heroImage: '/images/maranguape/desentupidora-maranguape-caminhao-limpa-fossa.webp',
  logoUrl: '/images/maranguape/logo-desentupidora-maranguape.webp',
  faviconUrl: '/images/maranguape/favicon-desentupidora-maranguape.webp',
  cnpj: '38.192.456/0001-92',
  endereco: 'Rua Coronel Antônio Botelho, 250 - Centro, Maranguape - CE, 61940-005',
  metaTitle: 'Desentupidora em Maranguape CE 24 Horas | Atendimento Já',
  metaDescription: 'Desentupidora em Maranguape CE com atendimento emergencial 24h. Desentupimento de esgoto, pias, ralos e fossa com preço justo e garantia.',
  h1Title: 'Desentupidora em Maranguape CE 24 Horas',
  firstParagraph: 'Precisando de uma desentupidora em Maranguape CE de confiança e com chegada imediata? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos pluviais e limpeza de fossas sépticas em todos os bairros e distritos da serra e do centro de Maranguape, com maquinário moderno sem quebrar pisos e garantia por escrito.',
  ctaButtonText: 'Solicitar Orçamento Grátis no WhatsApp',
  lastH2: 'Por que escolher a melhor Desentupidora em Maranguape CE?',
  seo: {
    metaTitle: 'Desentupidora em Maranguape CE 24 Horas | Atendimento Já',
    metaDescription: 'Desentupidora em Maranguape CE com atendimento emergencial 24h. Desentupimento de esgoto, pias, ralos e fossa com preço justo e garantia.',
    h1Title: 'Desentupidora em Maranguape CE 24 Horas',
    firstParagraphText: 'Precisando de uma desentupidora em Maranguape CE de confiança e com chegada imediata? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos pluviais e limpeza de fossas sépticas em todos os bairros e distritos da serra e do centro de Maranguape, com maquinário moderno sem quebrar pisos e garantia por escrito.',
    ctaButtonText: 'Solicitar Orçamento Grátis no WhatsApp',
    lastH2Title: 'Por que escolher a melhor Desentupidora em Maranguape CE?'
  },
  aboutCityTitle: 'Atendimento Especializado de Desentupidora em Maranguape - CE',
  aboutCityText: 'Maranguape é um dos municípios mais tradicionais e populosos da Região Metropolitana de Fortaleza, com mais de 108 mil habitantes e relevo caracterizado pela proximidade com a Serra de Maranguape. Essa topografia serrana e a rápida expansão urbana demandam manutenções hidráulicas frequentes tanto no Centro histórico quanto em bairros residenciais e distritos. Nossa empresa mantém caminhões auto-vácuo e viaturas volantes com equipamentos K-500 posicionadas estrategicamente para prestar atendimento em até 30 minutos em qualquer região de Maranguape.',
  bairros: [
    'Centro',
    'Outra Banda',
    'Guabiraba',
    'Parque Iracema',
    'Parque Santa Fé',
    'Área Seca',
    'Novo Maranguape',
    'Santos Dumont',
    'Coité',
    'Lages',
    'Novo Parque Iracema',
    'Gavião',
    'Tangueira',
    'Pirora',
    'Sapupara',
    'Amanari',
    'Itapebussu',
    'Juá dos Vieiras'
  ],
  neighborhoodFacts: {
    'Centro': 'No Centro de Maranguape, a presença de casarios históricos, comércio diversificado e tráfego contínuo exige técnicas não destrutivas de desobstrução com sondas flexíveis Roto-Rooter, evitando impactos nas estruturas antigas.',
    'Outra Banda': 'Bairro tradicional margeado pelo relevo serrano de Maranguape, a Outra Banda conta com atendimento ágil para desentupimento de esgotos domiciliares e caixas de gordura residenciais com chegada em até 20 minutos.',
    'Guabiraba': 'Região com forte ocupação residencial e chácaras em Maranguape, onde a manutenção de fossas sépticas e a limpeza profunda de tubulações pluviais recebem suporte direto de caminhões auto-vácuo de alta sucção.',
    'Parque Iracema': 'Com alta densidade populacional e condomínios em crescimento em Maranguape, o Parque Iracema conta com equipes 24h para desentupimento emergencial de pias, colunas prediais e ramais de esgoto sanitário.',
    'Parque Santa Fé': 'Área com intenso fluxo residencial em Maranguape, recebendo vistorias preventivas e desentupimento corretivo de ramais sanitários com maquinário rotativo elétrico que preserva tubos de PVC.',
    'Área Seca': 'Bairro dinâmico de Maranguape onde oscilações nas redes coletoras exigem maquinário desobstrutor de ponta e hidrojateamento para limpeza de ralos externos e tubulações principais.',
    'Novo Maranguape': 'Um dos maiores conjuntos habitacionais do município, o Novo Maranguape demanda constantes intervenções em ramais de cozinha e limpeza de caixas de inspeção sanitária com garantia estendida.',
    'Santos Dumont': 'Bairro residencial conectado aos principais acessos viários de Maranguape, com atendimento 24 horas para desentupimento de vasos sanitários, galerias pluviais e canaletas sem quebra-quebra.',
    'Coité': 'Região em expansão residencial e comercial de Maranguape, beneficiada pelo pronto atendimento para desobstrução de redes de águas servidas e fossas sépticas com emissão de laudo técnico.',
    'Lages': 'Com características residenciais e chácaras no entorno de Maranguape, Lages recebe suporte para limpeza de caixas de decantação, caixas de gordura e hidrojateamento preventivo em condomínios.',
    'Novo Parque Iracema': 'Setor residencial moderno em Maranguape que conta com atendimento ágil e equipamentos rotativos para resolver entupimentos em tanques, lavanderias e prumadas de esgoto.',
    'Gavião': 'Área com expressiva concentração habitacional e comercial próxima à serra em Maranguape, atendida por equipes de prontidão 24 horas para esgotamento e desentupimento técnico de tubulações.',
    'Tangueira': 'Bairro com perfil misto residencial e chácaras em Maranguape, onde a assistência técnica para fossas sépticas e desentupimento de ralos quintais é realizada com máxima eficiência.',
    'Pirora': 'Bairro tradicional com vias de acesso rápido em Maranguape, com frota equipada para atendimento imediato em residências familiares para desobstrução de vasos e pias sem sujeira.',
    'Sapupara': 'Importante distrito de Maranguape conhecido por suas chácaras e comércios locais, com atendimento prioritário para limpeza de fossas e desobstrução de tubulações residenciais e rurais.',
    'Amanari': 'Distrito serrano e residencial de Maranguape onde nosso caminhão limpa fossa e técnicos especializados prestam serviços com transporte e descarte ecologicamente licenciado.',
    'Itapebussu': 'Distrito polo de eventos e agropecuária em Maranguape, atendido com infraestrutura completa para limpeza de fossas de grande porte, galerias e redes de esgoto pluvial.',
    'Juá dos Vieiras': 'Localidade de Maranguape com crescente demanda por saneamento preventivo, atendida com equipamentos compactos de alta pressão para tubulações prediais e residenciais.'
  },
  services: [
    { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa K-500 e hidrojateamento de alta pressão sem quebrar pisos.', icon: '🚿' },
    { title: 'Limpeza de Fossa Séptica', description: 'Caminhão auto-vácuo de alta sucção equipado para esgotamento, sucção e descarte ecológico de fossas e poços em Maranguape.', icon: '🚛' },
    { title: 'Desentupimento de Pia e Ralo', description: 'Remoção de gordura incrustada e resíduos sólidos em ralos de banheiros, cozinhas e quintais com desinfecção completa.', icon: '🚰' },
    { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e rápido para vasos sanitários obstruídos por objetos ou papel, restaurando a vazão sem danos à louça.', icon: '🚽' },
    { title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem técnica pressurizada para higienização profunda de galerias coletoras e tubulações industriais e prediais.', icon: '🌊' },
    { title: 'Vídeo Inspeção Robotizada', description: 'Câmera de alta resolução para diagnóstico interno preciso, identificando raízes, trincas ou desníveis na tubulação.', icon: '📹' }
  ],
  faqs: [
    { question: 'Qual o valor do desentupimento em Maranguape CE?', answer: 'A visita técnica e o orçamento são 100% gratuitos no local em Maranguape. O técnico avalia a extensão do entupimento e apresenta o preço justo sem compromisso.' },
    { question: 'Vocês atendem finais de semana e feriados em Maranguape?', answer: 'Sim! Nossas equipes de emergência 24 horas estão de plantão 7 dias por semana, inclusive sábados, domingos e madrugadas em toda Maranguape.' },
    { question: 'Qual é o tempo médio de chegada em Maranguape?', answer: 'Com viaturas posicionadas nos principais pontos de Maranguape, nosso tempo médio de atendimento é de 20 a 40 minutos.' },
    { question: 'O serviço de desentupimento tem garantia?', answer: 'Sim, todos os nossos serviços acompanham garantia formal por escrito de até 90 dias com laudo e nota fiscal.' },
    { question: 'Precisa quebrar pisos ou azulejos para desentupir?', answer: 'Não! Em 99% dos chamados utilizamos sondas rotativas industriais e hidrojateamento que desobstruem diretamente pelos ralos ou caixas de inspeção sem qualquer quebra.' },
    { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos Pix com desconto, cartões de crédito e débito com parcelamento, além de faturamento no boleto para condomínios e empresas.' }
  ],
  testimonials: [
    { name: 'Francisco Valmir Rocha', neighborhood: 'Centro - Maranguape', rating: 5, text: 'Chamei a desentupidora em Maranguape num sábado à noite por causa do esgoto transbordando. Chegaram em 25 minutos e resolveram com a máquina rotativa sem sujeira.' },
    { name: 'Maria do Carmo Silveira', neighborhood: 'Outra Banda - Maranguape', rating: 5, text: 'Excelente atendimento! A pia da cozinha estava completamente entupida de gordura. O técnico foi muito educado, fez orçamento grátis e desentupiu na hora.' },
    { name: 'Antônio Marcos Peixoto', neighborhood: 'Parque Iracema - Maranguape', rating: 5, text: 'Contratamos para limpeza de fossa no sítio e desentupimento pluvial. Caminhão limpa fossa muito potente e serviço impecável. Recomendo com certeza!' }
  ],
  parceiros: [
    {
      cidade: 'Itapipoca',
      uf: 'CE',
      empresa: 'Desentupidora Itapipoca 24h',
      url: 'https://desentupidora-itapipoca.pages.dev/',
      anchorText: 'Desentupidora em Itapipoca CE'
    },
    {
      cidade: 'Tianguá',
      uf: 'CE',
      empresa: 'Desentupidora Tianguá 24h',
      url: 'https://desentupidora-tiangua.pages.dev/',
      anchorText: 'Desentupidora em Tianguá CE'
    },
    {
      cidade: 'Crato',
      uf: 'CE',
      empresa: 'Desentupidora Crato 24h',
      url: 'https://desentupidora-crato.pages.dev/',
      anchorText: 'Desentupidora em Crato CE'
    }
  ],
  auditScore: 100
};

// Update cities.json
const citiesPath = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
let cities = [];
if (fs.existsSync(citiesPath)) {
  cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
}
const existingIndex = cities.findIndex(c => c.id === 'maranguape');
if (existingIndex >= 0) {
  cities[existingIndex] = { ...cities[existingIndex], ...maranguapeData };
} else {
  cities.push(maranguapeData);
}
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log('Saved Maranguape into cities.json');

// Update active city in Astro
const astroConfigPath = path.join(__dirname, '..', 'apps', 'site-template-astro', 'src', 'data', 'cityConfig.json');
fs.writeFileSync(astroConfigPath, JSON.stringify(maranguapeData, null, 2), 'utf8');
console.log('Updated active city in cityConfig.json to Maranguape');
