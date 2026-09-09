const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const ASTRO_DIR = path.join(ROOT_DIR, 'apps', 'site-template-astro');
const DASHBOARD_DIR = path.join(ROOT_DIR, 'apps', 'web-dashboard');
const sharp = require(path.join(DASHBOARD_DIR, 'node_modules', 'sharp'));
const deployEngine = require(path.join(DASHBOARD_DIR, 'scripts', 'deployEngine.cjs'));
const settings = JSON.parse(fs.readFileSync(path.join(DASHBOARD_DIR, 'data', 'settings.json'), 'utf-8'));
const cities = JSON.parse(fs.readFileSync(path.join(DASHBOARD_DIR, 'data', 'cities.json'), 'utf-8'));
const patosCity = cities.find(c => c.id === 'patos');

async function updateHero() {
  const generatedImg = 'C:/Users/pedro/.gemini/antigravity-ide/brain/edfc9ff3-4a11-462f-a19b-d70d1cf38b78/hero_patos_desentupidora_1788961369037.jpg';
  const targetWebp = path.join(ASTRO_DIR, 'public', 'images', 'patos', 'desentupidora-patos-caminhao-hidrojateamento.webp');
  
  console.log('🖼️ Convertendo imagem original gerada para WebP leve...');
  await sharp(generatedImg)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 85, effort: 6 })
    .toFile(targetWebp);
  
  const stat = fs.statSync(targetWebp);
  console.log('✅ Imagem original WebP salva com:', stat.size, 'bytes (~' + (stat.size/1024).toFixed(1) + ' KB)');

  console.log('⚙️ Recompilando Astro com a imagem original...');
  execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

  console.log('☁️ Fazendo redeploy no Cloudflare Pages...');
  const distDir = path.join(ASTRO_DIR, 'dist');
  const res = await deployEngine.deployCitySite(patosCity, settings, distDir);
  console.log('Resultado Deploy:', res);
}

updateHero().catch(console.error);
