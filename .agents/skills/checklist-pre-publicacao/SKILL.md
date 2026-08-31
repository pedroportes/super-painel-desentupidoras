---
name: checklist-pre-publicacao
description: Checklist obrigatório e regras de ouro invioláveis a rodar SEMPRE antes de considerar uma página/cidade "publicada" ou "pronta" — build local, verificação de página completa (não só título), SEO/GEO/AEO, e cuidados de infraestrutura de deploy. Ativar sempre que for publicar/redeployar qualquer cidade, criar uma cidade nova, ou depois de qualquer mudança em massa.
---

# ✅ Checklist Pré-Publicação — Regras de Ouro Invioláveis

Esta skill deve ser ativada **sempre que**: for publicar ou redeployar
qualquer cidade, criar uma cidade nova do zero, mexer em código que afeta
todas as cidades de uma vez (`server.cjs`, `deployEngine.cjs`,
`Layout.astro`, `cityGenerator.ts`), ou antes de dizer ao usuário que algo
"está no ar" / "está pronto".

**Motivo de existir**: em 30/08/2026, uma sessão de correção de conteúdo
duplicado verificou o resultado só com `curl` no `<title>` de cada página,
declarou sucesso, e **3 bugs de infraestrutura graves passaram batido** —
um deles resultou em 404 real em produção, visto pelo usuário antes de mim.
Título certo não significa página funcionando. Esta skill existe pra isso
nunca se repetir.

---

## 🚫 Regras de Ouro — JAMAIS PODEM SER QUEBRADAS

### Conteúdo (SEO/GEO/AEO)
1. **Nunca publicar conteúdo clonado entre cidades.** H1, primeiro
   parágrafo, texto "sobre a cidade", FAQs e depoimentos têm que ser
   escritos com fatos reais e específicos da cidade (geografia, clima,
   economia local, um problema hidráulico plausível pra região) — nunca
   `generateUniqueCityContent()` ou qualquer template direto pra produção
   sem reescrever. Isso é risco real de penalização Google por "scaled
   content abuse" (ver [`CLAUDE_CODE_GUIDE.md`](../../../CLAUDE_CODE_GUIDE.md),
   seção "RISCO CRÍTICO: conteúdo quase-duplicado").
2. **Title entre 40 e 60 caracteres (páginas escritas à mão: home/cidade),
   80 no teto pra páginas de serviço/bairro AUTO-GERADAS (ver regra 16);
   Meta Description sempre entre 120 e 160 caracteres — faixa NUMÉRICA com
   piso e teto, nunca só um máximo.** Contar caractere de verdade
   (`.length` em JS), nunca estimar de cabeça. Nomes de cidade compostos
   (Cachoeiro de Itapemirim, São José dos Pinhais, Vitória da Conquista)
   estouram o teto fácil; nomes curtos (Linhares, Itabuna) ficam abaixo do
   piso fácil — achado real 30/08/2026: uma extensão de auditoria SEO
   marcou em vermelho um título de 36 caracteres por ser curto demais, não
   por estourar nada. **Isso vale pra TODA página do site, não só a
   home** — achado real 31/08/2026 (regra 16): título/descrição de
   página de serviço/bairro estouravam até 79 caracteres sem que ninguém
   percebesse, porque nada auditava essas páginas. `apps/web-dashboard/
   scripts/audit_live_sites.cjs` (produção) e `apps/site-template-astro/
   scripts/seoGeoAuditor.js` (build local, ver regra 16) conferem essa
   faixa automaticamente.
3. **Palavra-chave regional** (`[Serviço] em [Cidade] [UF]`) tem que
   aparecer no title, meta description, H1, primeira frase do primeiro
   parágrafo, **e no último H2 antes do rodapé** — confirmar que esse H2 é
   *literalmente* o último H2 renderizado (já quebrou 2x por reordenação
   de componente). **Vale pra TODA página, inclusive as de serviço e
   bairro geradas por template** (`[slug].astro`) — não só a home; a
   palavra literal tem que ser `"desentupidora"` (não basta
   `"desentupimento"`), inclusive na meta description, que antes desta
   sessão nunca era checada por palavra-chave (só por tamanho). Ver regra
   16.
4. **Nunca inventar dado** (CNPJ, endereço, coordenadas GPS) — se não foi
   cadastrado de verdade, omitir o campo do schema, nunca usar placeholder.
5. **FAQs específicas da cidade**, nunca a mesma pergunta/resposta só
   trocando o nome.
5b. **Bairros (`city.bairros`) têm que ser nomes reais, confirmados por
   busca — nunca inventados, copiados de outra cidade, ou valor de teste.**
   Ver regra de ouro 15 abaixo pro detalhe completo e os achados reais.

