const sharp = require('../apps/site-template-astro/node_modules/sharp');
const path = require('path');
const fs = require('fs');

async function testPolygonRetouch() {
  const base1920 = path.join(__dirname, 'base_clean_1920.png');
  const baseBuffer = fs.readFileSync(base1920);

  // 1. Extrair amostra de lataria branca limpa da parte superior da porta (acima do texto antigo)
  // x=600 a 760 (largura 160), y=530 a 580 (altura 50)
  const doorTexture = await sharp(baseBuffer)
    .extract({ left: 600, top: 535, width: 160, height: 45 })
    .resize(205, 125, { fit: 'fill' })
    .blur(0.8)
    .toBuffer();

  // 2. SVG com o polígono exato da placa e os textos de Rio Grande
  const svgOverlay = Buffer.from(`
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="plateBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#183b74"/>
        <stop offset="50%" stop-color="#1b4282"/>
        <stop offset="100%" stop-color="#122c57"/>
      </linearGradient>
    </defs>

    <!-- 1. PLACA DO BAÚ: POLÍGONO EXATO COBRINDO DE PONTA A PONTA -->
    <polygon points="232,342 615,326 615,396 232,412" fill="url(#plateBlue)" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="235,345 612,329 612,393 235,409" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5"/>

    <g transform="translate(423, 376) rotate(-2.39)">
      <text x="0" y="0" 
            font-family="'Arial Black', 'Impact', sans-serif" 
            font-size="18.5" 
            font-weight="900" 
            fill="#ffffff" 
            text-anchor="middle" 
            letter-spacing="0.6">DESENTUPIDORA EM RIO GRANDE</text>
    </g>

    <!-- 2. TEXTOS DA PORTA (sobre a lataria clonada) -->
    <g transform="translate(605, 624) rotate(-2.0)">
      <!-- Linha 1: ATENDIMENTO 24 HORAS -->
      <text x="96" y="16" 
            font-family="'Arial', sans-serif" 
            font-size="11.5" 
            font-weight="800" 
            fill="#334155" 
            text-anchor="middle" 
            letter-spacing="0.4">ATENDIMENTO 24 HORAS</text>

      <!-- Linha 2: Fixo oficial de Rio Grande -->
      <text x="96" y="48" 
            font-family="'Arial Black', sans-serif" 
            font-size="21" 
            font-weight="900" 
            fill="#0f172a" 
            text-anchor="middle" 
            letter-spacing="-0.5">(53) 3232-4890</text>

      <!-- Linha 3: WhatsApp oficial com badge verde -->
      <g transform="translate(26, 62)">
        <circle cx="10" cy="12" r="9" fill="#22c55e"/>
        <path d="M7 12 C7 9.5 8.5 8 10.5 8 C12.5 8 13.5 9.5 13.5 11.5 C13.5 13.5 12 15 10 15 L7.5 15.5 L8.2 13.8 Z" fill="#ffffff"/>
        <text x="68" y="19" 
              font-family="'Arial Black', sans-serif" 
              font-size="21" 
              font-weight="900" 
              fill="#0f172a" 
              text-anchor="middle" 
              letter-spacing="-0.5">(53) 99841-2895</text>
      </g>
    </g>
  </svg>
  `);

  // Composite door texture to cover old phones:
  const compositeRes = await sharp(baseBuffer)
    .composite([
      { input: doorTexture, left: 595, top: 620, blend: 'over' },
      { input: svgOverlay, left: 0, top: 0 }
    ])
    .webp({ quality: 92 })
    .toBuffer();

  const targetPath = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  fs.writeFileSync(targetPath, compositeRes);

  // Crops for inspection
  await sharp(compositeRes)
    .extract({ left: 180, top: 310, width: 450, height: 110 })
    .toFile(path.join(__dirname, 'poly_roof.png'));

  await sharp(compositeRes)
    .extract({ left: 520, top: 580, width: 320, height: 200 })
    .toFile(path.join(__dirname, 'poly_door.png'));

  console.log('Polygon test rendered!');
}

testPolygonRetouch().catch(console.error);
