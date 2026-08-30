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
- Sincronização ao vivo: **⚠️ correção de uma afirmação falsa que estava
  aqui** — isto dizia que "toda mudança em `editingCity` dispara (com
  debounce de 600ms)" uma chamada a `POST /api/preview-sync`. Conferido no
  código em 29/08/2026: **isso nunca existiu de verdade**. Só dois
  caminhos chamam `preview-sync` + recarregam o iframe:
  `handleSelectCityForEditor` (ao trocar de cidade) e a função
  `syncPreviewLive` (criada em 29/08/2026, debounce real de 400ms),
  ligada por enquanto só ao slider de tamanho da logo. Editar um campo de
  texto (H1, parágrafo, CTA, etc.) **não** atualiza o preview ao vivo —
  só reflete depois de "Salvar Alterações" ou trocar de cidade. Se for dar
  esse mesmo tratamento a outros campos, reaproveitar `syncPreviewLive`.
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
9. **FAQs reais, não genéricas** — cada FAQ tem que responder algo que um
   cliente daquela cidade especificamente perguntaria (ex: uma cidade de
   solo argiloso/vermelho pode ter uma FAQ sobre raízes de árvore
   entupindo a rede; uma cidade litorânea, sobre maré alta causando
   refluxo). **Nunca copiar a mesma pergunta/resposta trocando só o nome
   da cidade** — isso é conteúdo duplicado em escala (mesmo risco de
   "scaled content abuse" documentado na skill
   [`rede-de-parceiros`](.agents/skills/rede-de-parceiros/SKILL.md), mas
   aplicado ao conteúdo principal do site, não só à página de parceiros).
   ⚠️ **Bug conhecido, ainda não corrigido**: `generateUniqueCityContent()`
   em `cityGenerator.ts` gera hoje um `aboutCityText` e um conjunto de
   FAQs **100% fixos por modelo de template** (só troca `${cidade}`) — e
   as páginas de bairro (`[slug].astro`) são piores: os mesmos 4 cards
   ("Perfil e Infraestrutura", "Desafios Hidráulicos Comuns", "Pontos
   Conhecidos", "Tecnologia Sem Quebrar Piso") têm **texto idêntico,
   palavra por palavra, em todo bairro de toda cidade**, só troca o nome
   do bairro. Isso já soma 100+ páginas quase-idênticas publicadas hoje —
   é a mesma classe de risco do exemplo de mercado de 940 páginas
   analisado na skill de parceiros, só que em escala menor e já ao vivo,
   não hipotético. Ao criar uma cidade nova, escrever o conteúdo (H1,
   1º parágrafo, `aboutCityText`, FAQs) manualmente com fatos reais e
   específicos daquela cidade — nunca usar `generateUniqueCityContent()`
   direto pra produção sem reescrever o texto.
10. **Title entre 40 e 60 caracteres, Meta Description entre 120 e 160
    caracteres — faixa NUMÉRICA, com piso e teto, nunca só um máximo.**
    ⚠️ **2 bugs reais encontrados, em datas diferentes**:
    - **29/08/2026**: o `metaTitle` da cidade de teste Vitória da
      Conquista ficou com **83 caracteres** e a `metaDescription` com
      **165** (estourando o teto — Google trunca/penaliza). Até a
      fórmula padrão/fallback em `syncCityToAstro()` quebrava essa regra
      sozinha pra cidades de nome longo (`... | Atendimento Sem Quebrar
      Piso` já nascia com 75 caracteres).
    - **30/08/2026**: depois de corrigido o teto, uma extensão de
      auditoria SEO no navegador marcou em **VERMELHO** um título de
      **36 caracteres** ("Desentupidora em Porto Seguro BA 24h") — **por
      ser CURTO DEMAIS**, não por estourar nada. Título "≤60" sem piso
      desperdiça o espaço de exibição real do Google (~50-60 chars) e é
      penalizado por ferramentas de auditoria. Medido: a fórmula padrão
      simples ficava entre **31 e 47 chars** pra nomes reais de cidade —
      sempre abaixo de um piso saudável.
    - **Fórmula corrigida** (`buildDefaultMetaTitle()` em `server.cjs`):
      adiciona o complemento `" - Atendimento Rápido"` só quando o
      resultado cabe em 60 caracteres, senão cai pro título curto —
      nunca estoura o teto pra caber o complemento. Testado nas 11
      cidades reais: todas ficam entre 44 e 60 chars.
    - **Nunca concatenar o nome da cidade num título/descrição fixo sem
      checar o tamanho final contra as DUAS pontas** (`nome.length` em
      JS, não estimar de cabeça) — cidades com nome curto (Linhares)
      mascaram o teto estourando; cidades com nome longo (Vitória da
      Conquista, São José dos Pinhais) mascaram o piso não sendo
      atingido. `apps/web-dashboard/scripts/audit_live_sites.cjs`
      confere essa faixa numérica automaticamente em produção agora
      (constantes `TITLE_MIN`/`TITLE_MAX`/`DESC_MIN`/`DESC_MAX` no topo
      do arquivo).
11. **Nota real no [isitagentready.com](https://isitagentready.com/)** —
    além da auditoria interna (`npm run audit`, `seoGeoAuditor.js`, que
    verifica só a estrutura do HTML), todo site publicado deve ser testado
    de verdade nessa ferramenta (validador de discoverability/AEO afiliado
    à Cloudflare) depois do deploy. A auditoria interna pode dar 100% e o
    site ainda ter problemas reais de produção não cobertos por ela (foi
    o caso do bug de negociação de Markdown, `commit 5d5fa0b`/histórico
    acima) — **100% no `npm run audit` não substitui o teste externo real**.
12. **Rodar também o [PageSpeed Insights](https://pagespeed.web.dev/) (mobile) depois do deploy** —
    pega uma classe de bug que nem o auditor interno nem o isitagentready.com
    cobrem: robots.txt inválido, imagem sem `width`/`height`, iframe sem
    `title`, link sem nome acessível. **Bugs reais encontrados e corrigidos
    em 30/08/2026** (cidade de teste Vitória da Conquista, ver histórico):
    - `robots.txt` tinha a linha `llms-txt: <url>` — **não é uma diretiva
      válida** (Lighthouse/`robots-parser` não reconhece, reporta "Unknown
      directive" e derruba o SEO de 100 pra 92). A descoberta do
      `llms.txt` **não depende do robots.txt** — já existe via `Link`
      header (`rel="llms-txt"`, ver `public/_headers`), que é o mecanismo
      que o isitagentready.com de fato lê. **Nunca inventar diretiva de
      robots.txt fora do padrão real (`User-agent`, `Allow`, `Disallow`,
      `Sitemap`, `Crawl-delay`)** — se quiser anunciar um recurso pra
      agentes, usar `Link` header ou `.well-known`, nunca o robots.txt.
    - Todo `<img>` de conteúdo (logo no `Header.astro`, foto em
      `LocalAreas.astro`, hero em `[slug].astro`) **precisa de `width` e
      `height` explícitos** (as dimensões reais do master, mesmo que o CSS
      redimensione depois) — sem isso o navegador não reserva espaço e
      gera Cumulative Layout Shift.
    - Todo `<iframe>` (os 2 embeds de Google Maps, em `LocalAreas.astro` e
      `[slug].astro`) **precisa de `title` descritivo** — sem isso é
      reportado como falha de acessibilidade ("frame sem título").
    - ⚠️ **Pegadinha sutil, a mais fácil de repetir por acidente**: a regra
      de CSS responsivo `.top-bar span { display: none; }` (esconde o
      texto no mobile pra economizar espaço) **também escondia o único
      texto acessível do link do WhatsApp no topo** (`Header.astro`) — o
      link ficava sem nome nenhum pro leitor de tela em telas pequenas,
      mesmo tendo texto visível no desktop. **Toda vez que uma regra CSS
      esconder o conteúdo de texto de um link/botão em algum breakpoint,
      adicionar `aria-label` fixo naquele elemento** (não depende do CSS,
      sempre presente) — nunca confiar só no texto interno quando existe
      CSS que pode escondê-lo condicionalmente.
13. **Acessibilidade estrutural (achado real 30/08/2026, testando a
    cidade nova Blumenau com PageSpeed Insights)**:
    - **Toda página precisa de exatamente um `<main>`** envolvendo o
      conteúdo principal (entre `Header` e `Footer`). `index.astro` não
      tinha — corrigido (`<main>` agora envolve tudo de `HeroComponent`
      até `Benefits`). `[slug].astro` já tinha nos dois branches
      (bairro e serviço), não precisou mexer.
    - **Ordem de heading nunca pode pular nível** (h1 → h3 sem h2 no
      meio, por exemplo). Achado real: o card "⚡ Urgência 24 Horas em
      {cidade}" dentro do Hero (`Hero.astro` e `HeroV1.astro`) era um
      `<h3>` logo depois do `<h1>`, pulando o h2 — corrigido pra `<h2>`
      (e o CSS `.card-header h3` pra `.card-header h2` junto, senão o
      texto herda o tamanho de h2 genérico do navegador).
    - ⚠️ **Achado grave, AINDA NÃO CORRIGIDO — contraste de cor em
      botões/badges falha em 4 das 5 paletas do projeto.** Medido de
      verdade (fórmula WCAG, razão de contraste calculada, não
      estimativa) entre texto branco e as cores `--color-primary`/
      `--color-accent` de cada paleta (usadas de fundo em botões como
      "Chamar no WhatsApp" e badges como "Atendimento Emergencial"):
      | Paleta | branco/primary | branco/accent | Passa? |
      |---|---|---|---|
      | `urgencia-azul-laranja` | 4,10 | 2,80 | ❌ (mínimo 4,5 texto / 3,0 botão) |
      | `corporativo-verde-cinza` | 2,54 | 1,92 | ❌ |
      | `residencial-bege` | 3,19 | 2,15 | ❌ |
      | `industrial-amarelo` | 1,92 | 1,53 | ❌ |
      | `clean-azul` | 5,17 | 3,68 | ✅ (única que passa) |

      Ou seja, **10 das 12 cidades atuais** (todas menos as que usam
      `clean-azul`, hoje só Porto Seguro) têm texto branco genuinamente
      difícil de ler em botões/badges de destaque — confirmado
      visualmente (screenshot) e via `getComputedStyle` real no site
      publicado de Blumenau, não só pelo Lighthouse. **Não corrigido
      ainda de propósito**: mudar as cores de uma paleta usada em
      produção é uma decisão de marca/visual (a cor "clara e vibrante"
      pode ter sido escolhida assim de propósito), não só um bug de
      código — precisa de decisão explícita do usuário sobre qual
      caminho seguir (escurecer `primary`/`accent`, ou manter as cores e
      trocar o texto do botão pra uma cor escura em vez de branco, ou
      aceitar o risco e não mexer).

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

## ✅ RISCO CRÍTICO: conteúdo quase-duplicado entre cidades (achado em 30/08/2026, CORRIGIDO em 30/08/2026)

**Atualização 30/08/2026 (mesmo dia, sessão seguinte)**: os 5 passos do
plano abaixo foram aplicados. Resumo do que mudou (detalhes na seção
seguinte, "O que foi corrigido"):
- Bug do domínio hardcoded do Modelo 1 corrigido em `cityGenerator.ts`.
- `dominio` de São José dos Pinhais corrigido (não existe site real —
  confirmado com o usuário; usado o padrão `desentupidora<cidade>.com.br`
  só como valor de cadastro/schema, igual às outras cidades sem domínio
  próprio registrado).
- As 10 cidades com conteúdo genérico/clonado ganharam `h1Title`,
  `firstParagraph`, `aboutCityTitle`, `aboutCityText`, `lastH2`, 6 `faqs` e
  3 `testimonials` **individualmente escritos com fatos reais do
  município** (geografia, clima, economia local, um problema hidráulico
  plausível pra região) via
  `apps/web-dashboard/scripts/apply_unique_city_content.cjs` — não é mais
  reaproveitamento de template por modelo, é conteúdo único por cidade,
  igual ao padrão já usado em Vitória da Conquista.
- Validado por script: 0 nomes de depoimento repetidos entre as 11
  cidades, 11/11 `firstParagraph` e `aboutCityText` únicos, todas passam a
  regra de keyword-nas-30-primeiras-palavras e keyword-no-último-H2.
- Todas as 11 cidades rebuildadas localmente (`/api/build-city/:id`) com
  sucesso e `auditScore: 100` — **nenhum deploy foi refeito nessa rodada**,
  a correção ficou só em `cities.json`/build local, por pedido explícito do
  usuário ("arrume nossa versão local"). Publicar essas 10 cidades de novo
  fica pendente pra quando o usuário pedir.
- `update_cities_faqs.cjs` **não foi apagado** (fica como registro
  histórico do bug), mas não deve ser rodado de novo — se precisar de uma
  rotina de "garantir mínimo de FAQs/depoimentos" no futuro, usar
  `apply_unique_city_content.cjs` como referência (lê conteúdo por
  cidade, nunca um texto genérico único).

### ⚠️ Novo achado (30/08/2026), AINDA NÃO CORRIGIDO — bairros fictícios/copiados
Enquanto investigava o conteúdo, encontrei outro bug de dados, mais
delicado, que decidi **não corrigir sozinho** porque mexe em algo que pode
quebrar URLs já indexadas pelo Google:
- O campo `bairros` de **Curitiba** é, literalmente, a lista de bairros
  reais de **Linhares** (`Interlagos, Conceição, Novo Horizonte, Avisos,
  Araçá...`) — não tem nenhum bairro real de Curitiba.
- **São José dos Pinhais, Araucária e Londrina** compartilham a mesma
  lista genérica de bairros fictícios (`Centro, Jardim América, Bela
  Vista, São José, Santa Cruz, Vila Nova, Planalto, Bairro Alto`) — nomes
  que não existem de verdade nessas cidades.
- Por que não corrigi direto: cada bairro gera uma página própria
  indexável (`/[slug]` no Astro). Se essas 4 cidades já estão publicadas e
  o Google já indexou `/interlagos` pra "desentupidora Curitiba", por
  exemplo, trocar o nome do bairro de uma hora pra outra criaria uma URL
  nova e devolveria 404 na antiga (a não ser que se implemente redirect
  301, o que o motor de deploy atual não faz). Isso é uma decisão de
  produto/SEO que exige aprovação explícita antes de mexer.
- **Ação recomendada, aguardando decisão**: trocar `bairros` dessas 4
  cidades pelos bairros reais (`cityGenerator.ts` já tem uma lista correta
  de Curitiba em `KNOWN_NEIGHBORHOODS`; São José dos Pinhais/Araucária/
  Londrina precisam de lista nova) e, no mesmo deploy, configurar redirects
  301 dos slugs antigos pros novos — ou, se ainda não há tráfego/indexação
  real nessas URLs, apenas trocar direto sem redirect.

**Contexto**: cada cidade é publicada num domínio próprio
(`desentupidora<cidade>.com.br`). O Google trata isso como uma **rede de
sites do mesmo operador**, não como páginas internas de um site só — ou
seja, ele NÃO escolhe uma "versão canônica" como faria com duplicidade
dentro de um mesmo domínio. Duas políticas de spam do Google se aplicam
direto a esse padrão: **"scaled content abuse"** (conteúdo em escala com
pouca/nenhuma diferenciação real, cujo objetivo é manipular ranking — não
importa se foi feito à mão ou automatizado) e **"doorway pages"** (páginas
por cidade com pouco valor único, todas levando pro mesmo negócio). Se o
padrão for identificado, uma ação manual pode afetar **vários domínios de
uma vez**, não só um.

### Notas SEO / GEO / AEO — antes e depois da correção (30/08/2026)
| Categoria | Antes | Depois | Por quê |
|---|---|---|---|
| SEO | 5,5/10 | ~7,5/10 | Fundação técnica já era boa (sitemap, robots, schema, headers). O ponto fraco era o conteúdo idêntico entre cidades — agora cada uma tem H1/parágrafo/texto-sobre-a-cidade/FAQs/depoimentos próprios com fatos reais do município. Falta ainda diversificar os textos curtos de `services` (permanecem genéricos, ver pendência) e resolver o bug de bairros fictícios (ver achado acima) pra chegar mais perto de 9-10. |
| GEO | 3/10 | ~6,5/10 | Cada cidade agora tem um ângulo distintivo e citável (ex: água mineral em Poços de Caldas, terra roxa em Londrina, Repar em Araucária) em vez de texto genérico raspável. Ainda não testado de fato em Perplexity/AI Overviews. |
| AEO | 3,5/10 | ~5/10 | FAQs agora respondem perguntas específicas e plausíveis da região, não genéricas — ajuda motores que fazem parsing de conteúdo mesmo sem rich result do Google (descontinuado em maio de 2026). |

Notas "Depois" são estimativa qualitativa da IA com base nos critérios acima, não uma ferramenta externa — **rodar isitagentready.com e PageSpeed Insights depois do próximo deploy real** (regra 11/12 do guia) pra validar de fato.

### O que existe hoje pra resolver isso (`apps/web-dashboard/src/cityGenerator.ts`)
Esse arquivo é uma tentativa real (não cosmética) de resolver o problema:
gera 4 "modelos" com H1, parágrafo, CTA, 6 serviços, 6 FAQs e 3 depoimentos
**genuinamente diferentes** em texto (não é só trocar o nome da cidade):

- `urgencia-24h` (padrão, pré-selecionado na tela "Criar Novo Site") — tom
  de urgência/menor preço.
- `corporativo-empresarial` — tom B2B (condomínios, laudo técnico, nota
  fiscal).
- `residencial-bairros` — tom família/residencial.
- `industrial-hidrojato` — tom pesado/industrial (caminhão auto-vácuo,
  MTR, licença ambiental).

Estruturalmente só existem **2 esqueletos visuais** (`HeroV1`+
`ServicesGridV1` para os modelos 1 e 3; `HeroV2`+`ServicesGridV2` para os
modelos 2 e 4) — os 4 modelos diferem de verdade só no texto e na paleta de
cor, não no HTML/layout. Isso é secundário (texto pesa muito mais que
estrutura de HTML pra detecção de duplicidade), mas registrar pra não
confundir "4 modelos" com "4 layouts".

### Dois problemas concretos que estão anulando esse trabalho

**1. Bug no domínio do Modelo 1 (`urgencia-24h`)** — em
`cityGenerator.ts`, linha ~272, o campo `dominio` está **hardcoded**:
```js
dominio: `desentupidoralinhares.com.br`,   // ERRADO — deveria ser dinâmico
```
Os outros 3 modelos fazem certo: `dominio: \`desentupidora${cityKey}.com.br\``.
Isso é a causa raiz confirmada do bug que eu tinha registrado antes como
"erro de cadastro" (São José dos Pinhais e Araucária com o mesmo domínio
de Linhares) — na verdade é determinístico: **toda cidade nova criada com
o Modelo 1 (o padrão pré-selecionado, o que a maioria vai clicar sem
pensar) nasce com esse domínio errado.** Correção: trocar a linha pra usar
`cityKey` como os outros 3 modelos já fazem.

**2. Script `apps/web-dashboard/scripts/update_cities_faqs.cjs` nivelou
tudo pra um texto genérico único** — esse script varre `cities.json` e,
pra qualquer cidade com menos de 6 FAQs ou 3 depoimentos, **sobrescreve**
com um conjunto fixo — que por acaso é uma cópia do texto genérico mais
antigo do projeto (de antes até do `cityGenerator.ts` existir), incluindo
os mesmos 3 nomes fictícios de sempre: "Carlos Eduardo M.", "Maria
Aparecida Silva", "João Paulo Santos". Rodar esse script **desfaz** a
diferenciação que o `cityGenerator.ts` foi feito pra trazer, porque ele
não olha pra `modeloTemplate` da cidade — aplica o mesmo texto pra
qualquer modelo.

**Estado real medido em 30/08/2026** (`data/cities.json`, 11 cidades):
- **10 de 11 cidades** têm os mesmos 3 nomes fictícios de depoimento e as
  mesmas 6 FAQs, palavra por palavra — incluindo cidades que já foram
  criadas com o sistema novo de modelos (São José dos Pinhais, Araucária).
  Só Vitória da Conquista escapou (tem depoimentos próprios: "Marcos
  Vinícius R.", "Juliana Ferreira", "Clínica Santa Helena").
- Isso quer dizer que, na prática, a diferenciação por modelo **existe no
  código mas não está aplicada nos dados salvos** pra maioria das cidades
  já cadastradas.

### O que precisa ser feito (em ordem de prioridade) — status 30/08/2026
1. ✅ **Corrigir a linha do domínio hardcoded** no Modelo 1 do
   `cityGenerator.ts` — feito, agora usa `cityKey` como os outros 3
   modelos.
2. ✅ **Reprocessar as cidades afetadas** com conteúdo próprio — feito via
   `apply_unique_city_content.cjs`, mas **por escrita manual direta por
   cidade** (fatos reais), não reaplicando os 4 modelos do
   `cityGenerator.ts` como o plano original sugeria — os modelos ainda
   compartilham texto entre si (ver item 4), então reaplicá-los teria
   resolvido só parte do problema.
3. ✅ **Não usar `update_cities_faqs.cjs` de novo** — mantido como registro
   histórico, documentado aqui pra não ser reexecutado sem adaptar.
4. ⏳ **Ainda pendente — teto de escala com só 4 modelos**: os 4 modelos de
   `cityGenerator.ts` continuam compartilhando texto idêntico entre
   cidades do mesmo modelo (útil só na criação de cidade nova, ver Passo 1
   da skill `criar-site-desentupidora`, que já orienta reescrever à mão).
   Sem mudança de processo, a partir de ~5 cidades novas no mesmo modelo
   o clone completo volta a acontecer. Considerar variar/reescrever pontos
   do modelo por cidade no momento da criação, não só confiar no texto
   fixo do modelo.
5. ⏳ **Ainda pendente — bairros fictícios/copiados**: ver achado novo
   registrado acima (Curitiba com bairros de Linhares; São José dos
   Pinhais/Araucária/Londrina com lista genérica fictícia) — aguardando
   decisão do usuário por envolver risco de quebrar URLs indexadas.
6. ⏳ **Ainda pendente — depoimentos 100% fabricados/fictícios**: risco de
   propaganda enganosa (CDC) além do risco de SEO, mantido por pedido
   explícito do usuário em rodadas anteriores. Continuam fictícios mesmo
   após a reescrita de 30/08 (só deixaram de ser *idênticos* entre
   cidades) — reavaliar essa decisão em algum momento.
7. ⏳ **Ainda pendente — textos curtos de `services` (os 6 cards de
   serviço)** continuam idênticos, palavra por palavra, entre todas as 11
   cidades (não fazem parte do texto reescrito em 30/08, prioridade mais
   baixa por serem descrições curtas e genéricas de serviço, prática comum
   no setor — mas ainda vale variar no futuro se o tempo permitir).

---

## ✅ Checklist obrigatório antes de publicar (`checklist-pre-publicacao`)

Existe uma skill dedicada,
[`.agents/skills/checklist-pre-publicacao/SKILL.md`](.agents/skills/checklist-pre-publicacao/SKILL.md),
criada em 30/08/2026 depois de uma rodada de redeploy em massa ter sido
verificada só pelo `<title>` de cada página e deixado passar 3 bugs reais
de infraestrutura (um deles causou 404 em produção, visto pelo usuário
antes de mim). Ativar essa skill **sempre** antes de publicar/redeployar
qualquer cidade — ela tem as regras de ouro de infraestrutura (URL real
vs. calculada, nome de projeto vs. subdomínio, integração Git que rouba o
deploy manual, caminho de imagem com casing) e o checklist passo a passo
de verificação (nunca só o título — CSS, imagem, canonical, og:url e
schema JSON-LD todos batendo com a URL real).

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
- **Cloudflare: nome do projeto ≠ subdomínio `.pages.dev`** — são campos
  diferentes na API da Cloudflare, e podem divergir quando há colisão de
  nome (subdomínio é global). **Nunca derivar o nome do projeto a partir
  da URL salva** (bug real, corrigido 2x em 30/08/2026, ver histórico
  abaixo) — o nome real é guardado em `city.cloudflareProjectName` na
  primeira vez que a Cloudflare responde e sempre reaproveitado depois.
  Só cai no `getCleanProjectName(cidade)` se a cidade nunca foi publicada
  nessa conta.
- ⚠️ **Existe hoje 1 projeto órfão na conta Cloudflare**
  (`desentupidora-curitiba-sns`, subdomínio com sufixo `-f0c`, sem
  tráfego real) criado pelo bug acima antes da correção definitiva.
  Não foi apagado automaticamente — aguardando o usuário confirmar a
  exclusão (painel da Cloudflare ou API).

---

## 📜 Histórico de Correções (mais recente primeiro)

- **`(pendente de commit)`** (30/08/2026) — **Cidade de teste Blumenau-SC
  criada do zero ponta a ponta, validando todo o processo corrigido
  nesta sessão.** Cadastro com conteúdo 100% único (fatos reais:
  colonização alemã, Oktoberfest, indústria têxtil, histórico de
  enchentes do Rio Itajaí-Açu), logo/favicon gerados via Canva (fundo
  removido por chroma-key — achado no processo: o Canva não respeitou o
  hex exato pedido pro fundo sólido, a cor real saiu bem diferente do
  hex solicitado; corrigido amostrando a cor real do pixel em vez de
  confiar no hex do prompt), hero fotorrealista gerado via Canva com
  ortografia conferida visualmente antes de aprovar. Build local
  (`auditScore: 100`) e deploy real no Cloudflare confirmados, checklist
  completo batendo (`audit_live_sites.cjs`): título 40-60 chars,
  descrição 120-160, canonical/og/schema batendo com a URL real, CSS e
  imagem 200. Validação externa: **isitagentready.com deu 40/100, Nível
  4 "Agent-Integrated"** (melhor que qualquer cidade Vercel/Netlify
  porque a negociação de Markdown funciona no Cloudflare) e
  **PageSpeed Insights: Performance 69, Acessibilidade 92, Práticas
  Recomendadas 100, SEO 100**. A auditoria de acessibilidade do
  PageSpeed nessa cidade nova revelou 3 achados novos, aplicados nas 12
  cidades (ver regra de ouro 13 e pendência -1 acima): falta de `<main>`
  na home, ordem de heading pulando nível no Hero, e um achado grave de
  contraste de cor (4 de 5 paletas falham) ainda aguardando decisão do
  usuário.
- **`(pendente de commit)`** (30/08/2026) — **Título com piso mínimo de
  40 caracteres, não só teto de 60.** Achado por extensão de auditoria
  SEO no navegador que marcou em vermelho um título de 36 caracteres por
  ser curto demais. `buildDefaultMetaTitle()` novo em `server.cjs`
  adiciona complemento só quando cabe em 60 chars. `audit_live_sites.cjs`
  ganhou constantes numéricas exatas (`TITLE_MIN/MAX`, `DESC_MIN/MAX`) —
  checklist agora confere faixa completa, não só presença de keyword.
  Redeployadas as 11 cidades existentes com o título corrigido.
- **`(pendente de commit)`** (30/08/2026) — **Bug real e sério no deploy
  Netlify: zip do PowerShell corrompia toda a estrutura de pastas no ar.**
  Achado ao rodar o checklist completo em todas as 11 cidades (pedido
  explícito do usuário: "aplique o checklist tem que ficar tudo verde") —
  Poços de Caldas (única cidade Netlify) tinha HTML 200 mas **CSS e
  imagens 404**, página completamente sem estilo. Causa raiz: o zip criado
  por `Compress-Archive` (PowerShell) grava metadado de origem
  Windows/FAT no cabeçalho de cada entrada; o parser da Netlify, ao ver
  esse metadado, reinterpreta o separador de pasta como barra invertida
  (`\`) mesmo com os nomes gravados corretamente com `/` — confirmado
  isolando o teste via API da Netlify (mesmo `dist/`, um zip do
  PowerShell e um zip com metadado Unix, resultados diferentes na
  listagem de arquivos do deploy). Só o `index.html` da raiz (sem
  subpasta) funcionava; qualquer asset dentro de `_astro/`, `images/` ou
  qualquer página de bairro/serviço virava um arquivo achatado com nome
  quebrado. **Esse bug provavelmente afetou TODOS os deploys Netlify
  desde sempre**, não só o de hoje. Corrigido com um criador de ZIP
  nativo em Node, sem dependência de shell nenhum
  (`apps/web-dashboard/scripts/zipUtil.cjs`, usa `zlib.crc32`/
  `deflateRawSync` do próprio Node), substituindo o `Compress-Archive` em
  `deployEngine.cjs`. Testado isoladamente contra a API da Netlify antes
  de integrar, depois testado de ponta a ponta via `/api/deploy-city/`.
- **`(pendente de commit)`** (30/08/2026) — **3 bugs reais achados pelo
  usuário em produção (não pela IA) depois de um redeploy em massa
  verificado só pelo `<title>` de cada página — corrigidos e documentados
  numa skill nova, [`checklist-pre-publicacao`](.agents/skills/checklist-pre-publicacao/SKILL.md):**
  1. **`syncCityToAstro()` nunca repassava `city.deployUrl` pro
     `cityConfig.json`** — o canonical/og:url/schema (`Layout.astro`)
     sempre caíam numa URL "calculada por fórmula" em vez da real.
     Confirmado quebrado em produção: Linhares (Vercel, sufixo `-zeta`
     não coberto pela fórmula), Curitiba (Cloudflare, sufixo `-sns`) e
     **Poços de Caldas** (canonical apontando pra
     `desentupidorapocosdecaldas.com.br`, domínio que não existe — a
     fórmula nem tinha um caso pra hospedagem Netlify). Corrigido: campo
     `deployUrl` agora passa por `syncCityToAstro()`, e `Layout.astro`
     ganhou o caso `netlify` explícito no fallback.
  2. **Araucária e Curitiba com `logoUrl`/`heroImage`/`faviconUrl`
     apontando pra pasta com maiúscula/acento** (`/images/Araucária/...`,
     `/images/Curitiba/...`) que não existe em disco (pasta real é
     minúscula/sem acento) — sobrou da correção de casing do campo
     `cidade` numa sessão anterior, que vazou pro caminho de imagem por
     engano. Logo/hero ficavam 404 silenciosamente (build não reclama).
     Corrigido pra Araucária e confirmado (imagem 200 depois do
     redeploy); Curitiba com o mesmo bug, **corrigido e confirmado
     também** (imagem 200 depois do redeploy).
  3. Ver também os 2 achados já documentados abaixo (projeto órfão
     Cloudflare, integração GitHub↔Vercel roubando o alias de produção).
  **Como foram descobertos**: o usuário abriu a página publicada de
  Linhares manualmente com uma extensão de auditoria SEO no navegador e
  viu o canonical errado — nenhuma dessas 3 coisas tinha sido pega pela
  verificação da IA (que só conferiu `<title>` via `curl`). Daí a criação
  da skill `checklist-pre-publicacao` com a regra explícita de nunca mais
  verificar só o título.
- **`84c329c`** (30/08/2026) — **Bug de deploy Cloudflare corrigido de vez
  (2ª rodada, mesmo dia): projeto órfão criado a cada redeploy.** Ao
  redeployar as 10 cidades com o conteúdo único novo (ver entrada de
  conteúdo quase-duplicado abaixo), o redeploy de Curitiba criou um
  **projeto novo do zero** na Cloudflare em vez de reusar o existente — o
  conteúdo corrigido foi parar num projeto órfão
  (`desentupidora-curitiba-sns-f0c.pages.dev`) e o site real
  (`desentupidora-curitiba-sns.pages.dev`) ficou com o conteúdo antigo.
  Causa raiz: a correção da rodada anterior (linha abaixo) extraía o
  "slug" de dentro da URL salva e reusava como `--project-name` — mas
  esse slug é o **subdomínio**, não o **nome do projeto**, e os dois
  campos são diferentes na Cloudflare quando há colisão. Fix definitivo:
  o nome real do projeto agora é salvo em `city.cloudflareProjectName` e
  nunca mais re-derivado da URL. Confirmado via API da Cloudflare que o
  redeploy correto de Curitiba não criou projeto novo (conta permaneceu
  com 6 projetos). Ficou 1 projeto órfão pra limpar
  (`desentupidora-curitiba-sns`, sufixo `-f0c`), aguardando confirmação do
  usuário.
- **`bbd567c` / `af1b121`** (30/08/2026) — **Conteúdo quase-duplicado
  entre 10 de 11 cidades corrigido e republicado.** Ver seção completa "✅
  RISCO CRÍTICO: conteúdo quase-duplicado entre cidades" acima. H1,
  primeiro parágrafo, texto sobre a cidade, último H2, FAQs e depoimentos
  reescritos com fatos reais por cidade (não mais template genérico
  raspado por `update_cities_faqs.cjs`), validado (0 nomes de depoimento
  repetidos, 11/11 textos únicos, `auditScore: 100` em todas), e
  **republicado de verdade** nas 10 cidades (confirmado por `curl` no
  título e no texto único de cada uma, nos 3 provedores).
- **`(pendente de commit)`** (30/08/2026) — **Bug real de deploy Cloudflare
  descoberto e corrigido: `deployToCloudflarePages()` nunca lia a URL real
  reportada pelo wrangler**, só assumia `https://<nomeCalculado>.pages.dev`
  cegamente. Descoberto ao conferir o checklist da Curitiba: o site
  publicado de verdade estava em `desentupidora-curitiba-sns.pages.dev`
  (Cloudflare renomeou por colisão de nome/subdomínio — `.pages.dev` é
  global, não só por conta), mas o painel continuava mostrando/salvando
  `desentupidora-curitiba.pages.dev`, que aponta pra um site antigo/de
  outra origem ("R$ 79,90 o metro", claramente não é nosso conteúdo).
  Corrigido: (1) a URL final agora é sempre extraída do output real do
  wrangler (linha "Take a peek over at..."), nunca assumida; (2) o nome do
  projeto pedido em deploys futuros passa a reaproveitar o slug real já
  salvo em `deployUrl`, evitando pedir de novo um nome que sabidamente
  colide. Redeploy de Curitiba confirmou a correção (título e Link header
  batendo com o cadastro atual).
  **Mais 2 bugs de dado real corrigidos no caminho**: `cidade: "araucaria"`
  e `cidade: "curitiba"` estavam salvos em minúsculo/sem acento (vazava pro
  `<title>` publicado); e o `dominio` de araucaria apontava por engano pro
  domínio da Linhares (`desentupidoralinhares.com.br`). Também corrigido:
  `firstParagraph` de Londrina não tinha a palavra-chave nas primeiras 30
  palavras (auditor pegou, 91%→100% depois do ajuste).
  Depois disso, **republicadas todas as cidades no Vercel e Cloudflare que
  ainda estavam com deploy anterior à correção do título/`vercel.json`**
  (Linhares, Porto Seguro, Itabuna, Guarapuava, São José dos Pinhais,
  Curitiba) — todas confirmadas com `curl` mostrando título curto e `Link`
  header presente.
- **`(pendente de commit)`** (30/08/2026) — **Logo+favicon+hero geradas
  para 5 cidades (Cachoeiro, Poços de Caldas, Guarapuava, Curitiba, São
  José dos Pinhais) e publicadas de verdade** (200 OK confirmado em todas
  via curl). Hero usou fotos geradas pelo próprio usuário no ChatGPT/Gemini
  (prompt salvo em `PROMPT-IDENTIDADE-VISUAL.md`) — 1 das 6 rejeitada por
  erro de ortografia real ("HIDOJATEAMENTO", faltando R). Parcerias
  esparsas adicionadas em 3 delas (Cachoeiro→Linhares, Guarapuava→Curitiba,
  São José dos Pinhais→Curitiba — todas unidirecionais, sem ciclo, só
  "satélite aponta pro polo", seguindo a skill `rede-de-parceiros`; Poços
  de Caldas ficou sem parceiro por falta de vizinho geográfico plausível
  na rede). **2 bugs reais novos encontrados rodando o checklist completo
  numa delas (Cachoeiro) e corrigidos** — detalhes na seção de Pendências
  (itens 1 e 2): `_headers` não funciona no Vercel (corrigido com
  `public/vercel.json`) e negociação de Markdown não existe fora do
  Cloudflare Pages (não corrigido, documentado como pendência). Também
  corrigido de quebra o **bug sistêmico de título estourando 60
  caracteres** que já valia pra quase toda cidade (só nomes curtos tipo
  "Linhares"/"Itabuna" mascaravam) — removido o sufixo fixo
  `"| Atendimento Sem Quebrar Piso"` da fórmula padrão em `server.cjs`.
- **`(pendente de commit)`** (30/08/2026) — **Teste ponta a ponta de
  criação de cidade com conteúdo 100% único (Vitória da Conquista, BA) +
  publicação real + correção de bugs achados por ferramentas externas**.
  Criada como teste do fluxo "conteúdo único por cidade" discutido (ver
  regra 9 acima): H1/1º parágrafo/`aboutCityText`/FAQs escritos com fatos
  reais da cidade (planalto, altitude, raízes de árvore, polo de saúde
  regional, BR-116), nunca template genérico. Imagens geradas via Canva
  seguindo `PROMPT-IDENTIDADE-VISUAL.md` (logo com chroma-key real, hero
  com "DESENTUPIDORA" pintado no caminhão, texto conferido). Publicada de
  verdade no Cloudflare Pages
  (`https://desentupidora-vitoriadaconquista.pages.dev`) a pedido do
  usuário pra rodar validação externa real. **3 bugs reais encontrados e
  corrigidos** (detalhes na regra 12 das Regras de Ouro): `metaTitle`/
  `metaDescription` estourando o limite de caracteres (83/165 chars, até a
  fórmula padrão do `server.cjs` quebra pra cidade de nome longo);
  `llms-txt:` como diretiva inválida dentro do `robots.txt` (Lighthouse
  reportava erro, SEO caía de 100 pra 92); `<img>` sem `width`/`height`,
  `<iframe>` sem `title`, e o link do WhatsApp do topo ficando sem nome
  acessível no mobile por causa do CSS `.top-bar span { display: none; }`.
  **Resultado real no PageSpeed Insights (mobile) depois de tudo
  corrigido**: SEO 92→**100**, Acessibilidade 83→**92**, Navegação
  agêntica 2/3→**3/3 (completo)** — medido antes/depois, não estimado.
  Isso tudo **também melhorou o score real do isitagentready.com de 33 pra 40**
  (Discoverability 50%→75%) — ganho medido, não estimado. Como as imagens
  candidatas descartadas (3 de logo, 3 de hero) eram boas, ficaram salvas
  em `.agents/skills/criar-site-desentupidora/exemplos-gerados/vitoriadaconquista/`
  pra reaproveitar depois em vez de gerar de novo. Correções nos arquivos
  compartilhados (`_headers`, `robots.txt.ts`, `Header.astro`,
  `LocalAreas.astro`, `[slug].astro`, `cityGenerator.ts`, `server.cjs`)
  valem pra **todas** as cidades, não só a de teste — as outras 10 ainda
  precisam ser republicadas pra herdar esses ganhos (pendência).
- **`(pendente de commit)`** (30/08/2026) — **Módulo de Rede de Parceiros
  ("Fora da Área de Cobertura")**, do design de risco à implementação
  completa. Contexto: usuário trouxe um prompt próprio que pedia pra
  implementar via Antigravity um sistema de "sites parceiros" com
  cross-linking entre as cidades da rede, inclusive propondo inicialmente
  uma topologia "em círculo" (A→B→C→A) usando hospedagens diferentes pra
  tentar escapar de detecção do Google. **Análise de risco feita antes de
  qualquer código** (documentada na conversa e na skill nova): topologia e
  hospedagem não mudam a classificação de link scheme — o que importa é
  propriedade comum + padrão sistemático de link, não a forma do grafo.
  Pesquisa real de mercado (`desentupidorakennedy.com.br` = anchor text
  keyword-stuffing num rodapé "PARCEIROS"; `desentupidoralitoral.com.br` =
  940 páginas de doorway/scaled-content) confirmou os dois anti-padrões a
  evitar. Decisão final: hub `/fora-da-area-de-cobertura/` + 1 subpágina
  por parceiro real (nunca lista de links, nunca reciprocidade automática,
  nunca dado de teste em produção). Detalhes completos, regras e passo a
  passo em
  [`.agents/skills/rede-de-parceiros/SKILL.md`](.agents/skills/rede-de-parceiros/SKILL.md).
  **Implementado**: rota Astro
  `src/pages/fora-da-area-de-cobertura/[...partner].astro` (hub + subpágina
  num arquivo só, via rest param — só gera rota se houver parceiro ativo);
  util `partnerSlug.ts` extraído pra corrigir um bug real do compilador do
  Astro (`getStaticPaths` roda num escopo separado do corpo do componente —
  uma função declarada localmente no frontmatter e usada só dali quebra o
  build com `X is not defined`); `Footer.astro` mostra um único link
  condicional; aba nova **🤝 Parceiros** no Editor Visual do painel
  (`App.tsx`) com formulário completo (adicionar/editar/excluir/ativar-
  desativar), coluna **PARCEIROS** na tabela de Central de Cidades, e
  contador "Parceiros ativos na rede" no topo da tabela. Testado ponta a
  ponta: build real gerou as 3 rotas esperadas pra Linhares (com 2
  parceiros de exemplo, claramente marcados `(EXEMPLO)`, usados só pra
  validar visual). **Limpeza final**: removidos os 2 parceiros de exemplo
  de Linhares e o registro de lixo pré-existente `"Desentupidora teste"`
  das outras 9 cidades — hoje todas as 10 cidades estão com
  `parceiros: []`. Confirmado que sem parceiro ativo a rota
  `/fora-da-area-de-cobertura` retorna 404 (nem é gerada no build), e o
  auditor SEO/GEO/AEO continua em 100%.
- **`(próximo commit)`** (29/08/2026) — **Sessão de identidade visual,
  parte 2: seção "Áreas Atendidas" com foto local + correção da Linhares**.
  Adicionado suporte a foto ao lado do mapa em `LocalAreas.astro` (prop
  `heroImage`, grid `.map-photo-grid`, aspect-ratio 4:3 desktop / 16:9
  mobile) — decisão explícita do usuário de **não** mexer no card de
  conversão do `HeroV1.astro` (que tem um formulário, não uma foto; esse
  card nunca teve foto em nenhum commit deste repo, apesar do usuário
  lembrar de uma versão com foto — não foi encontrada em nenhum histórico
  git, possivelmente de antes deste repositório existir).
  **Bug real grave encontrado no caminho**: `heroImage` de Linhares E
  Itabuna apontava pro mesmo arquivo (`hero.webp`, hash MD5 idêntico), que
  continha um **watermark de outra empresa** ("HIDROCURITIBA" + telefone
  `41 3051-1101`) — corrigido gerando fotos exclusivas e sem marca pra cada
  cidade. Duas iterações até acertar: (1) a primeira geração via Canva
  (`design_type: desktop_wallpaper`) veio com um efeito indesejado de
  "moldura dentro da moldura" (foto nítida emoldurada por uma versão
  borrada de si mesma) apesar do prompt pedir explicitamente "no border,
  no frame" — corrigido recortando a camada interna com `sharp` (`.extract()`)
  antes de salvar; (2) a régua de conteúdo da foto HERO foi corrigida a
  pedido do usuário: ao contrário do logo (nunca texto), a foto HERO
  **deve** mostrar um caminhão limpa-fossa real com "DESENTUPIDORA" pintado
  na lateral — texto pintado em veículo é autêntico numa foto, diferente de
  texto num ícone de marca. Testado: o Canva acertou a ortografia da
  palavra em todas as 4 variações geradas (mas **sempre conferir
  visualmente antes de aprovar** — geradores de imagem erram texto com
  frequência).
  **Nova regra de nomenclatura de arquivo** (pedido do usuário): todo
  arquivo de imagem tem que ter nome sugestivo, incluindo cidade e/ou nome
  da desentupidora — nunca `logo.webp`/`hero.webp` genérico. Aplicado nas
  duas cidades: `logo-desentupidora-<cidade>.webp` e
  `desentupidora-<cidade>-<descrição-do-conteúdo>.webp`. De brinde, isso
  forçou a limpeza dos arquivos mortos de Linhares que já estavam
  documentados como problema (os PNGs de 3,8 MB duplicados, `logo.jpg`,
  `favicon.jpg` antigos) — todos removidos, restam só os 2 arquivos webp
  novos e nomeados corretamente. Detalhe completo do processo, do prompt
  final e das duas correções de curso em `PROMPT-IDENTIDADE-VISUAL.md`.
- **`(próximo commit)`** (29/08/2026) — **Bug visual real encontrado ao
  aplicar a primeira logo gerada por IA em Itabuna**: `Header.astro` (o
  componente realmente usado por `index.astro`/`[slug].astro` — diferente
  de `HeaderV1.astro`/`HeaderV2.astro`, que já estavam corretos) tinha as
  cores do cabeçalho **fixas em hexadecimal** (`background: #0f172a`,
  `#0284c7`, `#10b981`...) em vez de usar `var(--color-bg-dark)` /
  `var(--color-primary)` / `var(--color-accent)` da paleta da cidade. Na
  prática, **toda cidade fora da paleta `urgencia-azul-laranja` mostrava o
  cabeçalho azul-marinho genérico**, não a cor da sua própria paleta —
  só ficou visível ao colocar a logo amarela/âmbar de Itabuna
  (`industrial-amarelo`, `--color-bg-dark: #18181b`) dentro de um header
  ainda pintado de `#0f172a`. Corrigido replicando exatamente o padrão de
  variáveis já usado em `HeaderV1.astro`. Cidades com paleta diferente da
  azul-laranja que já foram publicadas antes desta correção **precisam ser
  republicadas** pra pegar o header certo (Cachoeiro/Poços de
  Caldas/Guarapuava usam a paleta azul por padrão então não foram afetadas
  visualmente, mas vale conferir).
  Criado também o prompt mestre de identidade visual
  (`.agents/skills/criar-site-desentupidora/PROMPT-IDENTIDADE-VISUAL.md`)
  com tamanhos exatos calibrados no CSS real do projeto, e testado de
  ponta a ponta gerando a primeira logo real via Canva MCP: **o Canva não
  exporta com fundo transparente pra designs `logo`** (o fundo é uma
  imagem raster real, sem locator_id editável — testado e confirmado, ver
  o próprio arquivo de prompt) — a solução funcional é pedir fundo sólido
  na cor hex exata da paleta, testado com desvio de 1-4 unidades RGB
  (imperceptível). Confirmado também que **o Canva não exporta em WebP**
  (só pdf/jpg/png/pptx/gif/mp4) — o fluxo correto é exportar PNG e converter
  com `npx --yes sharp-cli -i x.png -o x.webp -f webp -q 90`, apagando o
  PNG depois (reduziu 63,9 KB → 5,4 KB na logo real da Itabuna).
  **Correção sobre a própria correção, mesma sessão**: a primeira versão
  do prompt de logo pedia um "lockup" com símbolo + nome da empresa escrito
  dentro da imagem (900×300px) — errado, porque `Header.astro` já renderiza
  o nome como texto HTML separado; o resultado prático foi o nome aparecer
  duplicado na tela. Corrigido pra logo ser só ícone, sem texto, 512×512
  (1:1), igual ao favicon. Também trocado o símbolo abstrato genérico
  ("gota + raio", que o usuário leu como parecendo um microscópio) por um
  caminhão-tanque com mangueira visível — símbolo específico do negócio (o
  veículo real usado no serviço de limpeza de fossa), validado e publicado
  em Itabuna. Guia completo com o prompt final e a lição aprendida em
  `PROMPT-IDENTIDADE-VISUAL.md`.
  **Evolução da mesma sessão — transparência real, não mais "cor
  parecida"**: o usuário exigiu (regra inegociável) que toda logo tenha
  fundo transparente de verdade. Resolvido com chroma-key: gerar no Canva
  com fundo sólido de propósito (matéria-prima, não resultado final) e
  remover essa cor via novo script `apps/web-dashboard/scripts/
  removeLogoBackground.cjs` (usa `sharp`, adicionado como dependência real
  do `web-dashboard`) — lê os pixels crus, zera o alpha de qualquer pixel
  dentro de uma tolerância de distância RGB da cor de fundo. Testado e
  confirmado pixel a pixel (canto do fundo `alpha=0`, centro do ícone
  `alpha=255`, sem halo nas bordas) e publicado de verdade em Itabuna — o
  `.webp` final agora reporta "with alpha". Documentado como processo
  obrigatório de 2 passos em `PROMPT-IDENTIDADE-VISUAL.md`.
  **Também nesta sessão**: (1) aumentado o tamanho padrão da logo no
  header de 46px pra 64px (`Header.astro`), e criado um controle de
  tamanho ajustável de verdade no painel (`logoHeight`, slider 32-120px em
  `App.tsx`, propagado por `syncCityToAstro` em `server.cjs` e pelo tipo
  `CityConfig`); (2) corrigido bug real: **nenhum campo do painel
  atualizava o preview ao vivo automaticamente** — a documentação antiga
  deste guia afirmava existir um debounce de 600ms fazendo isso pra
  qualquer edição, o que **nunca existiu no código** (só troca de cidade ou
  "Salvar Alterações" atualizavam o iframe). Corrigido criando
  `syncPreviewLive` (debounce de 400ms) e ligando ao slider de tamanho da
  logo — os demais campos de texto continuam no comportamento antigo
  (só sincronizam ao salvar), por não terem sido pedidos; (3) corrigido
  `type="image/x-icon"` fixo no `<link rel="icon">` de `Layout.astro`,
  que estava sempre errado quando o favicon real era `.webp`/`.jpg` — agora
  calculado pela extensão real do arquivo.
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

-1. **Contraste de cor branco-sobre-paleta falha em 4 das 5 paletas —
    AGUARDANDO DECISÃO DO USUÁRIO.** Ver regra de ouro 13 acima pra
    números exatos. Afeta 10 das 12 cidades atuais. Landmark `<main>`
    ausente e ordem de heading pulando nível **já foram corrigidos** (as
    2 outras coisas achadas no mesmo teste) e aplicados nas 12 cidades.
0. **Conteúdo quase-duplicado entre cidades — CORRIGIDO e REPUBLICADO em
   30/08/2026.** Ver seção completa "✅ RISCO CRÍTICO: conteúdo
   quase-duplicado entre cidades" acima: as 10 cidades com conteúdo
   clonado ganharam H1/parágrafo/texto-sobre-a-cidade/FAQs/depoimentos
   únicos, com fatos reais de cada município, via
   `apply_unique_city_content.cjs`, e foram **republicadas de verdade**
   nos 3 provedores (confirmado por `curl` no conteúdo ao vivo). No
   caminho, achado e corrigido um 2º bug real no motor de deploy
   Cloudflare (projeto órfão criado a cada redeploy — ver "Motor de
   Deploy" e histórico acima). Ficaram 2 pendências novas: bairros
   fictícios/copiados em 4 cidades (aguardando decisão do usuário, risco
   de quebrar URL indexada) e o teto de escala dos 4 modelos do
   `cityGenerator.ts` (só relevante pra cidades novas). E 1 limpeza
   pendente: apagar o projeto órfão `desentupidora-curitiba-sns` (sufixo
   `-f0c`) criado na Cloudflare pelo bug antes de ser corrigido.
1. **Negociação de Markdown (AEO) só funciona em cidades no Cloudflare
   Pages** — confirmado em 30/08/2026 rodando o isitagentready.com de
   verdade contra uma cidade no Vercel (Cachoeiro de Itapemirim): Content
   Accessibility deu **0/1**, derrubando o nível de "Agent-Integrated"
   (4) pra "Bot-Aware" (2), mesmo com Discoverability e Bot Access Control
   iguais aos de uma cidade no Cloudflare. Causa: `functions/_middleware.js`
   é uma convenção **exclusiva do Cloudflare Pages** — no Vercel e
   provavelmente no Netlify esse arquivo é ignorado silenciosamente, sem
   erro nenhum no deploy. Afeta hoje Linhares, Cachoeiro, Porto Seguro,
   araucaria (Vercel) e Poços de Caldas (Netlify) — 5 das 11 cidades.
   **Não corrigido ainda** — precisa de uma Vercel Edge Middleware
   (`middleware.ts` na raiz, API diferente da do Cloudflare Worker) e,
   separadamente, uma Netlify Edge Function, reescrevendo a mesma lógica
   de negociação de `Accept: text/markdown` pra cada plataforma. Não é
   reaproveitável 1:1 entre as 3 hospedagens.
2. **`_headers` (formato Netlify/Cloudflare Pages) não funciona no
   Vercel** — **já corrigido** em 30/08/2026: o `Link` HTTP header
   (usado pro isitagentready.com descobrir `llms.txt`, política de
   privacidade e termos de uso) não aparecia em nenhuma cidade no Vercel,
   porque o Vercel não lê `_headers`, só `vercel.json`. Solução: criado
   `public/vercel.json` com o mesmo conteúdo do `Link` header (Astro copia
   pra `dist/` automaticamente igual já fazia com `_headers`, e os dois
   arquivos convivem sem conflito — Cloudflare/Netlify ignoram o
   `vercel.json` solto). Testado e confirmado com `curl -I` antes/depois.
3. **`/api/deploy-city/:id` (botão "Publicar") não roda a auditoria nem
   atualiza `auditScore`** — só `/api/build-city/:id` (botão "Build") faz
   isso. Publicar uma cidade sem antes/depois clicar em Build deixa o score
   na Central de Cidades desatualizado (visto em 29/08/2026 com Itabuna:
   ficou mostrando 90% com o site já 100% no ar). Corrigir: fazer
   `deploy-city` rodar `npm run audit` também (ou chamar a mesma lógica de
   `build-city`) antes de marcar `status: 'ativo'`.
4. **Editor estilo Elementor** (clicar no elemento pra editar, containers) —
   pedido explícito do usuário. Agora que o preview é o Astro real e já
   sincroniza ao vivo, esta é a próxima frente. Precisa: (a) um jeito de
   injetar overlay/contentEditable nas páginas Astro quando servidas em
   modo editor, (b) reconectar isso ao listener `handleMessage`/
   `SELECT_ELEMENT` que já existe em `App.tsx` mas está sem uso desde que o
   preview falso foi removido.
5. Qualidade de copy: alguns títulos de página de serviço ficam redundantes
   (ex: "Desentupidora de Desentupimento de Pia") — a palavra-chave está lá,
   mas o fraseado é estranho.
6. Depoimentos fabricados — usuário pediu pra não mexer por enquanto, mas é
   um risco real (propaganda enganosa) que vale revisitar no futuro.
7. A rota antiga `/api/preview/:id` (gerador de HTML falso) ficou morta no
   `server.cjs` — pode ser removida com segurança quando alguém for limpar
   código morto.
8. ~~**Deploy URLs quebradas em `cities.json`**~~ — **corrigido em
   30/08/2026**: Porto Seguro tinha um deploy do Vercel que expirou/sumiu
   (404, corrigido republicando); `araucaria.deployUrl` e
   `londrina.deployUrl` estavam com URL errada/lixo — corrigido apagando o
   campo e deixando o próprio deploy gerar um novo de verdade. Ver
   histórico de correções pra detalhes completos (inclusive o bug maior de
   `deployToCloudflarePages` nunca ler a URL real do wrangler, achado no
   mesmo mutirão).

---

## ⚙️ Scripts Úteis
- `npm run dev` (dentro de `apps/web-dashboard`): roda `server.cjs` + Vite
  juntos.
- `npm run dev` (dentro de `apps/site-template-astro`): sobe o Astro em
  `localhost:4321`.
- `npm run build` (dentro de `apps/site-template-astro`): gera o `dist/`
  real que é publicado — **sempre teste aqui antes de assumir que uma
  mudança de SEO funcionou**, não confie só em ler o `.astro`.
