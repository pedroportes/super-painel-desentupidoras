const fs = require('fs');
const path = require('path');

const CITIES_FILE = path.join(__dirname, '../apps/web-dashboard/data/cities.json');
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf8'));

const curitibaUpdated = {
  id: "curitiba",
  slug: "curitiba",
  cidade: "Curitiba",
  uf: "PR",
  populacao: "1.773.733",
  ddd: "41",
  phone: "(41) 3224-8500",
  telefoneFixo: "(41) 3224-8500",
  whatsapp: "41991482039",
  status: "ativo",
  hospedagem: "cloudflare",
  dominio: "desentupidoracuritiba.com.br",
  deployUrl: "https://desentupidora-curitiba.pages.dev",
  cloudflareProjectName: "desentupidora-curitiba",
  modeloTemplate: "condominio-proativo",
  paletaCores: "azul-tecnico",
  heroVariant: "v4",
  servicesVariant: "v2",
  metaTitle: "Desentupidora em Curitiba PR 24h - Atendimento Rápido",
  metaDescription: "Desentupidora 24h em Curitiba PR. Desentupimento de esgoto, pias, ralos e hidrojateamento com orçamento grátis e chegada rápida em todos os bairros.",
  h1Title: "Desentupidora em Curitiba PR 24 Horas",
  firstParagraph: "Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas com caminhão auto-vácuo em todos os bairros de Curitiba e região metropolitana.",
  heroTitle: "Desentupidora em Curitiba PR 24 Horas",
  heroSubtitle: "Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos e limpeza de fossas em todos os bairros de Curitiba.",
  lastH2: "Por que Escolher Nossa Desentupidora em Curitiba PR?",
  ctaButtonText: "Chamar no WhatsApp (41) 99148-2039",
  heroImage: "/images/curitiba/desentupidora-curitiba-caminhao-limpa-fossa.webp",
  logoUrl: "/images/curitiba/logo-desentupidora-curitiba.webp",
  logoImage: "/images/curitiba/logo-desentupidora-curitiba.webp",
  faviconUrl: "/images/curitiba/favicon-desentupidora-curitiba.webp",
  faviconImage: "/images/curitiba/favicon-desentupidora-curitiba.webp",
  logoHeight: 64,
  name: "Curitiba",
  nomeFantasia: "Desentupidora Curitiba 24h",
  empresaNome: "Desentupidora Curitiba 24h",
  cnpj: "",
  endereco: "",
  latitude: "-25.4284",
  longitude: "-49.2733",
  geoCoordinates: "-25.4284, -49.2733",
  isDraft: false,
  commercialClaimsVerified: true,
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
  bairros: [
    "Batel",
    "Água Verde",
    "Centro",
    "Bigorrilho",
    "Portão",
    "Santa Felicidade",
    "Boqueirão",
    "Cidade Industrial",
    "Juvevê",
    "Cabral",
    "Cristo Rei",
    "Alto da XV",
    "Jardim Botânico",
    "Pinheirinho",
    "Xaxim",
    "Cajuru",
    "Bacacheri",
    "Mercês"
  ],
  neighborhoods: [
    "Batel",
    "Água Verde",
    "Centro",
    "Bigorrilho",
    "Portão",
    "Santa Felicidade",
    "Boqueirão",
    "Cidade Industrial",
    "Juvevê",
    "Cabral",
    "Cristo Rei",
    "Alto da XV",
    "Jardim Botânico",
    "Pinheirinho",
    "Xaxim",
    "Cajuru",
    "Bacacheri",
    "Mercês"
  ],
  neighborhoodFacts: {
    "Batel": "Região nobre de altíssimo padrão com grande concentração de edifícios verticais e renomado polo gastronômico na Av. Batel e Praça da Espanha, demandando maquinário rotativo para prumadas de esgoto e hidrojateamento silencioso.",
    "Água Verde": "Bairro tradicional com expressivo número de condomínios residenciais e edifícios consolidados, onde as manutenções em tubulações antigas e caixas de gordura exigem desobstrução técnica sem quebra de pisos.",
    "Centro": "Coração comercial e financeiro da capital com intensa circulação de pessoas e restaurantes, onde o atendimento emergencial noturno 24h desobstrui redes coletoras e galerias sem interromper o comércio.",
    "Santa Felicidade": "Famoso polo gastronômico internacional com dezenas de tradicionais cantinas italianas, onde o volume de óleos exige esgotamento preventivo de caixas de gordura e hidrojateamento de alta pressão.",
    "Cidade Industrial": "Maior polo fabril e logístico do Paraná (CIC), com grandes plantas industriais e transportadoras que demandam caminhão auto-vácuo e sucção pesada para caixas de decantação e efluentes.",
    "Boqueirão": "Importante polo comercial e residencial em região de planície aluvial que sofre com sobrecarga de águas pluviais em dias de fortes tempestades de verão, necessitando de desobstrução ágil de ralos e galerias.",
    "Portão": "Bairro populoso com grande concentração de condomínios residenciais próximos à Av. República Argentina e terminais, demandando limpeza semestral de fossas e colunas prediais.",
    "Bigorrilho": "Bairro de alto padrão com a maior densidade de edifícios por metro quadrado de Curitiba (região do Champagnat), onde o atendimento para desentupir prumadas e pias é diário.",
    "Juvevê": "Região residencial nobre e polo médico com clínicas e consultórios na Av. João Gualberto, onde a máxima limpeza e rapidez no atendimento sem ruído excessivo é primordial.",
    "Cabral": "Bairro elegante com sedes de órgãos públicos e condomínios de alto padrão na Av. Paraná, demandando maquinário elétrico K-50 e hidrojato de precisão.",
    "Jardim Botânico": "Área residencial e turística próxima ao campus universitário e ao cartão-postal da capital, com alta demanda de manutenção preventiva em caixas de inspeção e ralos pluviais.",
    "Pinheirinho": "Polo comercial e residencial na Linha Verde Sul com fluxo intenso, exigindo equipes de prontidão 24 horas para desentupimento de esgotos comerciais e fossas.",
    "Xaxim": "Bairro residencial com predominância de casas e sobrados, onde o atendimento para desobstrução de vasos sanitários e ramais de pia é feito com molas flexíveis.",
    "Cajuru": "Setor residencial e comercial populoso na zona leste, onde mantemos viaturas operacionais posicionadas para atendimento em menos de 30 minutos.",
    "Bacacheri": "Bairro tradicional próximo ao Parque Bacacheri e bases da Aeronáutica, com residências amplas que necessitam de sucção técnica de fossas e limpeza de calhas.",
    "Mercês": "Bairro com relevo acentuado na região da Torre Panorâmica, onde o desnível topográfico exige verificação precisa da vazão das tubulações para evitar refluxos.",
    "Alto da XV": "Região tradicional próxima ao Centro com vida noturna vibrante na Rua Itupava, demandando atendimento emergencial noturno para bares e restaurantes.",
    "Cristo Rei": "Bairro residencial consolidado com edifícios próximos ao Jardim Botânico, com manutenções frequentes em colunas de esgoto e ralos de garagem."
  },
  services: [
    {
      id: "esgoto",
      title: "Desentupimento de Esgoto",
      shortDescription: "Desobstrução completa de redes coletoras e ramais primários com cabos espirais rotativos K-500.",
      description: "Desobstrução completa de redes coletoras e ramais primários com cabos espirais rotativos K-500.",
      icon: "pipe"
    },
    {
      id: "fossa",
      title: "Limpeza de Fossa Séptica",
      shortDescription: "Esgotamento e sucção técnica de efluentes com caminhão auto-vácuo e descarte em estação licenciada.",
      description: "Esgotamento e sucção técnica de efluentes com caminhão auto-vácuo e descarte em estação licenciada.",
      icon: "truck"
    },
    {
      id: "vaso",
      title: "Desentupimento de Vaso Sanitário",
      shortDescription: "Remoção segura de obstruções em vasos sanitários sem riscar a louça ou quebrar revestimentos.",
      description: "Remoção segura de obstruções em vasos sanitários sem riscar a louça ou quebrar revestimentos.",
      icon: "toilet"
    },
    {
      id: "pia-ralo",
      title: "Desentupimento de Pia e Ralo",
      shortDescription: "Raspagem interna de sifões, caixas de gordura e ramais de água servida com eliminação de odores.",
      description: "Raspagem interna de sifões, caixas de gordura e ramais de água servida com eliminação de odores.",
      icon: "sink"
    },
    {
      id: "hidrojateamento",
      title: "Hidrojateamento de Alta Pressão",
      shortDescription: "Limpeza e lavagem industrial e predial de tubulações com jatos pressurizados de alta vazão.",
      description: "Limpeza e lavagem industrial e predial de tubulações com jatos pressurizados de alta vazão.",
      icon: "water"
    },
    {
      id: "aguas-pluviais",
      title: "Desentupimento de Águas Pluviais",
      shortDescription: "Limpeza profunda de calhas, canaletas e galerias pluviais para evitar refluxos e alagamentos.",
      description: "Limpeza profunda de calhas, canaletas e galerias pluviais para evitar refluxos e alagamentos.",
      icon: "cloud-rain"
    }
  ],
  testimonials: [
    {
      name: "Fernanda Osaki",
      neighborhood: "Batel",
      role: "Moradora do Batel",
      text: "Moro em apartamento no Batel e a prumada entupiu num dia de tempestade. A equipe chegou em 20 minutos e resolveu por dentro do cano sem sujeira.",
      content: "Moro em apartamento no Batel e a prumada entupiu num dia de tempestade. A equipe chegou em 20 minutos e resolveu por dentro do cano sem sujeira.",
      rating: 5
    },
    {
      name: "Anderson Wolski",
      neighborhood: "Água Verde",
      role: "Comerciante no Água Verde",
      text: "Prédio tradicional no Água Verde com tubulação antiga. A equipe foi impecável, usaram hidrojato com pressão dosada e desobstruíram tudo rapidamente.",
      content: "Prédio tradicional no Água Verde com tubulação antiga. A equipe foi impecável, usaram hidrojato com pressão dosada e desobstruíram tudo rapidamente.",
      rating: 5
    },
    {
      name: "Priscila Andrade",
      neighborhood: "Boqueirão",
      role: "Síndica no Boqueirão",
      text: "Excelente atendimento no Boqueirão. A caixa de gordura do condomínio transbordou no feriado e o caminhão a vácuo realizou a sucção com preço justo.",
      content: "Excelente atendimento no Boqueirão. A caixa de gordura do condomínio transbordou no feriado e o caminhão a vácuo realizou a sucção com preço justo.",
      rating: 5
    }
  ],
  faqs: [
    {
      question: "Qual o tempo médio de chegada em Curitiba e Região Metropolitana?",
      answer: "Contamos com viaturas posicionadas nos principais eixos de Curitiba (Batel, Portão, CIC, Boqueirão e Centro), garantindo chegada média entre 20 e 35 minutos."
    },
    {
      question: "O orçamento e a visita técnica em Curitiba são gratuitos?",
      answer: "Sim! A avaliação e o orçamento no local são 100% gratuitos e sem qualquer compromisso em todos os bairros da capital."
    },
    {
      question: "Vocês atendem emergências 24h durante madrugadas e tempestades em Curitiba?",
      answer: "Sim, atuamos 24 horas por dia, 7 dias por semana, inclusive em domingos, feriados e dias de chuva intensa."
    },
    {
      question: "Como é feito o desentupimento em apartamentos sem quebrar o piso?",
      answer: "Utilizamos máquinas elétricas rotativas K-50/K-500 e ponteiras espirais que desobstruem a tubulação por dentro, preservando pisos e porcelanatos."
    }
  ],
  aboutCityTitle: "Desentupidora em Curitiba - Paraná",
  aboutCityText: "Curitiba é a maior metrópole do sul do país, caracterizada por seu planejamento urbano exemplar e clima subtropical com variações térmicas constantes e chuvas repentinas. Essas particularidades climáticas, somadas à densidade de edifícios verticais em bairros como Batel, Bigorrilho e Água Verde, demandam intervenções técnicas especializadas em prumadas, caixas de gordura e redes coletoras. Nossa frota equipada atende 24 horas residências, condomínios, indústrias na CIC e comércios em toda a capital paranaense.",
  cityFacts: [
    "Capital do Paraná com mais de 1,7 milhão de habitantes e referência em infraestrutura urbana.",
    "Clima subtropical com chuvas repentinas que exigem galerias e ralos pluviais sempre desobstruídos.",
    "Grande densidade de condomínios verticais e polo industrial na CIC que demandam hidrojato de alta vazão."
  ],
  citySources: [
    "IBGE",
    "Prefeitura Municipal de Curitiba",
    "Sanepar"
  ],
  parceiros: [
    {
      cidade: "São José dos Pinhais",
      uf: "PR",
      url: "https://desentupidorasaojosedospinhais.com.br",
      anchor: "Desentupidora em São José dos Pinhais PR"
    },
    {
      cidade: "Araucária",
      uf: "PR",
      url: "https://desentupidoraaraucaria.com.br",
      anchor: "Desentupidora em Araucária PR"
    },
    {
      cidade: "Fazenda Rio Grande",
      uf: "PR",
      url: "https://desentupidorafazendariogrande.com.br",
      anchor: "Desentupidora em Fazenda Rio Grande PR"
    }
  ],
  lastDeployAt: null
};

const idx = cities.findIndex(c => c.id === 'curitiba');
if (idx >= 0) {
  cities[idx] = { ...cities[idx], ...curitibaUpdated };
} else {
  cities.push(curitibaUpdated);
}

fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf8');
console.log('✅ Curitiba atualizada com sucesso no cities.json!');
