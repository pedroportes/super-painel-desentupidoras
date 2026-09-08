const sharp = require('../apps/site-template-astro/node_modules/sharp');
const path = require('path');
const fs = require('fs');

async function buildHeroRioGrande() {
  const base1920 = path.join(__dirname, 'base_clean_1920.png');
  const targetWebp = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  
  // Criar SVG overlay com precisão cirúrgica
  const svgOverlay = Buffer.from(`
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradiente da placa azul do baú -->
      <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#163973"/>
        <stop offset="60%" stop-color="#183f7f"/>
        <stop offset="100%" stop-color="#122f5e"/>
      </linearGradient>

      <!-- Gradiente fotográfico da lataria da porta do furgão Ford Transit -->
      <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="50%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>

      <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="2"/>
      </filter>
    </defs>

    <!-- 1. PLACA DO BAÚ: COBRINDO 'DESENTUPIDORA EM BAGÉ' E COLOCANDO 'DESENTUPIDORA EM RIO GRANDE' -->
    <!-- Coordenadas calibradas: x=234, y=328, rotação de -2.2 graus para seguir a linha do baú -->
    <g transform="translate(234, 334) rotate(-2.2)">
      <!-- Fundo azul da placa cobrindo 100% da anterior -->
      <rect x="0" y="0" width="376" height="74" rx="3" fill="url(#plateGrad)"/>
      <rect x="0" y="0" width="376" height="74" rx="3" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4"/>
      <line x1="2" y1="3" x2="374" y2="3" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Texto oficial de Rio Grande -->
      <text x="188" y="49" 
            font-family="'Arial Black', 'Impact', sans-serif" 
            font-size="22" 
            font-weight="900" 
            fill="#ffffff" 
            text-anchor="middle" 
            letter-spacing="0.7">DESENTUPIDORA EM RIO GRANDE</text>
    </g>

    <!-- 2. PORTA DA CABINE: COBRINDO OS TELEFONES ANTIGOS DE BAGÉ E COLOCANDO OS DE RIO GRANDE -->
    <!-- Patch de lataria para apagar o texto antigo -->
    <g transform="translate(632, 615) rotate(-2.0)">
      <!-- Patch com cantos arredondados e cor idêntica à lataria -->
      <rect x="0" y="0" width="168" height="120" rx="10" fill="url(#doorGradient)"/>
      <rect x="2" y="2" width="164" height="116" rx="8" fill="url(#doorGradient)" filter="url(#softBlur)" opacity="0.8"/>

      <!-- Linha 1: ATENDIMENTO 24 HORAS -->
      <text x="84" y="22" 
            font-family="'Arial', sans-serif" 
            font-size="12.5" 
            font-weight="800" 
            fill="#1e293b" 
            text-anchor="middle" 
            letter-spacing="0.3">ATENDIMENTO 24 HORAS</text>

      <!-- Linha 2: Fixo oficial de Rio Grande -->
      <text x="84" y="58" 
            font-family="'Arial Black', sans-serif" 
            font-size="23" 
            font-weight="900" 
            fill="#0f172a" 
            text-anchor="middle" 
            letter-spacing="-0.5">(53) 3232-4890</text>

      <!-- Linha 3: WhatsApp oficial de Rio Grande com ícone verde -->
      <g transform="translate(8, 74)">
        <!-- Círculo do WhatsApp -->
        <circle cx="12" cy="13" r="10" fill="#22c55e"/>
        <path d="M8.5 13.5 C8.5 10.5 10 9 12 9 C14 9 15.5 10.5 15.5 12.5 C15.5 14.5 14 16 12 16 L9.5 16.5 L10.2 14.8 Z" fill="#ffffff"/>
        <!-- Número do WhatsApp -->
        <text x="76" y="21" 
              font-family="'Arial Black', sans-serif" 
              font-size="23" 
              font-weight="900" 
              fill="#0f172a" 
              text-anchor="middle" 
              letter-spacing="-0.5">(53) 99841-2895</text>
      </g>
    </g>
  </svg>
  `);

  const outputBuffer = await sharp(base1920)
    .composite([{ input: svgOverlay, left: 0, top: 0 }])
    .webp({ quality: 92 })
    .toBuffer();

  fs.writeFileSync(targetWebp, outputBuffer);
  console.log('✅ Imagem hero de Rio Grande gerada com sucesso em:', targetWebp);

  // Gerar recortes para inspeção imediata
  await sharp(outputBuffer)
    .extract({ left: 180, top: 310, width: 450, height: 110 })
    .toFile(path.join(__dirname, 'inspect_final_roof.png'));

  await sharp(outputBuffer)
    .extract({ left: 520, top: 580, width: 320, height: 200 })
    .toFile(path.join(__dirname, 'inspect_final_door.png'));

  console.log('✅ Recortes salvos para validação visual.');
}

buildHeroRioGrande().catch(console.error);
