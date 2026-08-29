# Auditoria SEO/GEO/AEO — DEPOIS das correções (28/08/2026)

Ver `docs/auditoria-seo-ANTES.md` para o estado anterior e o plano. Este
documento registra o que foi feito de fato, testado com `npm run build` real
(não apenas lido no código), na cidade de teste (Guarapuava/PR).

## 1. Regra "Último H2 com a palavra-chave" — CORRIGIDO

- **Causa raiz**: o H2 com a palavra-chave (`Benefits`) ficava na 3ª posição
  de 7 seções, e nas páginas internas era **duplicado** com o texto errado
  (mostrava o H2 da home em vez do H2 daquela página específica de
  serviço/bairro), porque `<Benefits {...cityData} />` recebia os dados da
  cidade em vez dos dados da página (`pageSeo`).
- **Correção**: `Benefits.astro` agora recebe o texto do H2 por uma prop
  explícita e dedicada (`lastH2Text`), nunca implícita via `seo` espalhado.
  Em `index.astro` e `[slug].astro`, o componente `Benefits` foi movido para
  ser literalmente a última seção antes do `Footer`, e recebe o texto certo
  (`cityData.seo.lastH2Title` na home, `pageSeo.lastH2` nas páginas
  internas).
- **Verificado no build real** (Guarapuava): último H2 da home = "Por que
  escolher a melhor Desentupidora em Guarapuava PR?" ✅. Último H2 da página
  de serviço "Desentupimento de Pia" = "Por que somos a melhor opção para
  desentupimento de pia em Guarapuava?" ✅ (sem duplicar, sem H2 da home
  vazando). Mesmo teste na página de bairro "Centro" ✅.

## 2. Title / Meta Description / H1 / 1º parágrafo

- Já estavam corretos antes (confirmado de novo no build atual, home e
  páginas internas). Nenhuma mudança necessária aqui.

## 3. `sitemap.xml` — CORRIGIDO

- Instalado `@astrojs/sitemap` de verdade (não um arquivo estático inventado).
- `astro.config.mjs` calcula a URL de produção real (lê `cityConfig.json`
  pra montar `https://desentupidora-<cidade>.pages.dev` ou o equivalente
  Vercel/domínio próprio, dependendo da hospedagem daquela cidade).
- Gerado e confirmado no build: `sitemap-index.xml` + `sitemap-0.xml`.

## 4. `robots.txt` — CORRIGIDO

- Era um arquivo estático apontando pra `/sitemap.xml`, que nunca existiu.
- Virou uma rota dinâmica (`robots.txt.ts`, mesmo padrão do `llms.txt.ts`),
  que aponta pro sitemap real com o domínio de produção correto:
  `Sitemap: https://desentupidora-guarapuava.pages.dev/sitemap-index.xml`
  (confirmado no build).

## 5. `public/_headers` (Link HTTP headers) — CRIADO

- Não existia. Criado com Link headers apontando pro sitemap, llms.txt e
  robots.txt em todas as páginas — item que o isitagentready.com verifica
  na categoria "Descoberta".
- Confirmado que é copiado pro `dist/_headers` no build.

## 6. Negociação real de Markdown — IMPLEMENTADA (com uma limitação importante)

- Antes só existia uma URL separada (`/site-markdown`) — não era negociação
  de conteúdo de verdade.
- Agora: toda página de serviço e de bairro tem uma versão `.md` gerada no
  build (`[slug].md.ts`, reaproveitando exatamente a mesma lógica de
  `pageSeo`/`pageFaqs` do `[slug].astro`, pra nunca divergir do conteúdo
  real). A home tem `index.md.ts`.
- Criada uma Cloudflare Pages Function (`functions/_middleware.js`) que
  intercepta toda requisição: se o `Accept` mandar `text/markdown`, ela
  busca e devolve a versão `.md` da mesma URL.
- **⚠️ Limitação que preciso deixar clara**: isso só funciona nos deploys
  feitos via **Cloudflare Pages** (a hospedagem padrão/recomendada). Vercel
  e Netlify têm mecanismos próprios de edge/serverless functions, com
  sintaxe diferente, que **não foram implementados nesta rodada** por causa
  do tempo. Se uma cidade estiver publicada na Vercel ou Netlify, a
  negociação por `Accept` header ainda não vai funcionar nela — só a URL
  separada `/site-markdown` continua funcionando em qualquer hospedagem.
- **Também não pude testar isso rodando de verdade contra um Cloudflare
  Pages real** — meu ambiente aqui não tem acesso de rede a esses domínios.
  Testei a lógica e a sintaxe do código, e confirmei que os arquivos `.md`
  são gerados corretamente no build, mas o comportamento da Function em
  produção só pode ser confirmado por vocês, publicando de verdade.

## 7. Schema `geo` com valores vazios — CORRIGIDO

- Antes: `"geo": {"latitude": "", "longitude": ""}` quando a cidade não
  tinha coordenadas cadastradas — JSON-LD inválido.
- Agora: o bloco `geo` só aparece no schema quando há latitude E longitude
  reais cadastradas. Confirmado no build (Guarapuava, sem coordenadas
  cadastradas): o campo `geo` simplesmente não aparece no HTML gerado.

## 8. `.well-known/ai-plugin.json` e `api-catalog` — REMOVIDOS (3ª vez)

- Removidos os arquivos de novo, e desta vez também removidas as 3 tags
  `<link>` correspondentes no `<head>` do `Layout.astro`, que ainda
  apontavam pra esses arquivos mesmo depois de removidos antes. Confirmado
  no HTML gerado: zero ocorrências de `ai-plugin`/`api-catalog`.

## 9. Depoimentos

- **Não alterados**, conforme pedido explícito.

## 10. Corrigido de brinde (não fazia parte do pedido, mas apareceu no meio do caminho)

- `CityConfig` (tipo TypeScript do painel) não declarava os campos
  `deployUrl`/`lastDeployAt`, usados em `App.tsx` mas ausentes do tipo —
  isso fazia o `tsc --noEmit` falhar. Adicionados os campos ao tipo.

## O que NÃO foi mexido nesta rodada (fora do escopo pedido)

- Editor estilo Elementor (clicar no elemento pra editar) — ainda não
  começado, é a próxima frente grande.
- Negociação de Markdown real pra Vercel/Netlify (só Cloudflare por agora).
- Qualidade de copy: notei que o título de algumas páginas de serviço fica
  meio redundante (ex: "Desentupidora de Desentupimento de Pia em
  Guarapuava") — a palavra-chave está lá, mas o fraseado é estranho. Não
  mexi porque não foi pedido, só deixo registrado.
