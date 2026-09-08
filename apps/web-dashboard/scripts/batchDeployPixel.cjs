/**
 * BATCH DEPLOY PIXEL - Publica todas as cidades com o Pixel de Rastreamento Próprio
 * Executa sequencialmente com validação e checagem ao vivo pós-deploy.
 */

const fs = require('fs');
const path = require('path');

const CITIES_FILE = path.join(__dirname, '..', 'data', 'cities.json');
const REPORT_FILE = path.join(__dirname, '..', '..', 'docs', 'RELATORIO_PIXEL_TODAS_CIDADES.md');
const API_URL = 'http://localhost:5002';

async function checkLivePixel(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { online: false, status: res.status, hasPixel: false };
    const html = await res.text();
    const hasPixel = html.includes('supabase.co') || html.includes('analytics_events');
    return { online: true, status: res.status, hasPixel };
  } catch (err) {
    return { online: false, status: err.message, hasPixel: false };
  }
}

async function deployCity(cityId) {
  try {
    const res = await fetch(`${API_URL}/api/deploy-city/${cityId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(120000) // 2 min timeout per deploy
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log('====================================================');
  console.log('🚀 INICIANDO DEPLOY DO PIXEL EM TODAS AS CIDADES');
  console.log('====================================================\n');

  const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
  console.log(`📋 Total de cidades cadastradas: ${cities.length}`);

  // 1. Diagnóstico inicial
  console.log('\n🔍 Checando quais cidades já possuem o Pixel no ar...');
  const queue = [];
  const alreadyDone = [];

  for (let i = 0; i < cities.length; i++) {
    const c = cities[i];
    if (!c.deployUrl) continue;
    const check = await checkLivePixel(c.deployUrl);
    if (check.hasPixel) {
      alreadyDone.push(c);
      console.log(`[${i + 1}/${cities.length}] 🟢 ${c.cidade} (${c.uf}) - Já está com o Pixel ativo no ar!`);
    } else {
      queue.push(c);
      console.log(`[${i + 1}/${cities.length}] ⏳ ${c.cidade} (${c.uf}) - Na fila de deploy (${c.hospedagem})`);
    }
  }

  console.log(`\n📊 Status Inicial:`);
  console.log(`- Cidades já atualizadas com Pixel: ${alreadyDone.length}`);
  console.log(`- Cidades na fila para atualizar: ${queue.length}\n`);

  if (queue.length === 0) {
    console.log('🎉 Todas as cidades já estão com o Pixel ativo no ar!');
    return;
  }

  // 2. Executa deploys
  const results = [];

  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    const progress = `[${i + 1}/${queue.length}]`;
    console.log(`\n${progress} ⏳ Compilando e publicando: ${c.cidade} (${c.uf}) [${c.hospedagem}]...`);
    const startTime = Date.now();

    let deployRes = await deployCity(c.id);

    // Se falhar na primeira tentativa, tenta mais uma vez
    if (!deployRes.success) {
      console.log(`${progress} ⚠️ Primeira tentativa falhou: ${deployRes.error || 'Erro desconhecido'}. Tentando novamente...`);
      await new Promise(r => setTimeout(r, 2000));
      deployRes = await deployCity(c.id);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (deployRes.success) {
      const liveUrl = deployRes.deployUrl || c.deployUrl;
      // Aguarda 1s para propagação no CDN
      await new Promise(r => setTimeout(r, 1000));
      const liveCheck = await checkLivePixel(liveUrl);

      if (liveCheck.hasPixel) {
        console.log(`${progress} ✅ ${c.cidade} (${c.uf}) publicado em ${duration}s! Pixel VERIFICADO AO VIVO em: ${liveUrl}`);
        results.push({ city: c, success: true, liveUrl, hasPixel: true, duration });
      } else {
        console.log(`${progress} 🟡 ${c.cidade} (${c.uf}) publicado (${duration}s), mas Pixel ainda não detectado (pode ser cache do CDN): ${liveUrl}`);
        results.push({ city: c, success: true, liveUrl, hasPixel: false, duration });
      }
    } else {
      console.error(`${progress} ❌ Falha no deploy de ${c.cidade}: ${deployRes.error || 'Erro'}`);
      results.push({ city: c, success: false, error: deployRes.error, duration });
    }
  }

  // 3. Auditoria Final Geral de todas as 53 cidades
  console.log('\n====================================================');
  console.log('🔍 AUDITORIA FINAL: TESTANDO TODAS AS 53 CIDADES NO AR');
  console.log('====================================================\n');

  // Recarrega cidades atualizadas
  const updatedCities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf-8'));
  const finalAudit = [];

  for (let i = 0; i < updatedCities.length; i++) {
    const c = updatedCities[i];
    if (!c.deployUrl) continue;
    const check = await checkLivePixel(c.deployUrl);
    finalAudit.push({
      index: i + 1,
      id: c.id,
      cidade: c.cidade,
      uf: c.uf,
      hospedagem: c.hospedagem || 'cloudflare',
      url: c.deployUrl,
      status: check.status,
      hasPixel: check.hasPixel
    });
    process.stdout.write(check.hasPixel ? '🟢' : '🔴');
  }

  console.log('\n');

  const totalPixelAtivo = finalAudit.filter(a => a.hasPixel).length;
  const totalSemPixel = finalAudit.filter(a => !a.hasPixel).length;

  console.log(`\n🏆 RESULTADO FINAL DA OPERAÇÃO:`);
  console.log(`- Total de cidades publicadas: ${finalAudit.length}`);
  console.log(`- Cidades com Pixel 100% ativo e verificado: ${totalPixelAtivo}`);
  console.log(`- Cidades pendentes: ${totalSemPixel}`);

  // 4. Salva relatório completo em Markdown
  let md = `# Relatório de Implementação do Pixel de Rastreamento\n\n`;
  md += `**Data da Operação:** ${new Date().toLocaleString('pt-BR')}\n`;
  md += `**Total de Cidades:** ${finalAudit.length}\n`;
  md += `**Cidades com Pixel Ativo:** ${totalPixelAtivo} / ${finalAudit.length} (${((totalPixelAtivo / finalAudit.length) * 100).toFixed(1)}%)\n\n`;
  md += `| # | Cidade / UF | Provedor | Status HTTP | Pixel no Ar | URL de Produção |\n`;
  md += `|---|-------------|----------|-------------|-------------|-----------------|\n`;

  finalAudit.forEach(a => {
    const pixelIcon = a.hasPixel ? '✅ Ativo' : '❌ Não detectado';
    md += `| ${a.index} | ${a.cidade} (${a.uf}) | ${a.hospedagem.toUpperCase()} | ${a.status} | ${pixelIcon} | [Link](${a.url}) |\n`;
  });

  fs.writeFileSync(REPORT_FILE, md, 'utf-8');
  console.log(`\n📄 Relatório detalhado salvo em: ${REPORT_FILE}`);
}

run().catch(err => {
  console.error('Erro fatal no batch:', err);
});
