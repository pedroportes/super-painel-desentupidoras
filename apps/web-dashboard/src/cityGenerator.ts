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

export interface PartnerItem {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  dominio: string;
  url: string;
  descricao: string;
  logo?: string;
  status: 'ativo' | 'inativo';
  tipo: 'Parceiro de atendimento' | 'Empresa parceira' | 'Rede de atendimento' | 'Indicação regional';
}

export interface CityConfig {
  id: string;
  cidade: string;
  uf: string;
  // Prevents unverified draft records from rendering fallback commercial data.
  isDraft?: boolean;
  qualityGateRequired?: boolean;
  deployUrl?: string;
  lastDeployAt?: string;
  // Nome REAL do projeto na Cloudflare Pages (distinto do subdomínio
  // .pages.dev, que pode ganhar sufixo aleatório em caso de colisão global
  // de nome). Só existe pra cidades hospedadas na Cloudflare. Ver
  // deployEngine.cjs para o porquê disso nunca poder ser re-derivado da URL.
  cloudflareProjectName?: string;
  // Id do serviço Static Site criado na Render (ex: "srv_abc123") — só
  // existe pra cidades hospedadas na Render. Precisa ser reusado em todo
  // redeploy seguinte, senão cada deploy cria um serviço novo em vez de
  // atualizar o existente. Ver deployEngine.cjs.
  renderServiceId?: string;
  populacao: string;
  // 30/08/2026: eram só 4 modelos, e 2 deles (residencial-bairros,
  // industrial-hidrojato) compartilhavam heroVariant/servicesVariant com
  // outro modelo — "4 modelos" era na prática "2 esqueletos visuais".
  // Corrigido: agora são 8 modelos, cada um com sua própria combinação de
  // hero+serviços (e alguns com seções desligadas via sectionsConfig) —
  // pedido explícito do usuário: "modelo" tem que ser estrutura diferente,
  // não só cor/texto em cima do mesmo layout.
  // 02/09/2026: novos modelos entram de forma estritamente aditiva, sem
  // alterar IDs nem combinações dos 8 existentes.
  modeloTemplate: 'urgencia-24h' | 'corporativo-empresarial' | 'residencial-bairros' | 'industrial-hidrojato' | 'premium-clean' | 'rapido-economico' | 'familia-seguranca' | 'tecnico-especializado' | 'bairro-referencia' | 'agenda-premium' | 'condominio-proativo' | 'premium-chatgpt';
  status: 'ativo' | 'em_construcao' | 'pendente';
  hospedagem: 'cloudflare' | 'vercel' | 'netlify' | 'render';
  paletaCores: 'urgencia-azul-laranja' | 'corporativo-verde-cinza' | 'residencial-bege' | 'industrial-amarelo' | 'clean-azul' | 'bairro-azul-petroleo' | 'premium-chumbo-dourado' | 'proativo-vinho-areia' | 'premium-ocean-teal';
  heroVariant: 'HeroV1' | 'HeroV2' | 'HeroV3' | 'HeroV4' | 'HeroV5' | 'HeroV6' | 'HeroV7';
  servicesVariant: 'ServicesGridV1' | 'ServicesGridV2' | 'ServicesGridV3' | 'ServicesGridV4' | 'ServicesGridV5' | 'ServicesGridV6' | 'ServicesGridV7';
  // Liga/desliga seções da home por modelo (ex: um modelo família pode
  // preferir não ter os "sinais de alerta" alarmistas). Ausente = tudo
  // ligado (nunca quebra cidade antiga sem esse campo).
  sectionsConfig?: { warningSigns?: boolean; cityContext?: boolean };
  dominio: string;
  whatsapp: string;
  telefoneFixo?: string;
  empresaNome?: string;
  cnpj?: string;
  endereco?: string;
  logoUrl?: string;
  logoHeight?: number;
  faviconUrl?: string;
  heroImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  h1Title?: string;
  firstParagraph?: string;
  ctaButtonText?: string;
  lastH2?: string;
  aboutCityTitle?: string;
  aboutCityText?: string;
  bairros?: string[];
  services?: ServiceItem[];
  faqs?: FaqItem[];
  testimonials?: TestimonialItem[];
  parceiros?: PartnerItem[];
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
  modelo: CityConfig['modeloTemplate'] = 'urgencia-24h',
  hospedagem: 'cloudflare' | 'vercel' | 'netlify' | 'render' = 'cloudflare'
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
      aboutCityTitle: `Estrutura de Atendimento Corporativo e Predial em ${cidade} - ${uf}`,
      aboutCityText: `${cidade} destaca-se como um polo estratégico com mais de ${populacao} habitantes, concentrando forte atividade empresarial, redes de comércio e condomínios residenciais. Para atender com eficiência o alto padrão exigido por síndicos e administradoras de ${cidade}, nossa empresa mantém frotas de prontidão para diagnósticos rápidos e desobstruções técnicas com equipamentos não-destrutivos.`,
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
      // 30/08/2026: era HeroV1+ServicesGridV1, igual ao modelo padrão
      // (urgencia-24h) — corrigido pra ter layout próprio de verdade.
      heroVariant: 'HeroV4',
      servicesVariant: 'ServicesGridV1',
      sectionsConfig: { warningSigns: false },
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
      aboutCityTitle: `Atendimento Residencial Especializado em ${cidade} - ${uf}`,
      aboutCityText: `Com mais de ${populacao} habitantes, ${cidade} é um município vibrante e acolhedor. Nossa missão é garantir a tranquilidade e higiene dos lares de ${cidade}, atuando com profissionais uniformizados e equipamentos rotativos modernos que resolvem entupimentos de pias, ralos e vasos sem causar danos a pisos e azulejos.`,
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
      // 30/08/2026: era HeroV2+ServicesGridV2, igual ao modelo
      // corporativo-empresarial — corrigido pra ter layout próprio.
      heroVariant: 'HeroV3',
      servicesVariant: 'ServicesGridV4',
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
      aboutCityTitle: `Estrutura de Hidrojateamento e Limpeza Pesada em ${cidade} - ${uf}`,
      aboutCityText: `Com ampla malha industrial e logística atendendo mais de ${populacao} habitantes, ${cidade} demanda suporte pesado e contínuo em redes de saneamento. Nossa base operacional dispõe de caminhões vácuo e bombas de alta pressão licenciados para desentupimentos industriais e descarte ecológico.`,
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

