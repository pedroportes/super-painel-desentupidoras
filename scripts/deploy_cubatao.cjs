const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const settingsPath = path.join(rootDir, 'apps', 'web-dashboard', 'data', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const { accountId, apiToken } = settings.cloudflare;

const distDir = path.join(rootDir, 'apps', 'site-template-astro', 'dist');
const projectName = 'desentupidora-cubatao';
const deployUrl = 'https://desentupidora-cubatao.pages.dev';

console.log('🚀 Building and Deploying Cubatão to Cloudflare Pages...');

// Step 1: Ensure deployUrl is set in configs
const citiesPath = path.join(rootDir, 'apps', 'web-dashboard', 'data', 'cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const idx = cities.findIndex(c => c.id === 'cubatao');
if (idx >= 0) {
  cities[idx].deployUrl = deployUrl;
  cities[idx].status = 'ativo';
  fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
}

const astroConfigPath = path.join(rootDir, 'apps', 'site-template-astro', 'src', 'data', 'cityConfig.json');
const cityConf = JSON.parse(fs.readFileSync(astroConfigPath, 'utf8'));
cityConf.deployUrl = deployUrl;
cityConf.status = 'ativo';
fs.writeFileSync(astroConfigPath, JSON.stringify(cityConf, null, 2), 'utf8');

// Step 2: Build Astro with final deployUrl
console.log('Building Astro with final deployUrl...');
execSync('npm run build', {
  cwd: path.join(rootDir, 'apps', 'site-template-astro'),
  stdio: 'inherit'
});

// Step 3: Deploy dist folder
console.log(`Deploying dist folder to ${projectName}...`);
const deployOutput = execSync(`npx --yes wrangler@latest pages deploy "${distDir}" --project-name="${projectName}" --branch=main`, {
  cwd: path.join(rootDir, 'apps', 'site-template-astro'),
  env: {
    ...process.env,
    CLOUDFLARE_API_TOKEN: apiToken,
    CLOUDFLARE_ACCOUNT_ID: accountId
  },
  encoding: 'utf8'
});
console.log(deployOutput);

console.log(`✅ Cubatão successfully deployed to: ${deployUrl}`);
