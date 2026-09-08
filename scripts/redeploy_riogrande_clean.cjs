const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.join(__dirname, '..');
const ASTRO_DIR = path.join(ROOT_DIR, 'apps', 'site-template-astro');
const SETTINGS_FILE = path.join(ROOT_DIR, 'apps', 'web-dashboard', 'data', 'settings.json');
const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));

console.log('Compilando Astro com imagem limpa para Rio Grande...');
execSync('npm run build', { cwd: ASTRO_DIR, stdio: 'inherit' });

console.log('Publicando na Vercel...');
const distDir = path.join(ASTRO_DIR, 'dist');
const cmd = `npx --yes vercel@latest deploy "${distDir}" --name=desentupidora-riogrande --prod --yes --token=${settings.vercel.apiToken}`;
execSync(cmd, { stdio: 'inherit' });
console.log('✅ Deploy de Rio Grande concluído na Vercel!');
