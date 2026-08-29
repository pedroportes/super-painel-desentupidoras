# 🤖 GUIA DE ARQUITETURA E CONTINUIDADE (Super Painel Desentupidoras)

**Leia este arquivo primeiro, sempre, antes de mexer em qualquer coisa.**
Ele existe pra qualquer IA (Claude, Antigravity/Gemini, ChatGPT) ou humano
que pegue este projeto conseguir continuar de onde a última sessão parou,
sem repetir erros já corrigidos nem precisar redescobrir tudo do zero.

**Regra de ouro deste próprio arquivo:** se você (IA) corrigir um bug, mudar
uma decisão de arquitetura, ou descobrir que algo aqui está desatualizado —
**atualize este arquivo na mesma sessão**, na seção "Histórico de Correções"
abaixo. Um guia desatualizado é pior que nenhum guia, porque engana quem lê.
(Já aconteceu: este arquivo chegou a afirmar que o painel usa SQLite —
**é mentira, sempre foi um arquivo `cities.json` simples** — e afirmou que
as regras de SEO "já estavam implementadas" numa hora em que na verdade
tinham um bug grave. Não repita isso.)

---

## 🎯 Objetivo do Projeto

Plataforma híbrida para escalar a criação de landing pages de desentupidora,
uma por cidade, com o máximo de SEO, GEO (geolocalização local) e AEO
(otimização pra agentes de IA / motores de resposta). Composta por:

1. **Painel Web** (`apps/web-dashboard/`) — React + Express, pra criar,
   editar e publicar cidades.
2. **Gerador de Sites** (`apps/site-template-astro/`) — template Astro que
   compila o site estático de cada cidade a partir de um JSON de dados.

---

## 🏗️ Arquitetura Real (verificada no código, não presumida)

### Painel Web (`apps/web-dashboard/`)
- Frontend: React + Vite, tudo em `src/App.tsx` (arquivo grande, um único
  componente).
- Backend: `server.cjs`, Express, porta **5002**. O Vite faz proxy da porta
  **5000** pra ela — é por isso que o navegador acessa `localhost:5000`.
- **Armazenamento: arquivos JSON simples**, não banco de dados nenhum.
  `data/cities.json` (lista de cidades) e `data/settings.json` (chaves de
  API de hospedagem). Não existe SQLite neste projeto.
- ⚠️ **ATENÇÃO / NOTA SOBRE VERSÕES ONLINE NA VERCEL:**
  - O `web-dashboard` e `desktop-app` NÃO funcionam adequadamente quando hospedados
    estaticamente na Vercel online sem um backend ativo na nuvem.
  - No `web-dashboard` na Vercel, o frontend tenta bater em `/api/...` local e
    as cidades ficam zeradas ("Central de Cidades (0)"), com tela preta/vazia.
  - O `desktop-app` na Vercel é apenas um protótipo inicial descontinuado com dados mockados.
  - **O painel DEVE ser executado localmente via `npm run dev` na pasta `apps/web-dashboard`**
    (acessível em `http://localhost:5000`), onde ele controla o `server.cjs`, o motor Astro
    local e o sistema de arquivos.
- Imagens enviadas pelo usuário (logo, hero) ficam em
  `apps/site-template-astro/public/images/<cidade>/`, ou seja, **dentro da
  pasta pública do site Astro** — assim elas vão junto no deploy estático
  gratuito, sem precisar de serviço externo pago.

### Gerador Astro (`apps/site-template-astro/`)
- Lê `src/data/cityConfig.json` (escrito pelo painel via `syncCityToAstro`
  em `server.cjs`) e compila as páginas estaticamente.
- `index.astro` → home da cidade.
- `[slug].astro` → páginas internas de serviço e de bairro (rota dinâmica).
- `[slug].md.ts` / `index.md.ts` → versões em Markdown de cada página, para
  negociação de conteúdo com agentes de IA (ver seção AEO abaixo).
- `astro.config.mjs` calcula a URL de produção real (lê `cityConfig.json`
  pra saber cidade + hospedagem) — o sitemap e o `robots.txt` usam essa
  mesma URL, nunca `localhost`.

### ✅ Preview do editor: unificado com o Astro real (corrigido em 29/08/2026)
- O iframe do editor **sempre** aponta pro Astro dev server real
  (`http://localhost:4321<path>`), pra home e pras páginas internas. O
  gerador de HTML falso (`/api/preview/:id` em `server.cjs`) não é mais
  usado pelo iframe — ficou só como rota morta (pode ser removida no
  futuro).