  if (modelo === 'premium-clean') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'premium-clean',
      status: 'pendente',
      hospedagem,
      paletaCores: 'clean-azul',
      heroVariant: 'HeroV2',
      servicesVariant: 'ServicesGridV4',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}996554433`,
      telefoneFixo: `(${ddd}) 3700-0000`,
      empresaNome: `Desentupidora Premium ${cidade}`,
      cnpj: '56.789.012/0001-34',
      endereco: `Rua das Palmeiras, 800 - Centro, ${cidade} - ${uf}`,
      h1Title: `Desentupidora Premium em ${cidade} ${uf}`,
      firstParagraph: `Uma desentupidora em ${cidade} com padrão técnico elevado: equipamentos de última geração, equipe uniformizada e certificada, e um atendimento discreto e pontual, sem transtorno pro seu dia.`,
      ctaButtonText: `Agendar Avaliação Técnica`,
      lastH2: `Por que ${cidade} confia na desentupidora premium da região?`,
      aboutCityTitle: `Padrão Técnico Elevado em ${cidade} - ${uf}`,
      aboutCityText: `${cidade} tem mais de ${populacao} habitantes e um mercado cada vez mais exigente por serviços técnicos de qualidade. Nossa operação em ${cidade} foi montada pra atender esse padrão: equipamentos calibrados, protocolos de higienização e uma equipe que documenta cada etapa do serviço com relatório técnico.`,
      bairros,
      services: [
        { title: 'Desentupimento de Esgoto', description: 'Diagnóstico por vídeo inspeção antes de qualquer intervenção, com relatório técnico do problema.', icon: '🚿' },
        { title: 'Desentupimento de Pia', description: 'Desobstrução de precisão sem desgaste da tubulação, com produtos que não corroem metais.', icon: '🚰' },
        { title: 'Desentupimento de Vaso Sanitário', description: 'Procedimento limpo e silencioso, sem remoção de louças ou danos ao acabamento do banheiro.', icon: '🚽' },
        { title: 'Desentupimento de Ralo', description: 'Higienização completa do ponto de escoamento, eliminando odores na origem.', icon: '🛁' },
        { title: 'Esgotamento de Fossa', description: 'Coleta com destinação certificada e emissão de comprovante ambiental.', icon: '🚛' },
        { title: 'Hidrojateamento de Precisão', description: 'Pressão calibrada por tipo de tubulação, evitando desgaste em encanamentos antigos.', icon: '🌊' }
      ],
      faqs: [
        { question: `A desentupidora premium em ${cidade} emite relatório técnico do serviço?`, answer: `Sim, todo serviço é documentado com relatório técnico e, quando solicitado, registro fotográfico do antes e depois.` },
        { question: `O atendimento em ${cidade} é discreto, sem uniforme chamativo ou caminhão grande?`, answer: `Sim, trabalhamos com veículos e uniformes discretos, pensando em condomínios e imóveis de alto padrão.` },
        { question: `Vocês atendem com hora marcada em ${cidade}?`, answer: `Sim, além do plantão de emergência, oferecemos agendamento com horário fixo pra quem prefere planejar.` },
        { question: `Qual o diferencial técnico da desentupidora premium?`, answer: `Equipamentos calibrados, produtos que não corroem tubulação e uma equipe treinada continuamente.` },
        { question: `A avaliação técnica em ${cidade} tem custo?`, answer: `Não, a avaliação é gratuita e sem compromisso.` },
        { question: `Vocês atendem condomínios de alto padrão em ${cidade}?`, answer: `Sim, é um dos nossos focos principais, com protocolo de acesso e horário combinados com a administração.` }
      ],
      testimonials: [
        { name: 'Arq. Fernanda Losso', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Equipe extremamente profissional. Documentaram tudo e não deixaram vestígio nenhum de sujeira no apartamento.` },
        { name: 'Condomínio Bella Vista', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Contratamos pela discrição e pontualidade. Chegaram no horário marcado e resolveram sem incomodar os moradores.` },
        { name: 'Ricardo Whitaker', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `Voltou a funcionar perfeitamente e ainda recebi um relatório explicando o que foi feito. Muito profissional.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'rapido-economico') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'rapido-economico',
      status: 'pendente',
      hospedagem,
      paletaCores: 'urgencia-azul-laranja',
      heroVariant: 'HeroV1',
      servicesVariant: 'ServicesGridV3',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}995443322`,
      telefoneFixo: `(${ddd}) 3800-0000`,
      empresaNome: `Desentupidora Rápida ${cidade}`,
      cnpj: '67.890.123/0001-45',
      endereco: `Av. Brasil, 300 - Centro, ${cidade} - ${uf}`,
      h1Title: `Desentupidora Rápida e Econômica em ${cidade} ${uf}`,
      firstParagraph: `Precisa de uma desentupidora em ${cidade} rápida e sem gastar uma fortuna? Chegamos em minutos, cobramos preço justo e nunca escondemos o valor no orçamento.`,
      ctaButtonText: `Pedir Orçamento Rápido no WhatsApp`,
      lastH2: `A desentupidora mais rápida e em conta de ${cidade}`,
      aboutCityTitle: `Atendimento Rápido e Justo em ${cidade} - ${uf}`,
      aboutCityText: `${cidade} tem mais de ${populacao} habitantes e muita gente que não pode esperar horas nem pagar caro por um desentupimento simples. Montamos a operação em ${cidade} pra resolver rápido, com preço fechado antes de começar o serviço — sem taxa escondida, sem letra miúda.`,
      bairros,
      services: [
        { title: 'Desentupimento de Esgoto', description: 'Atendimento rápido com preço fechado antes de começar, sem taxa de deslocamento.', icon: '🚿' },
        { title: 'Desentupimento de Pia', description: 'Serviço básico rápido, ideal pra quem quer resolver sem gastar muito.', icon: '🚰' },
        { title: 'Desentupimento de Vaso Sanitário', description: 'Solução rápida e em conta pra voltar a usar o banheiro ainda hoje.', icon: '🚽' },
        { title: 'Desentupimento de Ralo', description: 'Serviço econômico de limpeza rápida de ralos de banheiro e área de serviço.', icon: '🛁' },
        { title: 'Esgotamento de Fossa', description: 'Preço competitivo pra esgotamento de fossa residencial, sem pegadinha.', icon: '🚛' },
        { title: 'Hidrojateamento Básico', description: 'Opção econômica de hidrojateamento pra entupimentos mais simples.', icon: '🌊' }
      ],
      faqs: [
        { question: `Qual o valor médio de um desentupimento em ${cidade}?`, answer: `Trabalhamos com preço fechado, informado antes de qualquer serviço — sem surpresa na hora de pagar.` },
        { question: `Vocês são realmente os mais rápidos de ${cidade}?`, answer: `Mantemos equipes espalhadas pela cidade pra reduzir o tempo de chegada e resolver o quanto antes.` },
        { question: `Tem taxa de visita em ${cidade}?`, answer: `Não, a visita e o orçamento são sempre gratuitos.` },
        { question: `Dá pra parcelar o pagamento em ${cidade}?`, answer: `Sim, aceitamos cartão, Pix e parcelamento em determinadas condições, combinado direto com o técnico.` },
        { question: `Serviço econômico tem menos garantia?`, answer: `Não, a garantia por escrito é a mesma, independente do serviço contratado.` },
        { question: `Vocês atendem de madrugada em ${cidade}?`, answer: `Sim, plantão 24 horas, com o mesmo preço justo combinado.` }
      ],
      testimonials: [
        { name: 'Josiane Amaral', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Precisava resolver rápido e sem gastar muito. Chegaram em 20 minutos e o preço foi exatamente o combinado.` },
        { name: 'Edmilson Costa', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Comparei com outras empresas e essa foi a mais rápida e mais barata, sem enrolação.` },
        { name: 'Patrícia Nunes', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `Serviço simples, rápido e no preço combinado desde o início. Recomendo.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'familia-seguranca') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'familia-seguranca',
      status: 'pendente',
      hospedagem,
      paletaCores: 'residencial-bege',
      heroVariant: 'HeroV4',
      servicesVariant: 'ServicesGridV2',
      sectionsConfig: { warningSigns: false },
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}994332211`,
      telefoneFixo: `(${ddd}) 3900-0000`,
      empresaNome: `Desentupidora Segura ${cidade}`,
      cnpj: '78.901.234/0001-56',
      endereco: `Rua da Paz, 150 - Centro, ${cidade} - ${uf}`,
      h1Title: `Desentupidora de Confiança pra Sua Família em ${cidade} ${uf}`,
      firstParagraph: `Sua família merece uma desentupidora em ${cidade} de confiança de verdade: técnicos identificados, uniformizados e treinados pra entrar na sua casa com respeito, cuidado e sem sujeira.`,
      ctaButtonText: `Chamar um Técnico de Confiança`,
      lastH2: `A desentupidora de confiança que as famílias de ${cidade} recomendam`,
      aboutCityTitle: `Segurança e Confiança pras Famílias de ${cidade} - ${uf}`,
      aboutCityText: `${cidade} tem mais de ${populacao} habitantes e muitas famílias que preferem saber exatamente quem está entrando em casa. Todos os nossos técnicos em ${cidade} são identificados, uniformizados e passam por treinamento antes de atender — pensado pra quem quer tranquilidade, não só um conserto rápido.`,
      bairros,
      services: [
        { title: 'Desentupimento de Esgoto', description: 'Técnico identificado, uniformizado, com crachá visível durante todo o atendimento.', icon: '🚿' },
        { title: 'Desentupimento de Pia', description: 'Atendimento cuidadoso, sem pressa, respeitando o ambiente da sua cozinha.', icon: '🚰' },
        { title: 'Desentupimento de Vaso Sanitário', description: 'Serviço higiênico, com proteção de calçado e limpeza do local ao final.', icon: '🚽' },
        { title: 'Desentupimento de Ralo', description: 'Ideal pra banheiro de criança e idoso, com produtos seguros e sem odor forte.', icon: '🛁' },
        { title: 'Esgotamento de Fossa Residencial', description: 'Serviço agendado com antecedência pra não atrapalhar a rotina da família.', icon: '🚛' },
        { title: 'Hidrojateamento Residencial', description: 'Feito com cuidado extra em casas com crianças e animais de estimação.', icon: '🌊' }
      ],
      faqs: [
        { question: `Os técnicos que atendem em ${cidade} são identificados?`, answer: `Sim, todos usam uniforme e crachá com identificação, e você pode confirmar por telefone antes de abrir a porta.` },
        { question: `É seguro chamar uma desentupidora com crianças em casa em ${cidade}?`, answer: `Sim, nossos técnicos são treinados pra atender com cuidado redobrado em casas com crianças e idosos.` },
        { question: `Dá pra agendar um horário fixo em vez de esperar em ${cidade}?`, answer: `Sim, oferecemos agendamento com horário combinado, ideal pra quem organiza a rotina da família.` },
        { question: `Vocês usam produto forte que faz mal à família em ${cidade}?`, answer: `Não, priorizamos métodos mecânicos e produtos seguros para uso residencial com crianças e pets.` },
        { question: `A visita técnica em ${cidade} é gratuita?`, answer: `Sim, sempre gratuita e sem compromisso.` },
        { question: `Vocês limpam a sujeira depois do serviço em ${cidade}?`, answer: `Sim, deixamos o ambiente limpo como encontramos, sempre.` }
      ],
      testimonials: [
        { name: 'Débora Marchesini', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Tenho filhos pequenos e fiquei tranquila com o técnico identificado e todo cuidado que tiveram dentro de casa.` },
        { name: 'Sr. Aparecido Lima', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Sou idoso e moro sozinho, e o rapaz foi super educado e respeitoso. Me senti seguro em deixar ele entrar.` },
        { name: 'Cristiane Bonfim', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `Agendei um horário e chegaram certinho, sem atrasar. Meus filhos nem perceberam a visita.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'tecnico-especializado') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'tecnico-especializado',
      status: 'pendente',
      hospedagem,
      paletaCores: 'corporativo-verde-cinza',
      heroVariant: 'HeroV3',
      servicesVariant: 'ServicesGridV3',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}993221100`,
      telefoneFixo: `(${ddd}) 4000-0000`,
      empresaNome: `Desentupidora Técnica ${cidade}`,
      cnpj: '89.012.345/0001-67',
      endereco: `Rua da Engenharia, 400 - Distrito Técnico, ${cidade} - ${uf}`,
      h1Title: `Desentupidora Técnica Especializada em ${cidade} ${uf}`,
      firstParagraph: `Uma desentupidora em ${cidade} que explica o diagnóstico antes de agir: usamos vídeo inspeção pra identificar a causa real do entupimento e escolher o método certo, em vez de simplesmente "tentar e ver".`,
      ctaButtonText: `Solicitar Diagnóstico Técnico`,
      lastH2: `A desentupidora técnica que investiga a causa real em ${cidade}`,
      aboutCityTitle: `Diagnóstico Técnico Especializado em ${cidade} - ${uf}`,
      aboutCityText: `${cidade} tem mais de ${populacao} habitantes e uma rede de encanamento com décadas de idades diferentes conforme o bairro. Por isso, nossa equipe em ${cidade} usa vídeo inspeção antes de intervir: identificamos raiz de árvore, colapso de tubulação, acúmulo de gordura ou objeto preso, e explicamos pro cliente exatamente o que foi encontrado antes de cobrar qualquer coisa.`,
      bairros,
      services: [
        { title: 'Vídeo Inspeção de Tubulação', description: 'Câmera de alta resolução identifica a causa exata do entupimento antes de qualquer intervenção.', icon: '📹' },
        { title: 'Desentupimento de Esgoto', description: 'Método escolhido conforme o diagnóstico: rotativo, hidrojato ou combinação dos dois.', icon: '🚿' },
        { title: 'Desentupimento de Pia e Ralo', description: 'Diagnóstico rápido pra obstruções domésticas simples, com explicação da causa.', icon: '🚰' },
        { title: 'Reparo de Tubulação Colapsada', description: 'Identificação de trechos danificados que causam entupimento recorrente.', icon: '🔧' },
        { title: 'Hidrojateamento Técnico', description: 'Pressão ajustada conforme o material e idade da tubulação identificados na inspeção.', icon: '🌊' },
        { title: 'Laudo Técnico de Diagnóstico', description: 'Relatório com fotos/vídeo do problema encontrado, útil pra laudos e seguros.', icon: '📄' }
      ],
      faqs: [
        { question: `A vídeo inspeção em ${cidade} tem custo separado?`, answer: `A vídeo inspeção está incluída na visita técnica gratuita quando necessária pro diagnóstico.` },
        { question: `Como saber a causa real do entupimento recorrente em ${cidade}?`, answer: `Usamos câmera de inspeção pra identificar raiz, colapso ou obstrução específica, em vez de tentar às cegas.` },
        { question: `Vocês emitem laudo técnico em ${cidade}?`, answer: `Sim, entregamos laudo com registro do problema encontrado, útil pra laudos de imóvel ou seguro.` },
        { question: `O diagnóstico técnico demora mais que um desentupimento comum?`, answer: `Leva alguns minutos a mais, mas evita retrabalho e intervenção no lugar errado.` },
        { question: `Vocês atendem tubulação com raiz de árvore em ${cidade}?`, answer: `Sim, é uma das causas mais identificadas na inspeção, e usamos equipamento específico de corte.` },
        { question: `A visita técnica com inspeção é gratuita em ${cidade}?`, answer: `Sim, sempre gratuita e sem compromisso.` }
      ],
      testimonials: [
        { name: 'Eng. Marcelo Tanaka', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Fizeram a inspeção por câmera e mostraram exatamente onde estava o problema. Muito mais profissional que só "tentar".` },
        { name: 'Síndica Ana Paula Reis', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Precisava de laudo técnico pro seguro do condomínio e eles entregaram completo, com fotos do problema.` },
        { name: 'Vinícius Bastos', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `Entupia toda semana e ninguém sabia por quê. Descobriram a raiz de árvore na tubulação com a câmera.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'bairro-referencia') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'bairro-referencia',
      status: 'pendente',
      hospedagem,
      paletaCores: 'bairro-azul-petroleo',
      heroVariant: 'HeroV5',
      servicesVariant: 'ServicesGridV5',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}991114477`,
      telefoneFixo: `(${ddd}) 4100-0000`,
      empresaNome: `Desentupidora Referência ${cidade}`,
      cnpj: '11.214.356/0001-78',
      endereco: `Rua da Base Local, 220 - Centro, ${cidade} - ${uf}`,
      h1Title: `Desentupidora de Referência nos Bairros de ${cidade} ${uf}`,
      firstParagraph: `Se você quer uma desentupidora em ${cidade} que realmente conhece os bairros e não só anuncia na cidade inteira, esse modelo foi pensado para isso: atendimento local organizado, rota rápida e explicação clara do serviço antes de começar.`,
      ctaButtonText: `Pedir equipe do seu bairro`,
      lastH2: `Por que escolher uma desentupidora com presença real nos bairros de ${cidade}?`,
      aboutCityTitle: `Cobertura Local Organizada em ${cidade} - ${uf}`,
      aboutCityText: `${cidade} reúne mais de ${populacao} habitantes espalhados entre regiões com ritmos bem diferentes de atendimento. Por isso estruturamos a operação com cobertura de bairro, priorizando deslocamento curto, comunicação objetiva e uma leitura mais realista do tipo de entupimento encontrado em cada região de ${cidade}.`,
      bairros,
      services: [
        { title: 'Desentupimento de Esgoto por Região', description: `Triagem rápida para mandar a equipe certa ao seu trecho de ${cidade}, evitando perda de tempo e retrabalho.`, icon: '🗺️' },
        { title: 'Desentupimento de Pia e Cozinha', description: 'Atendimento local para gordura, sifão e retorno de água com diagnóstico simples e execução limpa.', icon: '🚰' },
        { title: 'Desentupimento de Vaso Sanitário', description: 'Resposta ágil para urgências domésticas com orientação clara antes da execução.', icon: '🚽' },
        { title: 'Desentupimento de Ralos e Quintais', description: 'Equipe preparada para áreas molhadas, ralos externos e retorno de mau cheiro em casas e comércios.', icon: '🛁' },
        { title: 'Limpeza de Caixa de Gordura', description: 'Serviço programado ou emergencial com foco em prevenção de retorno e mau odor.', icon: '🛢️' },
        { title: 'Hidrojateamento Localizado', description: 'Aplicação quando o cenário pede limpeza mais profunda sem assumir intervenção pesada antes do necessário.', icon: '🌊' }
      ],
      faqs: [
        { question: `Vocês atendem todos os bairros de ${cidade}?`, answer: `Sim. Organizamos a operação por regiões de ${cidade} justamente para manter previsibilidade no deslocamento e no tempo de resposta.` },
        { question: `O técnico que vai até meu bairro em ${cidade} já sabe qual serviço é mais comum na região?`, answer: `Sim. A triagem considera o bairro e o tipo de sintoma relatado para priorizar a frente mais adequada.` },
        { question: `O atendimento em ${cidade} também serve para condomínio e comércio de bairro?`, answer: `Sim, esse modelo cobre residências, pequenos comércios e condomínios com a mesma lógica de proximidade.` },
        { question: `Vocês cobram taxa só para visitar meu endereço em ${cidade}?`, answer: `Não. A visita e o orçamento continuam gratuitos.` },
        { question: `Precisa quebrar piso para resolver o problema?`, answer: `Na maioria dos casos não. Avaliamos primeiro e priorizamos métodos internos de desobstrução.` },
        { question: `Dá para chamar pelo WhatsApp e já informar o bairro em ${cidade}?`, answer: `Sim. Esse é o jeito mais rápido de encaixar sua solicitação na frente local correta.` }
      ],
      testimonials: [
        { name: 'Mariana Ribas', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Pedi ajuda já informando meu bairro e o técnico chegou com a abordagem certa, sem perder tempo tentando adivinhar o problema.` },
        { name: 'Rogério Pacheco', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Gostei porque explicaram o atendimento de forma objetiva e o deslocamento foi bem mais rápido que em outras empresas.` },
        { name: 'Lívia Telles', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `Atendimento limpo, rápido e com a sensação de que realmente conhecem a rotina dos bairros daqui.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'agenda-premium') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'agenda-premium',
      status: 'pendente',
      hospedagem,
      paletaCores: 'premium-chumbo-dourado',
      heroVariant: 'HeroV6',
      servicesVariant: 'ServicesGridV5',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}992225588`,
      telefoneFixo: `(${ddd}) 4200-0000`,
      empresaNome: `Desentupidora Agenda Premium ${cidade}`,
      cnpj: '21.348.567/0001-39',
      endereco: `Alameda do Atendimento, 88 - Centro, ${cidade} - ${uf}`,
      h1Title: `Desentupidora com Agendamento Premium em ${cidade} ${uf}`,
      firstParagraph: `Precisa de uma desentupidora em ${cidade} com horário combinado, comunicação limpa e execução discreta? Este modelo prioriza atendimento planejado, confirmação clara da visita e uma experiência mais organizada do primeiro contato ao pós-serviço.`,
      ctaButtonText: `Agendar visita organizada`,
      lastH2: `Por que a desentupidora com agendamento premium em ${cidade} funciona melhor?`,
      aboutCityTitle: `Atendimento Planejado e Discreto em ${cidade} - ${uf}`,
      aboutCityText: `${cidade} tem um público cada vez mais atento a pontualidade, previsibilidade e cuidado com o imóvel. Por isso nossa frente premium em ${cidade} trabalha com confirmação de agenda, janela de atendimento bem definida e execução técnica com comunicação mais consultiva do que improvisada.`,
      bairros,
      services: [
        { title: 'Desentupimento com Hora Marcada', description: 'Ideal para apartamentos, casas ocupadas e rotinas que exigem janela de atendimento previsível.', icon: '🗓️' },
        { title: 'Desentupimento de Pia e Espaços Gourmet', description: 'Abordagem discreta para cozinhas planejadas e ambientes com acabamento delicado.', icon: '🍽️' },
        { title: 'Desentupimento de Banheiros', description: 'Atuação limpa, protegendo circulação e reduzindo impacto no uso do imóvel.', icon: '🧼' },
        { title: 'Hidrojateamento de Precisão', description: 'Aplicação técnica quando a tubulação pede limpeza profunda com controle maior da intervenção.', icon: '🌊' },
        { title: 'Vídeo Inspeção para Decisão Segura', description: 'Diagnóstico que ajuda o cliente a entender o que vale a pena fazer agora e o que pode ser programado.', icon: '📹' },
        { title: 'Relato Técnico e Garantia', description: 'Fechamento do serviço com resumo do que foi executado e orientação de prevenção.', icon: '📄' }
      ],
      faqs: [
        { question: `Vocês realmente trabalham com horário marcado em ${cidade}?`, answer: `Sim. Esse é o foco principal deste modelo: combinar janela de visita e manter comunicação mais previsível.` },
        { question: `O atendimento premium em ${cidade} também serve para emergência?`, answer: `Sim, mas ele é mais forte quando o cliente valoriza organização, discrição e clareza no processo.` },
        { question: `A equipe entra em apartamento e condomínio com postura mais discreta?`, answer: `Sim. Esse modelo foi pensado para contextos em que apresentação e rotina do imóvel importam bastante.` },
        { question: `A avaliação técnica tem custo?`, answer: `Não. A avaliação continua gratuita.` },
        { question: `Vocês explicam antes se vale vídeo inspeção ou hidrojato?`, answer: `Sim. O diferencial aqui é justamente orientar a escolha antes de executar.` },
        { question: `Dá para remarcar o atendimento em ${cidade} se surgir imprevisto?`, answer: `Sim, desde que avisado com antecedência, a agenda é reorganizada com nova janela.` }
      ],
      testimonials: [
        { name: 'Paula Sehn', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Chegaram dentro da janela combinada e conduziram tudo com muita discrição. Foi bem diferente do padrão corrido que eu esperava.` },
        { name: 'Condomínio Vista Serena', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `A organização do atendimento foi o que mais chamou atenção. Ficou claro o que fariam e em quanto tempo.` },
        { name: 'Rafael Esteves', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `Gostei porque não vieram empurrando o serviço mais caro. Explicaram o cenário e agiram só no que precisava.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'condominio-proativo') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'condominio-proativo',
      status: 'pendente',
      hospedagem,
      paletaCores: 'proativo-vinho-areia',
      heroVariant: 'HeroV5',
      servicesVariant: 'ServicesGridV6',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}993336699`,
      telefoneFixo: `(${ddd}) 4300-0000`,
      empresaNome: `Desentupidora Proativa ${cidade}`,
      cnpj: '31.459.678/0001-40',
      endereco: `Av. das Administradoras, 510 - Centro, ${cidade} - ${uf}`,
      h1Title: `Desentupidora Proativa para Condomínios em ${cidade} ${uf}`,
      firstParagraph: `Quando o objetivo não é só apagar incêndio, mas evitar reincidência, este modelo de desentupidora em ${cidade} entra com foco em rotina condominial, prevenção, priorização por risco e comunicação útil para síndicos e administradoras.`,
      ctaButtonText: `Falar sobre plano proativo`,
      lastH2: `Como a desentupidora proativa reduz emergências recorrentes em condomínios de ${cidade}?`,
      aboutCityTitle: `Prevenção e Rotina Técnica em ${cidade} - ${uf}`,
      aboutCityText: `Com mais de ${populacao} habitantes, ${cidade} reúne condomínios, centros comerciais e imóveis de uso coletivo que não podem depender apenas de chamados emergenciais. Nossa frente proativa atua com vistoria, histórico de pontos críticos e manutenção orientada por recorrência para reduzir novos entupimentos em ${cidade}.`,
      bairros,
      services: [
        { title: 'Mapeamento de Pontos Críticos', description: 'Levantamento dos trechos que mais repetem ocorrência para agir com prioridade e não só por demanda do dia.', icon: '📍' },
        { title: 'Desentupimento de Prumadas e Colunas', description: 'Atuação organizada para minimizar impacto no condomínio e proteger a rotina dos moradores.', icon: '🏢' },
        { title: 'Limpeza Programada de Caixa de Gordura', description: 'Rotina preventiva para cozinhas coletivas, áreas gourmet e operação comercial no térreo.', icon: '🛢️' },
        { title: 'Hidrojateamento Preventivo', description: 'Limpeza técnica antes da obstrução crítica, especialmente em redes que já demonstram histórico de retorno.', icon: '🌊' },
        { title: 'Vídeo Inspeção e Registro', description: 'Base para comparar recorrências e justificar decisão técnica para síndico, conselho ou administradora.', icon: '📹' },
        { title: 'Plano de Manutenção por Prioridade', description: 'Sequência prática de ações para reduzir urgências e organizar investimentos hidráulicos.', icon: '🧭' }
      ],
      faqs: [
        { question: `Vocês atendem condomínios em ${cidade} só na emergência ou também com prevenção?`, answer: `Também com prevenção. Esse modelo foi criado exatamente para reduzir reincidência e organizar manutenção.` },
        { question: `É possível montar uma rotina técnica por prioridades em ${cidade}?`, answer: `Sim. Podemos separar o que é urgente, o que é preventivo e o que precisa de acompanhamento periódico.` },
        { question: `A vídeo inspeção ajuda administradora e síndico a justificar decisão?`, answer: `Sim. Ela traz evidência visual do ponto crítico e melhora a tomada de decisão.` },
        { question: `Vocês trabalham sem paralisar totalmente a rotina do condomínio?`, answer: `Sim. O planejamento da frente proativa considera janelas, áreas afetadas e comunicação com a administração.` },
        { question: `Esse atendimento também serve para centros comerciais em ${cidade}?`, answer: `Sim. Qualquer operação com uso coletivo e recorrência de problema tende a se beneficiar desse modelo.` },
        { question: `A vistoria inicial para montar o plano em ${cidade} é gratuita?`, answer: `Sim, a primeira avaliação segue sem custo.` }
      ],
      testimonials: [
        { name: 'Síndico Marcelo Azevedo', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Pararam de tratar cada entupimento como caso isolado. Mapearam os pontos mais críticos e isso já melhorou nossa rotina.` },
        { name: 'Administradora Horizonte', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `A frente preventiva deu clareza do que era urgência e do que podia entrar em cronograma. Ficou muito mais gerenciável.` },
        { name: 'Condomínio Jardim das Torres', neighborhood: `${bairros[2] || 'Centro'} - ${cidade}`, rating: 5, text: `O registro por inspeção e a ordem de prioridades evitaram dois chamados repetidos no mesmo mês.` }
      ],
      auditScore: 0
    };
  }

  if (modelo === 'premium-chatgpt') {
    return {
      id: cityKey,
      cidade,
      uf,
      populacao,
      modeloTemplate: 'premium-chatgpt',
      status: 'pendente',
      hospedagem,
      paletaCores: 'premium-ocean-teal',
      heroVariant: 'HeroV7',
      servicesVariant: 'ServicesGridV7',
      dominio: `desentupidora${cityKey}.com.br`,
      whatsapp: `${ddd}992795590`,
      telefoneFixo: `(${ddd}) 3323-0000`,
      empresaNome: `Desentupidora Premium ${cidade}`,
      cnpj: '24.981.432/0001-18',
      endereco: `Av. Principal, 1000 - Centro, ${cidade} - ${uf}`,
      h1Title: `Desentupidora em ${cidade} ${uf} 24h Especializada`,
      firstParagraph: `Soluções completas em desentupimento técnico, hidrojateamento e esgotamento em ${cidade} e região com frota própria e tecnologia de ponta para residências, condomínios e indústrias.`,
      ctaButtonText: `Solicitar Atendimento Imediato`,
      lastH2: `Por que contratar nossa equipe de desentupimento em ${cidade}?`,
      aboutCityTitle: `Atendimento Técnico Especializado em ${cidade} - ${uf}`,
      aboutCityText: `Com mais de ${populacao} habitantes, ${cidade} exige estrutura ágil e equipamentos de alta performance para resolver desentupimentos sem quebra-quebra. Nossa frota com equipamentos rotativos e caminhão auto-vácuo atende toda a área urbana com rapidez e laudo técnico.`,
      bairros,
      services: [
        { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida com sondas rotativas e hidrojato de última geração em redes coletoras e ramais.', icon: '🚿' },
        { title: 'Limpeza de Fossa Séptica', description: 'Esgotamento e transporte seguro de efluentes com caminhão auto-vácuo credenciado.', icon: '🚛' },
        { title: 'Desentupimento de Vasos e Ralos', description: 'Remoção de obstruções em vasos sanitários, ralos e caixas sifonadas sem danificar pisos ou louças.', icon: '🚽' },
        { title: 'Desobstrução de Pias e Tanques', description: 'Eliminação profunda de gordura e resíduos orgânicos nas tubulações da cozinha e lavanderia.', icon: '🚰' },
        { title: 'Hidrojateamento de Alta Pressão', description: 'Limpeza profunda e desincrustação de redes industriais, comerciais e prediais sob alta pressão.', icon: '🌊' },
        { title: 'Vídeo Inspeção Robotizada', description: 'Diagnóstico por câmera em alta definição para localizar rachaduras, raízes e pontos críticos com precisão.', icon: '📹' }
      ],
      faqs: [
        { question: `Qual é o prazo de chegada da equipe em ${cidade}?`, answer: `Contamos com viaturas volantes em pontos estratégicos de ${cidade}, chegando ao seu endereço em 20 a 40 minutos.` },
        { question: `A visita técnica e o orçamento são gratuitos em ${cidade}?`, answer: `Sim, a avaliação no local é 100% gratuita e sem qualquer compromisso.` },
        { question: `O serviço possui garantia formal?`, answer: `Sim, todos os serviços acompanham certificado de garantia por escrito de até 90 dias.` },
        { question: `Vocês quebram pisos ou paredes para desentupir?`, answer: `Não! Em mais de 98% dos chamados utilizamos maquinário rotativo K-500 e hidrojateamento que desobstruem diretamente pelos pontos de acesso.` },
        { question: `Quais são as formas de pagamento aceitas?`, answer: `Aceitamos cartões de crédito e débito (parcelamento disponível), Pix, transferência e faturamento para empresas e condomínios.` },
        { question: `O atendimento funciona 24 horas aos sábados, domingos e feriados?`, answer: `Sim! Mantemos equipes de plantão 24h ininterruptas todos os dias do ano em ${cidade}.` }
      ],
      testimonials: [
        { name: 'Ricardo Mendes', neighborhood: `${bairros[0]} - ${cidade}`, rating: 5, text: `Atendimento impecável! O caminhão chegou em 30 minutos e o técnico resolveu o esgoto entupido com muita agilidade e sem sujeira.` },
        { name: 'Patrícia Nogueira', neighborhood: `${bairros[1] || 'Centro'} - ${cidade}`, rating: 5, text: `Ótimo atendimento. Fizeram a vídeo inspeção e mostraram exatamente onde estava a obstrução na tubulação da cozinha.` },
        { name: 'Engenheiro Bruno Faria', neighborhood: `${bairros[2] || 'Distrito'} - ${cidade}`, rating: 5, text: `Contratamos para limpeza de fossa e hidrojateamento na nossa empresa. Serviço profissional, emitiram laudo e nota fiscal rapidamente.` }
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
    dominio: `desentupidora${cityKey}.com.br`,
    whatsapp: `${ddd}992795590`,
    telefoneFixo: `(${ddd}) 3323-0000`,
    empresaNome: `Desentupidora ${cidade} 24h`,
    cnpj: '12.345.678/0001-90',
    endereco: `Av. Central, 500 - Centro, ${cidade} - ${uf}`,
    h1Title: `Desentupidora em ${cidade} ${uf} 24h`,
    firstParagraph: `Precisando de uma desentupidora em ${cidade} ${uf} urgente? Nossa equipe especializada oferece atendimento emergencial 24 horas para desentupimento de esgoto, pias, vasos sanitários, ralos e limpeza de fossas sépticas em todos os bairros de ${cidade} e região, com garantia por escrito e o menor preço.`,
    ctaButtonText: `Solicitar Visita Grátis no WhatsApp`,
    lastH2: `Por que escolher a melhor Desentupidora em ${cidade} ${uf}?`,
    aboutCityTitle: `Estrutura e Atendimento de Desentupidora em ${cidade} - ${uf}`,
    aboutCityText: `${cidade} é um dos municípios mais importantes de ${uf}, reunindo mais de ${populacao} habitantes e bairros com intensa movimentação residencial e comercial. Nossa empresa mantém veículos equipados e técnicos posicionados estrategicamente em ${cidade} para chegar em até 30 minutos em emergências de esgoto, pias e ralos.`,
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
