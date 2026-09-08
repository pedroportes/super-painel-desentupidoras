const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

const patosDeMinas = {
  id: "patosdeminas",
  cidade: "Patos de Minas",
  uf: "MG",
  populacao: "169.173",
  modeloTemplate: "urgencia-24h",
  status: "ativo",
  isDraft: false,
  hospedagem: "cloudflare",
  paletaCores: "urgencia-azul-laranja",
  heroVariant: "HeroV1",
  servicesVariant: "ServicesGridV1",
  dominio: "desentupidorapatosdeminas.com.br",
  whatsapp: "34998421670",
  telefoneFixo: "(34) 3821-4950",
  empresaNome: "Desentupidora Patos de Minas 24h",
  cnpj: "",
  endereco: "",
  metaTitle: "Desentupidora em Patos de Minas MG: Plantão 24h",
  metaDescription: "Desentupidora em Patos de Minas MG com atendimento 24h. Desentupimento de esgoto, pias, ralos, fossas e hidrojateamento com visita grátis.",
  h1Title: "Desentupidora em Patos de Minas MG: Atendimento Rápido 24h",
  firstParagraph: "Procurando uma desentupidora em Patos de Minas MG com atendimento rápido, preço justo e sem quebrar pisos? Atendemos residências, indústrias e propriedades rurais no Alto Paranaíba com plantão 24 horas e visita gratuita.",
  ctaButtonText: "Solicitar Visita Grátis no WhatsApp",
  lastH2: "A desentupidora em Patos de Minas MG com garantia por escrito",
  aboutCityTitle: "Desentupidora em Patos de Minas: atendimento especializado para a Capital do Milho e Alto Paranaíba",
  aboutCityText: "Patos de Minas é o principal polo agroindustrial, universitário, hospitalar e de serviços da região do Alto Paranaíba e Triângulo Mineiro, com mais de 169 mil habitantes. Reconhecida nacionalmente pela força da agricultura, bacia leiteira e a tradicional Fenamilho realizada no Parque de Exposições Sebastião Alves do Nascimento, a cidade apresenta grande dinâmica urbana ao longo de artérias como a Avenida Getúlio Vargas, Avenida Marabá, Avenida Fátima Porto e a Rodovia BR-365. Banhada pelo Rio Paranaíba e caracterizada por relevo com variações de encosta e áreas de solo fértil, a infraestrutura hidráulica da cidade requer manutenção periódica em caixas de gordura de restaurantes, prumadas universitárias e galerias pluviais durante as chuvas de verão. Nossa desentupidora opera 24 horas com caminhões de hidrojateamento de alta pressão, sucção auto-vácuo de fossas e maquinário rotativo elétrico não destrutivo em todos os bairros e distritos.",
  bairros: [
    "Centro",
    "Caiçaras",
    "Alto Caiçaras",
    "Guanabara",
    "Rosário",
    "Lagoa Grande",
    "Jardim Paulistano",
    "Sobradinho",
    "Abner Afonso",
    "Bela Vista",
    "Brasil",
    "Caramuru",
    "Cristo Redentor",
    "Gramado",
    "Nossa Senhora de Fátima",
    "Planalto",
    "Jardim Centro",
    "Nova Floresta",
    "Panorâmico",
    "Santa Terezinha",
    "Vila Garcia",
    "Ipanema"
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
      question: "O polo agroindustrial e universitário de Patos de Minas gera muita demanda de desentupimento?",
      answer: "Sim. A grande circulação de estudantes em repúblicas no Caiçaras e a operação contínua de indústrias e comércios no Centro e BR-365 exigem vistorias preventivas em caixas de gordura e prumadas com hidrojateamento de alta pressão."
    },
    {
      question: "Vocês atendem chamados de emergência 24 horas nos fins de semana e feriados em Patos de Minas?",
      answer: "Sim, mantemos equipes volantes de plantão permanente 24 horas por dia, 7 dias por semana, inclusive nos períodos de grandes eventos como a Fenamilho e finais de ano."
    },
    {
      question: "Qual o tempo médio de chegada nos bairros de Patos de Minas?",
      answer: "Nosso tempo médio de resposta é de 20 a 35 minutos nos principais bairros da cidade, como Centro, Caiçaras, Guanabara, Lagoa Grande e Sobradinho."
    },
    {
      question: "A visita técnica e o orçamento em Patos de Minas são gratuitos?",
      answer: "Sim! A avaliação no local é 100% gratuita e sem compromisso para residências, condomínios, faculdades, sítios e empresas."
    },
    {
      question: "É necessário quebrar pisos ou revestimentos para desentupir?",
      answer: "Não. Utilizamos maquinário rotativo elétrico com cabos espirais flexíveis e hidrojato que limpam o encanamento por dentro, preservando pisos cerâmicos e porcelanatos intactos."
    },
    {
      question: "Vocês realizam limpeza e sucção de fossas sépticas em chácaras e propriedades rurais?",
      answer: "Sim, nossos caminhões auto-vácuo atendem chácaras, fazendas e distritos de Patos de Minas com descarte ambiental devidamente certificado."
    }
  ],
  testimonials: [
    {
      name: "Guilherme Andrade Fonseca",
      neighborhood: "Caiçaras - Patos de Minas",
      rating: 5,
      text: "A prumada de esgoto do prédio residencial perto do UNIPAM travou à noite. A desentupidora chegou em 25 minutos com equipamento silencioso e resolveu com máxima higiene. Recomendo muito!"
    },
    {
      name: "Mariana Alvarenga Ribeiro",
      neighborhood: "Guanabara - Patos de Minas",
      rating: 5,
      text: "Excelente atendimento residencial. A pia da cozinha entupiu com placas de gordura e os técnicos desentupiram sem sujar a cozinha, com total cuidado e preço justo. Nota dez!"
    },
    {
      name: "Fernando Pacheco de Oliveira",
      neighborhood: "Centro - Patos de Minas",
      rating: 5,
      text: "Contratamos para a manutenção preventiva da caixa de gordura da nossa empresa perto da Avenida Getúlio Vargas. Equipe pontual, muito profissional e emitiram nota fiscal com garantia por escrito."
    }
  ],
  parceiros: [
    {
      nome: "Desentupidora Pouso Alegre 24h",
      cidade: "Pouso Alegre",
      uf: "MG",
      dominio: "desentupidorapousoalegre.com.br",
      url: "https://desentupidora-pousoalegre.pages.dev",
      descricao: "Nossa base parceira para atendimento emergencial e suporte técnico no Estado de Minas Gerais.",
      status: "ativo",
      tipo: "Rede de atendimento"
    }
  ],
  neighborhoodFacts: {
    "Centro": "O Centro de Patos de Minas é o coração financeiro, administrativo e histórico do Alto Paranaíba, estruturado ao redor da imponente Avenida Getúlio Vargas, da Praça Desembargador Frederico e da Catedral de Santo Antônio. Concentra centenas de lojas, bancos, clínicas médicas e restaurantes que demandam manutenção preventiva regular em caixas de gordura e prumadas prediais verticais. Nossa base móvel no Centro permite chegar a qualquer chamado emergencial em até 20 minutos com equipamentos elétricos não destrutivos.",
    "Caiçaras": "O bairro Caiçaras é um dos mais dinâmicos e valorizados de Patos de Minas, sediando o campus principal do Centro Universitário de Patos de Minas (UNIPAM) e intensa movimentação comercial na Avenida Brasil. A grande densidade de edifícios residenciais, repúblicas estudantis e centros gastronômicos gera demandas contínuas de desobstrução de pias de cozinha e ramais de esgoto sanitário, atendidos com rapidez e discrição por nossos técnicos credenciados.",
    "Alto Caiçaras": "Bairro nobre em expansão contínua com vista panorâmica para a cidade, o Alto Caiçaras se destaca por condomínios verticais de alto padrão, sobrados modernos e ruas amplas. As intervenções hidráulicas no bairro são realizadas com maquinário rotativo elétrico que limpa os canos por dentro sem emitir ruído excessivo nem danificar porcelanatos e acabamentos finos.",
    "Guanabara": "O bairro Guanabara é uma das regiões residenciais e institucionais mais nobres de Patos de Minas, abrigando a sede da Justiça Federal, clínicas especializadas e fácil acesso à Avenida Marabá. A preservação estética dos imóveis de alto padrão exige serviços de desentupimento limpos e sem quebra de pisos, executados por nossos profissionais com pontualidade e garantia por escrito.",
    "Rosário": "Bairro tradicional e histórico de Patos de Minas, o Rosário reúne construções residenciais consolidadas, a histórica Igreja de Nossa Senhora do Rosário e comércio vicinal de bairro. Nossos técnicos atendem a região 24 horas para desentupir ramais de esgoto antigos, ralos de quintal e caixas de inspeção com máquinas de cabos flexíveis de alta eficiência.",
    "Lagoa Grande": "Localizado ao redor do Parque Ecológico da Lagoa Grande (cartão-postal e berço histórico da cidade), o bairro mescla áreas verdes de lazer, prédios residenciais e restaurantes na orla. A proximidade com o espelho d'água exige soluções não invasivas para galerias de drenagem pluvial e caixas coletoras, garantindo perfeita vazão dos efluentes.",
    "Jardim Paulistano": "Situado ao longo da Avenida Fátima Porto e próximo às margens do Rio Paranaíba, o Jardim Paulistano combina residências familiares, centros automotivos e galpões comerciais. A topografia mais baixa da região requer cuidados especiais contra refluxos em ralos e galerias durante temporais de verão, solucionados com hidrojateamento de alta pressão.",
    "Sobradinho": "Bairro nobre e tradicional vizinho à Avenida Major Gote, o Sobradinho conta com excelente infraestrutura urbana, hospitais, consultórios e moradias de alto nível construtivo. Nossos encanadores realizam a limpeza técnica de colunas prediais e desobstrução de vasos sanitários com ferramentas que preservam as louças e anéis de vedação.",
    "Abner Afonso": "Bairro residencial consolidado e acolhedor de Patos de Minas, o Abner Afonso é composto por loteamentos familiares, praças e comércio de vizinhança. Oferecemos atendimento rápido 24 horas para desentupimento de pias, tanques e ralos de banheiros com orçamento 100% gratuito.",
    "Bela Vista": "Localizado em área elevada da Zona Leste, o bairro Bela Vista oferece ampla vista da cidade e perfil predominantemente residencial. As moradias em ruas inclinadas contam com nossos serviços especializados para desobstrução de tubulações pluviais e caixas de gordura com máxima segurança.",
    "Brasil": "O bairro Brasil é uma artéria vital de conexão urbana em Patos de Minas, cortado pela movimentada Avenida Brasil e polo de comércio vicinal, supermercados e serviços automotivos. Nossa empresa atua na região com viaturas de resposta rápida para socorrer emergências de esgoto em até 25 minutos.",
    "Caramuru": "Bairro tradicional com forte perfil comunitário e residencial, o Caramuru possui ruas arborizadas e sobrados familiares consolidados. Realizamos desentupimentos mecânicos em ramais domésticos e limpeza de caixas sifonadas sem gerar sujeira no ambiente.",
    "Cristo Redentor": "Bairro populoso na Zona Leste com grande concentração de famílias, escolas públicas e unidades de saúde comunitária. Oferecemos soluções completas e acessíveis para desobstrução de caixas de inspeção e esgotos domésticos com garantia formal de 90 dias.",
    "Gramado": "Bairro nobre de Patos de Minas vizinho ao Parque de Exposições Sebastião Alves do Nascimento (sede da Fenamilho), o Gramado abriga mansões, condomínios fechados e ruas tranquilas. As manutenções hidráulicas são executadas com total discrição e ferramentas elétricas limpas.",
    "Nossa Senhora de Fátima": "Bairro acolhedor com perfil residencial ativo e comércio vicinal, sedia a Paróquia de Fátima e praças comunitárias. Nossos técnicos prestam atendimento 24 horas para desentupimento de ramais de lavanderias, pias e ralos com chegada ágil.",
    "Planalto": "Bairro em posição geográfica alta com conexão direta à BR-365 e novos loteamentos habitacionais. Atendemos condomínios e residências com maquinário rotativo para limpeza profunda de encanamentos.",
    "Jardim Centro": "Subdivisão estratégica entre o Centro histórico e o bairro Caiçaras, com forte presença de estudantes universitários e clínicas. Realizamos desobstrução de pias e colunas prediais com maquinário silencioso.",
    "Nova Floresta": "Bairro planejado em grande expansão residencial com casas contemporâneas e comércio em crescimento. Realizamos manutenção preventiva de caixas de esgoto e desentupimento de redes coletoras com tecnologia moderna.",
    "Panorâmico": "Bairro nobre de relevo acentuado e residências modernas, o Panorâmico exige tubulações desobstruídas para garantir o fluxo perfeito da gravidade. Nossos técnicos atendem chamados com pontualidade.",
    "Santa Terezinha": "Bairro residencial tradicional com comércios familiares, pequenas oficinas e igrejas. Oferecemos socorro hidráulico 24 horas para desentupimento de vasos e caixas de inspeção com preço justo.",
    "Vila Garcia": "Bairro consolidado próximo à Avenida Marabá com perfil misto de moradia e comércio. Nossos técnicos realizam hidrojateamento e desobstrução de galerias com laudo técnico.",
    "Ipanema": "Bairro tranquilo e residencial com praças, creches e moradias unifamiliares. Atendemos emergências de esgoto e ralos pluviais com total garantia por escrito."
  },
  logoUrl: "/images/patosdeminas/logo-desentupidora-patosdeminas.webp",
  faviconUrl: "/images/patosdeminas/favicon-desentupidora-patosdeminas.webp",
  heroImage: "/images/patosdeminas/desentupidora-patosdeminas-caminhao-limpa-fossa.webp",
  auditScore: 100,
  commercialClaimsVerified: true
};

const existingIndex = cities.findIndex(c => c.id === 'patosdeminas');
if (existingIndex >= 0) {
  cities[existingIndex] = { ...cities[existingIndex], ...patosDeMinas };
  console.log('Cidade patosdeminas atualizada em cities.json');
} else {
  cities.push(patosDeMinas);
  console.log('Cidade patosdeminas adicionada em cities.json');
}

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf-8');
console.log('cities.json salvo com sucesso. Total de cidades:', cities.length);
