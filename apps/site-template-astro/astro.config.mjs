import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cityConfigPath = path.join(__dirname, 'src', 'data', 'cityConfig.json');

// O sitemap só pode usar uma URL confirmada pelo deploy. Não derive domínio
// de cidade ou provedor: isso criava canonicals apontando para sites inexistentes.
function getSiteUrl() {
  try {
    const cityData = JSON.parse(fs.readFileSync(cityConfigPath, 'utf-8'));
    if (cityData.deployUrl) return cityData.deployUrl.replace(/\/$/, '');
    return undefined;
  } catch {
    return undefined;
  }
}

const siteUrl = getSiteUrl();

export default defineConfig({
  ...(siteUrl ? { site: siteUrl } : {}),
  integrations: siteUrl ? [sitemap()] : []
});
