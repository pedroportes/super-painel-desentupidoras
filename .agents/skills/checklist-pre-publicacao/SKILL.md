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
2. **Title ≤ ~60 caracteres, Meta Description ≤ ~155-160 caracteres** —
   contar caractere de verdade (`.length` em JS), nunca estimar de cabeça.
   Nomes de cidade compostos (Cachoeiro de Itapemirim, São José dos
   Pinhais, Vitória da Conquista) estouram fácil.
3. **Palavra-chave regional** (`[Serviço] em [Cidade] [UF]`) tem que
   aparecer no title, meta description, H1, primeira frase do primeiro
   parágrafo, **e no último H2 antes do rodapé** — confirmar que esse H2 é
   *literalmente* o último H2 renderizado (já quebrou 2x por reordenação
   de componente).
4. **Nunca inventar dado** (CNPJ, endereço, coordenadas GPS) — se não foi
   cadastrado de verdade, omitir o campo do schema, nunca usar placeholder.
5. **FAQs específicas da cidade**, nunca a mesma pergunta/resposta só
   trocando o nome.

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
- [ ] `<title>` contém a palavra-chave e a cidade certa
- [ ] **`<link rel="canonical">` bate exatamente com a URL que está sendo
      testada** (copiar um do outro, não só "parece certo")
- [ ] `og:url` e o campo `"url"` do schema JSON-LD também batem com a URL
      real
- [ ] Um trecho de FAQ ou depoimento específico daquela cidade aparece no
      HTML (prova de que não é conteúdo genérico)

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
