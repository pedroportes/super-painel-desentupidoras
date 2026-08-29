export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TestimonialItem {
  name: string;
  neighborhood: string;
  rating: number;
  text: string;
}

export interface CityConfig {
  id: string;
  cidade: string;
  uf: string;
  deployUrl?: string;
  lastDeployAt?: string;
  populacao: string;
  modeloTemplate: 'urgencia-24h' | 'corporativo-empresarial' | 'residencial-bairros' | 'industrial-hidrojato';
  status: 'ativo' | 'em_construcao' | 'pendente';
  hospedagem: 'cloudflare' | 'vercel' | 'netlify';
  paletaCores: 'urgencia-azul-laranja' | 'corporativo-verde-cinza' | 'residencial-bege' | 'industrial-amarelo' | 'clean-azul';
  heroVariant: 'HeroV1' | 'HeroV2';
  servicesVariant: 'ServicesGridV1' | 'ServicesGridV2';
  dominio: string;
  whatsapp: string;
  telefoneFixo?: string;
  empresaNome?: string;
  cnpj?: string;
  endereco?: string;
  logoUrl?: string;
  heroImage?: string;
  h1Title?: string;
  firstParagraph?: string;
  ctaButtonText?: string;
  lastH2?: string;
  bairros?: string[];
  services?: ServiceItem[];
  faqs?: FaqItem[];
  testimonials?: TestimonialItem[];
  auditScore: number;
  latitude?: string;
  longitude?: string;
}

// Known DDDs by State
const DDD_MAP: Record<string, string> = {
  'ES': '27',
  'PR': '41',
  'BA': '73',
  'MG': '35',
  'SP': '11',
  'RJ': '24',
  'SC': '47',
  'RS': '51'
};

// Known Real Neighborhoods for common cities
const KNOWN_NEIGHBORHOODS: Record<string, string[]> = {
  'curitiba': ['Batel', 'Água Verde', 'Bigorrilho', 'Centro Cívico', 'Portão', 'Santa Felicidade', 'Boa Vista', 'Cabral', 'Juvevê', 'Cristo Rei', 'Mercês', 'Boqueirão', 'Pinheirinho', 'CIC'],
  'linhares': ['Centro', 'Interlagos', 'Conceição', 'Novo Horizonte', 'Avisos', 'Araçá', 'BNH', 'Juparanã', 'Movelar', 'Três Barras', 'Shell', 'São José'],
  'cachoeiro': ['Centro', 'Gilberto Machado', 'Alto Amarelo', 'Aquidaban', 'Baiminas', 'Coronel Borges', 'Ilha da Luz', 'Vila Rica', 'Paraíso', 'Santo Antônio'],
  'pocosdecaldas': ['Centro', 'Jardim dos Estados', 'Cascatinha', 'Jardim Country Club', 'Santa Rosália', 'Vila Cruz', 'Zona Sul', 'Jardim Centenário'],
  'itabuna': ['Centro', 'São Caetano', 'Pontalzinho', 'Fátima', 'Conceição', 'Califórnia', 'Mangabinha', 'Jardim Vitória', 'Santo Antônio', 'Góes Calmon'],
  'portoseguro': ['Centro', 'Arraial d\'Ajuda', 'Trancoso', 'Mundaí', 'Taperapuã', 'Fontana', 'Parque Ecológico', 'Frei Calixto', 'Baianão', 'Cambuquira'],
  'guarapuava': ['Centro', 'Santa Cruz', 'Bonsucesso', 'Santana', 'Trianon', 'Batel', 'Vila Carli', 'Boqueirão', 'Morro Alto', 'Cascavelzinho']
};

