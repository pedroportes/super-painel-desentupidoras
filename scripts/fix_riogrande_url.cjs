const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const citiesPath = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');
const activeCityPath = path.join(__dirname, '..', 'apps', 'site-template-astro', 'src', 'data', 'active-city.json');
const settings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'settings.json'), 'utf8'));

const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const rg = cities.find(c => c.id === 'riogrande');
rg.deployUrl = 'https://desentupidora-riogrande.vercel.app';
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
fs.writeFileSync(activeCityPath, JSON.stringify(rg, null, 2), 'utf8');

console.log('Compilando Astro com canonical fixo https://desentupidora-riogrande.vercel.app...');
const astroDir = path.join(__dirname, '..', 'apps', 'site-template-astro');
execSync('npm run build', { cwd: astroDir, stdio: 'inherit' });

console.log('Publicando na Vercel com alias de produção...');
const distDir = path.join(astroDir, 'dist');
const cmd = `npx --yes vercel@latest deploy "${distDir}" --name=desentupidora-riogrande --prod --yes --token=${settings.vercel.apiToken}`;
execSync(cmd, { stdio: 'inherit' });
console.log('Finalizado com sucesso!');
