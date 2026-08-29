/**
 * REMOVE BACKGROUND (chroma-key) — transforma o fundo sólido de uma logo
 * gerada pelo Canva em transparência real (canal alpha de verdade).
 *
 * Por que isso existe: o Canva não permite exportar designs `logo`
 * gerados por IA com fundo transparente (o fundo vem como uma imagem
 * raster real, sem locator_id editável — ver
 * `.agents/skills/criar-site-desentupidora/PROMPT-IDENTIDADE-VISUAL.md`).
 * A solução adotada é gerar a logo com um fundo sólido, chapado, na cor
 * exata da paleta da cidade, e depois usar este script pra "recortar" essa
 * cor exata e transformá-la em transparência real via chroma-key —
 * testado e confirmado: sem halo/franja visível nas bordas do ícone,
 * mesmo com a leve variação de anti-aliasing entre o ícone e o fundo.
 *
 * Uso:
 *   node scripts/removeLogoBackground.js <entrada> <saida.png> <#hexDoFundo> [tolerancia]
 *
 * Exemplo real (logo de Itabuna, fundo #18181b):
 *   node scripts/removeLogoBackground.js logo.png logo-transparente.png "#18181b" 40
 *
 * - tolerancia (opcional, padrão 40): distância euclidiana máxima em RGB
 *   pra considerar um pixel "parte do fundo". Comece em 40; se sobrar
 *   fundo visível nas bordas, aumente; se começar a "comer" o próprio
 *   ícone (cores muito parecidas com o fundo), diminua.
 * - Sempre revisar visualmente o resultado depois — cores muito próximas
 *   da cor do ícone (ex: um símbolo laranja escuro sobre fundo marrom)
 *   podem furar sem querer com tolerância alta.
 */
const sharp = require('sharp');

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

async function removeBackground(inputPath, outputPath, hexColor, tolerance = 40) {
  const target = hexToRgb(hexColor);
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.sqrt((r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2);
    if (dist <= tolerance) {
      data[i + 3] = 0; // alpha = 0 (transparente)
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outputPath);
  return { width, height };
}

module.exports = { removeBackground };

// Permite rodar direto via CLI: node removeLogoBackground.js in out.png "#18181b" 40
if (require.main === module) {
  const [, , inputPath, outputPath, hexColor, toleranceArg] = process.argv;
  if (!inputPath || !outputPath || !hexColor) {
    console.error('Uso: node removeLogoBackground.js <entrada> <saida.png> <#hex> [tolerancia]');
    process.exit(1);
  }
  removeBackground(inputPath, outputPath, hexColor, toleranceArg ? parseInt(toleranceArg, 10) : 40)
    .then(({ width, height }) => console.log(`OK: ${outputPath} (${width}x${height})`))
    .catch((e) => { console.error(e); process.exit(1); });
}
