// Script de VERIFICAÇÃO LOCAL apenas — escreve direto em
// site-template-astro/src/data/cityConfig.json pra testar o render de um
// modelo (dos 8 em cityGenerator.ts) sem precisar cadastrar uma cidade
// real no painel. Uso: `npx tsx scripts/test_new_models.mjs <modeloId>`,
// depois `cd ../site-template-astro && npm run build`. NUNCA rodar isso
// e depois fazer deploy sem antes rodar `/api/build-city/:id` numa
// cidade real de novo pra restaurar o cityConfig.json de verdade —
// esse arquivo é sempre sobrescrito pelo painel a cada build/deploy real,
// então o efeito colateral é temporário, mas não decore fazer deploy
// logo depois de rodar este script sem restaurar antes.
import { generateUniqueCityContent } from '../src/cityGenerator.ts';
import fs from 'fs';
import path from 'path';

const modelo = process.argv[2] || 'tecnico-especializado';
const config = generateUniqueCityContent('Cidade Teste', 'PR', '200.000', modelo, 'cloudflare');
config.heroImage = '/images/vitoriadaconquista/desentupidora-vitoriadaconquista-caminhao-limpa-fossa.webp';
config.logoUrl = '/images/vitoriadaconquista/logo-desentupidora-vitoriadaconquista.webp';

const astroConfig = {
  cidade: config.cidade,
  estado: 'Paraná',
  uf: config.uf,
  populacao: config.populacao,
  ddd: '41',
  whatsapp: config.whatsapp,
  telefoneFixo: config.telefoneFixo,
  empresaNome: config.empresaNome,
  cnpj: config.cnpj,
  endereco: config.endereco,
  hospedagem: config.hospedagem,
  deployUrl: '',
  paletaCores: config.paletaCores,
  logoUrl: config.logoUrl,
  logoHeight: 64,
  faviconUrl: config.logoUrl,
  heroImage: config.heroImage,
  variants: { hero: config.heroVariant, services: config.servicesVariant, faq: 'FAQV1' },
  sectionsConfig: config.sectionsConfig || {},
  geoCoordinates: { latitude: '', longitude: '' },
  seo: {
    metaTitle: `Desentupidora em ${config.cidade} ${config.uf} 24h`,
    metaDescription: `teste`,
    h1Title: config.h1Title,
    firstParagraphText: config.firstParagraph,
    lastH2Title: config.lastH2
  },
  ctaButtonText: config.ctaButtonText,
  aboutCityTitle: config.aboutCityTitle,
  aboutCityText: config.aboutCityText,
  bairros: config.bairros,
  services: config.services,
  faqs: config.faqs,
  testimonials: config.testimonials,
  parceiros: []
};

const outPath = path.join(process.cwd(), '..', 'site-template-astro', 'src', 'data', 'cityConfig.json');
fs.writeFileSync(outPath, JSON.stringify(astroConfig, null, 2), 'utf8');
console.log('OK, escrito cityConfig.json pro modelo:', modelo, '| hero:', config.heroVariant, '| services:', config.servicesVariant);
