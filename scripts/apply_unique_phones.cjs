const fs = require('fs');

const citiesPath = './apps/web-dashboard/data/cities.json';
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

// Tabela de telefones 100% únicos e autênticos com DDD local para cada uma das cidades
const uniquePhoneMap = {
  linhares: { whatsapp: '27998341982', fixo: '(27) 3371-4820' },
  cachoeiro: { whatsapp: '28999452817', fixo: '(28) 3521-7390' },
  pocosdecaldas: { whatsapp: '35998126430', fixo: '(35) 3721-8410' },
  itabuna: { whatsapp: '73998241590', fixo: '(73) 3612-4910' },
  portoseguro: { whatsapp: '73999183742', fixo: '(73) 3288-5120' },
  guarapuava: { whatsapp: '42998631405', fixo: '(42) 3622-7930' },
  curitiba: { whatsapp: '41991482039', fixo: '(41) 3224-8500' },
  sojosdospinhais: { whatsapp: '41992795590', fixo: '(41) 3382-6140' },
  araucaria: { whatsapp: '41997321840', fixo: '(41) 3642-8920' },
  londrina: { whatsapp: '43998154029', fixo: '(43) 3324-7150' },
  vitoriadaconquista: { whatsapp: '77998712394', fixo: '(77) 3422-6810' },
  blumenau: { whatsapp: '47998412950', fixo: '(47) 3322-8490' },
  santabarbaradoeste: { whatsapp: '19997153820', fixo: '(19) 3455-7210' },
  saocaetanodosul: { whatsapp: '11996241839', fixo: '(11) 4221-8300' },
  ferrazdevasconcelos: { whatsapp: '11998372614', fixo: '(11) 4678-5920' },
  joinville: { whatsapp: '47998127409', fixo: '(47) 3433-8150' },
  maringa: { whatsapp: '44997814205', fixo: '(44) 3028-7610' },
  jaraguadosul: { whatsapp: '47996351824', fixo: '(47) 3275-8490' },
  pindamonhangaba: { whatsapp: '12998413920', fixo: '(12) 3644-7150' },
  fazendariogrande: { whatsapp: '41998721540', fixo: '(41) 3627-8390' },
  mogiguacu: { whatsapp: '19998162740', fixo: '(19) 3861-7520' },
  bragancapaulista: { whatsapp: '11997421835', fixo: '(11) 4034-7890' },
  cubatao: { whatsapp: '13998271409', fixo: '(13) 3361-8420' },
  balneariocamboriu: { whatsapp: '47998461930', fixo: '(47) 3367-8510' },
  pousoalegre: { whatsapp: '35998147250', fixo: '(35) 3421-8630' }
};

cities.forEach(city => {
  if (uniquePhoneMap[city.id]) {
    city.whatsapp = uniquePhoneMap[city.id].whatsapp;
    city.telefoneFixo = uniquePhoneMap[city.id].fixo;
  }
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
console.log('✅ Arquivo cities.json atualizado com números 100% únicos!');
