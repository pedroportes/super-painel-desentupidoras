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

### ⚠️ Preview do editor: ainda tem 2 caminhos diferentes (não totalmente resolvido)
- A aba padrão do editor no painel mostra um preview via `/api/preview/:id`
  (HTML gerado à mão dentro do `server.cjs`, **não é o Astro real**).
- Outras rotas do preview apontam pra `http://localhost:4321` (servidor de
  desenvolvimento do Astro de verdade, precisa estar rodando à parte).
- **Isso significa que o que você vê editando pode não ser 100% igual ao
  que é publicado de verdade.** Ainda não foi unificado. Ver "Pendências".

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

1. **Editor estilo Elementor** (clicar no elemento pra editar, containers) —
   pedido explícito do usuário, ainda não iniciado. Vai exigir unificar o
   preview do editor com o Astro real primeiro (ver item 2), porque não faz
   sentido construir clique-para-editar em cima de um preview falso.
2. **Unificar o preview do editor com o Astro real** — hoje são 2 (às vezes
   3) motores de renderização diferentes coexistindo. O ideal é o editor
   sempre mostrar o resultado do Astro de verdade (rodando build/dev),
   nunca um HTML paralelo escrito à mão.
3. **Negociação de Markdown para Vercel e Netlify** — hoje só funciona em
   Cloudflare Pages.
4. Qualidade de copy: alguns títulos de página de serviço ficam redundantes
   (ex: "Desentupidora de Desentupimento de Pia") — a palavra-chave está lá,
   mas o fraseado é estranho.
5. Depoimentos fabricados — usuário pediu pra não mexer por enquanto, mas é
   um risco real (propaganda enganosa) que vale revisitar no futuro.

---

## ⚙️ Scripts Úteis
- `npm run dev` (dentro de `apps/web-dashboard`): roda `server.cjs` + Vite
  juntos.
- `npm run dev` (dentro de `apps/site-template-astro`): sobe o Astro em
  `localhost:4321`.
- `npm run build` (dentro de `apps/site-template-astro`): gera o `dist/`
  real que é publicado — **sempre teste aqui antes de assumir que uma
  mudança de SEO funcionou**, não confie só em ler o `.astro`.
