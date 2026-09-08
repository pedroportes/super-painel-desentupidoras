const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { deployCitySite } = require('../apps/web-dashboard/scripts/deployEngine.cjs');

async function redeployAllModified() {
  const citiesPath = path.resolve(__dirname, '../apps/web-dashboard/data/cities.json');
  const settingsPath = path.resolve(__dirname, '../apps/web-dashboard/data/settings.json');

  const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const distDir = path.resolve(__dirname, '../apps/site-template-astro/dist');

  // Carregar helpers de sincronização
  const serverCode = fs.readFileSync(path.resolve(__dirname, '../apps/web-dashboard/server.cjs'), 'utf8');
  eval(serverCode.substring(serverCode.indexOf('function syncCityToAstro'), serverCode.indexOf('function writeBairroRedirects')));
  eval(serverCode.substring(serverCode.indexOf('function writeBairroRedirects'), serverCode.indexOf('// 1. GET ALL CITIES')));
  function buildDefaultMetaTitle(c, u) { return 'Desentupidora em ' + c + ' ' + u + ' 24h'; }
  function slugify(text) { return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''); }
  const ASTRO_CONFIG_FILE = './apps/site-template-astro/src/data/cityConfig.json';
  const REDIRECTS_FILE = './apps/site-template-astro/public/_redirects';
  const VERCEL_JSON_FILE = './apps/site-template-astro/public/vercel.json';

  // Cidades recém criadas/atualizadas nesta sessão
  const targetIds = [
    'joinville',
    'maringa',
    'ferrazdevasconcelos',
    'jaraguadosul',
    'pindamonhangaba',
    'fazendariogrande',
    'mogiguacu',
    'bragancapaulista',
    'balneariocamboriu',
    'pousoalegre'
  ];

  console.log(`=== REBUILD E REDEPLOY DAS ${targetIds.length} CIDADES COM NÚMEROS ÚNICOS ===`);

  for (const id of targetIds) {
    const city = cities.find(c => c.id === id);
    if (!city) continue;

    console.log(`\n🔄 Processando ${city.cidade} (${city.uf}) - WhatsApp: ${city.whatsapp} | Fixo: ${city.telefoneFixo}...`);
    syncCityToAstro(city);
    execSync('npm run build', { cwd: './apps/site-template-astro', stdio: 'pipe' });
    const res = await deployCitySite(city, settings, distDir);
    console.log(`✅ Deploy ${city.cidade}: ${res.success ? 'SUCESSO' : 'FALHA'}`);
  }

  console.log('\n🎉 TODAS AS CIDADES REBUILDADAS E DEPLOYADAS COM OS NOVOS NÚMEROS!');
}

redeployAllModified().catch(console.error);
