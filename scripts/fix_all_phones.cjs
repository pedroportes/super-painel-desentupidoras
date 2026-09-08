const fs = require('fs');

const citiesPath = './apps/web-dashboard/data/cities.json';
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

// DDD oficial por UF e Cidade
const dddMap = {
  linhares: '27',
  cachoeiro: '28',
  pocosdecaldas: '35',
  itabuna: '73',
  portoseguro: '73',
  guarapuava: '42',
  curitiba: '41',
  sojosdospinhais: '41',
  araucaria: '41',
  londrina: '43',
  vitoriadaconquista: '77',
  blumenau: '47',
  santabarbaradoeste: '19',
  saocaetanodosul: '11',
  ferrazdevasconcelos: '11',
  joinville: '47',
  maringa: '44',
  jaraguadosul: '47',
  pindamonhangaba: '12',
  fazendariogrande: '41',
  mogiguacu: '19',
  bragancapaulista: '11',
  cubatao: '13',
  balneariocamboriu: '47',
  pousoalegre: '35'
};

const usedWhats = new Set();
const usedFixos = new Set();

// Gerador determinístico baseado no ID da cidade para não haver repetição
cities.forEach((city, index) => {
  const ddd = dddMap[city.id] || '11';
  
  // Criar número de celular único: DDD + 9 + 8 dígitos
  // Ex: 41984123891
  let seed = 0;
  for (let i = 0; i < city.id.length; i++) {
    seed = (seed * 37 + city.id.charCodeAt(i) + (index * 13)) >>> 0;
  }

  const prefixes = ['984', '988', '991', '992', '996', '997', '981', '987', '994', '982'];
  let pIdx = (seed + index) % prefixes.length;
  
  let wNum = '';
  let fNum = '';

  let attempt = 1;
  while (true) {
    const p = prefixes[(pIdx + attempt) % prefixes.length];
    const mid = String(1000 + ((seed * 7 + attempt * 311) % 8999)).substring(0, 2);
    const end = String(1000 + ((seed * 13 + attempt * 577) % 8999)).substring(0, 3);
    wNum = `${ddd}${p}${mid}${end}`;

    const fixPrefix = ['32', '33', '34', '35', '36', '37', '38', '30', '31'][(seed + attempt) % 9];
    const fMid = String(10 + ((seed * 3 + attempt * 17) % 89));
    const fEnd = String(1000 + ((seed * 11 + attempt * 89) % 8999));
    fNum = `(${ddd}) ${fixPrefix}${fMid}-${fEnd}`;

    if (!usedWhats.has(wNum) && !usedFixos.has(fNum) && wNum.length === 11) {
      usedWhats.add(wNum);
      usedFixos.add(fNum);
      break;
    }
    attempt++;
  }

  city.whatsapp = wNum;
  city.telefoneFixo = fNum;
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');

console.log('=== RELATÓRIO FINAL: TODOS OS NÚMEROS ÚNICOS DEFINIDOS ===');
cities.forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.id}] ${c.cidade} - ${c.uf} | WhatsApp: "${c.whatsapp}" | Fixo: "${c.telefoneFixo}"`);
});
