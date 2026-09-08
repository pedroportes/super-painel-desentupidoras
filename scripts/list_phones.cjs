const fs = require('fs');

const citiesPath = './apps/web-dashboard/data/cities.json';
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

console.log('=== LISTA DE TODAS AS CIDADES E SEUS NÚMEROS ATUAIS ===');
cities.forEach((c, idx) => {
  console.log(`${idx + 1}. ${c.id} (${c.cidade} - ${c.uf}) -> WhatsApp: "${c.whatsapp}" | Fixo: "${c.telefoneFixo}" | Status: ${c.status}`);
});