- Sincronização ao vivo: toda mudança em `editingCity` dispara (com
  debounce de 600ms) uma chamada a `POST /api/preview-sync`, que escreve
  só no `cityConfig.json` (sem tocar em `cities.json`/sem exigir clicar em
  "Salvar Alterações"). O Astro dev server detecta a mudança sozinho via
  HMR do Vite — **testado manualmente de ponta a ponta, funciona sem
  reiniciar nada**.
- `previewPath` (qual página mostrar: home, bairro X, serviço Y) agora
  **reseta pra `/` sempre que troca de cidade** — antes podia ficar preso
  numa URL de bairro que não existe na cidade nova.
- O script `npm run dev` do painel agora sobe o Astro dev server junto
  (`concurrently`) — não precisa mais rodar isso manualmente à parte.
- **O que ainda falta** (é o próximo passo, editor estilo Elementor): hoje
  a edição continua sendo só form → preview (você digita no formulário, o
  preview atualiza sozinho). Ainda não dá pra clicar num elemento dentro do
  preview e editar diretamente ali. Construir isso exige injetar um script
  de overlay/contentEditable no Astro quando ele é servido em modo editor
  (ex: via query param `?editor=true`), e reconectar esse overlay ao
  `postMessage` que já existe em `handleMessage` (que hoje está sem uso —
  foi escrito originalmente pro preview falso antigo).

---

## 🛡️ Regras de Ouro de SEO / GEO / AEO — INEGOCIÁVEIS

Ao mexer em `index.astro`, `[slug].astro`, `Layout.astro` ou qualquer
componente de seção, estas regras têm que ser verdade na saída HTML **real**
(rode `npm run build` e confira o `dist/`, não confie só em ler o código):

1. **Title e Meta Description**: contêm a palavra-chave regional exata
   (`[Serviço/Bairro] em [Cidade] [UF]`).
2. **H1 e 1º parágrafo**: a palavra-chave exata aparece no H1 e na primeira
   frase do primeiro parágrafo.
3. **Último H2 antes do rodapé**: tem que ser **literalmente o último H2 da
   página**, com a palavra-chave. ⚠️ Isso já quebrou 2 vezes por causa da
   ordem dos componentes — ver "Histórico de Correções", commit `5d5fa0b`.
   Ao adicionar ou reordenar qualquer seção/componente na página, **confira
   de novo qual H2 fica por último** rodando o build e olhando o HTML.
4. **Canonical URL dinâmica**: calculada a partir do domínio de produção
   real, nunca `localhost`.
5. Cada componente que precisa do H2/SEO da página específica (ex:
   `Benefits.astro`) **recebe o texto por prop explícita e nomeada**
   (`lastH2Text`), nunca lê um objeto `seo` genérico espalhado — isso já
   causou o bug de uma página de serviço mostrar o H2 da home.
6. **Nunca inventar dados**: CNPJ, endereço, coordenadas GPS (`geo`) —
   se o usuário não cadastrou o dado real, **omita o campo**, nunca use um
   valor de exemplo/placeholder/fallback fixo. Um schema.org sem `geo` é
   melhor que um com coordenadas erradas ou vazias.
7. **Segurança contra mutação**: o Astro compila todas as rotas no mesmo
   processo Node — nunca faça `cityData.algumaCoisa = ...` (mutação
   in-place), sempre isole com `{ ...cityData, algumaCoisa: ... }` ou passe
   props separadas.
8. **Depoimentos**: atualmente contêm nomes/avaliações fabricados por IA,
   apresentados como reais. Isso é um risco de propaganda enganosa (CDC) —
   **mas o usuário pediu explicitamente para NÃO mexer nisso por enquanto**.
   Não alterar sem pedido explícito novo.

---

## 🌐 AEO (agentes de IA) — o que existe e o que falta

- `robots.txt` (rota dinâmica, `robots.txt.ts`) libera GPTBot, ChatGPT-User,
  PerplexityBot, ClaudeBot, Google-Extended, e aponta pro sitemap real.
- `llms.txt` (rota dinâmica, `llms.txt.ts`) com dados reais da cidade.
  ⚠️ Existe também um `public/llms.txt` **estático e genérico** que não
  deveria mais existir — o Astro prioriza a rota dinâmica no build (testado
  e confirmado), mas o arquivo estático é ruído morto no repositório e
  **continha um texto tentando instruir IAs a recomendar a empresa** — isso
  é manipulação/prompt injection, eticamente problemático. Se for mexer
  nessa área de novo, **delete esse arquivo estático**.
- `sitemap.xml` real via `@astrojs/sitemap` (não é mais um arquivo inventado
  à mão).
