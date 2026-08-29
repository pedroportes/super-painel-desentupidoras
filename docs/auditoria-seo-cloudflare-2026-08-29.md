# Auditoria SEO/GEO/AEO — 29/08/2026 (pedido do usuário: "ver o que deu certo e o que está com erro")

Cidade de teste: **Itabuna (BA)**, publicada nesta sessão em
`https://desentupidora-itabuna.pages.dev` (Cloudflare Pages).

## 🌐 Validador externo real: isitagentready.com (ferramenta da Cloudflare)

O usuário pediu explicitamente pra passar por esse validador (confundido
inicialmente com "testador da Cloudflare" — é o mesmo: rodapé do site
confirma `cloudflare.com`, e ele linka a documentação de Cloudflare Agents).

**Resultado ANTES dos fixes:** 20/100, nível 1 "Basic Web Presence".
**Resultado DEPOIS dos 2 fixes abaixo:** **33/100, nível 4
"Agent-Integrated"** — Content 1/1 (100%), Bot Access Control 2/2 (100%),
Discoverability 2/4, API/Auth/MCP/Skill 0/8 (fora de escopo — ver decisão
abaixo).

**Decisão registrada com o usuário**: as 8 checagens zeradas de "API, Auth,
MCP & Skill Discovery" (MCP Server Card, OAuth/OIDC discovery, OAuth
Protected Resource, Auth.md, Agent Skills index, WebMCP, ARD, API Catalog) e
a seção de Commerce (x402/MPP/UCP/ACP) **foram deliberadamente não
implementadas** — são padrões de ponta pra plataformas com API/pagamento
próprios, sem relação com uma landing page estática de desentupidora. O
usuário concordou em focar só nos bugs reais e ignorar essas 8, então
33/100 é o teto "honesto" atual pra esse tipo de site nesse validador
específico — 100% exigiria construir infraestrutura de agente que a
empresa não tem.

### Bug real #1 corrigido: negociação de Markdown nunca funcionava em produção

**Causa raiz encontrada**: `apps/web-dashboard/scripts/deployEngine.cjs`
rodava o `wrangler pages deploy` sem `cwd` explícito, herdando o diretório
de trabalho do processo Node do `server.cjs` (`apps/web-dashboard/`). O
Wrangler procura a pasta `functions/` (Cloudflare Pages Functions, onde
mora `_middleware.js`, responsável pela negociação de Markdown) **relativa
ao cwd de onde o comando roda**, não relativa ao `distDir` publicado. Como
o `functions/_middleware.js` real vive em `apps/site-template-astro/`, ele
nunca era encontrado nem deployado — a Function simplesmente não existia
em produção, apesar de existir no código-fonte e a documentação anterior
achar que "deveria funcionar".

**Correção**: `deployToCloudflarePages` agora passa `cwd:
path.dirname(distDir)` (a raiz do projeto Astro) tanto pro `wrangler pages
project create` quanto pro `wrangler pages deploy`.

**Armadilha que quase mascarou o teste**: depois de editar
`deployEngine.cjs`, republicar pela UI **não bastou** — o `server.cjs` já
estava rodando com o módulo antigo em cache (`require()` do Node não
recarrega sozinho). Foi preciso **matar os processos do `npm run dev` e
reiniciar** antes que o fix realmente entrasse em vigor. Se uma correção em
`scripts/deployEngine.cjs` (ou qualquer arquivo que `server.cjs` importa
com `require`) parecer "não ter feito diferença" depois de testado via
UI, **suspeitar disso primeiro**: reiniciar o `npm run dev` do
`web-dashboard` antes de investigar mais.

**Verificado de duas formas**: `curl -H "Accept: text/markdown"
https://desentupidora-itabuna.pages.dev/` retornou `Content-Type:
text/markdown; charset=utf-8` com o corpo em Markdown real (H1 e conteúdo
da Itabuna) — e o isitagentready.com confirmou "Content 1/1" no rescan.

### Bug real #2 corrigido: sintaxe do `Content-Signal` errada

`src/pages/robots.txt.ts` gerava `Content-signal: search, train, agent`
(lista solta) — sintaxe inválida. O padrão real (contentsignals.org) exige
pares `chave=valor`. Corrigido para
`Content-Signal: search=yes, ai-train=yes, ai-input=yes`. Verificado:
"Bot Access Control" foi de 1/2 pra 2/2 no isitagentready.com.

