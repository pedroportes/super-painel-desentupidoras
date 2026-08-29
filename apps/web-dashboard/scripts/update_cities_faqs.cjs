const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

const get6Faqs = (cidade) => [
  { question: `Vocês atendem emergências 24 horas em ${cidade}?`, answer: `Sim! Nossas equipes de plantão em ${cidade} operam 24 horas por dia, 7 dias por semana, inclusive domingos e feriados.` },
  { question: `Qual o tempo estimado de chegada até o meu endereço em ${cidade}?`, answer: `Devido às equipes posicionadas nos principais bairros de ${cidade}, nosso tempo médio de chegada é de 20 a 40 minutos.` },
  { question: `A visita técnica para avaliação em ${cidade} é gratuita?`, answer: `Sim! A visita técnica é 100% gratuita e sem qualquer compromisso. O técnico avalia o problema no local.` },
  { question: `O serviço de desentupimento possui garantia por escrito?`, answer: `Oferecemos garantia total por escrito de até 90 dias em todos os serviços realizados em ${cidade}.` },
  { question: `Precisa quebrar piso, azulejos ou paredes para desentupir?`, answer: `Na grande maioria dos casos não! Utilizamos máquinas rotativas K-50/K-500 e hidrojateamento que desobstruem o encanamento por dentro sem danificar o imóvel.` },
  { question: `Vocês atendem empresas, condomínios e comércios em ${cidade}?`, answer: `Sim! Dispomos de frotas preparadas para atendimento residencial, condomínios prediais, restaurantes, indústrias e comércio em geral.` }
];

const get3Testimonials = (cidade, bairros) => [
  { name: "Carlos Eduardo M.", neighborhood: `${(bairros && bairros[0]) || "Centro"} - ${cidade}`, rating: 5, text: `Atendimento nota 10! O esgoto transbordou na madrugada e a equipe chegou muito rápido em ${cidade}, resolvendo sem sujeira.` },
  { name: "Maria Aparecida Silva", neighborhood: `${(bairros && (bairros[1] || bairros[0])) || "Centro"} - ${cidade}`, rating: 5, text: `Profissionais extremamente educados e organizados. Desentupiram a pia da cozinha sem precisar quebrar nada em ${cidade}. Recomendo muito!` },
  { name: "João Paulo Santos", neighborhood: `${(bairros && (bairros[2] || bairros[0])) || "Centro"} - ${cidade}`, rating: 5, text: `Chamei para uma emergência no ralo e chegaram em 25 minutos. Orçamento transparente e serviço com garantia em ${cidade}.` }
];

cities.forEach(c => {
  if (!c.faqs || c.faqs.length < 6) {
    c.faqs = get6Faqs(c.cidade);
  }
  if (!c.testimonials || c.testimonials.length < 3) {
    c.testimonials = get3Testimonials(c.cidade, c.bairros || ["Centro"]);
  }
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log('Cities successfully updated with 6 FAQs and 3 Testimonials each. Total:', cities.length);
