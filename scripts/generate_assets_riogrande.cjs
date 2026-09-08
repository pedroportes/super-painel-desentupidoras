const fs = require('fs');
const path = require('path');
const sharp = require('../apps/site-template-astro/node_modules/sharp');

async function makeAssets() {
  const targetDir = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'riogrande');
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Process Hero
  const baseHero = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'bage', 'desentupidora-bage-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1920, 1080, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(targetDir, 'desentupidora-riogrande-caminhao-limpa-fossa.webp'));
  console.log('Hero Rio Grande salvo!');

  // 2. Vector Logo in clean-azul palette -> WebP (transparent)
  const logoSvg = Buffer.from(`
  <svg width="640" height="160" viewBox="0 0 640 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cleanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <!-- Icon Group -->
    <g transform="translate(15, 10)">
      <!-- Water Drop -->
      <path d="M70 10 C70 10 30 70 30 100 C30 122 48 140 70 140 C92 140 110 122 110 100 C110 70 70 10 Z" fill="url(#cleanGrad)"/>
      <path d="M55 70 C55 70 42 90 42 105 C42 115 50 123 60 123 C50 115 50 100 55 90 Z" fill="#ffffff" opacity="0.5"/>
      <!-- Technical Ring -->
      <circle cx="70" cy="95" r="32" fill="none" stroke="url(#cyanGrad)" stroke-width="10" stroke-linecap="round" stroke-dasharray="160 40"/>
    </g>
    <!-- Text Group -->
    <text x="165" y="68" font-family="'Arial Black', 'Montserrat', sans-serif" font-size="34" font-weight="900" fill="#0f172a" letter-spacing="1">DESENTUPIDORA</text>
    <text x="165" y="122" font-family="'Arial Black', 'Montserrat', sans-serif" font-size="44" font-weight="900" fill="#0284c7" letter-spacing="2">RIO GRANDE</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(targetDir, 'logo-desentupidora-riogrande.webp'));
  console.log('Logo Rio Grande gerado!');

  // 3. Vector Favicon -> WebP (transparent)
  const faviconSvg = Buffer.from(`
  <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fClean" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <linearGradient id="fCyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    <path d="M64 8 C64 8 24 64 24 92 C24 114 42 124 64 124 C86 124 104 114 104 92 C104 64 64 8 Z" fill="url(#fClean)"/>
    <path d="M48 65 C48 65 36 82 36 96 C36 105 43 112 52 112 C44 105 44 92 48 83 Z" fill="#ffffff" opacity="0.55"/>
    <circle cx="64" cy="88" r="24" fill="none" stroke="url(#fCyan)" stroke-width="8" stroke-linecap="round" stroke-dasharray="110 30"/>
  </svg>
  `);

  await sharp(faviconSvg)
    .resize(128, 128)
    .webp({ quality: 95 })
    .toFile(path.join(targetDir, 'favicon-desentupidora-riogrande.webp'));
  console.log('Favicon Rio Grande gerado!');
}

makeAssets().catch(console.error);