export function generateUniqueCityContent(
  cidade: string,
  uf: string,
  populacao: string = '150.000',
  modelo: 'urgencia-24h' | 'corporativo-empresarial' | 'residencial-bairros' | 'industrial-hidrojato' = 'urgencia-24h',
  hospedagem: 'cloudflare' | 'vercel' | 'netlify' = 'cloudflare'
): CityConfig {
  const cityKey = cidade.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const ddd = DDD_MAP[uf.toUpperCase()] || '27';
  const bairros = KNOWN_NEIGHBORHOODS[cityKey] || [
    'Centro', 'Jardim América', 'Bela Vista', 'São José', 'Santa Cruz', 'Vila Nova', 'Planalto', 'Bairro Alto'
  ];

  if (modelo === 'corporativo-empresarial') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'corporativo-empresarial',
      status: 'pendente',
      hospedagem,
      paletaCores: 'corporativo-verde-cinza',
      heroVariant: 'HeroV2',
      servicesVariant: 'ServicesGridV2',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}999887766`,
      telefoneFixo: `(${ddd}) 3500-0000`,
      empresaNome: `Desentupidora Corporativa ${cidade}`,
      cnpj: '23.456.789/0001-01',
      endereco: `Av. Comercial, 1000 - Centro Empresarial, ${cidade} - ${uf}`,
      h1Title: `Desentupidora Corporativa e Predial em ${cidade} ${uf}`,
      firstParagraph: `Soluções especializadas em desentupimento técnico, manutenção preventiva de redes de esgoto, caixas de gordura e hidrojateamento para condomínios, restaurantes, indústrias e empresas em toda ${cidade} e região metropolitana, com emissão de laudo técnico e nota fiscal.`,
      ctaButtonText: `Solicitar Atendimento Corporativo`,
      lastH2: `Por que empresas e condomínios em ${cidade} contratam a nossa equipe?`,
      bairros,
      services: [
        { title: 'Desentupimento Predial e Condominial', description: 'Contratos e atendimentos de urgência em prumadas, caixas de esgoto e redes pluviais de edifícios.', icon: '🏢' },
        { title: 'Limpeza de Caixa de Gordura Comercial', description: 'Higienização e descarte ecológico com certificação ambiental para restaurantes e indústrias.', icon: '🛢️' },
        { title: 'Hidrojateamento de Alta Pressão', description: 'Desobstrução de tubulações industriais de grande diâmetro com bombas de alta performance.', icon: '🌊' },
        { title: 'Desobstrução de Redes de Esgoto', description: 'Equipamentos rotativos industriais que eliminam raízes, gordura e incrustações severas.', icon: '⚙️' },
        { title: 'Esgotamento de Fossas e Efluentes', description: 'Caminhões auto-vácuo licenciados pelos órgãos ambientais para coleta e transporte seguro.', icon: '🚛' },
        { title: 'Vídeo Inspeção Robotizada', description: 'Diagnóstico por câmera de alta resolução para identificar trincas e pontos exatos de obstrução.', icon: '📹' }
      ],
      faqs: [
        { question: `Vocês atendem emergências 24 horas para condomínios e empresas em ${cidade}?`, answer: `Sim! Nosso plantão corporativo opera 24 horas por dia, 7 dias por semana, com equipes preparadas para chamados urgentes.` },
        { question: `Qual o tempo estimado de chegada para atendimento empresarial em ${cidade}?`, answer: `Chegamos em média entre 20 e 40 minutos em qualquer bairro de ${cidade} devido às nossas bases móveis descentralizadas.` },
        { question: `A visita técnica e vistoria no local é gratuita?`, answer: `Sim, a visita técnica para diagnóstico e elaboração de proposta comercial é 100% gratuita e sem compromisso.` },
        { question: `A empresa emite nota fiscal e laudo técnico para condomínios em ${cidade}?`, answer: `Sim, emitimos nota fiscal eletrônica, laudo técnico de vistoria e certificado de garantia para prestação de contas de síndicos e administradoras.` },
        { question: `Vocês trabalham com contratos de manutenção preventiva em ${cidade}?`, answer: `Sim, oferecemos planos mensais e semestrais para empresas, shoppings, hospitais e condomínios residenciais em ${cidade}.` },
        { question: `Precisa interditar áreas ou quebrar pisos para desentupir?`, answer: `Não. Nossos equipamentos rotativos e de hidrojateamento atuam diretamente pelo interior das tubulações, sem causar sujeira ou quebra-quebra.` }
      ],
      testimonials: [
        { name: 'Condomínio Residencial Parque Real', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Equipe muito técnica. Resolveram o refluxo da prumada do prédio num domingo à noite com hidrojato sem sujar as áreas comuns.` },
        { name: 'Dr. Roberto Mendes (Clínica Médica)', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Atendimento impecável e altamente higiênico. Resolveram o problema na rede de esgoto sem interromper nossas atividades.` },
        { name: 'Restaurante Sabor & Arte', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `A limpeza da caixa de gordura e desentupimento da cozinha foram rápidos e com documentação ambiental completa.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'residencial-bairros') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'residencial-bairros',
      status: 'pendente',
      hospedagem,
      paletaCores: 'residencial-bege',
      heroVariant: 'HeroV1',
      servicesVariant: 'ServicesGridV1',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}998776655`,
      telefoneFixo: `(${ddd}) 3400-0000`,
      empresaNome: `Desentupidora Familiar ${cidade}`,
      cnpj: '34.567.890/0001-12',
      endereco: `Rua das Flores, 250 - Bairro Residencial, ${cidade} - ${uf}`,
      h1Title: `Desentupidora Residencial em ${cidade} ${uf} - Atendimento Sem Quebrar`,
      firstParagraph: `Sua pia, ralo ou vaso sanitário entupiu em ${cidade}? Nossa equipe atende sua casa rapidamente com técnicos educados, trabalho 100% limpo sem quebrar azulejos ou pisos e orçamento gratuito na sua residência.`,
      ctaButtonText: `Chamar Encanador no WhatsApp`,
      lastH2: `A desentupidora mais recomendada pelas famílias de ${cidade}`,
      bairros,
      services: [
        { title: 'Desentupimento de Pia de Cozinha', description: 'Desobstrução rápida de gordura acumulada sem estragar o sifão e com limpeza total do local.', icon: '🚰' },
        { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e cuidadoso. Desobstruímos seu vaso sanitário sem remover a louça.', icon: '🚽' },
        { title: 'Desentupimento de Ralo e Banheiro', description: 'Remoção de cabelos, sabonetes e sujeiras em ralos de chuveiro, lavanderias e quintais.', icon: '🛁' },
        { title: 'Desentupimento de Rede de Esgoto', description: 'Máquinas elétricas com sondas flexíveis que limpam as tubulações da casa com máxima segurança.', icon: '🚿' },
        { title: 'Limpeza de Caixa de Gordura Residencial', description: 'Remoção de resíduos sólidos para evitar mau cheiro e refluxo de água na cozinha.', icon: '🛢️' },
        { title: 'Limpeza de Fossa Séptica Residencial', description: 'Esgotamento rápido com caminhão limpa fossa para chácaras e residências de ${cidade}.', icon: '🚛' }
      ],
      faqs: [
        { question: `Vocês atendem emergências 24 horas em ${cidade}?`, answer: `Sim! Nosso plantão atende residências 24 horas por dia, todos os dias da semana, inclusive sábados, domingos e feriados.` },
        { question: `Qual o tempo estimado de chegada na minha residência em ${cidade}?`, answer: `Nossos técnicos estão distribuídos pelos principais bairros e chegam em média entre 20 e 35 minutos.` },
        { question: `A visita técnica para avaliação em ${cidade} é gratuita?`, answer: `Sim! A visita é 100% gratuita e sem compromisso. O técnico avalia o local e passa a melhor solução antes de iniciar.` },
        { question: `Precisa quebrar o piso ou as paredes para desentupir?`, answer: `Em 99% dos casos não quebramos nada. Usamos maquinário rotativo especializado que passa pelas curvas do encanamento limpando tudo por dentro.` },
        { question: `Qual é a garantia dos serviços de desentupimento residencial?`, answer: `Fornecemos garantia total por escrito de até 90 dias para todos os serviços residenciais em ${cidade}.` },
        { question: `Quais tipos de desentupimento residencial vocês realizam?`, answer: `Desentupimos pias, ralos de banheiro e quintal, vasos sanitários, caixas de gordura, colunas e redes gerais de esgoto.` }
      ],
      testimonials: [
        { name: 'Dona Maria Helena', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Os rapazes foram muito educados, usaram protetor nos sapatos e desentupiram a pia da minha cozinha em 20 minutos sem deixar nenhuma sujeira.` },
        { name: 'Renato Guimarães', neighborhood: `${bairros[0] || 'Centro'} - ${cidade}`, rating: 5, text: `Chamei num domingo para desentupir o vaso sanitário e chegaram muito rápido. Trabalho limpo, rápido e com garantia.` },
        { name: 'Carla Silveira', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `Excelente atendimento! Limparam a caixa de gordura e o ralo do banheiro sem nenhum mau cheiro na casa.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'industrial-hidrojato') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'industrial-hidrojato',
      status: 'pendente',
      hospedagem,
      paletaCores: 'industrial-amarelo',
      heroVariant: 'HeroV2',
      servicesVariant: 'ServicesGridV2',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}997665544`,
      telefoneFixo: `(${ddd}) 3600-0000`,
      empresaNome: `Limpa Fossa & Hidrojato ${cidade}`,
      cnpj: '45.678.901/0001-23',
      endereco: `Rodovia Principal, Km 5 - Distrito Industrial, ${cidade} - ${uf}`,
      h1Title: `Limpa Fossa e Hidrojateamento 24h em ${cidade} ${uf}`,
      firstParagraph: `Frota própria de caminhões auto-vácuo de alta capacidade e hidrojateamento pressurizado para esgotamento de fossas sépticas, caixas de decantação e redes industriais em todos os bairros e distritos de ${cidade}.`,
      ctaButtonText: `Solicitar Caminhão Auto-Vácuo`,
      lastH2: `Líder em sucção de fossas e hidrojateamento pesado em ${cidade}`,
      bairros,
      services: [
        { title: 'Esgotamento de Fossa Séptica e Negra', description: 'Caminhões vácuo de 8m³ a 15m³ para sucção rápida e descarte certificado em estação de tratamento.', icon: '🚛' },
        { title: 'Hidrojateamento de Alta Pressão Industrial', description: 'Pressão de até 1.000 bar para remoção de incrustações pesadas em galerias e tubulações.', icon: '🌊' },
        { title: 'Limpeza de Caixas de Gordura e Decantação', description: 'Remoção e transporte de lodo industrial e resíduos oleosos com total conformidade ambiental.', icon: '🏭' },
        { title: 'Desentupimento de Galerias e Redes Pluviais', description: 'Limpeza pesada de tubulações pluviais e manilhas de escoamento público e privado.', icon: '🛣️' },
        { title: 'Desentupimento de Esgoto Geral', description: 'Desobstrução de redes principais em indústrias, galpões e grandes instalações.', icon: '⚙️' },
        { title: 'Transporte e Destinação de Efluentes', description: 'Certificado de destinação final expedido conforme as normas da legislação ambiental.', icon: '📜' }
      ],
      faqs: [
        { question: `A empresa possui licença ambiental para descarte de fossas em ${cidade}?`, answer: `Sim, possuímos todas as licenças dos órgãos ambientais e entregamos o Manifesto de Transporte de Resíduos (MTR) para cada serviço realizado.` },
        { question: `Qual a capacidade dos caminhões limpa fossa em ${cidade}?`, answer: `Dispomos de caminhões com tanques de 8.000 a 15.000 litros, atendendo desde residências até grandes indústrias.` },
        { question: `Vocês realizam hidrojateamento de alta pressão em galerias em ${cidade}?`, answer: `Sim, nossa frota conta com bombas de alta pressão para desobstrução e higienização profunda de manilhas e redes pluviais.` },
        { question: `Qual o prazo para atendimento com caminhão auto-vácuo?`, answer: `Atendemos chamados programados e emergências 24 horas em qualquer distrito ou bairro industrial de ${cidade}.` },
        { question: `A visita técnica para orçamento de hidrojato é gratuita?`, answer: `Sim, nossos técnicos realizam a vistoria técnica no local sem qualquer custo ou taxa de deslocamento.` },
        { question: `O serviço industrial acompanha certificado e garantia?`, answer: `Sim, todos os serviços são acompanhados de certificado de garantia por escrito e laudo de conformidade técnica.` }
      ],
      testimonials: [
        { name: 'Transportadora Vale do Sol', neighborhood: `Distrito Industrial - ${cidade}`, rating: 5, text: `Serviço impecável na sucção das fossas e limpeza dos tanques da garagem de carretas. Caminhão moderno e documentação 100% correta.` },
        { name: 'Indústria Metalúrgica Progresso', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Hidrojateamento de altíssima eficiência nas galerias pluviais da nossa fábrica. Equipe com EPIs e segurança impecável.` },
        { name: 'Galpão Logístico Sul', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Contratamos para esgotamento e desobstrução das caixas de decantação. Serviço rápido e sem paralisar nossa operação.` }
      ],
      auditScore: 0
    };
  }

  // DEFAULT: URGENCIA-24H
  return {
    id: cityKey,
    cidade,
    uf,
    populacao,
    modeloTemplate: 'urgencia-24h',
    status: 'pendente',
    hospedagem,
    paletaCores: 'urgencia-azul-laranja',
    heroVariant: 'HeroV1',
    servicesVariant: 'ServicesGridV1',
    dominio: `desentupidoralinhares.com.br`,
    whatsapp: `${ddd}992795590`,
    telefoneFixo: `(${ddd}) 3323-0000`,
    empresaNome: `Desentupidora ${cidade} 24h`,
    cnpj: '12.345.678/0001-90',
    endereco: `Av. Central, 500 - Centro, ${cidade} - ${uf}`,
    h1Title: `Desentupidora em ${cidade} ${uf} 24h`,
    firstParagraph: `Precisando de uma desentupidora em ${cidade} ${uf} urgente? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos e limpeza de fossas sépticas em todos os bairros de ${cidade} e região, com garantia por escrito e o menor preço.`,
    ctaButtonText: `Solicitar Visita Grátis no WhatsApp`,
    lastH2: `Por que escolher a melhor Desentupidora em ${cidade} ${uf}?`,
    bairros,
    services: [
      { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa e hidrojateamento.', icon: '🚿' },
      { title: 'Desentupimento de Pia', description: 'Remoção de gordura e restos de alimentos bloqueando a tubulação da cozinha sem danificar o sifão.', icon: '🚰' },
      { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e rápido para vasos entupidos. Desobstruímos sem quebrar pisos ou louças.', icon: '🚽' },
      { title: 'Desentupimento de Ralo', description: 'Limpeza de ralos de banheiros, quintais e lavanderias bloqueados por sujeira acumulada.', icon: '🛁' },
      { title: 'Esgotamento e Limpeza de Fossa', description: 'Caminhão auto-vácuo equipado para sucção e descarte ecológico de fossas sépticas.', icon: '🚛' },
      { title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem interna pressurizada para higienização e desobstrução profunda em tubulações.', icon: '🌊' }
    ],
    faqs: [
      { question: `Qual o valor cobrado para um desentupimento em ${cidade}?`, answer: `O orçamento é 100% gratuito e feito no local após avaliação da tubulação com o melhor preço da região.` },
      { question: `Vocês atendem emergências 24 horas aos finais de semana em ${cidade}?`, answer: `Sim! Nossas equipes de plantão em ${cidade} operam 24 horas por dia, 7 dias por semana, inclusive domingos e feriados.` },
      { question: `Qual o tempo estimado de chegada até o meu endereço em ${cidade}?`, answer: `Devido às equipes posicionadas nos principais bairros de ${cidade}, nosso tempo médio de chegada é de 20 a 40 minutos.` },
      { question: `O serviço possui alguma garantia?`, answer: `Oferecemos garantia total por escrito em todos os nossos serviços, respeitando as normas do Código de Defesa do Consumidor.` },
      { question: `Precisa quebrar o piso ou a parede para realizar o desentupimento?`, answer: `Na grande maioria das vezes não! Utilizamos equipamentos rotativos profissionais que desobstruem as tubulações por dentro, sem necessidade de quebrar nada.` },
      { question: `Quais formas de pagamento vocês aceitam?`, answer: `Facilitamos o pagamento. Aceitamos cartões de crédito, débito, Pix e dinheiro. Condições especiais podem ser negociadas diretamente com o técnico no local.` }
    ],
    testimonials: [
      { name: 'Carlos Eduardo M.', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Atendimento nota 1000! O esgoto do banheiro transbordou num domingo à noite e a equipe chegou em 25 minutos. Resolveram sem quebrar nada!` },
      { name: 'Juliana Fernandes', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `A pia da cozinha estava parada há dias. O técnico foi super educado, fez o orçamento grátis e o serviço foi muito rápido. Recomendo muito!` },
      { name: 'Roberto Almeida', neighborhood: `${bairros[2] || 'Bairro'} - ${cidade}`, rating: 5, text: `Preço justo e serviço limpo. Achei que iam cobrar uma fortuna pela urgência de madrugada, mas foram super transparentes.` }
    ],
    auditScore: 0
  };
}