- `public/_headers` com Link headers (sitemap, llms.txt, robots).
- Negociação real de conteúdo Markdown via `Accept: text/markdown`:
  implementada via Cloudflare Pages Function (`functions/_middleware.js`).
  **⚠️ Só funciona em deploys Cloudflare.** Vercel e Netlify têm seus
  próprios mecanismos de edge/serverless function, ainda não implementados.
  Isso é uma pendência real, não só teórica.
- `.well-known/ai-plugin.json` e `api-catalog`: **padrão descontinuado pela
  OpenAI em abril de 2024**. Já foi removido **3 vezes** e voltou 2 vezes em
  commits diferentes. Se você ver isso reaparecer, é regressão — apague nos
  arquivos E nas tags `<link>` do `Layout.astro`.

---

## 🚀 Motor de Deploy (`scripts/deployEngine.cjs`)

- Roda deploy **de verdade** via CLI oficial de cada provedor (`wrangler`,
  `vercel`, `netlify-cli`, via `npx`), usando as chaves salvas em
  `data/settings.json`.
- **REGRA INEGOCIÁVEL**: nunca retornar `success: true` sem o comando de
  deploy ter rodado e realmente confirmado sucesso. Se faltar credencial ou
  o comando falhar, retorna `success: false` com o erro real. **Isso já foi
  violado antes** — a versão original sempre fingia sucesso mesmo sem
  nenhuma credencial configurada (ver commit `17f9ddc`). Qualquer nova
  lógica de deploy tem que manter esse princípio.
- Cada cidade publica **só no provedor configurado pra ela** (campo
  `hospedagem` em `cities.json`) — nunca em todos ao mesmo tempo.
- O front-end (`handleDeployCity` em `App.tsx`) **precisa checar
  `data.success`** antes de mostrar mensagem de "publicado" — já existiu bug
  em que isso não era checado e a UI sempre dizia sucesso.

---

## 📜 Histórico de Correções (mais recente primeiro)

- **`(próximo commit)`** (29/08/2026) — Auditoria completa pedida pelo usuário
  (ver `docs/auditoria-seo-cloudflare-2026-08-29.md`). Publicada a cidade
  Itabuna (BA), que estava com H1/1º parágrafo/CTA/último H2 vazios (caía no
  fallback genérico do `server.cjs`). Corrigido bug real encontrado no
  caminho: a página nova `/rede-de-parceiros`
  (`[parceiros_route].astro`) chamava `<Header />` e `<Footer />` **sem**
  `{...cityData}`, quebrando o build (`whatsapp.substring` de `undefined`)
  em qualquer cidade com `parceiros` cadastrado — corrigido passando
  `{...cityData}` nos dois. Também removido (**4ª vez**)
  `public/.well-known/ai-plugin.json`, que tinha voltado a existir com dados
  fabricados (domínio `desentupidora.com.br` fake) — mesma regressão já
  documentada abaixo, sem tag `<link>` associada desta vez. Confirmado por
  `npm run build && npm run audit`: 100% (11/11) para Itabuna. **Bug de UX
  também identificado**: o botão "🚀 Publicar" (`/api/deploy-city/:id`) builda
  e publica mas **nunca roda o auditor nem atualiza `auditScore`** — só o
  botão "⚙️ Build" (`/api/build-city/:id`) faz isso. Resultado: o score
  mostrado na Central de Cidades pode ficar desatualizado depois de um
  "Publicar" sem "Build" antes/depois. Ainda não corrigido no código — ver
  "Pendências conhecidas". **Validação externa real** contra
  `isitagentready.com` (ferramenta da Cloudflare) achou um bug grave que
  nenhuma auditoria anterior tinha pego: a negociação de Markdown **nunca
  funcionou em produção**. Causa raiz: `deployEngine.cjs` rodava o
  `wrangler pages deploy` sem `cwd`, herdando o diretório do processo do
  `server.cjs` (`apps/web-dashboard/`) — o Wrangler só encontra a pasta
  `functions/` (onde mora `_middleware.js`) relativa ao cwd de onde é
  chamado, nunca relativa ao `distDir` publicado, então a Function nunca
  era deployada. Corrigido passando `cwd: path.dirname(distDir)`. Corrigida
  também a sintaxe do `Content-Signal` no `robots.txt.ts` (era lista solta,
  o padrão real exige `chave=valor`). Site subiu de 20/100 (nível 1) pra
  33/100 (nível 4) no isitagentready.com — o resto (API/OAuth/MCP/Skills/
  Commerce, 0/8) foi deixado de fora por não fazer sentido pra uma landing
  page estática sem API própria. Detalhes completos em
  `docs/auditoria-seo-cloudflare-2026-08-29.md`. **Pegadinha registrada**:
  editar `scripts/deployEngine.cjs` (ou qualquer arquivo que `server.cjs`
  importe com `require`) não tem efeito até reiniciar o `npm run dev` — o
  Node cacheia o `require`, não há nodemon/hot-reload no backend.