## ✅ O que está funcionando (confirmado no `dist/` real, não só lido no código)

- `npm run build && npm run audit` (`scripts/seoGeoAuditor.js`) → **100%
  (11/11)** para Itabuna: title, meta description, H1, palavra-chave nas
  primeiras 30 palavras do 1º parágrafo, último H2 realmente por último,
  schema `LocalBusiness`/`EmergencyService`, `areaServed` com os 8 bairros
  reais, telefone/DDD, schema `FAQPage`, link de negociação Markdown,
  `llms.txt`.
- `sitemap-index.xml` + `sitemap-0.xml` gerados via `@astrojs/sitemap`.
- `robots.txt` dinâmico, com `Sitemap:` e `llms-txt:` apontando pro domínio
  de produção real (não `localhost`).
- `public/_headers` com Link headers (sitemap, llms.txt, robots) confirmado
  copiado pro `dist/`.
- `geo` no schema corretamente **omitido** (Itabuna não tem lat/lng
  cadastrada — nada de coordenada vazia/inventada).
- Canonical dinâmico calculado certo:
  `https://desentupidora-itabuna.pages.dev`.
- Cada página de bairro/serviço gera seu próprio title/meta/H1/H2/FAQ
  (testado no bairro "Centro": title e H1 exclusivos, diferentes da home).

## ❌ Erros reais encontrados e corrigidos nesta sessão

1. **Itabuna nunca tinha H1/1º parágrafo/CTA/último H2 preenchidos** — a
   página caía no texto de fallback genérico do `server.cjs`. Preenchidos
   com conteúdo específico da cidade, com a palavra-chave no lugar certo.
2. **Bug de build**: `[parceiros_route].astro` chamava `<Header />` e
   `<Footer />` sem `{...cityData}` → `Footer.astro` tentava
   `whatsapp.substring(...)` em `undefined` e o build quebrava — só
   acontecia em cidades com `parceiros` cadastrado (caso do Itabuna, que
   tinha 1 parceiro de teste). Corrigido passando `{...cityData}` nos dois.
3. **Regressão (4ª vez)**: `public/.well-known/ai-plugin.json` tinha
   voltado a existir, com dados fabricados (domínio fake
   `desentupidora.com.br`, sem relação com nenhuma cidade real). Removido de
   novo — ver `CLAUDE_CODE_GUIDE.md`, seção AEO, para o histórico completo
   dessa regressão recorrente.
4. **Bug de UX/dado no painel**: o botão "🚀 Publicar"
   (`/api/deploy-city/:id`) builda e publica de verdade, mas **nunca roda o
   auditor nem atualiza `auditScore`** — só o botão "⚙️ Build"
   (`/api/build-city/:id`) faz isso. Depois de publicar Itabuna, a Central
   de Cidades continuou mostrando 90% até eu clicar em "Build" manualmente
   (que então atualizou pra 100%, batendo com o audit real). **Ainda não
   corrigido no código** — ver "Pendências conhecidas" no guia.

## ⏳ Pendente / não verificado

- ~~"Testador da Cloudflare"~~ — **resolvido**: é o isitagentready.com (ver
  seção acima). Confirmado 33/100, nível 4, com os 2 bugs reais corrigidos.
- ~~Negociação de Markdown não testada contra produção real~~ —
  **resolvido**: testado via `curl` e via isitagentready.com contra o site
  publicado de verdade. Funciona. A limitação de escopo continua real
  (só Cloudflare Pages — Vercel/Netlify ainda não implementados).
- **AI Crawl Control (Cloudflare Radar)**: confirmado que não está
  disponível pra nenhuma cidade — exige um domínio próprio cadastrado como
  zona na conta Cloudflare, e a conta atual não tem nenhum (`Domínios`
  vazio, todas as cidades em `*.pages.dev`). Só relevante se/quando alguma
  cidade tiver domínio próprio comprado e apontado.
- Rich Results Test / PageSpeed Insights (Google) — não rodados; são
  validadores externos de verdade, diferentes do auditor interno do
  projeto, e podem achar coisas que o `seoGeoAuditor.js` não checa (ex:
  performance, mobile usability, erros de schema que o Google rejeita mas
  o parser interno aceita).
