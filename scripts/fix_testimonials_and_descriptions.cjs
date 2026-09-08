const fs = require('fs');
const path = require('path');

const CITIES_FILE = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));

const tunedDescriptions = {
  jaraguadosul: 'Desentupidora em Jaraguá do Sul SC com atendimento 24h. Esgoto, pias, ralos, fossas e hidrojateamento com orçamento gratuito sem taxa!',
  altamira: 'Desentupidora em Altamira PA com atendimento 24h para esgotos, pias, ralos e vasos. Chegada rápida e orçamento gratuito sem taxa de visita!',
  umuarama: 'Desentupidora em Umuarama PR com atendimento 24h para esgotos, pias, ralos e vasos. Chegada rápida e orçamento gratuito sem taxa de visita!',
  itabira: 'Desentupidora em Itabira MG com atendimento 24h para esgotos, pias, ralos e vasos. Chegada rápida e orçamento gratuito sem taxa de visita!',
  patobranco: 'Desentupidora em Pato Branco PR com atendimento 24h para esgotos, pias, ralos e vasos. Chegada rápida e orçamento gratuito sem taxa!',
  tangaradaserra: 'Desentupidora em Tangará da Serra MT com atendimento 24h para esgotos, pias, ralos e vasos. Chegada rápida e orçamento gratuito sem taxa!',
  tiangua: 'Desentupidora em Tianguá CE com atendimento 24h para esgotos, pias, ralos e vasos. Chegada rápida e orçamento gratuito sem taxa de visita!',
  tucano: 'Desentupidora em Tucano BA com plantão 24h para esgotos, fossas, pias e ralos. Atendimento na sede, Caldas do Jorro e povoados sem taxa!',
  ariquemes: 'Desentupidora em Ariquemes RO com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os setores com orçamento sem taxa!',
  angradosreis: 'Desentupidora em Angra dos Reis RJ com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em toda a Costa Verde sem taxa de visita!',
  uba: 'Desentupidora em Ubá MG com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros e polo moveleiro sem taxa de visita!',
  timoteo: 'Desentupidora em Timóteo MG com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros do Vale do Aço sem taxa de visita!',
  luiseduardomagalhaes: 'Desentupidora em Luís Eduardo Magalhães BA com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os bairros sem taxa de visita!',
  mineiros: 'Desentupidora em Mineiros GO com atendimento 24h para esgotos, fossas, pias e ralos. Equipe em todos os setores com orçamento sem taxa de visita!'
};

let testimonialsFixed = 0;
let descriptionsFixed = 0;

cities.forEach(c => {
  // 1. Normalize testimonials
  if (Array.isArray(c.testimonials)) {
    c.testimonials.forEach(t => {
      const txt = t.text || t.content || '';
      const neigh = t.neighborhood || t.role || '';
      if (!t.text || !t.content || !t.neighborhood || !t.role) {
        t.text = txt;
        t.content = txt;
        t.neighborhood = neigh;
        t.role = neigh;
        testimonialsFixed++;
      }
    });
  }

  // 2. Tune meta description if specified or too long
  if (tunedDescriptions[c.id]) {
    c.metaDescription = tunedDescriptions[c.id];
    if (c.seo) c.seo.metaDescription = tunedDescriptions[c.id];
    descriptionsFixed++;
  } else if (c.metaDescription && c.metaDescription.length > 150) {
    console.warn(`Cidade ${c.id} ainda tem metaDescription > 150 chars: ${c.metaDescription.length}`);
  }
});

fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf-8');
console.log(`✅ cities.json atualizado!`);
console.log(`Testemunhos normalizados em ${testimonialsFixed} itens.`);
console.log(`Descrições ajustadas para 120-150 chars em ${descriptionsFixed} cidades.`);
