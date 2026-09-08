const cities = require('../apps/web-dashboard/data/cities.json');

function getNeighDesc(bairro, cidade, uf) {
  const candidates = [
    `Desentupidora no bairro ${bairro}, em ${cidade} ${uf}. Atendimento emergencial 24 horas, visita técnica e orçamento sem taxa. Chame agora!`,
    `Desentupidora no bairro ${bairro}, em ${cidade} ${uf}. Atendimento 24h com visita técnica gratuita e orçamento sem taxa. Peça já!`,
    `Desentupidora no bairro ${bairro}, ${cidade} ${uf}. Atendimento emergencial 24 horas com visita técnica e orçamento gratuito sem taxa!`,
    `Desentupidora no bairro ${bairro}, ${cidade} ${uf}. Atendimento 24h com visita técnica e orçamento sem taxa de visita. Chame agora!`,
    `Desentupidora no bairro ${bairro}, ${cidade} ${uf}. Atendimento emergencial 24h, visita técnica e orçamento gratuito sem compromisso!`,
    `Desentupidora no bairro ${bairro}, ${cidade} ${uf}. Atendimento emergencial 24h, visita técnica e orçamento sem taxa de visita!`,
    `Desentupidora no bairro ${bairro}, ${cidade} ${uf}. Atendimento 24h, visita técnica e orçamento grátis sem taxa!`
  ];
  const valid = candidates.find(c => c.length >= 120 && c.length <= 150);
  if (!valid) {
    console.warn(`Aviso para ${bairro}, ${cidade}: nenhuma candidata entre 120-150.`);
    return candidates.sort((a,b) => Math.abs(a.length - 135) - Math.abs(b.length - 135))[0];
  }
  return valid;
}

function getServiceDesc(serviceTitle, cidade, uf) {
  const short = serviceTitle.replace(/^Desentupimento (de\s+)?/i, '').replace(/^Desobstru[cç][aã]o (de\s+)?/i, '').toLowerCase();
  const candidates = [
    `Desentupidora de ${short} em ${cidade} ${uf}. Atendimento 24h, visita técnica e orçamento grátis sem taxa!`,
    `Desentupidora especialista em ${short} em ${cidade} ${uf}. Atendimento rápido 24h com visita técnica e orçamento grátis sem taxa!`,
    `Desentupidora especialista em ${short} em ${cidade} ${uf}. Atendimento rápido 24 horas, visita técnica e orçamento gratuito sem taxa. Chame já!`,
    `Desentupidora especialista em ${short} em ${cidade} ${uf}. Atendimento rápido, visita técnica e orçamento gratuito. Plantão 24h!`,
    `Desentupidora especialista em ${short} em ${cidade} ${uf}. Atendimento rápido com visita e orçamento gratuito sem taxa. Plantão 24h!`,
    `Desentupidora de ${short} em ${cidade} ${uf}. Atendimento emergencial 24h, visita técnica e orçamento sem taxa de visita!`,
    `Desentupidora de ${short} em ${cidade} ${uf}. Atendimento 24h, visita técnica e orçamento sem taxa!`,
    `Desentupidora especialista em ${short} em ${cidade} ${uf}. Atendimento emergencial 24h com visita e orçamento gratuito sem taxa!`
  ];
  const valid = candidates.find(c => c.length >= 120 && c.length <= 150);
  if (!valid) {
    console.warn(`Aviso para ${serviceTitle}, ${cidade}: nenhuma candidata de serviço entre 120-150.`);
    return candidates.sort((a,b) => Math.abs(a.length - 135) - Math.abs(b.length - 135))[0];
  }
  return valid;
}

let allOk = true;
let totalBairros = 0;
let totalServices = 0;

cities.forEach(c => {
  (c.bairros || []).forEach(b => {
    totalBairros++;
    const desc = getNeighDesc(b, c.cidade, c.uf);
    if (desc.length < 120 || desc.length > 150) {
      console.log('FAIL BAIRRO:', c.cidade, b, desc.length, desc);
      allOk = false;
    }
  });

  (c.services || []).forEach(s => {
    totalServices++;
    const desc = getServiceDesc(s.title, c.cidade, c.uf);
    if (desc.length < 120 || desc.length > 150) {
      console.log('FAIL SERVICO:', c.cidade, s.title, desc.length, desc);
      allOk = false;
    }
  });
});

console.log(`Testados ${totalBairros} bairros e ${totalServices} serviços em ${cities.length} cidades.`);
if (allOk) console.log('✅ SUCESSO: 100% dos bairros e serviços estão entre 120 e 150 caracteres!');
