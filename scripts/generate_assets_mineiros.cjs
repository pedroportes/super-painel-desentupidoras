const fs = require('fs');
const path = require('path');
const sharp = require('../apps/site-template-astro/node_modules/sharp');

async function makeAssets() {
  const targetDir = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'mineiros');
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Process Hero
  const baseHero = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'unai', 'desentupidora-unai-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1920, 1080, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(targetDir, 'desentupidora-mineiros-caminhao-limpa-fossa.webp'));
  console.log('Hero Mineiros salvo!');

  // 2. Vector Logo in SVG -> WebP (transparent)
  const logoSvg = Buffer.from(`
  <svg width="640" height="160" viewBox="0 0 640 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <linearGradient id="swirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
    </defs>
    <!-- Icon Group -->
    <g transform="translate(15, 10)">
      <!-- Water Drop -->
      <path d="M70 10 C70 10 30 70 30 100 C30 122 48 140 70 140 C92 140 110 122 110 100 C110 70 70 10 Z" fill="url(#dropGrad)"/>
      <path d="M55 70 C55 70 42 90 42 105 C42 115 50 123 60 123 C50 115 50 100 55 90 Z" fill="#ffffff" opacity="0.5"/>
      <!-- Swirl Arc -->
      <path d="M70 50 C95 50 115 70 115 95 C115 120 95 138 70 138 C50 138 35 125 35 105 C35 90 45 80 58 80 C70 80 78 88 78 98 C78 105 72 110 65 110" fill="none" stroke="url(#swirlGrad)" stroke-width="12" stroke-linecap="round"/>
    </g>
    <!-- Text Group -->
    <text x="165" y="70" font-family="'Arial Black', 'Montserrat', sans-serif" font-size="36" font-weight="900" fill="#0f172a" letter-spacing="1">DESENTUPIDORA</text>
    <text x="165" y="126" font-family="'Arial Black', 'Montserrat', sans-serif" font-size="44" font-weight="900" fill="#0284c7" letter-spacing="2">MINEIROS</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(targetDir, 'logo-desentupidora-mineiros.webp'));
  console.log('Logo Mineiros gerado!');

  // 3. Vector Favicon in SVG -> WebP (transparent)
  const faviconSvg = Buffer.from(`
  <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fDrop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <linearGradient id="fSwirl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
    </defs>
    <path d="M64 8 C64 8 24 64 24 92 C24 114 42 124 64 124 C86 124 104 114 104 92 C104 64 64 8 Z" fill="url(#fDrop)"/>
    <path d="M48 65 C48 65 36 82 36 96 C36 105 43 112 52 112 C44 105 44 92 48 83 Z" fill="#ffffff" opacity="0.55"/>
    <path d="M64 48 C86 48 102 64 102 86 C102 108 86 120 64 120 C46 120 34 108 34 92 C34 78 44 68 56 68 C66 68 74 76 74 84" fill="none" stroke="url(#fSwirl)" stroke-width="10" stroke-linecap="round"/>
  </svg>
  `);

  await sharp(faviconSvg)
    .resize(128, 128)
    .webp({ quality: 95 })
    .toFile(path.join(targetDir, 'favicon-desentupidora-mineiros.webp'));
  console.log('Favicon Mineiros gerado!');
}

makeAssets().catch(console.error);
