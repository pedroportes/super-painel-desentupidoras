const sharp = require('../apps/site-template-astro/node_modules/sharp');
const path = require('path');
const fs = require('fs');

async function retouchHeroPerfect() {
  const inputPath = path.join(__dirname, '..', 'apps', 'site-template-astro', 'public', 'images', 'riogrande', 'desentupidora-riogrande-caminhao-limpa-fossa.webp');
  const imageBuffer = fs.readFileSync(inputPath);
  
  // 1. Extrair uma amostra de lataria branca limpa da porta (x: 775 a 855)
  const cleanDoorPatch = await sharp(imageBuffer)
    .extract({ left: 775, top: 620, width: 80, height: 115 })
    .resize(170, 115, { fit: 'fill' })
    .toBuffer();

  // 2. Criar overlay para a placa do teto e os novos textos da porta
  // Analisando a imagem original:
  // A placa azul original:
  // Inicia em x: 198, y: 340, largura: 378, altura: 68
  // Leve ângulo de perspectiva: ~ -0.5 grau
  const overlaySvg = Buffer.from(`
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="plateBlue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#183b72"/>
        <stop offset="50%" stop-color="#1b417e"/>
        <stop offset="100%" stop-color="#132e5b"/>
      </linearGradient>
    </defs>

    <!-- PLACA DO BAÚ: COBRINDO EXATAMENTE 'DESENTUPIDORA EM BAGÉ' -->
    <g transform="translate(196, 338)">
      <!-- Fundo azul escuro idêntico ao original -->
      <rect x="0" y="0" width="378" height="70" rx="3" fill="url(#plateBlue)"/>
      <line x1="2" y1="2" x2="376" y2="2" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1"/>
      
      <!-- Texto 'DESENTUPIDORA EM RIO GRANDE' com proporções e peso idênticos -->
      <text x="189" y="47" 
            font-family="'Arial Black', 'Impact', sans-serif" 
            font-size="22" 
            font-weight="900" 
            fill="#ffffff" 
            text-anchor="middle" 
            letter-spacing="0.8">DESENTUPIDORA EM RIO GRANDE</text>
    </g>

    <!-- TEXTOS NA PORTA (sobre a lataria limpa) -->
    <!-- Coordenadas da porta: texto alinhado com leve rotação natural -->
    <g transform="translate(642, 632) rotate(-1.5)">
      <!-- Linha 1: ATENDIMENTO 24 HORAS -->
      <text x="75" y="16" 
            font-family="'Arial', 'Helvetica', sans-serif" 
            font-size="11.5" 
            font-weight="800" 
            fill="#2c3437" 
            text-anchor="middle" 
            letter-spacing="0.3">ATENDIMENTO 24 HORAS</text>

      <!-- Linha 2: (53) 3232-4890 -->
      <text x="78" y="48" 
            font-family="'Arial Black', 'Impact', sans-serif" 
            font-size="22" 
            font-weight="900" 
            fill="#1e252b" 
            text-anchor="middle" 
            letter-spacing="-0.5">(53) 3232-4890</text>

      <!-- Linha 3: WhatsApp + (53) 99841-2895 -->
      <g transform="translate(14, 62)">
        <!-- Ícone WhatsApp realista -->
        <circle cx="9" cy="11" r="8.5" fill="#25d366"/>
        <path d="M6 11.5 C6 8.5 7.5 7 9.5 7 C11.5 7 13 8.5 13 10.5 C13 12.5 11.5 14 9 14 L7 14.5 L7.5 12.8 Z" fill="#ffffff"/>
        <!-- Número WhatsApp -->
        <text x="66" y="18" 
              font-family="'Arial Black', 'Impact', sans-serif" 
              font-size="22" 
              font-weight="900" 
              fill="#1e252b" 
              text-anchor="middle" 
              letter-spacing="-0.5">(53) 99841-2895</text>
      </g>
    </g>
  </svg>
  `);

  // Compor:
  // 1. Aplica o patch de lataria limpa sobre o texto antigo da porta (left: 640, top: 625)
  // 2. Aplica o SVG com a placa do baú e os novos telefones
  const finalImage = await sharp(imageBuffer)
    .composite([
      { input: cleanDoorPatch, left: 635, top: 620 },
      { input: overlaySvg, left: 0, top: 0 }
    ])
    .webp({ quality: 92 })
    .toBuffer();

  // Salvar no arquivo final de Rio Grande
  fs.writeFileSync(inputPath, finalImage);
  console.log('✅ Imagem de Rio Grande atualizada e retocada com perfeição!');

  // Gerar recortes de conferência
  await sharp(finalImage)
    .extract({ left: 150, top: 300, width: 480, height: 150 })
    .toFile(path.join(__dirname, 'perfect_roof.png'));

  await sharp(finalImage)
    .extract({ left: 610, top: 600, width: 230, height: 160 })
    .toFile(path.join(__dirname, 'perfect_door.png'));

  console.log('Recortes salvos para conferência visual.');
}

retouchHeroPerfect().catch(console.error);
