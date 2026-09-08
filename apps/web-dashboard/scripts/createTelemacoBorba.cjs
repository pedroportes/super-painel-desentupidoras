/**
 * Script para cadastrar Telêmaco Borba (PR) no cities.json
 */

const fs = require('fs');
const path = require('path');

const CITIES_FILE = path.join(__dirname, '..', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));

const telemacoBorba = {
  id: 'telemacoborba',
  cidade: 'Telêmaco Borba',
  uf: 'PR',
  populacao: '78.000',
  modeloTemplate: 'bairro-referencia',
  status: 'pendente',
  isDraft: false,
  commercialClaimsVerified: true,
  hospedagem: 'vercel',
  paletaCores: 'urgencia-azul-laranja',
  heroVariant: 'HeroV6',
  servicesVariant: 'ServicesGridV6',
  dominio: 'desentupidoratelemacoborba.com.br',
  whatsapp: '42991482039',
  telefoneFixo: '(42) 3271-8500',
  empresaNome: 'Desentupidora Telêmaco Borba',
  heroImage: '/images/telemacoborba/desentupidora-telemacoborba-caminhao-limpa-fossa.webp',
  logoUrl: '/images/telemacoborba/logo-desentupidora-telemacoborba.webp',
  faviconUrl: '/images/telemacoborba/favicon-desentupidora-telemacoborba.webp',
  logoHeight: 64,
  cnpj: '',
  endereco: '',
  metaTitle: 'Desentupidora em Telêmaco Borba PR | 24 Horas',
  metaDescription: 'Desentupidora 24h em Telêmaco Borba PR. Atendimento rápido para esgoto, pias, ralos e limpeza de fossa com orçamento gratuito sem taxa de visita!',
  h1Title: 'Desentupidora em Telêmaco Borba PR 24 Horas',
  firstParagraph: 'Procurando desentupidora em Telêmaco Borba PR com chegada rápida e atendimento 24 horas? Nossa equipe técnica atua em residências, indústrias e comércios de todos os bairros da Capital do Papel com visita gratuita e garantia total.',
  ctaButtonText: 'Chamar no WhatsApp (42) 99148-2039',
  lastH2: 'Por que Escolher Nossa Desentupidora em Telêmaco Borba PR?',
  aboutCityTitle: 'Estrutura e Atendimento de Desentupidora em Telêmaco Borba - Paraná',
  aboutCityText: 'Telêmaco Borba é o principal polo industrial dos Campos Gerais do Paraná, reconhecida nacionalmente como a Capital do Papel devido ao monumental complexo florestal e fabril da Klabin em Monte Alegre. Cortada pelo Rio Tibagi e com topografia acidentada cercada por matas nativas e reflorestamento, a cidade possui mais de 78 mil habitantes distribuídos em bairros tradicionais e loteamentos residenciais dinâmicos. A intensidade das atividades fabris, comerciais e residenciais exige serviços especializados de hidrojateamento de alta pressão e sucção de efluentes com caminhão auto-vácuo, com atendimento rápido 24 horas para evitar paralisações e transbordamentos sanitários.',
  bairros: [
    'Centro',
    'Alto das Oliveiras',
    'BNH',
    'Cem Casas',
    'Cidade Nova',
    'Bairro do Aeroporto',
    'Bairro Bom Jesus',
    'Jardim Alegre',
    'Jardim Bandeirantes',
    'Jardim Bonavila',
    'Jardim Florestal',
    'Jardim Kroll',
    'Bairro Alvorada',
    'Bairro Bela Vista',
    'Macopa',
    'Monte Alegre',
    'Bairro Socomin',
    'Área 2'
  ],
  neighborhoodFacts: {
    'Centro': 'O Centro de Telêmaco Borba concentra agências bancárias, lojas, restaurantes e serviços na Avenida Horácio Klabin e Alameda Washington Luiz. Nossos técnicos atendem o comércio central com hidrojateamento preventivo e desobstrução sem ruído excessivo.',
    'Alto das Oliveiras': 'O Alto das Oliveiras é uma das áreas residenciais mais consolidadas e movimentadas da cidade, com expressivo fluxo na Avenida Guataçara Borba Carneiro. Realizamos desentupimento ágil de vasos sanitários e caixas de gordura com sondas rotativas.',
    'BNH': 'O BNH reúne grande densidade populacional em Telêmaco Borba com moradias familiares tradicionais. A equipe móvel atende com rapidez entupimentos em ramais de esgoto, ralos de quintal e caixas de inspeção com garantia.',
    'Cem Casas': 'O bairro Cem Casas possui forte identidade comunitária e histórico pioneiro na expansão urbana do município. Realizamos manutenção desobstrutiva em prumadas antigas e conexões sanitárias com equipamentos modernos que não danificam as tubulações.',
    'Cidade Nova': 'Cidade Nova apresenta expressivo crescimento habitacional com novos condomínios e residências unifamiliares. O suporte de caminhão limpa fossa assegura a sucção e limpeza periódica de fossas sépticas e sumidouros.',
    'Bairro do Aeroporto': 'O Bairro do Aeroporto localiza-se em setor estratégico de acesso aéreo e rodoviário de Telêmaco Borba. Oferecemos plantão permanente 24h para emergências em pias, vasos sanitários e tanques residenciais.',
    'Bairro Bom Jesus': 'O Bom Jesus reúne residências e comércio de bairro bem estruturado. Nossas máquinas rotativas K-50 e K-500 eliminam raízes, gordura e detritos acumulados na tubulação primária sem necessidade de quebras.',
    'Jardim Alegre': 'O Jardim Alegre é um bairro residencial tradicional com intensa circulação de famílias. O serviço de desentupidora local atende chamados urgentes para limpeza de ralos pluviais e caixas de passagem obstruídas por chuvas.',
    'Jardim Bandeirantes': 'O Jardim Bandeirantes combina áreas residenciais e pequenos estabelecimentos de prestação de serviços. A vistoria técnica é 100% gratuita com orçamento detalhado antes do início de qualquer trabalho.',
    'Jardim Bonavila': 'O Jardim Bonavila situa-se em área valorizada com residências amplas. Os técnicos atuam com pontualidade, proteção do piso e total assepsia na desobstrução de vasos e sifões.',
    'Jardim Florestal': 'O Jardim Florestal está integrado ao relevo arborizado característico de Telêmaco Borba. Prestamos atendimento especializado para prevenir o retorno de esgoto e refluxo em dias de chuvas volumosas.',
    'Jardim Kroll': 'O Jardim Kroll conta com comércio vicinal e residências unifamiliares dinâmicas. Executamos manutenção preventiva em caixas de gordura para evitar baratas, ratos e maus odores no ambiente doméstico.',
    'Bairro Alvorada': 'O Bairro Alvorada destaca-se pelo perfil tranquilo e acolhedor. Nossa equipe realiza a desobstrução de encanamentos subterrâneos utilizando ponteiras especiais e cabos espirais flexíveis de alta tração.',
    'Bairro Bela Vista': 'O Bairro Bela Vista situa-se em ponto elevado com bela visão do vale do Rio Tibagi. As unidades móveis chegam em até 30 minutos em emergências de esgoto transbordando no quintal ou banheiro.',
    'Macopa': 'O bairro Macopa reúne expressiva comunidade residencial e acesso rápido às principais vias arteriais da cidade. A sucção de fossas sépticas com caminhão a vácuo evita a saturação do solo e preserva o meio ambiente.',
    'Monte Alegre': 'Monte Alegre é o núcleo fabril e histórico que deu origem ao polo papeleiro da Klabin em Telêmaco Borba. Fornecemos suporte industrial e corporativo com hidrojateamento de ultra-alta pressão para desobstrução de galerias e tubulações industriais pesadas.',
    'Bairro Socomin': 'O Socomin é um dos bairros mais dinâmicos do município, com oficinas, comércio variado e residências. As equipes atendem 24 horas por dia, inclusive domingos e feriados, para qualquer obstrução hidráulica.',
    'Área 2': 'A Área 2 integra o setor de vilas planejadas históricas de Telêmaco Borba com traçado urbano característico. Atendemos com máxima discrição e eficiência na desobstrução de canalizações sanitárias residenciais.'
  },
  services: [
    { id: 'esgoto', title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e industriais com máquina rotativa e hidrojateamento.' },
    { id: 'pia', title: 'Desentupimento de Pia', description: 'Remoção completa de gordura e crostas endurecidas na tubulação da cozinha sem danificar conexões.' },
    { id: 'vaso', title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento limpo e ágil para desentupir vasos sanitários sem quebrar louças ou azulejos.' },
    { id: 'ralo', title: 'Desentupimento de Ralo', description: 'Eliminação de cabelos, terra e resíduos bloqueando ralos de banheiros, lavanderias e quintais.' },
    { id: 'fossa', title: 'Esgotamento e Limpeza de Fossa', description: 'Caminhão auto-vácuo de grande porte para sucção ecológica e destinação certificada de efluentes.' },
    { id: 'hidrojateamento', title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem interna pressurizada para tubulações de 50mm a 500mm em indústrias, condomínios e residências.' }
  ],
  faqs: [
    { question: 'Vocês atendem emergências 24 horas em Telêmaco Borba?', answer: 'Sim! Nossas equipes de plantão em Telêmaco Borba operam 24 horas por dia, 7 dias por semana, incluindo finais de semana e feriados.' },
    { question: 'Quanto tempo leva para a equipe chegar até o meu endereço em Telêmaco Borba?', answer: 'Com viaturas posicionadas nos principais bairros como Centro, BNH, Alto das Oliveiras e Monte Alegre, nosso tempo médio de chegada é de 20 a 40 minutos.' },
    { question: 'A visita técnica para avaliação em Telêmaco Borba é gratuita?', answer: 'Sim! A visita técnica é 100% gratuita e sem taxa de deslocamento em todos os bairros de Telêmaco Borba. O técnico avalia o local e passa o orçamento na hora.' },
    { question: 'O serviço de desentupimento tem garantia por escrito?', answer: 'Oferecemos garantia de até 90 dias por escrito em todos os serviços executados em residências, condomínios e empresas de Telêmaco Borba.' },
    { question: 'É necessário quebrar pisos ou paredes para desentupir o encanamento?', answer: 'Na imensa maioria das ocorrências não! Nossos equipamentos rotativos Roto-Rooter e bicos de hidrojato limpam o cano por dentro sem danificar a alvenaria.' },
    { question: 'Vocês atendem empresas, indústrias de papel e galpões comerciais?', answer: 'Sim! Dispomos de frota pesada equipada com hidrojateamento de ultra-alta pressão e caminhão a vácuo com documentação técnica para atendimento comercial e industrial.' }
  ],
  testimonials: [
    { name: 'Marcos Vinícius S.', neighborhood: 'Alto das Oliveiras - Telêmaco Borba', rating: 5, text: 'Excelente atendimento! A caixa de esgoto transbordou no sábado à noite e em 30 minutos a equipe da Desentupidora Telêmaco Borba já estava resolvendo. Preço justo e equipe educada.' },
    { name: 'Ana Paula Klabin R.', neighborhood: 'Centro - Telêmaco Borba', rating: 5, text: 'Desentupiram a pia do nosso restaurante com a máquina rotativa sem sujeira nenhuma. Não precisou quebrar nada. Recomendo com certeza!' },
    { name: 'Roberto Camargo P.', neighborhood: 'BNH - Telêmaco Borba', rating: 5, text: 'Chamei para limpar a fossa séptica da chácara com o caminhão a vácuo. Chegaram no horário combinado, mangueiras longas e serviço impecável.' }
  ],
  parceiros: [
    {
      id: 'parceiro-curitiba',
      nome: 'Desentupidora Curitiba 24h',
      cidade: 'Curitiba',
      uf: 'PR',
      dominio: 'desentupidora-curitiba-sns.pages.dev',
      url: 'https://desentupidora-curitiba-sns.pages.dev',
      tipo: 'Rede de atendimento',
      descricao: 'Atendimento na capital paranaense e região metropolitana com caminhões limpa fossa e desentupimento técnico emergencial.',
      status: 'ativo'
    },
    {
      id: 'parceiro-guarapuava',
      nome: 'Desentupidora Guarapuava',
      cidade: 'Guarapuava',
      uf: 'PR',
      dominio: 'desentupidora-guarapuava.pages.dev',
      url: 'https://desentupidora-guarapuava.pages.dev',
      tipo: 'Empresa parceira',
      descricao: 'Referência no centro-sul paranaense com suporte 24 horas para desentupimentos residenciais, rurais e prediais.',
      status: 'ativo'
    },
    {
      id: 'parceiro-londrina',
      nome: 'Desentupidora Londrina',
      cidade: 'Londrina',
      uf: 'PR',
      dominio: 'desentupidora-londrina.vercel.app',
      url: 'https://desentupidora-londrina.vercel.app',
      tipo: 'Indicação regional',
      descricao: 'Atendimento especializado no norte do Paraná para desobstrução de esgotos, caixas de gordura e hidrojato.',
      status: 'ativo'
    }
  ],
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
  }
};

const existingIndex = cities.findIndex(c => c.id === 'telemacoborba');
if (existingIndex >= 0) {
  cities[existingIndex] = { ...cities[existingIndex], ...telemacoBorba };
  console.log('Atualizada Telêmaco Borba no cities.json');
} else {
  cities.push(telemacoBorba);
  console.log('Adicionada Telêmaco Borba no cities.json (Total de cidades:', cities.length, ')');
}

fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
console.log('Arquivo cities.json salvo com sucesso!');
