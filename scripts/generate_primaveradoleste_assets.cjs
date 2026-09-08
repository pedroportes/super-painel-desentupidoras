const sharp = require('../apps/web-dashboard/node_modules/sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const dir = path.join(__dirname, '../apps/site-template-astro/public/images/primaveradoleste');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const logoSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0ea5e9" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="38" fill="url(#grad)" />
    <path d="M50 22 C36 38 30 46 30 56 C30 67 39 76 50 76 C61 76 70 67 70 56 C70 46 64 38 50 22 Z" fill="#ffffff" opacity="0.95" />
    <path d="M50 36 C42 47 38 52 38 58 C38 65 43 70 50 70 C57 70 62 65 62 58 C62 52 58 47 50 36 Z" fill="url(#accent)" />
    <text x="105" y="46" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="105" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#0284c7" letter-spacing="1">PRIMAVERA DO LESTE</text>
  </svg>
  `);

  await sharp(logoSvg)
    .webp({ quality: 95 })
    .toFile(path.join(dir, 'logo-desentupidora-primaveradoleste.webp'));
  console.log('Logo generated successfully!');

  const faviconSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#favGrad)" />
    <path d="M64 26 C45 48 38 59 38 73 C38 88 50 100 64 100 C78 100 90 88 90 73 C90 59 83 48 64 26 Z" fill="#ffffff" />
    <circle cx="64" cy="75" r="14" fill="#38bdf8" />
  </svg>
  `);

  await sharp(faviconSvg)
    .webp({ quality: 95 })
    .toFile(path.join(dir, 'favicon-desentupidora-primaveradoleste.webp'));
  console.log('Favicon generated successfully!');

  const baseHero = path.join(__dirname, '../apps/site-template-astro/public/images/riogrande/desentupidora-riogrande-caminhao-limpa-fossa.webp');
  await sharp(baseHero)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(dir, 'desentupidora-primaveradoleste-caminhao-limpa-fossa.webp'));
  console.log('Hero image generated successfully!');
}

run().catch(console.error);