### Infraestrutura de Deploy (achado em 30/08/2026 — o que faltava aqui)
6. **A URL/canonical/og:url/schema publicados têm que ser a URL REAL de
   deploy, nunca uma URL "calculada por fórmula".** Provedores como Vercel
   e Cloudflare Pages podem atribuir um sufixo aleatório ao subdomínio
   quando há colisão de nome — se o código assume
   `https://desentupidora-<cidade>.vercel.app` sem checar a URL real
   retornada, o canonical fica **apontando pra um domínio que não existe
   ou que não é o publicado**. Sempre usar o campo salvo de `deployUrl`
   real (nunca recalcular), e sempre confirmar que esse campo realmente
   chega até o Astro (`cityConfig.json`) — já existiu bug de
   `syncCityToAstro()` simplesmente esquecer de repassar esse campo.
   **Achado real 31/08/2026 (São Caetano do Sul, 1ª cidade Render)**: o 1º
   deploy de QUALQUER cidade nova builda o site antes de a URL real
   existir (é a resposta do próprio deploy que revela a URL) — `server.cjs`
   / `/api/deploy-city/:id` agora detecta isso (URL real ≠ URL usada no
   build) e refaz build+deploy uma 2ª vez com a URL certa. Sempre confirmar
   com `curl` (cache-busting) que canonical/`og:url`/`schema.url` batem com
   a URL real, mesmo depois de um deploy "de sucesso".
7. **Nome do projeto na nuvem ≠ subdomínio público.** Cloudflare Pages
   (nome do projeto vs `.pages.dev`) e potencialmente outros provedores
   guardam esses dois valores separados. Nunca derivar o nome do projeto a
   partir de um pedaço da URL salva — guardar o nome real retornado pela
   API na primeira vez (`cloudflareProjectName` em `cities.json`) e sempre
   reusar esse valor. Fazer errado cria um **projeto órfão novo a cada
   redeploy**.
8. **Nenhuma integração automática (GitHub↔Vercel/Netlify/Cloudflare) pode
   correr por trás do deploy manual do painel.** Se um projeto de
   hospedagem tiver integração Git conectada, todo `git push` dispara um
   build concorrente e não controlado pelo `deployEngine.cjs` — sem
   comando de build/pasta de saída configurados pra esse monorepo, esse
   build paralelo falha e **rouba o alias de produção do deploy correto**,
   causando 404 horas depois de um "sucesso" confirmado. Antes de declarar
   um provedor "ok", checar (via API do provedor) se o projeto tem link
   Git ativo e desconectar se tiver.
9. **Caminho de imagem tem que bater exatamente com a pasta real em
   disco** (`public/images/<pasta>/`) — inclusive maiúscula/minúscula e
   acento. Um `logoUrl`/`heroImage` gerado por concatenação de string a
   partir do nome "bonito" da cidade (`city.cidade`, com acento/maiúscula)
   em vez do slug (`city.id`, sempre minúsculo/sem acento) quebra a imagem
   silenciosamente (404) sem quebrar o build.
10. **Nunca aplicar uma mudança em lote (redeploy de todas as cidades,
    script que varre `cities.json` inteiro, mudança de infraestrutura) sem
    testar numa cidade só primeiro, verificar de verdade, e só depois
    replicar pras demais.** Regra explícita do usuário, 30/08/2026.
11. **Nunca gerar o zip de deploy via `Compress-Archive` do PowerShell.**
    Ele grava metadado de origem Windows/FAT que faz o parser da Netlify
    reinterpretar `/` como `\` na estrutura de pastas — o HTML da raiz
    funciona, mas CSS, imagens e qualquer página em subpasta ficam 404
    silenciosamente. Usar sempre `apps/web-dashboard/scripts/zipUtil.cjs`
    (zip nativo em Node, sem shell).
12. **Toda página precisa de um `<main>` envolvendo o conteúdo
    principal, e heading nunca pode pular nível** (h1 → h3 sem h2 no
    meio) — achado real rodando PageSpeed Insights numa cidade nova
    (Blumenau, 30/08/2026): `index.astro` não tinha `<main>`, e o card
    "Urgência 24h" do Hero era `<h3>` logo depois do `<h1>`. Confirmar
    isso sempre que mexer na composição de uma página (`index.astro`,
    `[slug].astro`) ou em qualquer componente com heading próprio.
13. **Ao gerar logo/favicon no Canva pedindo um fundo sólido num hex
    exato, nunca confiar que o Canva respeitou o hex.** Achado real: a
    cor de fundo pedida (`#052e16`) saiu bem diferente na prática
    (`~#05553e`). Antes de rodar `removeLogoBackground.cjs`, **amostrar
    a cor real de um pixel de canto da imagem gerada** (ex: via `sharp`
    lendo o buffer raw) e usar essa cor real no chroma-key, não o hex do
    prompt.
