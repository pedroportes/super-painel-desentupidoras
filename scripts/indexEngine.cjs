/**
 * INDEX ENGINE - Sistema Automatizado de Indexação Rápida
 * 
 * Executa disparo de URLs para:
 * 1. Protocolo IndexNow (Bing / Yahoo / Yandex / Naver / Seznam)
 * 2. Ping Oficial de Sitemaps (Google & Bing)
 * 3. Gravação de logs de telemetria no Supabase (indexing_logs)
 */

const INDEXNOW_KEY = '9f8b2c4e1a7d6f5e8b3c2a1d0f9e8b7a';
const SUPABASE_URL = 'https://dltqxfyrltgbudtzxzot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdHF4ZnlybHRnYnVkdHp4em90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NTMzNzIsImV4cCI6MjA4MjQyOTM3Mn0.25dykN-BHp6B_iB0l-EDtKiGrOGSc9inmo_403yhsUQ';

function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Gera a lista completa de URLs indexáveis para uma cidade
 */
function extractCityUrls(cityConfig, baseUrl) {
  const cleanBase = (baseUrl || cityConfig.deployUrl || '').replace(/\/+$/, '');
  if (!cleanBase) return [];

  const urls = new Set();
  const citySlug = slugify(cityConfig.cidade || cityConfig.id);

  // 1. Home
  urls.add(`${cleanBase}/`);

  // 2. Serviços
  const services = cityConfig.services || [
    { id: 'desentupimento-de-esgoto' },
    { id: 'desentupimento-de-pia' },
    { id: 'desentupimento-de-vaso-sanitario' },
    { id: 'desentupimento-de-ralo' },
    { id: 'esgotamento-de-fossa' },
    { id: 'hidrojateamento' }
  ];

  services.forEach(s => {
    let sSlug = s.id;
    if (s.id === 'esgotamento-de-fossa') sSlug = 'limpa-fossa-e-esgotamento';
    if (s.id === 'hidrojateamento') sSlug = 'hidrojateamento-de-alta-pressao';
    urls.add(`${cleanBase}/${sSlug}-em-${citySlug}/`);
  });

  // 3. Bairros
  (cityConfig.bairros || []).forEach(b => {
    const bSlug = slugify(b);
    if (bSlug) urls.add(`${cleanBase}/${bSlug}/`);
  });

  // 4. Páginas institucionais
  urls.add(`${cleanBase}/contato/`);
  urls.add(`${cleanBase}/termos-de-uso/`);
  urls.add(`${cleanBase}/politica-de-privacidade/`);

  // 5. Parceiros
  urls.add(`${cleanBase}/fora-da-area-de-cobertura/`);
  (cityConfig.parceiros || []).forEach(p => {
    const pSlug = slugify(p.cidade || p.nome);
    if (pSlug) {
      urls.add(`${cleanBase}/fora-da-area-de-cobertura/${pSlug}-desentupidora-${pSlug}-${(p.uf || '').toLowerCase()}-24h/`);
    }
  });

  return Array.from(urls);
}

/**
 * Dispara envio de URLs para o IndexNow
 */
async function submitToIndexNow(host, urls) {
  const payload = {
    host: host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: urls
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    let text = '';
    try { text = await res.text(); } catch (e) {}

    const isSuccess = [200, 202, 204].includes(status);
    return {
      success: isSuccess,
      status: status,
      response: text || (isSuccess ? 'URLs submetidas com sucesso ao IndexNow' : 'Falha no IndexNow')
    };
  } catch (err) {
    return {
      success: false,
      status: 0,
      response: `Erro de conexão IndexNow: ${err.message}`
    };
  }
}

/**
 * Dispara pings de Sitemap para os buscadores
 */
async function submitSitemapPings(sitemapUrl) {
  const results = [];

  // Google Ping
  try {
    const resG = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    results.push(`Google: HTTP ${resG.status}`);
  } catch (e) {
    results.push(`Google: ${e.message}`);
  }

  // Bing Ping
  try {
    const resB = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    results.push(`Bing: HTTP ${resB.status}`);
  } catch (e) {
    results.push(`Bing: ${e.message}`);
  }

  return results.join(' | ');
}

/**
 * Registra o log de indexação no Supabase
 */
async function logIndexingToSupabase(logData) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/indexing_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(logData)
    });
  } catch (err) {
    console.warn('⚠️ Falha ao registrar log no Supabase:', err.message);
  }
}

/**
 * Função principal chamada após o deploy de cada cidade
 */
async function triggerAutoIndex(cityConfig, deployedUrl) {
  const targetUrl = deployedUrl || cityConfig.deployUrl;
  if (!targetUrl) {
    console.warn('⚠️ triggerAutoIndex: URL de deploy não informada.');
    return { success: false, error: 'URL ausente' };
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const host = parsedUrl.host;
    const urls = extractCityUrls(cityConfig, targetUrl);
    const sitemapUrl = `${targetUrl.replace(/\/+$/, '')}/sitemap-index.xml`;

    console.log(`\n📡 [IndexEngine] Disparando indexação para ${cityConfig.cidade}/${cityConfig.uf} (${urls.length} URLs)...`);

    // 1. IndexNow
    const indexNowRes = await submitToIndexNow(host, urls);
    console.log(`   ⚡ IndexNow (${host}): Status ${indexNowRes.status} -> ${indexNowRes.response}`);

    // 2. Sitemap Pings
    const sitemapRes = await submitSitemapPings(sitemapUrl);
    console.log(`   🗺️ Sitemaps Ping: ${sitemapRes}`);

    // 3. Log no Supabase
    const logData = {
      city_id: cityConfig.id || slugify(cityConfig.cidade),
      city_name: cityConfig.cidade,
      provider: cityConfig.hospedagem || 'cloudflare',
      target_url: targetUrl,
      urls_count: urls.length,
      indexnow_status: indexNowRes.status,
      indexnow_response: indexNowRes.response,
      sitemap_status: 200,
      sitemap_response: sitemapRes,
      error: indexNowRes.success ? null : indexNowRes.response
    };

    await logIndexingToSupabase(logData);

    return {
      success: true,
      urlsCount: urls.length,
      indexNow: indexNowRes,
      sitemaps: sitemapRes
    };
  } catch (err) {
    console.error('❌ Erro no IndexEngine:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  triggerAutoIndex,
  extractCityUrls,
  submitToIndexNow,
  submitSitemapPings,
  logIndexingToSupabase
};
