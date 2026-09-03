# Snapshot da raspagem de concorrência SERP — 03/09/2026

Ver contexto completo em [`docs/mapa-oportunidades-expansao.md`](../mapa-oportunidades-expansao.md),
seção "Índice de Concorrência Fraca (SERP)".

Esta pasta guarda os artefatos brutos da raspagem feita em 03/09/2026 via
Serper.dev (`apps/web-dashboard/scripts/serp_scrape_serper.mjs`), pra não
depender só da planilha do Google Drive (link muda a cada republicação,
já que as ferramentas disponíveis não editam célula existente).

## Arquivos

- **`scoring_concorrencia_serp_2026-09-03.csv`** — resultado final consolidado.
  524 cidades do universo + Joinville/Maringá (fora do universo, já
  publicadas), 522 com dado real de SERP (faltam só Araucária e Porto
  Seguro, cadastradas antes de entrarem na fila de raspagem). Mesmo
  conteúdo que foi subido pra
  https://docs.google.com/spreadsheets/d/1g2snXkPohdDVS75nHTCJJP4JW6XiLOjE8OqxlGiencE/edit
- **`banco_cidades_raw.csv`** — CSV bruto das 524 cidades, baixado da
  planilha original `BANCO_CIDADES_DESENTUPIDORAS_2026` (aba
  `Banco_Cidades`), com população, saneamento, Nota Oportunidade Parcial
  e Ranking Parcial.
- **`lote1_resultado.csv` … `lote5_todas_restantes_resultado.csv`** —
  saída bruta de cada rodada de raspagem via Serper.dev (colunas
  Cidade,UF,IndiceConcorrenciaFraca,TotalResultados,Sociais,Diretorios,Marketplaces,SitesProprios).
  Lote 1-4 = 25 cidades cada (candidatas priorizadas por Ranking
  Parcial); lote 5 = todas as 410 restantes de uma vez.
- **`build_scoring_csv.cjs`** — script que junta `banco_cidades_raw.csv` +
  os 5 lotes + o status manual de cadastrada/livre e gera o CSV final.
  Reexecutável: `node build_scoring_csv.cjs` (regenera
  `scoring_concorrencia_serp_2026-09-03.csv` nesta mesma pasta,
  confirmado idêntico byte-a-byte ao arquivo já salvo).

## Créditos consumidos

522 de ~2.500 grátis no plano Serper.dev (sobram ~1.978). Chave em
`apps/web-dashboard/data/settings.json` → `serper.apiKey` (gitignored,
não está aqui).

## Como retomar

Pra completar as 2 cidades cadastradas sem dado (Araucária, Porto Seguro)
ou re-rodar alguma cidade: usar `serp_scrape_serper.mjs` diretamente
(ver exemplos de uso em `docs/mapa-oportunidades-expansao.md`) e
adicionar o resultado como um novo `loteN_resultado.csv` nesta pasta,
depois rodar `build_scoring_csv.cjs` de novo.
