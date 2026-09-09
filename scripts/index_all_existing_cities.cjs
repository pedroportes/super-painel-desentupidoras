const fs = require('fs');
const path = require('path');
const { triggerAutoIndex, extractCityUrls } = require('./indexEngine.cjs');

const CITIES_FILE = path.join(__dirname, '..', 'apps', 'web-dashboard', 'data', 'cities.json');

async function main() {
  console.log('====================================================');
  console.log('🌐 INDEXAÇÃO AUTOMATIZADA EM LOTE DE TODAS AS 65 CIDADES');
  console.log('====================================================\n');

  if (!fs.existsSync(CITIES_FILE)) {
    console.error('❌ Arquivo cities.json não encontrado!');
    process.exit(1);
  }

  const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
  const activeCities = cities.filter(c => c.deployUrl && c.deployUrl.startsWith('http'));

  console.log(`📋 Total de Cidades Carregadas: ${cities.length}`);
  console.log(`🚀 Cidades com Deploy Ativo: ${activeCities.length}\n`);

  let totalUrlsIndexed = 0;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < activeCities.length; i++) {
    const city = activeCities[i];
    const num = String(i + 1).padStart(2, '0');
    console.log(`[${num}/${activeCities.length}] Processando: ${city.cidade} (${city.uf}) - ${city.deployUrl}`);

    try {
      const res = await triggerAutoIndex(city, city.deployUrl);
      if (res.success) {
        successCount++;
        totalUrlsIndexed += res.urlsCount || 0;
      } else {
        failCount++;
      }
    } catch (e) {
      console.error(`   ❌ Erro ao indexar ${city.cidade}:`, e.message);
      failCount++;
    }

    // Pequena pausa amigável de 300ms entre requisições
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n====================================================');
  console.log('🎉 RESULTADO FINAL DA INDEXAÇÃO EM LOTE');
  console.log('====================================================');
  console.log(`✅ Cidades Indexadas com Sucesso: ${successCount}`);
  console.log(`❌ Cidades com Falha: ${failCount}`);
  console.log(`🔗 Total Estimado de URLs Submetidas: ~${totalUrlsIndexed}`);
  console.log(`📊 Logs registrados com sucesso na tabela indexing_logs do Supabase!`);
}

main().catch(err => {
  console.error('Erro geral no lote:', err);
  process.exit(1);
});
