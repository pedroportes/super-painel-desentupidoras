const fs = require('fs');
const path = require('path');

const configPath = path.resolve(process.cwd(), 'src/data/cityConfig.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const normalise = (value = '') => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

async function auditSource(label, source) {
  if (!source?.url || !/^https:\/\//.test(source.url)) return `${label}: URL HTTPS ausente`;
  try {
    const response = await fetch(source.url, { redirect: 'follow' });
    if (response.status !== 200) return `${label}: HTTP ${response.status}`;
    const contentType = response.headers.get('content-type') || '';
    if (source.format === 'pdf' || /\.pdf(?:$|\?)/i.test(source.url)) {
      if (!/pdf/i.test(contentType) && !/\.pdf(?:$|\?)/i.test(response.url)) return `${label}: PDF com content-type inesperado (${contentType})`;
      return null;
    }
    const body = normalise(await response.text());
    if (!body.includes(normalise(source.excerpt))) return `${label}: trecho não encontrado na fonte`;
    return null;
  } catch (error) {
    return `${label}: ${error.message}`;
  }
}

(async () => {
  const failures = [];
  for (const bairro of config.bairros || []) {
    const failure = await auditSource(bairro, config.bairroEvidence?.[bairro]);
    if (failure) failures.push(failure);
  }
  if (failures.length) {
    console.error(`AUDITORIA DE FONTES: ${failures.length} pendência(s)`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log(`AUDITORIA DE FONTES: TUDO VERDE (${(config.bairros || []).length} bairros com fonte HTTPS respondendo).`);
})();
