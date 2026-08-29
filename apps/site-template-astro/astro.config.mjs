import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cityConfigPath = path.join(__dirname, 'src', 'data', 'cityConfig.json');

// Calcula a mesma URL canônica de produção que o Layout.astro usa, pra que o
// sitemap.xml gerado aponte pro domínio real da cidade publicada (e não pra
// localhost). Lê o cityConfig.json, que já é escrito ANTES do build pelo
// painel (syncCityToAstro em server.cjs).
function getSiteUrl() {
  try {
    const cityData = JSON.parse(fs.readFileSync(cityConfigPath, 'utf-8'));
    const cityKey = (cityData.cidade || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    const hosting = cityData.hospedagem || 'cloudflare';

    if (cityData.deployUrl) return cityData.deployUrl.replace(/\/$/, '');
    if (hosting === 'cloudflare') return `https://desentupidora-${cityKey}.pages.dev`;
    if (hosting === 'vercel') return `https://desentupidora-${cityKey}.vercel.app`;
    return `https://${cityData.dominio || `desentupidora${cityKey}.com.br`}`;
  } catch {
    // Fallback só usado se cityConfig.json ainda não existir (ex: primeiro
    // build local sem nenhuma cidade sincronizada ainda).
    return 'https://exemplo.pages.dev';
  }
}

export default defineConfig({
  site: getSiteUrl(),
  integrations: [sitemap()]
});
