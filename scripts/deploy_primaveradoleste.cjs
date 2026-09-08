const { deployCitySite } = require('../apps/web-dashboard/scripts/deployEngine.cjs');
const fs = require('fs');
const path = require('path');

async function main() {
  const citiesFile = path.join(__dirname, '../apps/web-dashboard/data/cities.json');
  const cities = JSON.parse(fs.readFileSync(citiesFile, 'utf8'));
  const city = cities.find(c => c.id === 'primaveradoleste');

  if (!city) {
    console.error('Cidade primaveradoleste não encontrada!');
    process.exit(1);
  }

  console.log('Iniciando deploy de Primavera do Leste para', city.hospedagem);
  const result = await deployCitySite(city);
  console.log('Resultado do deploy:', JSON.stringify(result, null, 2));

  if (result.success) {
    city.deployUrl = result.url;
    city.lastDeployAt = new Date().toISOString();
    fs.writeFileSync(citiesFile, JSON.stringify(cities, null, 2), 'utf8');
    console.log('Atualizado cities.json com deployUrl:', result.url);
  } else {
    console.error('Falha no deploy:', result.error);
  }
}

main().catch(console.error);
