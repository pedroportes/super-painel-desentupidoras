const path = require('path');
const fs = require('fs');
const sharp = require(path.join(__dirname, '..', 'apps', 'site-template-astro', 'node_modules', 'sharp'));

async function run() {
  const outDir = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'maranguape');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const heroSrc = 'C:/Users/pedro/.gemini/antigravity-ide/brain/47be494f-0cf5-473e-9b60-ae48f9fd7310/hero_maranguape_1788814708743.jpg';
  await sharp(heroSrc)
    .webp({ quality: 85 })
    .toFile(path.join(outDir, 'desentupidora-maranguape-caminhao-limpa-fossa.webp'));
  console.log('Hero converted to WebP successfully');

  const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" width="500" height="120">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d9488" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
    </defs>
    <rect width="500" height="120" rx="16" fill="transparent"/>
    <g transform="translate(20, 20)">
      <circle cx="40" cy="40" r="38" fill="url(#grad)" />
      <path d="M28 42 L38 52 L54 28" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 55 C 32 68, 48 68, 58 55" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
    </g>
    <text x="115" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="900" fill="#0f172a" letter-spacing="-0.5">DESENTUPIDORA</text>
    <text x="115" y="88" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#0d9488" letter-spacing="1">MARANGUAPE</text>
    <rect x="350" y="26" width="130" height="30" rx="6" fill="#0284c7"/>
    <text x="415" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">24 HORAS</text>
  </svg>`;

  await sharp(Buffer.from(svgLogo))
    .webp({ quality: 90 })
    .toFile(path.join(outDir, 'logo-desentupidora-maranguape.webp'));
  console.log('Logo generated successfully');

  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d9488" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#favGrad)"/>
    <path d="M20 34 L28 42 L44 22" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  await sharp(Buffer.from(svgFavicon))
    .webp({ quality: 90 })
    .toFile(path.join(outDir, 'favicon-desentupidora-maranguape.webp'));
  console.log('Favicon generated successfully');
}

run().catch(console.error);
