#!/bin/bash
# Gera 1 screenshot (thumbnail) por modelo estrutural, pra usar como
# preview visual no seletor "Criar Novo Site" do painel. Roda build local
# (sem deploy) pra cada um dos 8 modelos, serve via http.server local, e
# tira um screenshot com Playwright.
set -e
cd "$(dirname "$0")/.."   # apps/web-dashboard
MODELS="urgencia-24h corporativo-empresarial residencial-bairros industrial-hidrojato premium-clean rapido-economico familia-seguranca tecnico-especializado"
mkdir -p scripts/_previews

for m in $MODELS; do
  echo "=== $m ==="
  node scripts/test_new_models.mjs "$m"
  (cd ../site-template-astro && npm run build > /dev/null 2>&1)
  node scripts/screenshot_model.mjs "http://localhost:8899/" "scripts/_previews/${m}.png" 760
done
echo "Pronto. Screenshots em scripts/_previews/"
