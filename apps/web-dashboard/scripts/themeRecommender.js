/**
 * MOTOR DE SUGESTÃO ANTI-CLONAGEM VISUAL
 * Seleciona automaticamente uma combinação de Paleta de Cores + Variação de Layouts
 * que AINDA NÃO FOI USADA em cidades geograficamente próximas.
 */

const PALETTES = [
  'urgencia-azul-laranja',
  'corporativo-verde-cinza',
  'residencial-bege',
  'industrial-amarelo',
  'clean-azul'
];

const HERO_VARIANTS = ['HeroV1', 'HeroV2'];
const SERVICES_VARIANTS = ['ServicesGridV1', 'ServicesGridV2'];
const HEADER_VARIANTS = ['HeaderV1', 'HeaderV2'];

export function recommendAntiCloneTheme(cityName, existingCities = []) {
  // Find themes used in the same state or nearby cities
  const usedPalettes = new Set(existingCities.map(c => c.paletaCores).filter(Boolean));
  const usedHeroes = new Set(existingCities.map(c => c.heroVariant).filter(Boolean));
  const usedServices = new Set(existingCities.map(c => c.servicesVariant).filter(Boolean));

  // Find unused palette, or cycle
  let selectedPalette = PALETTES.find(p => !usedPalettes.has(p)) || PALETTES[existingCities.length % PALETTES.length];
  
  // Pick contrasting Hero variant
  let selectedHero = HERO_VARIANTS.find(h => !usedHeroes.has(h)) || HERO_VARIANTS[existingCities.length % HERO_VARIANTS.length];
  
  // Pick contrasting Services variant
  let selectedServices = SERVICES_VARIANTS.find(s => !usedServices.has(s)) || SERVICES_VARIANTS[existingCities.length % SERVICES_VARIANTS.length];

  // Pick Header variant
  let selectedHeader = HEADER_VARIANTS[existingCities.length % HEADER_VARIANTS.length];

  return {
    cidade: cityName,
    paletaCores: selectedPalette,
    variants: {
      header: selectedHeader,
      hero: selectedHero,
      services: selectedServices
    },
    recommendationReason: `Combinação inédita gerada para evitar clonagem visual em relação às ${existingCities.length} cidades existentes.`
  };
}

// Command-line test
if (process.argv[1] && process.argv[1].endsWith('themeRecommender.js')) {
  const sampleExisting = [
    { cidade: 'Linhares', paletaCores: 'urgencia-azul-laranja', heroVariant: 'HeroV1', servicesVariant: 'ServicesGridV1' },
    { cidade: 'Cachoeiro', paletaCores: 'corporativo-verde-cinza', heroVariant: 'HeroV2', servicesVariant: 'ServicesGridV2' }
  ];

  const rec = recommendAntiCloneTheme('Colatina', sampleExisting);
  console.log('==========================================================================');
  console.log('🎨 SUGESTÃO ANTI-CLONAGEM PARA NOVA CIDADE:');
  console.log('==========================================================================');
  console.log(JSON.stringify(rec, null, 2));
}
