// Screenshot local via Playwright (headless) - usado só pra gerar as
// miniaturas de preview dos 8 modelos no painel. Requer o dist/ já
// buildado e servido em localhost (ver generate_model_previews.mjs).
import { chromium } from 'playwright';

const url = process.argv[2];
const outPath = process.argv[3];
const clipHeight = parseInt(process.argv[4] || '900', 10);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: clipHeight } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1400, height: clipHeight } });
await browser.close();
console.log('OK:', outPath);
