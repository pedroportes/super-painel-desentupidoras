const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const ASTRO_DIR = path.join(ROOT_DIR, 'apps', 'site-template-astro');
const DASHBOARD_DIR = path.join(ROOT_DIR, 'apps', 'web-dashboard');
const CITIES_FILE = path.join(DASHBOARD_DIR, 'data', 'cities.json');
const SETTINGS_FILE = path.join(DASHBOARD_DIR, 'data', 'settings.json');
const ASTRO_CONFIG_FILE = path.join(ASTRO_DIR, 'src', 'data', 'cityConfig.json');

const deployEngine = require(path.join(DASHBOARD_DIR, 'scripts', 'deployEngine.cjs'));
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));

const medianeira = cities.find(c => c.id === 'medianeira');

async function main() {
  console.log('🔄 Reconstruindo e republicando Medianeira com Mapa Direto Ativo...');
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });
  const distDir = path.join(ASTRO_DIR, 'dist');
  const res = await deployEngine.deployCitySite(medianeira, settings, distDir);
  console.log('Deploy Result:', res);
}

main().catch(console.error);
