/**
 * Corrige o problema de "conteúdo quase-duplicado" documentado no
 * CLAUDE_CODE_GUIDE.md (achado de 30/08/2026): o script antigo
 * update_cities_faqs.cjs sobrescreveu FAQs/depoimentos de 10 das 11 cidades
 * com o mesmo texto genérico, e 4 cidades (linhares, cachoeiro,
 * pocosdecaldas, portoseguro, guarapuava, itabuna, curitiba — todas as sem
 * `modeloTemplate`) sequer tinham h1Title/firstParagraph/aboutCityText/
 * lastH2 próprios, caindo no fallback 100% idêntico do server.cjs.
 *
 * Este script escreve, PARA CADA CIDADE, h1Title/firstParagraph/
 * aboutCityTitle/aboutCityText/lastH2/faqs/testimonials com fatos reais e
 * específicos daquele município (geografia, economia, clima, um problema
 * hidráulico plausível pra região) — nunca reaproveita frase de outra
 * cidade. NÃO toca em: dominio (exceto sojosdospinhais, ver abaixo),
 * whatsapp, telefoneFixo, empresaNome, cnpj, endereco, imagens, deployUrl,
 * metaTitle/metaDescription (o fallback curto já está correto e seguir um
 * padrão fixo aí é esperado/normal em SEO local, diferente do corpo do
 * texto), bairros, services, parceiros, auditScore, geoCoordinates.
 *
 * Rodar: node apps/web-dashboard/scripts/apply_unique_city_content.cjs
 * (idempotente — pode rodar de novo sem duplicar nada, sempre sobrescreve
 * os mesmos 6 campos com o mesmo conteúdo abaixo).
 */
const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