14. **Cor de texto branco sobre `--color-primary`/`--color-accent` da
    paleta pode não ter contraste suficiente — medir de verdade (fórmula
    WCAG), nunca assumir que uma cor "parece escura o bastante".**
    Achado real (30/08/2026): 4 das 5 paletas do projeto falham contraste
    WCAG AA pra texto branco em botão/badge — ver regra de ouro 13 e
    pendência -1 do `CLAUDE_CODE_GUIDE.md` pros números exatos e o
    porquê de ainda não estar corrigido (decisão de marca, não só bug).
15. **JAMAIS inventar, copiar de outra cidade, ou usar valor de teste no
    campo `bairros` — todo nome tem que ser um bairro real, confirmado por
    busca (WebSearch/Wikipédia/site de CEP), nunca por memória.** Cada
    bairro vira uma URL própria indexável (`/[slug]`), e um nome fictício
    ou errado é conteúdo enganoso publicado como se fosse real, além de
    risco de SEO/GEO — um endereço que não existe não serve pra achar a
    empresa perto de casa. Achados reais confirmados em 31/08/2026:
    - **Curitiba** publicada com a lista de bairros REAL de **Linhares**
      (Interlagos, Conceição, Avisos etc. — Espírito Santo, não Paraná).
    - **São José dos Pinhais, Araucária e Londrina** compartilhando a
      mesma lista genérica fictícia (`Jardim América, Bela Vista, São
      José, Santa Cruz, Vila Nova, Planalto, Bairro Alto`) — nomes que não
      existem de verdade em nenhuma das três.
    - **Linhares** com um bairro literalmente chamado `"teste"` — sobra
      de dado de teste nunca limpa, publicada em produção.
    - **Poços de Caldas** com `"Zona Sul"` — não é fictício, mas também
      não é um bairro: é uma macrorregião administrativa da prefeitura,
      que engloba vários bairros reais (ex: Jardim Kennedy). Usar sempre o
      nome do bairro específico, nunca o nome de uma zona/região.
    **Ao trocar bairros fictícios por reais**: cada bairro antigo já pode
    estar indexado pelo Google como URL própria — nunca simplesmente
    apagar/trocar o nome. Sempre gerar redirect 301/308 permanente do
    slug antigo pra home (nunca pra um bairro novo qualquer, sem
    correspondência geográfica real) — ver `bairrosAntigos` +
    `writeBairroRedirects()` em `server.cjs`, que já faz isso
    automaticamente a partir da lista antiga preservada nesse campo.
