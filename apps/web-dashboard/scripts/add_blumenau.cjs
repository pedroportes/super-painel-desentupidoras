/**
 * Cria a cidade de teste Blumenau-SC do zero, já seguindo TODAS as
 * correções e regras de ouro aplicadas nesta sessão (30/08/2026):
 * conteúdo único escrito à mão com fatos reais, sem depender de
 * generateUniqueCityContent(); metaTitle/metaDescription deixados em
 * branco de propósito pra usar a fórmula padrão já corrigida (faixa
 * 40-60 / 120-160 chars); domínio, bairros reais.
 */
const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

if (cities.find(c => c.id === 'blumenau')) {
  console.log('Blumenau já existe, abortando pra não duplicar.');
  process.exit(1);
}

const services = [
  { title: 'Desentupimento de Esgoto', description: 'Desobstrução rápida de redes de esgoto residenciais e comerciais com máquina rotativa e hidrojateamento.', icon: '🚿' },
  { title: 'Desentupimento de Pia', description: 'Remoção de gordura e restos de alimentos bloqueando a tubulação da cozinha sem danificar o sifão.', icon: '🚰' },
  { title: 'Desentupimento de Vaso Sanitário', description: 'Atendimento higiênico e rápido para vasos entupidos. Desobstruímos sem quebrar pisos ou louças.', icon: '🚽' },
  { title: 'Desentupimento de Ralo', description: 'Limpeza de ralos de banheiros, quintais e lavanderias bloqueados por sujeira acumulada.', icon: '🛁' },
  { title: 'Esgotamento e Limpeza de Fossa', description: 'Caminhão auto-vácuo equipado para sucção e descarte ecológico de fossas sépticas.', icon: '🚛' },
  { title: 'Hidrojateamento de Alta Pressão', description: 'Lavagem interna pressurizada para higienização e desobstrução profunda em tubulações.', icon: '🌊' }
];

const blumenau = {
  id: 'blumenau',
  cidade: 'Blumenau',
  uf: 'SC',
  populacao: '350.000',
  modeloTemplate: 'urgencia-24h',
  status: 'pendente',
  hospedagem: 'cloudflare',
  paletaCores: 'corporativo-verde-cinza',
  heroVariant: 'HeroV1',
  servicesVariant: 'ServicesGridV1',
  dominio: 'desentupidorablumenau.com.br',
  whatsapp: '47992795590',
  telefoneFixo: '(47) 3323-0000',
  empresaNome: 'Desentupidora Blumenau 24h',
  cnpj: '12.345.678/0001-90',
  endereco: 'Av. Rio Branco, 1000 - Centro, Blumenau - SC',
  // h1Title/firstParagraph/aboutCityText/lastH2/faqs/testimonials escritos
  // à mão com fatos reais de Blumenau (colonização alemã, Oktoberfest,
  // indústria têxtil, histórico de enchentes do Rio Itajaí-Açu, relevo do
  // Vale Europeu) — regra de ouro 9, nunca usar generateUniqueCityContent().
  h1Title: 'Desentupidora em Blumenau SC: Atendimento na Capital do Vale Europeu',
  firstParagraph: 'Precisa de uma desentupidora em Blumenau que conheça os riscos de enchente do Rio Itajaí-Açu? Atendemos toda a cidade, dos bairros próximos ao rio às áreas mais altas do Vale Europeu, com atendimento 24h e sem quebra de piso.',
  ctaButtonText: 'Solicitar Visita Grátis no WhatsApp',
  lastH2: 'A desentupidora de Blumenau preparada para o histórico de enchentes da cidade',
  aboutCityTitle: 'Desentupidora em Blumenau: preparo para o histórico de enchentes do Rio Itajaí-Açu',
  aboutCityText: 'Blumenau foi fundada por imigrantes alemães em 1850 e hoje é o coração do Vale Europeu, conhecida pela arquitetura enxaimel, pela Oktoberfest e por uma forte tradição têxtil. A cidade também convive com um histórico sério de enchentes do Rio Itajaí-Açu, que já causou desastres graves, como a enchente de 2008. Esse histórico faz com que bairros próximos ao rio, como Velha e Itoupava Seca, sofram mais com refluxo de esgoto e infiltração em dias de chuva forte, enquanto bairros nas encostas do Vale Europeu enfrentam desafios de pressão de água por causa do relevo montanhoso. Nossa equipe conhece essas duas realidades e mantém equipamento de hidrojateamento de alta pressão pronto para atender Blumenau em qualquer situação.',
  bairros: ['Centro', 'Velha', 'Itoupava Seca', 'Itoupava Central', 'Vorstadt', 'Garcia', 'Fortaleza', 'Água Verde', 'Ponta Aguda', 'Progresso', 'Boa Vista', 'Vila Formosa', 'Salto', 'Vila Itoupava', 'Badenfurt'],
  services,
  faqs: [
    { question: 'O histórico de enchentes do Rio Itajaí-Açu afeta a rede de esgoto em Blumenau?', answer: 'Sim, em bairros próximos ao rio, como Velha e Itoupava Seca, o nível alto da água pode causar refluxo de esgoto durante temporais. Nossa equipe atende com prioridade nesses períodos.' },
    { question: 'Vocês atendem bairros nas encostas do Vale Europeu?', answer: 'Sim, atendemos toda a região, incluindo bairros de relevo mais acidentado, onde a variação de pressão da água pode acelerar o desgaste das tubulações.' },
    { question: 'Casas antigas de arquitetura enxaimel têm mais problema de encanamento?', answer: 'Muitas construções históricas de Blumenau têm tubulações mais antigas, e fazemos avaliação cuidadosa para não danificar estruturas de valor histórico durante o desentupimento.' },
    { question: 'Qual o tempo de chegada em Blumenau?', answer: 'Em média de 20 a 40 minutos, dependendo da região da cidade.' },
    { question: 'A visita técnica em Blumenau é gratuita?', answer: 'Sim, sempre gratuita e sem compromisso.' },
    { question: 'Vocês atendem emergências durante a época de chuvas fortes em Blumenau?', answer: 'Sim, mantemos plantão 24 horas reforçado durante os períodos de maior risco de enchente.' }
  ],
  testimonials: [
    { name: 'Heinz Wagner', neighborhood: 'Velha - Blumenau', rating: 5, text: 'Minha casa é perto do rio e depois de uma chuva forte o esgoto voltou. A equipe veio rápido e resolveu sem sujeira.' },
    { name: 'Marlene Zimmermann', neighborhood: 'Itoupava Seca - Blumenau', rating: 5, text: 'Atendimento rápido e educado. Explicaram certinho por que acontece o refluxo aqui perto do rio.' },
    { name: 'Rogério Bittencourt', neighborhood: 'Garcia - Blumenau', rating: 5, text: 'Moro numa subida e o cano vivia com problema de pressão. Resolveram e ainda deram uma dica de manutenção.' }
  ],
  parceiros: [],
  auditScore: 0
};

cities.push(blumenau);
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log('OK: Blumenau cadastrada. Total de cidades:', cities.length);
