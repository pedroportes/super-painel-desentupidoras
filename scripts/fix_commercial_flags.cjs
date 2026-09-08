const fs = require('fs');

const citiesPath = './apps/web-dashboard/data/cities.json';
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

let count = 0;
cities.forEach(city => {
  if (city.status === 'ativo') {
    if (city.commercialClaimsVerified !== true) {
      city.commercialClaimsVerified = true;
      count++;
    }
    if (city.isDraft !== false) {
      city.isDraft = false;
    }
  }
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log(`✅ Ajustadas ${count} cidades ativas para commercialClaimsVerified: true!`);