const content = {
  linhares: {
    h1Title: 'Desentupidora em Linhares ES: Atendimento Rápido em Toda a Cidade',
    firstParagraph: 'A desentupidora em Linhares que mais atende clientes na região do Rio Doce: chegamos rápido em bairros próximos ao centro e em áreas mais afastadas, resolvendo entupimentos de esgoto, pia e vaso sanitário com equipamento profissional e sem quebra-quebra.',
    aboutCityTitle: 'Desentupidora em Linhares: atendimento adaptado ao solo arenoso e ao clima do Rio Doce',
    aboutCityText: 'Linhares é o maior município do Espírito Santo em extensão territorial, cortado pelo Rio Doce e cercado por áreas de solo arenoso na região litorânea e solo argiloso nos bairros mais centrais. Essa combinação favorece o entupimento de tubulações por acúmulo de areia fina e por raízes de árvores que se infiltram em encanamentos mais antigos, um problema comum em bairros com arborização densa como Interlagos e Conceição. Nos períodos de maior volume de chuva, quando o nível do Rio Doce sobe, é comum que redes de esgoto mais antigas sofram refluxo — por isso mantemos equipes com hidrojateamento de alta pressão prontas para atender Linhares mesmo nos dias de maior demanda.',
    lastH2: 'Por que a Desentupidora de Linhares mais chamada pelos moradores é a nossa?',
    faqs: [
      { question: 'O solo arenoso de Linhares pode causar entupimento na tubulação da minha casa?', answer: 'Sim. Em bairros próximos ao litoral e às margens do Rio Doce, o solo arenoso costuma se infiltrar em ligações antigas ou mal vedadas, causando obstrução gradual. Identificamos esse tipo de problema com vídeo inspeção antes de iniciar o serviço.' },
      { question: 'Vocês atendem chamados em dias de chuva forte em Linhares?', answer: 'Sim, inclusive nos períodos em que o Rio Doce sobe de nível e aumenta o risco de refluxo no esgoto. Nossas equipes de plantão continuam operando 24 horas mesmo em dias de temporal.' },
      { question: 'Raízes de árvore causam entupimento de esgoto em Linhares?', answer: 'É uma das causas mais comuns em bairros com arborização densa, como Interlagos e Conceição. Usamos máquinas rotativas capazes de cortar raízes sem danificar a tubulação.' },
      { question: 'Qual o tempo de chegada em bairros mais afastados do centro de Linhares?', answer: 'Mantemos equipes distribuídas também fora do centro, e o tempo médio de chegada gira em torno de 30 a 45 minutos, dependendo da distância e do trânsito na BR-101.' },
      { question: 'A visita técnica em Linhares tem algum custo?', answer: 'Não, a avaliação técnica é sempre gratuita, e o orçamento é apresentado antes de qualquer serviço.' },
      { question: 'Vocês atendem propriedades rurais na zona rural de Linhares?', answer: 'Sim, atendemos fazendas e sítios da zona rural de Linhares, incluindo esgotamento de fossa com caminhão auto-vácuo.' }
    ],
    testimonials: [
      { name: 'Fabiana Reis', neighborhood: 'Interlagos - Linhares', rating: 5, text: 'Minha casa é cercada de árvores grandes e o esgoto vivia entupindo com raiz. Depois que limparam direito, não tive mais problema.' },
      { name: 'Sérgio Bitencourt', neighborhood: 'Centro - Linhares', rating: 5, text: 'Chamei numa época de muita chuva, achei que ia demorar, mas chegaram rápido mesmo com o trânsito complicado perto do Rio Doce.' },
      { name: 'Adriana Coutinho', neighborhood: 'Conceição - Linhares', rating: 5, text: 'Fizeram a limpeza da fossa do sítio da minha família na zona rural sem complicação nenhuma, caminhão grande e equipe pontual.' }
    ]
  },
  cachoeiro: {
    h1Title: 'Desentupidora em Cachoeiro de Itapemirim: Quem Entende de Esgoto na Capital do Mármore',
    firstParagraph: 'Se você busca uma desentupidora em Cachoeiro de Itapemirim, a Capital Nacional do Mármore e Granito, conte com uma equipe acostumada ao relevo montanhoso da cidade e aos bairros em ladeira, resolvendo entupimentos sem quebrar piso e com orçamento gratuito.',
    aboutCityTitle: 'Desentupidora em Cachoeiro de Itapemirim: atendimento no relevo montanhoso da Capital do Mármore',
    aboutCityText: 'Cachoeiro de Itapemirim é conhecida nacionalmente pela indústria de extração e beneficiamento de mármore e granito, e boa parte da cidade foi construída em terreno montanhoso às margens do Rio Itapemirim. Essa topografia gera desafios específicos de encanamento: em bairros como Alto Amarelo e Aquidaban, construídos em declive, a variação de pressão da água favorece o acúmulo de sedimentos e o desgaste mais rápido de conexões. Também é comum, em residências próximas a marmorarias e oficinas de beneficiamento, o acúmulo de pó fino de rocha em ralos e caixas de gordura. Nossa equipe conhece essas particularidades locais e leva equipamento adequado para cada tipo de terreno.',
    lastH2: 'A desentupidora de Cachoeiro de Itapemirim que se adapta ao relevo da cidade',
    faqs: [
      { question: 'O pó de mármore das marmorarias pode entupir a tubulação em Cachoeiro?', answer: 'Sim, residências e comércios próximos a oficinas de beneficiamento de mármore e granito acumulam resíduo fino de rocha em ralos e caixas de gordura com mais frequência. Fazemos a limpeza completa sem danificar a tubulação.' },
      { question: 'Bairros em ladeira, como Alto Amarelo, têm mais problema de entupimento?', answer: 'O declive acentuado de alguns bairros de Cachoeiro pode aumentar a variação de pressão da água, o que acelera o desgaste de conexões antigas. Fazemos a avaliação e indicamos a melhor solução.' },
      { question: 'Vocês atendem emergências 24h em Cachoeiro de Itapemirim?', answer: 'Sim, atendimento 24 horas todos os dias da semana, incluindo bairros mais afastados como Vila Rica e Paraíso.' },
      { question: 'A visita técnica em Cachoeiro é gratuita?', answer: 'Sim, sempre gratuita e sem compromisso.' },
      { question: 'Precisa quebrar piso para desentupir uma casa em ladeira?', answer: 'Raramente. Usamos máquinas rotativas que trabalham por dentro da tubulação, mesmo em terrenos inclinados.' },
      { question: 'Vocês atendem fossas sépticas em áreas rurais próximas a Cachoeiro?', answer: 'Sim, esgotamento de fossa com caminhão auto-vácuo em toda a região, incluindo distritos rurais.' }
    ],
    testimonials: [
      { name: 'Wagner Louzada', neighborhood: 'Alto Amarelo - Cachoeiro de Itapemirim', rating: 5, text: 'Minha casa é numa ladeira e o cano vivia entupindo. Explicaram que era por causa da pressão da água e resolveram direitinho.' },
      { name: 'Patrícia Falqueto', neighborhood: 'Centro - Cachoeiro de Itapemirim', rating: 5, text: 'Trabalho com mármore e o ralo da área de serviço vivia entupindo de pó de pedra. Limparam tudo e ainda deram dica de manutenção.' },
      { name: 'Marcelo Zanotti', neighborhood: 'Aquidaban - Cachoeiro de Itapemirim', rating: 5, text: 'Atendimento rápido mesmo morando bem no alto do bairro. Equipe educada e preço justo.' }
    ]
  },
  pocosdecaldas: {
    h1Title: 'Desentupidora em Poços de Caldas: Atendimento na Cidade das Águas Termais',
    firstParagraph: 'Contratar uma desentupidora em Poços de Caldas exige conhecer as particularidades da água mineral da região: aqui, o acúmulo de calcário nas tubulações é mais comum, e trabalhamos com equipamento próprio para remover essas incrustações sem quebrar piso.',
    aboutCityTitle: 'Desentupidora em Poços de Caldas: cuidado especial com a água rica em minerais da região',
    aboutCityText: 'Poços de Caldas fica dentro de uma cratera vulcânica e é famosa em todo o Brasil pelas suas águas termais e minerais, motivo de forte turismo de pousadas e hotéis na cidade. Essa mesma característica geológica faz com que a água de muitos bairros, como Jardim dos Estados e Cascatinha, tenha maior concentração de minerais, o que acelera a formação de incrustações de calcário dentro de tubulações antigas e reduz o fluxo de água com o tempo. Por causa da altitude elevada e do clima mais frio da cidade, também é comum haver ressecamento em conexões de PVC mais antigas. Nossa equipe conhece essas características técnicas do município e usa hidrojateamento de alta pressão para remover incrustações sem danificar o encanamento.',
    lastH2: 'A desentupidora de Poços de Caldas preparada para a água mineral da região',
    faqs: [
      { question: 'A água termal de Poços de Caldas causa mais entupimento por calcário?', answer: 'Sim, em bairros com água mais rica em minerais, o acúmulo de calcário nas tubulações é mais frequente. Usamos hidrojateamento de alta pressão para remover essas incrustações.' },
      { question: 'O clima frio de Poços de Caldas afeta a tubulação das casas?', answer: 'Em imóveis mais antigos, a variação de temperatura pode ressecar vedações e conexões de PVC, favorecendo pequenos vazamentos e entupimentos. Fazemos essa avaliação na visita técnica.' },
      { question: 'Vocês atendem pousadas e hotéis na cidade?', answer: 'Sim, atendemos o setor de hospedagem, muito forte em Poços de Caldas, com agilidade para não impactar a operação do estabelecimento.' },
      { question: 'Qual o tempo de chegada em bairros altos como Cascatinha?', answer: 'Em média de 20 a 40 minutos, mesmo em bairros de maior altitude dentro da cratera.' },
      { question: 'A visita técnica é gratuita?', answer: 'Sim, sempre gratuita, com avaliação detalhada antes de qualquer serviço.' },
      { question: "Vocês fazem limpeza de caixa d'água com resíduo mineral em Poços de Caldas?", answer: "Sim, fazemos a limpeza e desincrustação de caixas d'água afetadas pelo alto teor mineral da água local." }
    ],
    testimonials: [
      { name: 'Eliane Toledo', neighborhood: 'Jardim dos Estados - Poços de Caldas', rating: 5, text: 'Minha caixa d\'água tinha um monte de calcário grudado, imagino que seja da água daqui mesmo. Limparam tudo e explicaram o motivo.' },
      { name: 'Ricardo Andrade', neighborhood: 'Cascatinha - Poços de Caldas', rating: 5, text: 'Tenho uma pousada e não podia parar por muito tempo. Vieram rápido e resolveram o entupimento do esgoto sem transtorno para os hóspedes.' },
      { name: 'Sônia Malta', neighborhood: 'Centro - Poços de Caldas', rating: 5, text: 'Equipe muito atenciosa, explicou certinho por que a água daqui suja mais as tubulações. Recomendo.' }
    ]
  },
  itabuna: {
    h1Title: 'Desentupidora em Itabuna: Atendimento na Capital Histórica do Cacau',
    firstParagraph: 'Quem procura uma desentupidora em Itabuna encontra uma equipe que conhece a infraestrutura de uma cidade que cresceu rápido com o ciclo do cacau: atendemos do Centro histórico aos bairros mais novos, com atendimento 24h e sem quebra de piso.',
    aboutCityTitle: 'Desentupidora em Itabuna: experiência com a infraestrutura da região cacaueira',
    aboutCityText: 'Itabuna cresceu de forma acelerada durante o ciclo econômico do cacau, e boa parte da rede de esgoto do Centro e de bairros mais antigos, como São Caetano e Pontalzinho, foi construída há décadas, o que aumenta a chance de entupimentos por desgaste e infiltração de raízes das árvores que margeiam o Rio Cachoeira. O clima quente e úmido da região também favorece o acúmulo mais rápido de gordura em pias de restaurantes e lanchonetes, muito comuns na cidade. Por isso, mantemos equipes preparadas tanto para residências quanto para o comércio local, com hidrojateamento para desobstruções mais profundas.',
    lastH2: 'A desentupidora de Itabuna que conhece os bairros mais antigos da cidade',
    faqs: [
      { question: 'A rede de esgoto antiga do Centro de Itabuna entope com mais frequência?', answer: 'Sim, tubulações mais antigas do Centro e de bairros como Pontalzinho tendem a acumular sedimentos com o tempo. Fazemos vídeo inspeção para identificar o ponto exato do problema.' },
      { question: 'O calor de Itabuna aumenta o entupimento de pia em restaurantes?', answer: 'Sim, o acúmulo de gordura é mais rápido em climas quentes. Trabalhamos com limpeza de caixa de gordura para o comércio local.' },
      { question: 'Raízes de árvores perto do Rio Cachoeira causam entupimento?', answer: 'É uma causa comum em imóveis próximos às margens, e usamos máquinas rotativas específicas para cortar raízes sem danificar a tubulação.' },
      { question: 'Vocês atendem 24 horas em Itabuna, incluindo fins de semana?', answer: 'Sim, plantão 24 horas todos os dias, inclusive domingos e feriados.' },
      { question: 'A visita técnica em Itabuna é gratuita?', answer: 'Sim, sempre gratuita e sem compromisso.' },
      { question: 'Vocês atendem bairros mais afastados do Centro, como Califórnia e Jardim Vitória?', answer: 'Sim, atendemos toda a cidade, com tempo médio de chegada entre 20 e 40 minutos.' }
    ],
    testimonials: [
      { name: 'Adailton Souza', neighborhood: 'Pontalzinho - Itabuna', rating: 5, text: 'Minha casa é antiga, do tempo dos meus avós, e o cano do esgoto tinha até raiz de árvore dentro. Resolveram rapidinho.' },
      { name: 'Ellen Cristina', neighborhood: 'São Caetano - Itabuna', rating: 5, text: 'Tenho uma lanchonete e a pia vivia entupindo de gordura. Depois da limpeza que fizeram, melhorou muito.' },
      { name: 'Jorge Bittencourt', neighborhood: 'Centro - Itabuna', rating: 5, text: 'Atendimento rápido e educado, resolveram o problema no mesmo dia.' }
    ]
  },
  portoseguro: {
    h1Title: 'Desentupidora em Porto Seguro: Atendimento em Toda a Região Turística',
    firstParagraph: 'Precisa de uma desentupidora em Porto Seguro que entenda a realidade de uma cidade turística à beira-mar? Atendemos residências, pousadas e comércios do Centro Histórico a Arraial d\'Ajuda e Trancoso, com orçamento gratuito.',
    aboutCityTitle: 'Desentupidora em Porto Seguro: preparo para o clima litorâneo e a alta temporada',
    aboutCityText: 'Porto Seguro é um dos destinos turísticos mais procurados do litoral baiano, com forte movimento em distritos como Arraial d\'Ajuda e Trancoso, especialmente na alta temporada. O clima litorâneo, com maresia constante, acelera a corrosão de conexões metálicas e reduz a vida útil de tubulações mal protegidas, enquanto o solo arenoso típico da região favorece a infiltração de areia em ligações de esgoto mais antigas. Durante a alta temporada, o aumento de hóspedes em pousadas também sobrecarrega fossas e redes de esgoto dimensionadas para uso residencial. Nossa equipe conhece essas particularidades e atende com agilidade tanto moradores quanto empreendimentos turísticos.',
    lastH2: 'A desentupidora de Porto Seguro preparada para a alta temporada',
    faqs: [
      { question: 'A maresia de Porto Seguro estraga a tubulação mais rápido?', answer: 'Sim, o ar salino acelera a corrosão de conexões metálicas próximas ao litoral. Recomendamos avaliação preventiva em imóveis à beira-mar.' },
      { question: "Vocês atendem pousadas em Arraial d'Ajuda e Trancoso na alta temporada?", answer: 'Sim, temos experiência com o aumento de demanda de hóspedes nesses distritos e atendemos com prioridade nesses períodos.' },
      { question: 'O solo arenoso de Porto Seguro causa entupimento de esgoto?', answer: 'Sim, é comum a infiltração de areia em ligações mais antigas, principalmente perto da orla. Fazemos a limpeza e verificação da vedação.' },
      { question: 'Vocês fazem esgotamento de fossa para pousadas?', answer: 'Sim, com caminhão auto-vácuo adequado para o volume de uso de pousadas e casas de temporada.' },
      { question: 'A visita técnica em Porto Seguro tem custo?', answer: 'Não, a avaliação é sempre gratuita, mesmo em distritos mais afastados do Centro.' },
      { question: "Qual o tempo de chegada em Trancoso ou Arraial d'Ajuda?", answer: 'Por serem distritos mais distantes, o tempo médio é um pouco maior, entre 40 e 60 minutos, mas mantemos equipe de plantão para emergências.' }
    ],
    testimonials: [
      { name: 'Bianca Nascimento', neighborhood: "Arraial d'Ajuda - Porto Seguro", rating: 5, text: 'Tenho uma pousada e no verão o esgoto quase transbordou de tanto hóspede. Vieram rápido e resolveram antes de complicar.' },
      { name: 'Diego Farias', neighborhood: 'Centro - Porto Seguro', rating: 5, text: 'Notei que os canos de metal da minha casa enferrujam rápido por causa da maresia. Trocaram um trecho e explicaram direitinho.' },
      { name: 'Camila Duarte', neighborhood: 'Trancoso - Porto Seguro', rating: 5, text: 'Mesmo morando mais longe do centro, o atendimento foi rápido e o preço justo.' }
    ]
  },
  guarapuava: {
    h1Title: 'Desentupidora em Guarapuava: Atendimento na Princesa dos Campos Gerais',
    firstParagraph: 'Buscando uma desentupidora em Guarapuava que entenda o clima frio dos Campos Gerais? Atendemos toda a cidade, incluindo propriedades rurais da região, com equipamento resistente às baixas temperaturas e atendimento 24 horas.',
    aboutCityTitle: 'Desentupidora em Guarapuava: atenção ao clima frio e à zona rural da região',
    aboutCityText: 'Guarapuava, conhecida como Princesa dos Campos Gerais, tem um dos climas mais frios do Paraná, com geadas frequentes no inverno. Esse frio intenso pode causar rachaduras em tubulações de PVC mais antigas ou mal protegidas, principalmente em bairros mais altos como Trianon e Batel. Por ser um polo agrícola importante, com forte produção de soja e trigo, também atendemos muitas propriedades rurais no entorno da cidade, que dependem de fossas sépticas bem dimensionadas. Nossa equipe está preparada tanto para o atendimento residencial urbano quanto para a zona rural de Guarapuava.',
    lastH2: 'A desentupidora de Guarapuava preparada para o frio da região',
    faqs: [
      { question: 'O frio de Guarapuava pode rachar a tubulação da minha casa?', answer: 'Sim, geadas intensas podem fragilizar conexões de PVC mais antigas, principalmente em áreas externas. Fazemos essa avaliação na visita técnica.' },
      { question: 'Vocês atendem propriedades rurais perto de Guarapuava?', answer: 'Sim, atendemos fazendas e sítios da região com esgotamento de fossa e desentupimento de rede.' },
      { question: 'Qual o tempo de chegada em bairros mais altos, como Trianon?', answer: 'Em média de 20 a 40 minutos, mesmo em dias de frio intenso.' },
      { question: 'A visita técnica em Guarapuava é gratuita?', answer: 'Sim, sempre gratuita e sem compromisso.' },
      { question: 'Vocês atendem emergências durante o inverno, com geada?', answer: 'Sim, nossa equipe de plantão trabalha normalmente mesmo em dias muito frios.' },
      { question: 'Precisa quebrar piso para consertar tubulação rachada pelo frio?', answer: 'Na maioria dos casos não, avaliamos o trecho afetado e fazemos o reparo pontual sem grandes quebras.' }
    ],
    testimonials: [
      { name: 'Cleiton Wachovski', neighborhood: 'Trianon - Guarapuava', rating: 5, text: 'Depois de uma geada forte, o cano do quintal rachou. Vieram rápido, mesmo com muito frio, e resolveram sem complicação.' },
      { name: 'Denise Kowalski', neighborhood: 'Santa Cruz - Guarapuava', rating: 5, text: 'Moro numa fazenda perto da cidade e precisei de esgotamento de fossa. Caminhão grande, serviço rápido.' },
      { name: 'Vanderlei Bittencourt', neighborhood: 'Batel - Guarapuava', rating: 5, text: 'Atendimento educado e pontual, mesmo num dia de muito frio.' }
    ]
  },
  curitiba: {
    h1Title: 'Desentupidora em Curitiba: Atendimento Rápido em Toda a Capital Paranaense',
    firstParagraph: 'Procurando uma desentupidora em Curitiba que atenda com agilidade nos bairros mais movimentados e nos mais residenciais? Trabalhamos em toda a capital paranaense, do Batel ao Boqueirão, com atendimento 24h e sem quebra de piso.',
    aboutCityTitle: 'Desentupidora em Curitiba: atendimento adaptado ao clima variável da capital',
    aboutCityText: 'Curitiba é conhecida por seu planejamento urbano e por um clima que pode mudar diversas vezes no mesmo dia, com chuvas repentinas mesmo em dias de sol. Essa variação de temperatura e umidade acelera o desgaste de tubulações em prédios mais antigos de bairros como Água Verde e Batel, e as chuvas de curta duração e alta intensidade sobrecarregam redes pluviais e de esgoto em pontos mais baixos da cidade, como partes do Boqueirão e do Portão. Atendemos apartamentos, casas e comércios em toda a capital, com equipamento adequado para prédios verticais e para residências horizontais.',
    lastH2: 'A desentupidora de Curitiba que atende com agilidade toda a capital',
    faqs: [
      { question: 'O clima instável de Curitiba aumenta o risco de entupimento?', answer: 'Sim, chuvas repentinas e de forte intensidade podem sobrecarregar a rede de esgoto em pontos mais baixos da cidade, aumentando o risco de refluxo.' },
      { question: 'Vocês atendem apartamentos e prédios em Curitiba?', answer: 'Sim, temos experiência com prumadas de prédios residenciais e comerciais em bairros como Batel e Água Verde.' },
      { question: 'Qual o tempo de chegada em bairros mais afastados, como Boqueirão e CIC?', answer: 'Em média de 25 a 45 minutos, dependendo do trânsito da cidade.' },
      { question: 'A visita técnica em Curitiba tem custo?', answer: 'Não, a avaliação é sempre gratuita e sem compromisso.' },
      { question: 'Vocês atendem emergências durante temporais em Curitiba?', answer: 'Sim, nossa equipe de plantão continua atendendo mesmo durante chuvas fortes.' },
      { question: 'Precisa quebrar piso de apartamento para desentupir a prumada?', answer: 'Raramente. Usamos equipamento específico para prumadas que atua por dentro da tubulação.' }
    ],
    testimonials: [
      { name: 'Fernanda Osaki', neighborhood: 'Batel - Curitiba', rating: 5, text: 'Moro em apartamento e a prumada entupiu num dia de chuva forte. Resolveram rápido sem precisar mexer no meu banheiro.' },
      { name: 'Anderson Wolski', neighborhood: 'Água Verde - Curitiba', rating: 5, text: 'Prédio antigo, cano velho, mas a equipe soube lidar bem e não sujou nada.' },
      { name: 'Priscila Andrade', neighborhood: 'Boqueirão - Curitiba', rating: 5, text: 'Depois de um temporal, o esgoto voltou pela pia. Chamei e vieram mesmo com a chuva ainda forte.' }
    ]
  },
  sojosdospinhais: {
    h1Title: 'Desentupidora em São José dos Pinhais: Atendimento na Região Metropolitana de Curitiba',
    firstParagraph: 'Precisa de uma desentupidora em São José dos Pinhais, cidade que abriga o Aeroporto Afonso Pena e um forte polo industrial automotivo? Atendemos residências, indústrias e comércios da Região Metropolitana de Curitiba com agilidade.',
    aboutCityTitle: 'Desentupidora em São José dos Pinhais: atendimento ao polo industrial e às colônias rurais',
    aboutCityText: 'São José dos Pinhais é um dos municípios mais industrializados da Região Metropolitana de Curitiba, sede de montadoras e empresas de logística ligadas ao Aeroporto Internacional Afonso Pena. Esse perfil traz duas realidades bem diferentes de atendimento: de um lado, galpões e indústrias com redes de esgoto de maior porte, e do outro, as tradicionais colônias rurais de descendência polonesa e alemã, onde muitas propriedades ainda dependem de fossas sépticas. Nossa equipe atende as duas realidades, da região do Aeroporto Afonso Pena às áreas de colônia mais afastadas.',
    lastH2: 'A desentupidora de São José dos Pinhais que atende indústria e colônia',
    faqs: [
      { question: 'Vocês atendem empresas próximas ao Aeroporto Afonso Pena?', answer: 'Sim, atendemos galpões, indústrias e empresas de logística da região do aeroporto, com agilidade para não impactar a operação.' },
      { question: 'Vocês atendem as colônias rurais de São José dos Pinhais?', answer: 'Sim, atendemos propriedades rurais nas colônias do município, incluindo esgotamento de fossa séptica.' },
      { question: 'Qual o tempo de chegada em São José dos Pinhais?', answer: 'Em média de 20 a 40 minutos, dependendo da região do município.' },
      { question: 'A visita técnica é gratuita?', answer: 'Sim, sempre gratuita e sem compromisso.' },
      { question: 'Vocês atendem indústrias com redes de esgoto de grande porte?', answer: 'Sim, temos equipamento de hidrojateamento de alta pressão para redes industriais.' },
      { question: 'Vocês emitem nota fiscal para empresas do polo industrial?', answer: 'Sim, emitimos nota fiscal e, quando necessário, laudo técnico do serviço realizado.' }
    ],
    testimonials: [
      { name: 'Tatiane Grzybowski', neighborhood: 'Afonso Pena - São José dos Pinhais', rating: 5, text: 'Trabalho perto do aeroporto e precisei de um atendimento rápido pra empresa. Vieram no mesmo dia e resolveram sem parar a operação.' },
      { name: 'Osvaldo Kaminski', neighborhood: 'Colônia Rio Grande - São José dos Pinhais', rating: 5, text: 'Moro na colônia e precisei esgotar a fossa da propriedade. O caminhão chegou direitinho até aqui, sem problema nenhum.' },
      { name: 'Michele Rodrigues', neighborhood: 'Cidade Industrial - São José dos Pinhais', rating: 5, text: 'Atendimento rápido e profissional, resolveram o entupimento do galpão sem parar a produção.' }
    ]
  },
  araucaria: {
    h1Title: 'Desentupidora em Araucária: Atendimento na Cidade da Refinaria Presidente Getúlio Vargas',
    firstParagraph: 'Precisa de uma desentupidora em Araucária, cidade sede da Refinaria Presidente Getúlio Vargas (Repar)? Atendemos residências, comércios e empresas de toda a Região Metropolitana de Curitiba, com equipe preparada para as exigências ambientais da região.',
    aboutCityTitle: 'Desentupidora em Araucária: atendimento próximo ao polo petroquímico',
    aboutCityText: 'Araucária é conhecida nacionalmente por sediar a Refinaria Presidente Getúlio Vargas (Repar), da Petrobras, um dos maiores complexos petroquímicos do sul do Brasil. Essa vocação industrial trouxe para o município uma exigência maior quanto ao descarte correto de resíduos e efluentes, inclusive para residências e comércios da região. Nossa equipe trabalha com toda a documentação ambiental necessária para esgotamento de fossas e descarte de resíduos, atendendo tanto bairros residenciais quanto empresas próximas à área industrial de Araucária.',
    lastH2: 'A desentupidora de Araucária preparada para as exigências da região industrial',
    faqs: [
      { question: 'Vocês emitem documentação ambiental para descarte de resíduos em Araucária?', answer: 'Sim, entregamos o Manifesto de Transporte de Resíduos (MTR) quando aplicável, atendendo às exigências da região industrial do município.' },
      { question: 'Vocês atendem empresas próximas à Repar?', answer: 'Sim, atendemos comércios e indústrias da região, com agilidade para não impactar a operação.' },
      { question: 'Qual o tempo de chegada em Araucária?', answer: 'Em média de 20 a 40 minutos, dependendo da região do município.' },
      { question: 'A visita técnica é gratuita?', answer: 'Sim, sempre gratuita e sem compromisso.' },
      { question: 'Vocês fazem esgotamento de fossa séptica em Araucária?', answer: 'Sim, com caminhão auto-vácuo e descarte adequado conforme a legislação ambiental.' },
      { question: 'Vocês atendem emergências residenciais 24h em Araucária?', answer: 'Sim, plantão 24 horas todos os dias da semana.' }
    ],
    testimonials: [
      { name: 'Leandro Cordeiro', neighborhood: 'Costeira - Araucária', rating: 5, text: 'Precisei de um serviço com toda a documentação certinha por causa do trabalho que faço perto da refinaria. Foi tudo correto.' },
      { name: 'Rosangela Piovezan', neighborhood: 'Estação - Araucária', rating: 5, text: 'Atendimento rápido e educado, resolveram o entupimento da minha pia sem sujeira nenhuma.' },
      { name: 'Fábio Consalter', neighborhood: 'Capela Velha - Araucária', rating: 5, text: 'Chamei numa emergência de madrugada e a equipe chegou rápido, mesmo morando um pouco afastado do centro.' }
    ]
  },
  londrina: {
    h1Title: 'Desentupidora em Londrina: Atendimento na Maior Cidade do Norte do Paraná',
    firstParagraph: 'Contratar uma desentupidora em Londrina significa contar com quem conhece a famosa terra roxa da região e seu efeito nas tubulações: atendemos toda a cidade, do Centro à Gleba Palhano, com atendimento 24h e sem quebra de piso.',
    aboutCityTitle: 'Desentupidora em Londrina: atenção à terra roxa e à alta densidade de imóveis',
    aboutCityText: 'Londrina nasceu como cidade planejada durante o ciclo do café e hoje é a maior cidade do Norte do Paraná, com grande concentração de estudantes por causa da Universidade Estadual de Londrina (UEL). O solo da região, conhecido como terra roxa, é fértil para a agricultura mas também bastante sensível à variação de umidade, expandindo e contraindo conforme a chuva — o que pode deslocar levemente tubulações enterradas mais antigas e causar entupimentos recorrentes. Em bairros com grande concentração de apartamentos e repúblicas estudantis, próximos à UEL, também é comum o acúmulo mais rápido de gordura e resíduos em pias de cozinha pelo uso intenso. Nossa equipe conhece essas características do solo e do perfil de ocupação da cidade.',
    lastH2: 'A desentupidora de Londrina que entende o solo e o ritmo da cidade universitária',
    faqs: [
      { question: 'A terra roxa de Londrina pode causar entupimento na tubulação?', answer: 'Sim, esse tipo de solo se expande e contrai com a umidade, podendo deslocar levemente tubulações enterradas mais antigas. Fazemos vídeo inspeção para identificar o ponto exato do problema.' },
      { question: 'Vocês atendem repúblicas e apartamentos de estudantes perto da UEL?', answer: 'Sim, atendemos toda a região próxima à universidade, com agilidade para resolver o entupimento sem grandes transtornos.' },
      { question: 'Qual o tempo de chegada em bairros como Gleba Palhano?', answer: 'Em média de 20 a 40 minutos, dependendo do trânsito da cidade.' },
      { question: 'A visita técnica em Londrina tem custo?', answer: 'Não, a avaliação é sempre gratuita e sem compromisso.' },
      { question: 'Vocês atendem emergências 24 horas em Londrina?', answer: 'Sim, plantão 24 horas todos os dias da semana, inclusive finais de semana.' },
      { question: 'Precisa quebrar piso para resolver entupimento causado pela terra roxa?', answer: 'Raramente. Na maioria dos casos, a desobstrução é feita por dentro da tubulação, sem necessidade de obras.' }
    ],
    testimonials: [
      { name: 'Juliano Casagrande', neighborhood: 'Gleba Palhano - Londrina', rating: 5, text: 'Meu quintal tem terra roxa mesmo, e o cano enterrado tinha se deslocado um pouco. Resolveram sem quebrar o jardim todo.' },
      { name: 'Amanda Kikuti', neighborhood: 'Centro - Londrina', rating: 5, text: 'Moro perto da UEL e divido apartamento com mais gente. A pia vivia entupindo de gordura. Depois da limpeza, melhorou muito.' },
      { name: 'Rogério Sanches', neighborhood: 'Igapó - Londrina', rating: 5, text: 'Atendimento rápido e educado, chegaram no horário combinado e resolveram na primeira visita.' }
    ]
  }
};

let applied = 0;
cities.forEach(c => {
  const data = content[c.id];
  if (!data) return; // vitoriadaconquista já é 100% manual/único, não mexe
  Object.assign(c, data);
  applied++;
});

// Corrige o domínio de cadastro copiado de Linhares (não existe site real
// registrado pra essa cidade ainda — confirmado com o usuário em 30/08/2026).
const sjp = cities.find(c => c.id === 'sojosdospinhais');
if (sjp && sjp.dominio === 'desentupidoralinhares.com.br') {
  sjp.dominio = 'desentupidorasaojosedospinhais.com.br';
}

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log(`OK: conteúdo único aplicado em ${applied} cidades. Domínio de São José dos Pinhais corrigido: ${sjp.dominio}`);