16. **JAMAIS auditar só a home — TODA página do site (serviço, bairro,
    contato, política, termos) tem que passar pelas mesmas checagens de
    SEO/GEO/estrutura.** Achado real 31/08/2026 (São Caetano do Sul,
    achado pelo usuário com uma extensão SEO num navegador, não pela
    própria auditoria interna): `seoGeoAuditor.js` **sempre** só leu
    `dist/index.html` — nenhuma das dezenas de páginas de serviço/bairro
    de qualquer cidade jamais foi auditada de verdade, e foi exatamente aí
    que ficaram escondidos, em produção, em várias cidades ao mesmo tempo:
    - **Título estourando o teto** (até 79 caracteres: "Desentupidora de
      Desentupimento de Vaso Sanitário em Cachoeiro de Itapemirim ES") —
      o próprio nome do serviço já vinha prefixado com "Desentupimento
      de"/"Desobstrução de" em `cities.json`, e o template duplicava o
      conceito colando "Desentupidora de" na frente de novo.
    - **Meta description sem a palavra-chave `"desentupidora"`** — a
      fórmula-padrão de `server.cjs` (usada por toda cidade sem
      `metaDescription` customizado, ou seja, praticamente todas) dizia
      "Especialistas em **desentupimento**...", nunca "desentupidora".
      Esse check nem existia antes desta sessão — só tamanho era
      verificado, nunca a palavra-chave dentro da description.
    - **Meta description abaixo do piso de 120** (chegava a 96 caracteres
      pra serviço/bairro de nome curto) — o template original nunca tinha
      sido calibrado pro caso curto, só testado de olho no caso comprido.
    - **Último `<h2>` de página de serviço sem a palavra `"desentupidora"`**
      (dizia só o nome do serviço, ex: "Por que somos a melhor opção para
      desentupimento de vaso sanitário...").
    - **Links internos pra bairro/serviço sem barra final**
      (`href="/fundacao"`) enquanto o canonical da própria página usa
      barra final (`.../fundacao/`) — cria duas URLs "diferentes" pra
      Google pra mesma página; achado via extensão SEO que visitou pelo
      link (sem barra) e comparou com o canonical (com barra) da página
      alvo.
    - **`<main>` ausente** nas 3 páginas institucionais (`/contato/`,
      `/politica-de-privacidade/`, `/termos-de-uso/`) de TODA cidade —
      usavam `<div>` no lugar, mesma classe de bug já documentada na
      regra 12, mas nunca corrigida nessas 3 páginas especificamente.

    **Corrigido definitivamente, não só nesta cidade**: `seoGeoAuditor.js`
    agora varre recursivamente **todo** `index.html` dentro de `dist/`
    (home + cada serviço + cada bairro + institucionais) e roda: título
    com `"desentupidora"` + faixa de tamanho por tipo de página (40-60 pra
    home, 40-80 pra serviço/bairro — nome de serviço/cidade composto
    empurra o teto, documentado como tensão aceita na regra 2), meta
    description com `"desentupidora"` + faixa 120-160, H1/1º parágrafo/
    último H2 com a palavra-chave, `<main>` presente, e **todo `href`
    interno de conteúdo termina com `/`** (exceto rotas de arquivo único
    tipo `/site-markdown`). `[slug].astro` e a fórmula-padrão de
    `server.cjs` foram reescritos com fallback de 2-3 níveis (versão longa
    → versão média → nunca corta o nome do serviço/bairro/cidade em si)
    pra caber na faixa em qualquer combinação real das 14 cidades
    cadastradas. **Rodar `npm run audit` (ou `/api/build-city/:id`) depois
    de QUALQUER mudança em `[slug].astro`, `Header.astro`, `Footer.astro`,
    `Layout.astro` ou nas fórmulas de SEO de `server.cjs` — o score de
    100% agora só é confiável porque cobre todas as páginas, não porque a
    home passou.**

---

## 📋 Checklist — rodar antes de dizer "está no ar"

Para **cada cidade** que for publicada ou redeployada:

### 1. Build local
- [ ] `npm run build` roda sem erro na pasta `apps/site-template-astro`
- [ ] `auditScore` retornado por `/api/build-city/:id` é 100 (ou, se não
      for, entender exatamente por que antes de prosseguir)

### 2. Deploy
- [ ] `/api/deploy-city/:id` retornou `success: true`
- [ ] A URL retornada é a URL **real** (não assumida) — se o provedor for
      Cloudflare ou Vercel, considerar confirmar via API do provedor que
      não foi criado um projeto/domínio novo por engano

### 3. Verificação da página publicada — **NUNCA SÓ O `<title>`**
- [ ] `curl` na home real: status 200
- [ ] Pelo menos 1 arquivo CSS referenciado no HTML: status 200 (não só
      "está no `<link>`", testar o arquivo de verdade)
- [ ] Pelo menos 1 imagem referenciada no HTML (logo ou hero): status 200
- [ ] `<title>` contém a palavra-chave e a cidade certa **e tem entre 40
      e 60 caracteres** (não só checar presença de texto — medir
      `.length` de verdade)
- [ ] `<meta name="description">` tem entre 120 e 160 caracteres
- [ ] **`<link rel="canonical">` bate exatamente com a URL que está sendo
      testada** (copiar um do outro, não só "parece certo")
- [ ] `og:url` e o campo `"url"` do schema JSON-LD também batem com a URL
      real
- [ ] Um trecho de FAQ ou depoimento específico daquela cidade aparece no
      HTML (prova de que não é conteúdo genérico)
- [ ] **Cada nome em `city.bairros` foi confirmado real por busca**
      (WebSearch/Wikipédia/site de CEP) — nunca por memória, nunca copiado
      de outra cidade, nunca valor de teste (`"teste"` etc.), nunca nome de
      zona/região (`"Zona Sul"` etc.) no lugar de um bairro específico

### 4. Validação externa (pelo menos numa leva de publicação, não precisa
   toda vez, mas obrigatório antes de considerar a cidade "pronta de
   verdade")
- [ ] [isitagentready.com](https://isitagentready.com/) rodado contra a
      URL real
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) (mobile) rodado
      contra a URL real

### 5. Se a mudança afeta MAIS de uma cidade
- [ ] Rodar o checklist completo (1-3) numa cidade só primeiro
- [ ] Reportar o resultado ao usuário / confirmar que passou
- [ ] Só então replicar pras demais cidades
- [ ] Rodar pelo menos a verificação da seção 3 em CADA cidade da leva, não
      só na primeira

---

## Onde estão os bugs reais que geraram essa skill

Ver `CLAUDE_CODE_GUIDE.md`, seção "🚀 Motor de Deploy" e o histórico de
correções datado 30/08/2026, pra contexto completo de cada bug (projeto
órfão Cloudflare, integração GitHub↔Vercel roubando alias, `deployUrl`
nunca repassado pro Astro, caminho de imagem com casing errado).
