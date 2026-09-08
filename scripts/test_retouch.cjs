const sharp = require('../apps/site-template-astro/node_modules/sharp');
const path = require('path');
const fs = require('fs');

async function retouchHero() {
  const inputPath = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  
  // 1. Banner Roof Overlay:
  // In roof crop: left: 150, top: 300.
  // The blue sign is around x: 195 to 585 (width: 390), y: 325 to 405 (height: 80).
  // Let's create an SVG overlay covering the blue rectangle and placing 'DESENTUPIDORA EM RIO GRANDE'
  
  // 2. Door Numbers Overlay:
  // In door crop: left: 550, top: 600.
  // Text is around x: 670 to 800, y: 630 to 730.
  // Fills with door white gradient and writes Rio Grande phones:
  // ATENDIMENTO 24 HORAS
  // (53) 3232-4890
  // (53) 99841-2895
  
  const overlaySvg = Buffer.from(`
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bluePlate" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#193a74"/>
        <stop offset="100%" stop-color="#142c58"/>
      </linearGradient>
      <linearGradient id="doorPaint" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
    </defs>

    <!-- ROOF SIGN OVERLAY -->
    <!-- Position: x=190, y=324, width=405, height=84 -->
    <g transform="translate(190, 324)">
      <!-- White outer border -->
      <rect x="0" y="0" width="405" height="84" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <!-- Blue background inner plate -->
      <rect x="4" y="4" width="397" height="76" rx="2" fill="url(#bluePlate)"/>
      <!-- Subtle highlight on plate -->
      <line x1="6" y1="6" x2="399" y2="6" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5"/>
      <!-- Text DESENTUPIDORA EM RIO GRANDE -->
      <text x="202" y="54" 
            font-family="'Arial Black', 'Impact', sans-serif" 
            font-size="28" 
            font-weight="900" 
            fill="#ffffff" 
            text-anchor="middle" 
            letter-spacing="0.5">DESENTUPIDORA EM RIO GRANDE</text>
    </g>

    <!-- DOOR NUMBERS OVERLAY -->
    <!-- Position: x=660, y=630, width=140, height=105 -->
    <g transform="translate(660, 630)">
      <!-- Seamless paint patch matching white van body -->
      <rect x="0" y="0" width="140" height="105" rx="8" fill="url(#doorPaint)" opacity="0.96"/>
      
      <!-- Text: ATENDIMENTO 24 HORAS -->
      <text x="70" y="20" 
            font-family="Arial, sans-serif" 
            font-size="11" 
            font-weight="800" 
            fill="#1e293b" 
            text-anchor="middle" 
            letter-spacing="0.2">ATENDIMENTO 24 HORAS</text>

      <!-- Landline Phone -->
      <text x="70" y="52" 
            font-family="Arial, sans-serif" 
            font-size="20" 
            font-weight="900" 
            fill="#0f172a" 
            text-anchor="middle">(53) 3232-4890</text>

      <!-- WhatsApp icon + Mobile Phone -->
      <g transform="translate(4, 68)">
        <!-- WhatsApp green badge -->
        <circle cx="10" cy="11" r="9" fill="#22c55e"/>
        <path d="M7 11 C7 9 9 7 11 7 C13 7 14 8 14 10 C14 12 12 13 10 14 L8 14 L8 12 Z" fill="#ffffff" opacity="0.9"/>
        <!-- WhatsApp Phone -->
        <text x="68" y="17" 
              font-family="Arial, sans-serif" 
              font-size="20" 
              font-weight="900" 
              fill="#0f172a" 
              text-anchor="middle">(53) 99841-2895</text>
      </g>
    </g>
  </svg>
  `);

  await sharp(inputPath)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .webp({ quality: 90 })
    .toFile(path.join(__dirname, 'temp_retouched_full.webp'));

  // Also create crops for visual inspection
  await sharp(path.join(__dirname, 'temp_retouched_full.webp'))
    .extract({ left: 150, top: 300, width: 480, height: 150 })
    .toFile(path.join(__dirname, 'test_roof_retouch.png'));

  await sharp(path.join(__dirname, 'temp_retouched_full.webp'))
    .extract({ left: 630, top: 610, width: 200, height: 150 })
    .toFile(path.join(__dirname, 'test_door_retouch.png'));

  console.log('Retouch test generated!');
}

retouchHero().catch(console.error);
