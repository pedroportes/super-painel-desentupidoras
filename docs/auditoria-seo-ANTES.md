# Auditoria SEO/GEO/AEO — ANTES das correções (28/08/2026)

Feita comparando o código real do template Astro (`apps/site-template-astro`)
contra as "Regras de Ouro de SEO / GEO / AEO" já documentadas em
`CLAUDE_CODE_GUIDE.md` (linhas 38-54) e contra o site publicado
`https://desentupidora-guarapuava.pages.dev/`.

Regra documentada (CLAUDE_CODE_GUIDE.md):
> 1. Title e Meta Description Exatas: devem conter a palavra-chave regional.
> 2. H1 e 1º Parágrafo: a palavra-chave exata deve estar no H1 e logo na
>    primeira frase do primeiro parágrafo.
> 3. Último H2: antes do rodapé, a página deve conter um H2 de autoridade
>    local (com a palavra-chave).
> 4. Canonical URL dinâmica de produção.

## Página HOME (index.astro)

| Critério | Status | Detalhe |
|---|---|---|
| Title com palavra-chave | ✅ OK | `Desentupidora em {cidade} {uf} 24h \| ...` |
| Meta description com palavra-chave | ✅ OK | Contém `{cidade} {uf}` |
| H1 com palavra-chave | ✅ OK | Renderizado pelo Hero a partir de `seo.h1Title` |
| 1º parágrafo com palavra-chave | ✅ OK | `seo.firstParagraphText` |
| **Último H2 antes do rodapé** | ❌ **QUEBRADO** | O H2 com a palavra-chave (`seo.lastH2Title`) é renderizado pelo componente `Benefits`, que fica na **3ª posição** de 7 seções (Hero, Services, **Benefits**, WarningSigns, LocalAreas, Testimonials, FAQ, Footer). O H2 que **realmente** fica por último, logo antes do rodapé, é o do componente `FAQ` ("Perguntas Frequentes sobre Desentupidora em {cidade}") — que não seguiu o padrão exato da palavra-chave definido pelo usuário no painel. |
| Canonical dinâmico | ✅ OK | Calculado corretamente em `Layout.astro` |

## Páginas internas de SERVIÇO e BAIRRO (`[slug].astro`)

| Critério | Status | Detalhe |
|---|---|---|
| Title com palavra-chave | ✅ OK | Customizado por serviço/bairro em `pageSeo.metaTitle` |
| Meta description com palavra-chave | ✅ OK | `pageSeo.metaDescription` |
| H1 com palavra-chave | ✅ OK | `pageSeo.h1Title`, específico da página |
| 1º parágrafo com palavra-chave | ✅ OK | `pageSeo.firstParagraph` |
| H2 com palavra-chave (`pageSeo.lastH2`) | ⚠️ **DUPLICADO E COM BUG** | A página renderiza manualmente `<h2>{pageSeo.lastH2}</h2>` (correto, com a palavra-chave certa da página) — mas logo em seguida chama `<Benefits {...cityData} />`, que **por sua vez renderiza um SEGUNDO H2 próprio** (`{seo.lastH2Title}`). Como `<Benefits>` recebe `cityData` (dados da cidade/home) em vez de `pageSeo` (dados da página atual), esse segundo H2 mostra **o texto genérico da home**, não o da página de serviço/bairro específica. Resultado: dois H2 seguidos, um certo e um errado/genérico. |
| **Último H2 antes do rodapé** | ❌ **QUEBRADO** | Igual à home: o H2 do `FAQ` é o que realmente fica por último, não o H2 com a palavra-chave. |

## Outros itens auditados (fora da regra de palavra-chave, mas relevantes pro pedido "ranquear bem")

| Item | Status |
|---|---|
| `sitemap.xml` | ❌ Não existe. `robots.txt` referencia `/sitemap.xml`, que dá 404. |
| `public/_headers` (Link HTTP headers p/ agentes) | ❌ Não existe |
| Negociação real de Markdown (`Accept: text/markdown` na própria URL) | ❌ Só existe uma URL separada `/site-markdown`, não é negociação de verdade |
| Schema `geo` com lat/lng vazios | ⚠️ Gera `"geo": {"latitude": "", "longitude": ""}` (inválido) quando a cidade não tem coordenadas cadastradas, em vez de omitir o campo |
| `.well-known/ai-plugin.json` e `api-catalog` | ⚠️ Voltaram a existir (padrão descontinuado pela OpenAI em 2024), depois de já terem sido removidos duas vezes antes |
| Depoimentos | ⚠️ Identificados como fabricados anteriormente — **por pedido do usuário, NÃO serão alterados nesta rodada** |

## Plano de correção desta rodada (nesta ordem)

1. Corrigir a ordem/estrutura para que o H2 com a palavra-chave seja
   **realmente** o último H2 antes do rodapé, na home e em todas as páginas
   internas (serviço e bairro).
2. Corrigir `[slug].astro` para não duplicar o H2 do `Benefits` com dados
   errados (da home) — cada página deve ter só o H2 correto, com sua própria
   palavra-chave.
3. Adicionar `sitemap.xml` real (via `@astrojs/sitemap`).
4. Adicionar `public/_headers` com Link headers para sitemap/llms.txt.
5. Implementar negociação real de Markdown via middleware (`Accept: text/markdown`
   na própria URL, não só em `/site-markdown`).
6. Corrigir o schema `geo` pra omitir o bloco quando não há coordenadas reais.
7. Remover de novo `.well-known/ai-plugin.json` e `api-catalog` (terceira vez).
8. Testar build, conferir manualmente cada critério na saída HTML gerada, e
   só então documentar o que foi feito em `docs/auditoria-seo-DEPOIS.md`.
