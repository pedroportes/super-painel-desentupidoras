const fs = require('fs');
const path = require('path');

const CITIES_FILE = path.join(__dirname, '../apps/web-dashboard/data/cities.json');
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf8'));

const primaveradoleste = {
  id: "primaveradoleste",
  slug: "primaveradoleste",
  cidade: "Primavera do Leste",
  uf: "MT",
  populacao: "96.006",
  ddd: "66",
  phone: "(66) 3498-1250",
  telefoneFixo: "(66) 3498-1250",
  whatsapp: "6634981250",
  status: "ativo",
  hospedagem: "cloudflare",
  dominio: "desentupidora-primaveradoleste.pages.dev",
  deployUrl: "https://desentupidora-primaveradoleste.pages.dev",
  modeloTemplate: "condominio-proativo",
  paletaCores: "azul-tecnico",
  heroVariant: "v4",
  servicesVariant: "v2",
  metaTitle: "Desentupidora em Primavera do Leste MT 24h",
  metaDescription: "Desentupidora 24h em Primavera do Leste MT. Desentupimento de esgoto, pias, ralos e hidrojateamento com orçamento grátis e chegada rápida.",
  h1Title: "Desentupidora em Primavera do Leste MT 24 Horas",
  firstParagraph: "Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos sanitários e limpeza de fossas com caminhão auto-vácuo em todos os bairros de Primavera do Leste MT.",
  heroTitle: "Desentupidora em Primavera do Leste MT 24 Horas",
  heroSubtitle: "Atendimento imediato e especializado em desentupimento de esgotos, pias, ralos, vasos e limpeza de fossas em todos os bairros de Primavera do Leste.",
  lastH2: "Atendimento Emergencial 24h em Primavera do Leste MT",
  ctaButtonText: "Chamar no WhatsApp (66) 3498-1250",
  heroImage: "/images/primaveradoleste/desentupidora-primaveradoleste-caminhao-limpa-fossa.webp",
  logoUrl: "/images/primaveradoleste/logo-desentupidora-primaveradoleste.webp",
  logoImage: "/images/primaveradoleste/logo-desentupidora-primaveradoleste.webp",
  faviconUrl: "/images/primaveradoleste/favicon-desentupidora-primaveradoleste.webp",
  faviconImage: "/images/primaveradoleste/favicon-desentupidora-primaveradoleste.webp",
  logoHeight: 64,
  name: "Primavera do Leste",
  nomeFantasia: "Desentupidora Primavera do Leste",
  empresaNome: "Desentupidora Primavera do Leste",
  cnpj: "",
  endereco: "",
  latitude: "-15.5586",
  longitude: "-54.2961",
  geoCoordinates: "-15.5586, -54.2961",
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
    "Centro",
    "Primavera II",
    "Parque Castelândia",
    "Poncho Verde",
    "Jardim Riva",
    "Jardim Progresso",
    "Jardim Eldorado",
    "Distrito Industrial José de Alencar",
    "Vila Bela Vista",
    "Primavera III",
    "Jardim das Américas",
    "Buritis",
    "Pioneiro",
    "Três Américas",
    "São José",
    "Vertente das Águas"
  ],
  neighborhoods: [
    "Centro",
    "Primavera II",
    "Parque Castelândia",
    "Poncho Verde",
    "Jardim Riva",
    "Jardim Progresso",
    "Jardim Eldorado",
    "Distrito Industrial José de Alencar",
    "Vila Bela Vista",
    "Primavera III",
    "Jardim das Américas",
    "Buritis",
    "Pioneiro",
    "Três Américas",
    "São José",
    "Vertente das Águas"
  ],
  neighborhoodFacts: {
    "Centro": "Área comercial e financeira de Primavera do Leste com alto fluxo de pedestres, restaurantes e agências bancárias que exigem manutenção periódica preventiva em caixas de gordura e ramais de esgoto.",
    "Primavera II": "Bairro residencial tradicional com residências amplas e condomínios, onde o atendimento para desentupimento de ralos, pias e vasos sanitários é realizado com maquinário rotativo sem quebrar pisos.",
    "Parque Castelândia": "Região com grande concentração residencial e comércios locais de bairro, demandando esgotamento preventivo de fossas sépticas e desobstrução de tubulações primárias.",
    "Poncho Verde": "Bairro em contínua expansão com novas construções unifamiliares, necessitando de desentupimento de redes de esgoto e galerias de águas pluviais após fortes chuvas no cerrado.",
    "Jardim Riva": "Área nobre de alto padrão com modernos condomínios horizontais, onde o serviço de hidrojateamento técnico e limpeza preventiva de colunas prediais é frequente.",
    "Distrito Industrial José de Alencar": "Polo agroindustrial e logístico que abriga armazéns, transportadoras e processadoras de grãos, exigindo caminhão auto-vácuo de alta capacidade para lavagem de tanques e caixas de decantação.",
    "Jardim Eldorado": "Bairro consolidado com vias de fácil acesso, garantindo deslocamento rápido de nossas equipes de emergência 24h para socorrer transbordamentos de esgoto.",
    "Primavera III": "Setor residencial populoso onde atuamos com maquinário elétrico K-500 e sondagem técnica para eliminar raízes e incrustações em redes coletoras domésticas."
  },
  services: [
    {
      id: "esgoto",
      title: "Desentupimento de Esgoto",
      shortDescription: "Desobstrução completa de redes coletoras e ramais primários com cabos espirais rotativos K-500.",
      icon: "pipe"
    },
    {
      id: "fossa",
      title: "Limpeza de Fossa Séptica",
      shortDescription: "Esgotamento e sucção técnica de efluentes com caminhão auto-vácuo e descarte em estação licenciada.",
      icon: "truck"
    },
    {
      id: "vaso",
      title: "Desentupimento de Vaso Sanitário",
      shortDescription: "Remoção segura de obstruções em vasos sanitários sem riscar a louça ou quebrar revestimentos.",
      icon: "toilet"
    },
    {
      id: "pia-ralo",
      title: "Desentupimento de Pia e Ralo",
      shortDescription: "Raspagem interna de sifões, caixas de gordura e ramais de água servida com eliminação de odores.",
      icon: "sink"
    },
    {
      id: "hidrojateamento",
      title: "Hidrojateamento de Alta Pressão",
      shortDescription: "Limpeza e lavagem industrial e predial de tubulações com jatos pressurizados de alta vazão.",
      icon: "water"
    },
    {
      id: "aguas-pluviais",
      title: "Desentupimento de Águas Pluviais",
      shortDescription: "Limpeza profunda de calhas, canaletas e galerias pluviais para evitar refluxos e alagamentos.",
      icon: "cloud-rain"
    }
  ],
  testimonials: [
    {
      name: "Rodrigo Mendonça",
      neighborhood: "Jardim Riva",
      role: "Morador do Jardim Riva",
      text: "Excelente atendimento no Jardim Riva! A tubulação da cozinha entupiu no domingo e a equipe chegou em 25 minutos. Resolveram tudo sem sujeira.",
      content: "Excelente atendimento no Jardim Riva! A tubulação da cozinha entupiu no domingo e a equipe chegou em 25 minutos. Resolveram tudo sem sujeira.",
      rating: 5
    },
    {
      name: "Alessandra Toledo",
      neighborhood: "Centro",
      role: "Gerente Comercial no Centro",
      text: "Tivemos um problema grave no esgoto do nosso restaurante no Centro. O serviço de hidrojato foi rápido, eficiente e com preço muito justo.",
      content: "Tivemos um problema grave no esgoto do nosso restaurante no Centro. O serviço de hidrojato foi rápido, eficiente e com preço muito justo.",
      rating: 5
    },
    {
      name: "Marcos Paulo Silveira",
      neighborhood: "Distrito Industrial José de Alencar",
      role: "Supervisor de Logística no Distrito Industrial",
      text: "Contratamos a limpeza da fossa e caixas de retenção do nosso galpão logístico. Equipe profissional com caminhão a vácuo moderno e pontual.",
      content: "Contratamos a limpeza da fossa e caixas de retenção do nosso galpão logístico. Equipe profissional com caminhão a vácuo moderno e pontual.",
      rating: 5
    }
  ],
  faqs: [
    {
      question: "Qual o tempo médio de chegada em Primavera do Leste MT?",
      answer: "Nossas viaturas operacionais circulam estrategicamente por Primavera do Leste, garantindo atendimento ágil entre 20 e 40 minutos em qualquer bairro ou distrito."
    },
    {
      question: "O orçamento e a visita técnica são gratuitos?",
      answer: "Sim! Avaliamos o local sem qualquer custo de deslocamento ou cobrança de visita técnica em Primavera do Leste MT."
    },
    {
      question: "Vocês atendem fazendas e galpões do Distrito Industrial aos fins de semana?",
      answer: "Sim, mantemos equipes de plantão 24 horas ininterruptas, incluindo sábados, domingos e feriados para residências, comércios e indústrias."
    },
    {
      question: "Como é feito o desentupimento sem danificar pisos ou encanamentos?",
      answer: "Utilizamos máquinas elétricas com molas flexíveis e ponteiras especiais ou hidrojateamento pressurizado, que desobstruem por dentro dos canos sem quebrar alvenaria."
    }
  ],
  aboutCityTitle: "Desentupidora em Primavera do Leste - Mato Grosso",
  aboutCityText: "Primavera do Leste é um dos principais polos agroindustriais e logísticos de Mato Grosso, destacando-se pela intensa produção de grãos e acelerada expansão urbana e comercial. Com novos loteamentos residenciais, condomínios fechados e amplo parque fabril, a manutenção preventiva e corretiva de redes coletoras de esgoto, caixas de gordura e fossas sépticas é fundamental. Nossa base operacional no município dispõe de caminhões combinados auto-vácuo e maquinários rotativos para atender emergências 24 horas em qualquer bairro da cidade.",
  cityFacts: [
    "Destaque nacional na produção de soja, milho e algodão com forte parque agroindustrial.",
    "Cidade jovem e planejada no leste mato-grossense com acelerado crescimento demográfico e imobiliário.",
    "Entroncamento logístico estratégico com malha rodoviária que liga o Centro-Oeste ao Norte do Brasil."
  ],
  citySources: [
    "IBGE",
    "Prefeitura Municipal de Primavera do Leste",
    "Famato"
  ],
  parceiros: [
    {
      cidade: "Tangará da Serra",
      uf: "MT",
      url: "https://desentupidoratangaradaserra.com.br",
      anchor: "Desentupidora em Tangará da Serra MT"
    },
    {
      cidade: "Mineiros",
      uf: "GO",
      url: "https://desentupidora-mineiros.pages.dev",
      anchor: "Desentupidora em Mineiros GO"
    }
  ],
  lastDeployAt: null
};

const idx = cities.findIndex(c => c.id === 'primaveradoleste');
if (idx >= 0) {
  cities[idx] = { ...cities[idx], ...primaveradoleste };
} else {
  cities.push(primaveradoleste);
}

fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf8');
console.log('Primavera do Leste registrada com sucesso em cities.json!');