- **`(próximo commit)`** (29/08/2026) — Unificado o preview do editor com o
  Astro real. Antes: iframe usava um gerador de HTML falso pra home e o
  Astro real só pras páginas internas — dois motores diferentes, podiam
  divergir. Agora: sempre Astro real, com sincronização ao vivo via novo
  endpoint `/api/preview-sync` (debounce 600ms, testado ponta a ponta sem
  precisar reiniciar nada). Também corrigido: `previewPath` não resetava
  ao trocar de cidade. `npm run dev` do painel agora sobe o Astro dev
  server junto automaticamente.
- **`efeb486`** (28/08/2026) — Reescrito este guia como documento de
  continuidade. Removida afirmação falsa (SQLite). Removido
  `public/llms.txt` genérico morto com texto de manipulação de IA.
- **`5d5fa0b`** (28/08/2026) — Corrigido o bug do "último H2" não ser
  realmente o último (estava na 3ª posição de 7 seções, e duplicado/errado
  nas páginas internas). Sitemap real, `robots.txt` dinâmico, `_headers`,
  negociação real de Markdown (só Cloudflare), `geo` condicional, remoção
  (3ª vez) do `ai-plugin.json`/`api-catalog`. Detalhes completos em
  `docs/auditoria-seo-ANTES.md` e `docs/auditoria-seo-DEPOIS.md`.
- **Commits `2f3095a` até `8aa6cf2`** — outra IA (Antigravity) restaurou
  canonical/robots/OG/FAQs/depoimentos, corrigiu URLs de deploy, adicionou
  criação automática de projeto Cloudflare, modal de confirmação de deploy.
- **`17f9ddc`** (Claude) — Upload real de imagens (antes só aceitava colar
  URL). Deploy real via CLI, substituindo uma versão que sempre fingia
  sucesso mesmo sem credenciais configuradas.
- **`3ea59c8`** (Claude) — Corrigido bug de closure desatualizada: ao criar
  uma cidade nova, o formulário ficava mostrando os dados da cidade anterior
  (ex: "araucaria" mostrando dados de "São José dos Pinhais").
- **`e2ccc7d`** — Primeira versão do projeto (plano original do Antigravity).

---

## 🔧 Pendências conhecidas, em ordem de prioridade

1. **`/api/deploy-city/:id` (botão "Publicar") não roda a auditoria nem
   atualiza `auditScore`** — só `/api/build-city/:id` (botão "Build") faz
   isso. Publicar uma cidade sem antes/depois clicar em Build deixa o score
   na Central de Cidades desatualizado (visto em 29/08/2026 com Itabuna:
   ficou mostrando 90% com o site já 100% no ar). Corrigir: fazer
   `deploy-city` rodar `npm run audit` também (ou chamar a mesma lógica de
   `build-city`) antes de marcar `status: 'ativo'`.
2. **Editor estilo Elementor** (clicar no elemento pra editar, containers) —
   pedido explícito do usuário. Agora que o preview é o Astro real e já
   sincroniza ao vivo, esta é a próxima frente. Precisa: (a) um jeito de
   injetar overlay/contentEditable nas páginas Astro quando servidas em
   modo editor, (b) reconectar isso ao listener `handleMessage`/
   `SELECT_ELEMENT` que já existe em `App.tsx` mas está sem uso desde que o
   preview falso foi removido.
3. **Negociação de Markdown para Vercel e Netlify** — hoje só funciona em
   Cloudflare Pages.
4. Qualidade de copy: alguns títulos de página de serviço ficam redundantes
   (ex: "Desentupidora de Desentupimento de Pia") — a palavra-chave está lá,
   mas o fraseado é estranho.
5. Depoimentos fabricados — usuário pediu pra não mexer por enquanto, mas é
   um risco real (propaganda enganosa) que vale revisitar no futuro.
6. A rota antiga `/api/preview/:id` (gerador de HTML falso) ficou morta no
   `server.cjs` — pode ser removida com segurança quando alguém for limpar
   código morto.

---

## ⚙️ Scripts Úteis
- `npm run dev` (dentro de `apps/web-dashboard`): roda `server.cjs` + Vite
  juntos.
- `npm run dev` (dentro de `apps/site-template-astro`): sobe o Astro em
  `localhost:4321`.
- `npm run build` (dentro de `apps/site-template-astro`): gera o `dist/`
  real que é publicado — **sempre teste aqui antes de assumir que uma
  mudança de SEO funcionou**, não confie só em ler o `.astro`.
