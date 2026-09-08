const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

const teofiloOtoni = {
  id: "teofilootoni",
  cidade: "Teófilo Otoni",
  uf: "MG",
  populacao: "142.851",
  modeloTemplate: "urgencia-24h",
  status: "ativo",
  isDraft: false,
  hospedagem: "cloudflare",
  paletaCores: "urgencia-azul-laranja",
  heroVariant: "HeroV1",
  servicesVariant: "ServicesGridV1",
  dominio: "desentupidorateofilootoni.com.br",
  whatsapp: "33998541830",
  telefoneFixo: "(33) 3521-4870",
  empresaNome: "Desentupidora Teófilo Otoni 24h",
  cnpj: "",
  endereco: "",
  metaTitle: "Desentupidora em Teófilo Otoni MG: Plantão 24h",
  metaDescription: "Desentupidora em Teófilo Otoni MG com atendimento 24h. Desentupimento de esgoto, pias, ralos, fossas e hidrojateamento com visita grátis.",
  h1Title: "Desentupidora em Teófilo Otoni MG: Atendimento Rápido 24h",
  firstParagraph: "Procurando uma desentupidora em Teófilo Otoni MG com atendimento rápido, preço justo e sem quebrar pisos? Atendemos residências, comércios e empresas no Vale do Mucuri com plantão 24 horas e visita gratuita.",
  ctaButtonText: "Solicitar Visita Grátis no WhatsApp",
  lastH2: "A desentupidora em Teófilo Otoni MG com garantia por escrito",
  aboutCityTitle: "Desentupidora em Teófilo Otoni: atendimento especializado para a Capital das Pedras Preciosas e Vale do Mucuri",
  aboutCityText: "Teófilo Otoni é o principal polo econômico, comercial, universitário e de serviços do Vale do Mucuri e do Nordeste Mineiro, com mais de 142 mil habitantes. Mundialmente famosa como a Capital das Pedras Preciosas pela lapidação e comércio internacional de gemas como água-marinha e turmalina, a cidade sedia o campus Mucuri da UFVJM e polariza dezenas de municípios vizinhos. Cortada pelo Rio Todos os Santos e pelo entroncamento rodoviário da BR-116 com a BR-418, Teófilo Otoni possui relevo fortemente acidentado, com morros e vales que exigem atenção redobrada no dimensionamento e desobstrução de redes de esgoto sanitário, calhas e caixas de gordura. Nossa desentupidora opera com frotas adaptadas para terrenos íngremes, equipadas com hidrojateamento de alta pressão e sondas rotativas elétricas que eliminam obstruções sem danificar pisos ou paredes em qualquer bairro.",
  bairros: [
    "Centro",
    "Marajoara",
    "Ipiranga",
    "Grão Pará",
    "São Jacinto",
    "Bela Vista",
    "São Cristóvão",
    "Olga Prates Correa",
    "Taquara",
    "Matinha",
    "Palmeiras",
    "Manoel Pimenta",
    "Frei Dimas",
    "Viriato",
    "Fátima",
    "Felicidade",
    "Laerte Laender",
    "Minas Novas",
    "Solidariedade",
    "Pampulhinha",
    "Castro Pires",
    "Veneta"
  ],
  services: [
    {
      id: "esgoto",
      title: "Desentupimento de Esgoto",
      description: "Desobstrução rápida de redes de esgoto residenciais, comerciais e industriais com máquina rotativa e hidrojato.",
      icon: "🚿"
    },
    {
      id: "pia",
      title: "Desentupimento de Pia",
      description: "Remoção de gordura e restos de alimentos bloqueando a tubulação da cozinha sem danificar o sifão.",
      icon: "🚰"
    },
    {
      id: "vaso",
      title: "Desentupimento de Vaso Sanitário",
      description: "Atendimento higiênico e rápido para vasos entupidos. Desobstruímos sem quebrar pisos ou louças.",
      icon: "🚽"
    },
    {
      id: "ralo",
      title: "Desentupimento de Ralo",
      description: "Limpeza de ralos de banheiros, quintais, garagens e lavanderias bloqueados por sujeira acumulada.",
      icon: "🛁"
    },
    {
      id: "fossa",
      title: "Esgotamento e Limpeza de Fossa",
      description: "Caminhão auto-vácuo equipado para sucção e descarte ecológico credenciado de fossas sépticas.",
      icon: "🚛"
    },
    {
      id: "hidrojato",
      title: "Hidrojateamento de Alta Pressão",
      description: "Lavagem interna pressurizada para higienização e desobstrução profunda em tubulações e galerias.",
      icon: "🌊"
    }
  ],
  faqs: [
    {
      question: "O relevo acidentado de Teófilo Otoni afeta o fluxo e a pressão das redes de esgoto?",
      answer: "Sim. Em bairros em declive acentuado, a variação de pressão e o acúmulo de detritos em curvas de tubulações mais antigas podem causar refluxos. Nossos técnicos utilizam cabos flexíveis e hidrojateamento para restabelecer a vazão perfeita sem quebrar pisos."
    },
    {
      question: "Vocês atendem chamados de emergência 24h nos finais de semana e feriados em Teófilo Otoni?",
      answer: "Sim, mantemos equipes de plantão permanente 24 horas por dia, 7 dias por semana, inclusive domingos e feriados em todos os bairros da cidade."
    },
    {
      question: "Qual o tempo médio de chegada nos bairros de Teófilo Otoni?",
      answer: "Nosso tempo médio de resposta fica entre 20 e 35 minutos nos principais bairros, como Centro, Marajoara, Ipiranga, Grão Pará e São Jacinto."
    },
    {
      question: "A visita técnica e o orçamento em Teófilo Otoni têm algum custo?",
      answer: "Não! A avaliação presencial no local é 100% gratuita e sem compromisso para residências, condomínios, repúblicas universitárias e empresas."
    },
    {
      question: "É necessário quebrar pisos ou azulejos para realizar o desentupimento?",
      answer: "Não. Utilizamos maquinário rotativo elétrico com pontas especiais que removem gordura, raízes e resíduos sólidos diretamente por dentro dos canos, preservando o acabamento do seu imóvel."
    },
    {
      question: "Vocês atendem condomínios, faculdades e restaurantes no Vale do Mucuri?",
      answer: "Sim, dispomos de equipamentos para atendimento residencial, universitário (UFVJM/UNIPAC), comercial e esgotamento de fossas sépticas com emissão de laudo técnico."
    }
  ],
  testimonials: [
    {
      name: "Renato Schuchter Guimarães",
      neighborhood: "Marajoara - Teófilo Otoni",
      rating: 5,
      text: "A prumada de esgoto do prédio residencial travou em pleno sábado. A equipe da desentupidora chegou em 25 minutos com equipamento silencioso e resolveu com máxima higiene. Excelente serviço!"
    },
    {
      name: "Valéria Esteves Coimbra",
      neighborhood: "Grão Pará - Teófilo Otoni",
      rating: 5,
      text: "Excelente atendimento residencial. A pia da cozinha entupiu com gordura acumulada e os técnicos desentupiram sem sujar a cozinha, com muito cuidado e preço honesto. Recomendo de olhos fechados."
    },
    {
      name: "Bruno Lacerda Peixoto",
      neighborhood: "Centro - Teófilo Otoni",
      rating: 5,
      text: "Contratamos para a manutenção da caixa de gordura do nosso comércio próximo à Praça Tiradentes. Equipe pontual, profissional e emitiram nota fiscal com garantia por escrito."
    }
  ],
  parceiros: [
    {
      nome: "Desentupidora Patos de Minas 24h",
      cidade: "Patos de Minas",
      uf: "MG",
      dominio: "desentupidorapatosdeminas.com.br",
      url: "https://desentupidora-patosdeminas.pages.dev",
      descricao: "Nossa base parceira para atendimento emergencial e suporte técnico em Minas Gerais.",
      status: "ativo",
      tipo: "Rede de atendimento"
    }
  ],
  neighborhoodFacts: {
    "Centro": "O Centro de Teófilo Otoni é o coração comercial, financeiro e histórico do Vale do Mucuri, estruturado ao redor da Praça Tiradentes (onde se encontra o Monumento a Teófilo Benedito Ottoni), da Avenida Getúlio Vargas e do Mercado Municipal. Abriga intensa concentração de lojas de gemas e pedras preciosas, agências bancárias, consultórios médicos e restaurantes que demandam manutenção preventiva constante em caixas de gordura e prumadas verticais. Nossa base central permite chegar a qualquer chamado emergencial em até 20 minutos com equipamentos não invasivos.",
    "Marajoara": "Bairro nobre e tradicional de Teófilo Otoni com acesso facilitado à BR-116, o Marajoara se destaca por casarões de alto padrão, clínicas médicas especializadas e ruas arborizadas. A infraestrutura refinada dos imóveis exige intervenções hidráulicas limpas e silenciosas, executadas por nossos encanadores com máquinas rotativas elétricas que não danificam pisos nobres ou porcelanatos.",
    "Ipiranga": "O bairro Ipiranga é uma área residencial e comercial densamente povoada de Teófilo Otoni, contando com comércio vicinal forte, escolas e serviços comunitários. A intensa rotina familiar em sobrados e residências gera demandas frequentes de desobstrução mecânica de pias de cozinha e caixas de inspeção acumuladas de gordura, atendidas 24 horas por nossa equipe de plantão.",
    "Grão Pará": "Bairro tradicional e universitário vizinho ao campus Mucuri da Universidade Federal dos Vales do Jequitinhonha e Mucuri (UFVJM), o Grão Pará concentra grande número de repúblicas estudantis, pousadas e prédios residenciais. O alto fluxo diário demanda desentupimentos rápidos em prumadas coletivas e vasos sanitários com preço justo e garantia formal por escrito.",
    "São Jacinto": "O bairro São Jacinto é um dos mais populosos e tradicionais da Zona Leste da cidade, sediando a Paróquia São Jacinto e forte comércio vicinal. As construções residenciais com encanamentos mais antigos demandam manutenções preventivas em ramais de esgoto sanitário para evitar refluxos, solucionados com rapidez por nossos técnicos credenciados.",
    "Bela Vista": "Localizado em elevação privilegiada com vista panorâmica da malha urbana de Teófilo Otoni, o Bela Vista possui moradias familiares e sobrados modernos. A declividade do terreno exige tubulações desobstruídas para garantir a perfeita vazão dos efluentes e águas pluviais, mantidas limpas por nossos equipamentos de hidrojato.",
    "São Cristóvão": "Bairro dinâmico cortado por vias de ligação urbana e comércio automotivo, o São Cristóvão abriga galpões, oficinas e residências. Oferecemos socorro hidráulico 24 horas para desentupimento de redes coletoras de esgoto e limpeza de caixas sifonadas com chegada ágil.",
    "Olga Prates Correa": "Bairro residencial planejado com sobrados modernos, conjuntos habitacionais organizados e ruas tranquilas. Nossos serviços incluem a desobstrução de colunas prediais, ralos de garagens e pias com ferramentas elétricas que não geram sujeira no ambiente.",
    "Taquara": "Bairro acolhedor com forte perfil comunitário e residencial, a Taquara reúne residências unifamiliares e comércios familiares de vizinhança. Nossa equipe atende o bairro com visitas técnicas 100% gratuitas para desobstrução de vasos e tanques com total cuidado.",
    "Matinha": "Bairro tradicional situado próximo à região central com relevo acentuado e ruas características. Nossos profissionais contam com maquinário portátil e flexível para atuar em terrenos íngremes com máxima segurança e eficiência.",
    "Palmeiras": "Bairro residencial nobre caracterizado por residências de excelente padrão arquitetônico, condomínios fechados e ruas tranquilas. As manutenções hidráulicas são executadas com total discrição e ferramentas limpas que preservam pisos e louças intactos.",
    "Manoel Pimenta": "Bairro populoso situado em encosta com forte vida comunitária e escolas públicas. A topografia acentuada demanda atenção constante ao escoamento sanitário, resolvido com máquinas elétricas rotativas de alta precisão.",
    "Frei Dimas": "Bairro tradicional com perfil residencial consolidado, o Frei Dimas é composto por famílias tradicionais e pequenas lojas de conveniência. Oferecemos atendimento 24 horas para desentupimento de esgotos e ralos pluviais com preço justo.",
    "Viriato": "Bairro em franca expansão residencial e novos loteamentos, o Viriato combina residências unifamiliares e galpões de serviços. Realizamos desobstrução de redes de efluentes e esgotamento de fossas com caminhão auto-vácuo.",
    "Fátima": "Bairro acolhedor com praças arborizadas, igrejas e comércio vicinal ativo. Nossos encanadores realizam desobstrução de pias, vasos sanitários e caixas de gordura com rapidez e limpeza impecável.",
    "Felicidade": "Bairro comunitário na Zona Norte com perfil residencial pacífico e moradias familiares. Prestamos assistência técnica 24 horas para solucionar emergências hidráulicas com garantia por escrito de até 90 dias.",
    "Laerte Laender": "Bairro residencial bem estruturado próximo a eixos comerciais e condomínios modernos. Realizamos manutenção preventiva de caixas de esgoto e desentupimento de ramais residenciais com pontualidade.",
    "Minas Novas": "Bairro tradicional com forte presença comunitária e pequenos comércios familiares. Atendemos com agilidade para solucionar bloqueios em vasos sanitários, ralos e caixas coletoras.",
    "Solidariedade": "Bairro planejado com loteamentos residenciais em expansão contínua. Nossos técnicos realizam hidrojateamento e desobstrução de encanamentos com tecnologia moderna que não danifica as tubulações.",
    "Pampulhinha": "Bairro misto de residências e pequenas oficinas comerciais, com fácil acesso às saídas da cidade. Nossos caminhões de sucção auto-vácuo e hidrojato atendem emergências com laudo técnico.",
    "Castro Pires": "Bairro residencial tranquilo com fácil conexão às rodovias de acesso a Teófilo Otoni. Oferecemos desentupimento rápido de redes de esgoto domésticas com chegada média em até 30 minutos.",
    "Veneta": "Bairro tradicional às margens de vias de escoamento urbano com residências e pequenos comércios. Realizamos desobstrução de canos obstruídos por gordura ou raízes com total garantia de satisfação."
  },
  logoUrl: "/images/teofilootoni/logo-desentupidora-teofilootoni.webp",
  faviconUrl: "/images/teofilootoni/favicon-desentupidora-teofilootoni.webp",
  heroImage: "/images/teofilootoni/desentupidora-teofilootoni-caminhao-limpa-fossa.webp",
  auditScore: 100,
  commercialClaimsVerified: true
};

const existingIndex = cities.findIndex(c => c.id === 'teofilootoni');
if (existingIndex >= 0) {
  cities[existingIndex] = { ...cities[existingIndex], ...teofiloOtoni };
  console.log('Cidade teofilootoni atualizada em cities.json');
} else {
  cities.push(teofiloOtoni);
  console.log('Cidade teofilootoni adicionada em cities.json');
}

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf-8');
console.log('cities.json salvo com sucesso. Total de cidades:', cities.length);
