const crypto = require('crypto');

const KEYWORD = 'desentupidora';
const normalise = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hash = (value) => crypto.createHash('sha256').update(normalise(value).replace(/\s+/g, ' ').trim()).digest('hex');

function validateCityReadiness(city) {
  const errors = [];
  const checks = [];
  const requireField = (label, value) => {
    const passed = Boolean(value && String(value).trim());
    checks.push({ label, passed });
    if (!passed) errors.push(label);
  };

  if (!city.qualityGateRequired) {
    return { passed: true, skipped: true, checks, errors };
  }

  if (city.isDraft) errors.push('O cadastro ainda esta marcado como rascunho.');
  if (!city.isDraft && (!city.empresaNome || /^site em preparacao/i.test(city.empresaNome))) errors.push('Identidade comercial verificada ausente.');
  if (city.whatsapp && !/^\d{10,13}$/.test((city.whatsapp || '').replace(/\D/g, ''))) errors.push('WhatsApp comercial invalido.');
  if (city.endereco && !String(city.endereco).trim()) errors.push('Endereco comercial invalido.');
  if (city.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(city.cnpj)) errors.push('CNPJ comercial invalido.');
  requireField('Meta title', city.metaTitle);
  requireField('Meta description', city.metaDescription);
  requireField('H1', city.h1Title);
  requireField('Primeiro paragrafo', city.firstParagraph);
  requireField('Ultimo H2', city.lastH2);

  for (const [label, value] of Object.entries({
    'Meta title': city.metaTitle,
    'Meta description': city.metaDescription,
    H1: city.h1Title,
    'Primeiro paragrafo': city.firstParagraph,
    'Ultimo H2': city.lastH2
  })) {
    if (normalise(value).includes(KEYWORD)) continue;
    errors.push(`${label} nao contem a palavra-chave '${KEYWORD}'.`);
  }

  if ((city.metaTitle || '').length < 40 || (city.metaTitle || '').length > 60) errors.push('Meta title fora da faixa de 40 a 60 caracteres.');
  if ((city.metaDescription || '').length < 120 || (city.metaDescription || '').length > 160) errors.push('Meta description fora da faixa de 120 a 160 caracteres.');
  if (!Array.isArray(city.faqs) || city.faqs.length < 6) errors.push('Sao necessarias ao menos 6 FAQs.');

  const evidence = city.bairroEvidence || {};
  const content = city.neighborhoodContent || {};
  const seenNames = new Set();
  const seenBodies = new Set();
  for (const bairro of city.bairros || []) {
    const key = normalise(bairro).replace(/[^a-z0-9]/g, '');
    if (seenNames.has(key)) errors.push(`Bairro duplicado: ${bairro}.`);
    seenNames.add(key);

    const source = evidence[bairro];
    if (!source?.url || !/^https:\/\//.test(source.url) || !source?.excerpt || !normalise(source.excerpt).includes(normalise(bairro))) {
      errors.push(`Bairro sem evidencia verificavel: ${bairro}.`);
    }

    const page = content[bairro];
    if (!page?.intro || !page?.lastH2 || !Array.isArray(page.facts) || page.facts.length < 1) {
      errors.push(`Bairro sem ficha editorial completa: ${bairro}.`);
      continue;
    }
    if (page.intro.trim().length < 180) errors.push(`Texto do bairro muito curto: ${bairro}.`);
    if (!normalise(page.intro).includes(normalise(bairro))) errors.push(`Texto nao cita o bairro: ${bairro}.`);
    if (!normalise(page.intro).includes(KEYWORD)) errors.push(`Primeiro paragrafo sem palavra-chave: ${bairro}.`);
    if (!normalise(page.lastH2).includes(KEYWORD)) errors.push(`Ultimo H2 sem palavra-chave: ${bairro}.`);
    // A fonte e o trecho sao revisados no fluxo editorial. Comparar palavras
    // soltas entre um resumo e uma pagina publica gerava falsos positivos e
    // nao era uma verificacao semantica confiavel.
    if (page.facts.some(fact => !String(fact).trim())) errors.push(`Fato editorial vazio: ${bairro}.`);
    const bodyHash = hash(`${page.intro}\n${page.lastH2}\n${page.facts.join('\n')}`);
    if (seenBodies.has(bodyHash)) errors.push(`Texto duplicado entre bairros: ${bairro}.`);
    seenBodies.add(bodyHash);
  }

  if ((city.bairros || []).length < 15) errors.push('Sao necessarios ao menos 15 bairros verificados.');
  return { passed: errors.length === 0, skipped: false, checks, errors };
}

module.exports = { validateCityReadiness };
