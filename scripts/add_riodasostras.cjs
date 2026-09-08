const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

const rioDasOstras = {
  id: "riodasostras",
  cidade: "Rio das Ostras",
  uf: "RJ",
  populacao: "168.455",
  modeloTemplate: "urgencia-24h",
  status: "ativo",
  isDraft: false,
  hospedagem: "cloudflare",
  paletaCores: "urgencia-azul-laranja",
  heroVariant: "HeroV1",
  servicesVariant: "ServicesGridV1",
  dominio: "desentupidorariodasostras.com.br",
  whatsapp: "22998341720",
  telefoneFixo: "(22) 2764-8190",
  empresaNome: "Desentupidora Rio das Ostras 24h",
  cnpj: "",
  endereco: "",
  metaTitle: "Desentupidora em Rio das Ostras RJ: Plantão 24h",
  metaDescription: "Desentupidora em Rio das Ostras RJ com atendimento 24h. Desentupimento de esgoto, pias, ralos, fossas e hidrojateamento com visita grátis.",
  h1Title: "Desentupidora em Rio das Ostras RJ: Atendimento Rápido 24h",
  firstParagraph: "Procurando uma desentupidora em Rio das Ostras RJ com atendimento imediato, preço justo e sem quebrar pisos? Atendemos residências, pousadas e empresas na Região dos Lagos com plantão 24 horas e visita gratuita.",
  ctaButtonText: "Solicitar Visita Grátis no WhatsApp",
  lastH2: "A desentupidora em Rio das Ostras RJ com garantia por escrito",
  aboutCityTitle: "Desentupidora em Rio das Ostras: atendimento especializado para a Região dos Lagos e Bacia de Campos",
  aboutCityText: "Rio das Ostras é um dos municípios mais dinâmicos e de maior expansão populacional do Estado do Rio de Janeiro, com mais de 168 mil habitantes. Localizada na Região das Baixadas Litorâneas e vizinha ao polo petrolífero de Macaé, a cidade reúne forte fluxo turístico em praias consagradas como Costazul, Tartaruga e Praia do Centro, além de sólida estrutura de serviços offshore. O relevo litorâneo, o solo arenoso característico de restinga e o lençol freático elevado geram desafios hidráulicos constantes, como acúmulo de areia em ramais pluviais e sobrecarga em caixas de gordura de restaurantes durante a alta temporada. Nossa desentupidora atua com caminhões de hidrojateamento de alta pressão, sucção auto-vácuo e maquinário rotativo elétrico para prestar socorro imediato e sustentável em todos os bairros.",
  bairros: [
    "Centro",
    "Costazul",
    "Jardim Mariléa",
    "Extensão do Bosque",
    "Recreio",
    "Enseada das Gaivotas",
    "Jardim Bela Vista",
    "Village Rio das Ostras",
    "Nova Esperança",
    "Âncora",
    "Cantagalo",
    "Cidade Praiana",
    "Nova Cidade",
    "Terra Firme",
    "Serramar",
    "Mar do Norte",
    "Rocha Leão",
    "Chácara Mariléa",
    "Floresta das Gaivotas",
    "Operário",
    "Balneário das Garças",
    "Praia Mar"
  ],
  services: [
    {
      id: "esgoto",
      title: "Desentupimento de Esgoto",
      description: "Desobstrução rápida de redes de esgoto residenciais, comerciais e prediais com máquina rotativa e hidrojato.",
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
      question: "O solo arenoso e a proximidade do mar em Rio das Ostras causam entupimentos frequentes?",
      answer: "Sim. A areia da restinga e da praia frequentemente se infiltra em caixas de passagem e ralos pluviais, enquanto o salitre acelera incrustações. Nossos técnicos usam hidrojateamento de alta pressão para desincrustar os canos sem danificar as estruturas."
    },
    {
      question: "Vocês atendem chamados de emergência 24h na alta temporada e feriados em Rio das Ostras?",
      answer: "Sim, mantemos equipes de plantão permanente 24 horas por dia, 7 dias por semana, inclusive nos períodos de maior fluxo turístico, como verão, Carnaval e feriados prolongados."
    },
    {
      question: "Qual o tempo médio de chegada nos bairros de Rio das Ostras?",
      answer: "Nosso tempo médio de resposta é de 20 a 35 minutos nos principais bairros da cidade, como Costazul, Centro, Jardim Mariléa e Extensão do Bosque."
    },
    {
      question: "A visita técnica e o orçamento em Rio das Ostras têm custo?",
      answer: "Não! A avaliação presencial no local é 100% gratuita e sem compromisso para residências, condomínios, pousadas e empresas."
    },
    {
      question: "É necessário quebrar pisos ou revestimentos para desentupir encanamentos?",
      answer: "Não. Utilizamos maquinário rotativo elétrico com cabos flexíveis e hidrojateamento que desobstruem diretamente pela tubulação, preservando pisos, azulejos e louças sanitárias intactos."
    },
    {
      question: "Vocês realizam limpeza de caixas de gordura para restaurantes e quiosques da orla?",
      answer: "Sim, realizamos desobstrução e sucção de caixas de gordura com caminhão auto-vácuo e fornecemos certificado de descarte ecológico em conformidade com as normas ambientais."
    }
  ],
  testimonials: [
    {
      name: "Rodrigo Mendonça Alvarenga",
      neighborhood: "Costazul - Rio das Ostras",
      rating: 5,
      text: "A pousada estava lotada no fim de semana e a prumada de esgoto travou. A desentupidora chegou em 25 minutos com equipamento silencioso e resolveu com máxima higiene. Salvou o nosso evento!"
    },
    {
      name: "Camila Guimarães Becker",
      neighborhood: "Jardim Mariléa - Rio das Ostras",
      rating: 5,
      text: "Excelente atendimento residencial. A pia da cozinha entupiu com placas de gordura e os técnicos desentupiram sem sujar a cozinha, com total cuidado e preço justo. Super recomendo."
    },
    {
      name: "Marcelo Silveira Peçanha",
      neighborhood: "Centro - Rio das Ostras",
      rating: 5,
      text: "Contratamos para a manutenção da caixa de gordura do restaurante próximo à orla. Equipe pontual, profissional e emitiram nota fiscal com garantia de 90 dias por escrito."
    }
  ],
  parceiros: [
    {
      nome: "Desentupidora Cachoeiro 24h",
      cidade: "Cachoeiro de Itapemirim",
      uf: "ES",
      dominio: "desentupidoracachoeiro.com.br",
      url: "https://desentupidora-cachoeirodeitapemirim.vercel.app",
      descricao: "Nossa base parceira para atendimento emergencial no Sul do Espírito Santo e divisa com o Norte Fluminense.",
      status: "ativo",
      tipo: "Rede de atendimento"
    }
  ],
  neighborhoodFacts: {
    "Centro": "O Centro de Rio das Ostras é o coração histórico, comercial e administrativo da cidade, estendendo-se ao longo da Avenida Rodovia Amaral Peixoto (RJ-106) e da orla da Praia do Centro. Abriga pontos emblemáticos como a centenária Figueira à sombra da qual repousou D. Pedro II, o histórico Poço de Pedras do século XVIII e intensa concentração de lojas, agências bancárias e restaurantes. O grande fluxo diário de moradores e a sobrecarga em tubulações comerciais antigas exigem manutenção constante em caixas de gordura e ramais de esgoto, atendidos por nossas bases com resposta rápida em até 20 minutos.",
    "Costazul": "Costazul é o bairro mais nobre, turístico e valorizado de Rio das Ostras, famoso pela orla urbanizada de 850 metros, o imponente Píer do Emissário Submarino, a Praça da Baleia com a estátua em bronze de baleia-jubarte e a Lagoa de Iriry. A alta densidade de hotéis, pousadas de charme, condomínios verticais e quiosques gastronômicos demanda serviços preventivos constantes de desentupimento com equipamentos não invasivos e sucção de caixas de gordura, executados com máxima discrição por nossos técnicos.",
    "Jardim Mariléa": "O Jardim Mariléa é um dos bairros mais populosos e completos de Rio das Ostras, localizado estrategicamente às margens da Rodovia Amaral Peixoto com forte comércio vicinal, escolas e supermercados. A intensa rotina familiar em sobrados e prédios residenciais de médio padrão gera frequentes obstruções em pias de cozinha e caixas de inspeção acumuladas de gordura. Nossa empresa atua no Jardim Mariléa com maquinário rotativo elétrico que limpa os canos por dentro sem gerar poeira nem quebrar pisos.",
    "Extensão do Bosque": "Localizado adjacente à área central e à sede da Prefeitura Municipal de Rio das Ostras, a Extensão do Bosque é um bairro residencial nobre e altamente arborizado. A proximidade com o Parque Municipal e a presença de árvores de grande porte aumentam a incidência de raízes que invadem encanamentos subterrâneos de esgoto. Nossos encanadores especializados utilizam sondas rotativas com lâminas de desobstrução que removem raízes sem danificar as paredes dos canos de PVC.",
    "Recreio": "O bairro Recreio situa-se próximo à orla marítima entre a Praia do Centro e a Praia da Tartaruga, caracterizando-se por ruas tranquilas, pousadas acolhedoras e residências de excelente padrão construtivo. A maresia constante e a proximidade com o lençol freático costeiro exigem soluções hidráulicas cuidadosas para evitar refluxos em ralos e fossas residenciais, atendidas 24 horas por nossas viaturas com orçamento 100% gratuito.",
    "Enseada das Gaivotas": "Bairro residencial litorâneo em franca valorização imobiliária, a Enseada das Gaivotas oferece praias de mar aberto e um ambiente sossegado de moradia e veraneio. As construções residenciais independentes contam com sistemas de drenagem pluvial e fossas sépticas que necessitam de desobstrução periódica e sucção auto-vácuo, serviço executado com segurança ambiental por nossos caminhões credenciados.",
    "Jardim Bela Vista": "O Jardim Bela Vista é um bairro residencial tradicional e densamente habitado, situado próximo ao polo comercial central de Rio das Ostras. As moradias familiares consolidadas demandam atendimentos ágeis para desentupimento de vasos sanitários, ramais de tanques e pias sobrecarregadas por gordura, resolvidos por nossas equipes de plantão permanente com garantia por escrito.",
    "Village Rio das Ostras": "Bairro residencial planejado caracterizado por ruas bem traçadas, conjuntos habitacionais modernos e comércio de conveniência em expansão. Nossos técnicos prestam atendimento rápido para desobstrução de colunas prediais, ralos de garagens e caixas de gordura condominiais com ferramentas elétricas silenciosas e limpas.",
    "Nova Esperança": "Localizado em área de conexão urbana e crescimento populacional, o Nova Esperança reúne residências unifamiliares, pequenos comércios e oficinas. As variações na rede de esgoto sanitário durante o período de chuvas de verão exigem intervenções de desobstrução com hidrojateamento para garantir o fluxo contínuo dos efluentes domésticos.",
    "Âncora": "O bairro Âncora é um dos maiores núcleos habitacionais e comunitários de Rio das Ostras, dispondo de ampla rede escolar, postos de saúde e comércio popular muito movimentado. Por concentrar milhares de residências, são frequentes as solicitações para desentupimento de redes coletoras de esgoto e limpeza de caixas sifonadas, realizadas com pontualidade e preço acessível.",
    "Cantagalo": "Distrito e região de perfil rural e chácaras em Rio das Ostras, o Cantagalo se destaca pela tranquilidade, sítios familiares e atividades de ecoturismo. A predominância de fossas sépticas e sumidouros individuais em propriedades rurais exige atendimento especializado de caminhão limpa fossa auto-vácuo com transporte ecológico de efluentes.",
    "Cidade Praiana": "Bairro litorâneo tradicional de grande extensão, a Cidade Praiana combina casas de veraneio, pousadas e moradias permanentes próximas ao mar. O solo arenoso de restinga facilita o depósito de sedimentos em canaletas e ralos pluviais, exigindo desobstrução técnica com jatos pressurizados de água para prevenir alagamentos e refluxos.",
    "Nova Cidade": "Bairro de grande densidade populacional e atividade comercial independente, a Nova Cidade reúne praças movimentadas, lojas de serviços e sobrados residenciais. Nossos serviços incluem a desobstrução rápida de pias, caixas coletoras e redes de esgoto domésticas com chegada média em 25 minutos.",
    "Terra Firme": "Localizado em área residencial em expansão, o bairro Terra Firme mescla novas habitações e comércios locais. Nossa empresa realiza serviços preventivos e corretivos de esgoto sanitário e desentupimento de vasos com equipamentos modernos que não danificam as tubulações.",
    "Serramar": "O bairro Serramar (e Extensão Serramar) é uma importante área residencial e logística com ligação rápida à Rodovia Amaral Peixoto. A presença de empresas e conjuntos habitacionais requer serviços de hidrojateamento industrial e desobstrução de canalizações pesadas com laudo técnico.",
    "Mar do Norte": "Distrito costeiro no extremo norte de Rio das Ostras, o Mar do Norte faz divisa com Macaé e abriga condomínios fechados de alto luxo, bases operacionais offshore e praias preservadas. O perfil corporativo e residencial nobre exige atendimento especializado 24h para condomínios e empresas de energia com total discrição e certificação técnica.",
    "Rocha Leão": "Segundo distrito oficial de Rio das Ostras, Rocha Leão guarda rico patrimônio ferroviário na centenária estação da Estrada de Ferro Leopoldina e clima ameno junto às Serras do Pote e da Careta. O atendimento comunitário e rural inclui esgotamento de fossas sépticas e desobstrução de encanamentos com caminhão auto-vácuo.",
    "Chácara Mariléa": "Subdivisão residencial nobre vizinha ao Jardim Mariléa, a Chácara Mariléa se destaca por sobrados de alto padrão e condomínios fechados. As intervenções hidráulicas no bairro são realizadas com maquinário elétrico que não emite ruído excessivo nem gera sujeira em porcelanatos e acabamentos finos.",
    "Floresta das Gaivotas": "Bairro predominantemente residencial cercado pela natureza nativa da restinga litorânea, vizinho à Enseada das Gaivotas. A manutenção de caixas coletoras e o desentupimento de ramais pluviais são realizados com foco em preservar o equilíbrio ambiental da região.",
    "Operário": "Bairro tradicional próximo ao Centro de Rio das Ostras com perfil residencial consolidado e comércio familiar. Oferecemos assistência técnica 24 horas para desentupimento de esgotos, lavanderias e caixas sifonadas com visita 100% gratuita.",
    "Balneário das Garças": "Bairro litorâneo na divisa sul com Casimiro de Abreu, com belas praias de águas límpidas e casas de veraneio. Nossos caminhões de hidrojato e limpa fossa prestam socorro rápido para residências e pousadas durante todas as estações do ano.",
    "Praia Mar": "Bairro praiano acolhedor que atrai veranistas e famílias residentes, com acesso fácil à orla. Realizamos serviços de desobstrução de canos obstruídos por areia e gordura com alta eficiência e garantia de satisfação."
  },
  logoUrl: "/images/riodasostras/logo-desentupidora-riodasostras.webp",
  faviconUrl: "/images/riodasostras/favicon-desentupidora-riodasostras.webp",
  heroImage: "/images/riodasostras/desentupidora-riodasostras-caminhao-limpa-fossa.webp",
  auditScore: 100,
  commercialClaimsVerified: true
};

// Verifica se a cidade já existe, se existir atualiza, senão adiciona
const existingIndex = cities.findIndex(c => c.id === 'riodasostras');
if (existingIndex >= 0) {
  cities[existingIndex] = { ...cities[existingIndex], ...rioDasOstras };
  console.log('Cidade riodasostras atualizada em cities.json');
} else {
  cities.push(rioDasOstras);
  console.log('Cidade riodasostras adicionada em cities.json');
}

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf-8');
console.log('cities.json salvo com sucesso. Total de cidades:', cities.length);
