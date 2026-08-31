---
title: Sessão 30-31/08/2026 — Checklist, modelos, bairros e Render
date: 2026-08-31
tags:
  - super-painel-desentupidoras
  - sessao-dev
  - checklist
  - seo
  - acessibilidade
  - deploy
  - render
aliases:
  - Sessão checklist e modelos
  - Sessão bairros e Render
---

# Sessão 30-31/08/2026 — Checklist de publicação, contraste WCAG, 8 modelos, bairros reais e 4º provedor (Render)

> [!info] Contexto
> Nota de trabalho (Obsidian) espelhando o que já está registrado de
> forma canônica em [[CLAUDE_CODE_GUIDE]] e nas skills do projeto. Esta
> nota é um resumo navegável da sessão — pra detalhe técnico completo
> (números exatos, trechos de código, commits), ver sempre o guia
> principal, que é a fonte de verdade.

## O que motivou a sessão

Uma rodada anterior de correção de conteúdo duplicado entre cidades foi
verificada só pelo `<title>` de cada página via `curl` — e isso deixou
passar **bugs reais de infraestrutura**, um deles causando 404 em
produção que o usuário viu antes de mim (print de tela). Daí a regra
central que guiou o resto da sessão: **nunca verificar só o título,
sempre a página completa.**

## Achados e correções, em ordem cronológica

> [!bug] 1. Projeto órfão no deploy Cloudflare
> Nome do projeto ≠ subdomínio `.pages.dev` — reusar o slug errado criava
> um projeto novo a cada redeploy. Corrigido guardando o nome real
> (`cloudflareProjectName`) em vez de re-derivar da URL.

> [!bug] 2. Integração GitHub↔Vercel roubando o deploy manual
> Um `git push` disparava build automático da Vercel sem config de
> monorepo, sobrescrevendo o deploy correto do painel. Desconectada a
> integração Git dos 5 projetos Vercel via API.

> [!bug] 3. `deployUrl` nunca chegava no Astro
> Canonical/`og:url`/schema sempre usavam URL "calculada por fórmula" em
> vez da real — quebrado em Linhares, Curitiba e **Poços de Caldas**
> (canonical apontando pra domínio `.com.br` inexistente). Corrigido em
> `syncCityToAstro()` + `Layout.astro`.

> [!bug] 4. Zip do PowerShell corrompia o deploy Netlify
> `Compress-Archive` grava metadado Windows/FAT que faz o parser da
> Netlify trocar `/` por `\` na estrutura de pastas — CSS e imagens
> ficavam 404 silenciosamente. Corrigido com um criador de ZIP nativo em
> Node (`zipUtil.cjs`), sem dependência de shell.

> [!bug] 5. Caminho de imagem com casing errado
> Araucária/Curitiba com `logoUrl` apontando pra pasta com
> maiúscula/acento (`/images/Araucária/`) que não existe em disco.

> [!success] Resultado
> Criado `apps/web-dashboard/scripts/audit_live_sites.cjs` — audita as
> 11 (depois 12) cidades publicadas de ponta a ponta: HTML, CSS, imagem,
> título/descrição **dentro de faixa numérica exata**, canonical/og/schema
> batendo com a URL real. Nova skill
> `[[.agents/skills/checklist-pre-publicacao/SKILL|checklist-pre-publicacao]]`
> documenta as regras de ouro de infraestrutura pra isso nunca mais
> passar despercebido.

## Cidade de teste ponta a ponta: Blumenau-SC

Criada do zero pra validar todo o processo corrigido: conteúdo único
(colonização alemã, Oktoberfest, enchentes do Rio Itajaí-Açu), logo via
Canva + chroma-key, hero fotorrealista com ortografia conferida.

- **isitagentready.com**: 40/100, Nível 4 "Agent-Integrated"
- **PageSpeed Insights**: Performance 69 · Acessibilidade 92 · Boas Práticas 100 · SEO 100

A auditoria de acessibilidade dessa cidade nova revelou:

- Faltava `<main>` na home — corrigido.
- Heading pulava H1→H3 no card "Urgência 24h" do Hero — corrigido pra H2.
- **Contraste de cor**: 4 das 5 paletas falhavam WCAG AA (texto branco em
  botão). Medido com fórmula real (não estimativa): razões de 1,53 a
  4,10, mínimo exigido 3,0-4,5. **Corrigido** escurecendo `--color-primary`/
  `--color-accent` das 5 paletas até 4,5:1+, mantendo o matiz original.
  Ficou pendente: várias cores ainda hardcoded fora da variável de tema
  (documentado, não corrigido).

## Título e descrição: regra com piso, não só teto

Uma extensão de auditoria SEO no navegador marcou em **vermelho** um
título de 36 caracteres por ser **curto demais** — não só longo demais.
Regra nova: **título 40-60 caracteres, descrição 120-160**, com
`TITLE_MIN/MAX`/`DESC_MIN/MAX` checados de verdade no script de auditoria.

## 8 Modelos Estruturais (não só cor)

Pedido explícito do usuário: "modelo" tem que ser layout diferente, não
só paleta/texto em cima do mesmo HTML. Eram 4 modelos com só **2
esqueletos visuais reais** (2 pares duplicados). Construídos `HeroV3`
(foto de fundo cheia), `HeroV4` (foto ao lado sem form), `ServicesGridV3`
(sanfona/accordion) e `ServicesGridV4` (ícones em passos) — agora **8
modelos, 8 combinações únicas de Hero+Serviços**, nenhuma repetida.

Depois, a pedido do usuário ("não teria como ter um tipo de preview
antes de escolher"), cada card do seletor de modelo no painel ganhou uma
**miniatura real** (screenshot via Playwright do site de verdade
renderizado, não mockup) — `apps/web-dashboard/public/model-previews/*.webp`.

## Onde está a fonte de verdade

- [[CLAUDE_CODE_GUIDE]] — regras de ouro numeradas (agora até a 13),
  histórico de correções completo, pendências em ordem de prioridade.
- `.agents/skills/checklist-pre-publicacao/SKILL.md` — checklist
  obrigatório antes de qualquer publicação.
- `.agents/skills/criar-site-desentupidora/SKILL.md` — passo a passo de
  criação de cidade nova.
- `.agents/skills/rede-de-parceiros/SKILL.md` — regras da rede de
  parceiros/sites indicados.

## Atualização 31/08/2026 — bairros fictícios corrigidos

Outra IA, a pedido do usuário, fez uma varredura independente do painel e
confirmou o achado de bairros fictícios (ver pendência abaixo, que era da
sessão anterior). Usuário aprovou a correção ("acho melhor colocar
bairros reais e redirecionar para os reais") e ela foi aplicada:

> [!success] Correção aplicada e verificada em produção
> - Curitiba, São José dos Pinhais, Araucária e Londrina receberam listas
>   reais de bairros (confirmadas via Wikipédia/busca, não por memória).
> - Cada bairro fictício antigo agora tem redirect 301 (Cloudflare/Netlify,
>   via `_redirects`) ou 308 (Vercel, via `vercel.json`) pra home — nunca
>   pra um bairro novo qualquer, sem correspondência geográfica real.
> - Seguida a regra "testar 1, confirmar, só depois aplicar nas outras":
>   Curitiba primeiro (testado ao vivo com `curl`), depois as outras 3.
> - Reauditadas as 12 cidades depois — zero regressão.
>
> Detalhe técnico completo em [[CLAUDE_CODE_GUIDE]], seção "✅ Bairros
> fictícios/copiados — CORRIGIDO".

## Nova cidade: Santa Bárbara d'Oeste-SP, primeiro modelo novo em produção

Pedido do usuário ("suba uma nova cidade da planilha, modelo novo"):
primeira cidade real usando um dos 4 modelos estruturais novos —
`tecnico-especializado` (HeroV3 + ServicesGridV3, foco em vídeo
inspeção/diagnóstico). Escolhida a partir do ranking da planilha
`BANCO_CIDADES_DESENTUPIDORAS_2026` (ver [[mapa-oportunidades-expansao]]),
próxima colocada ainda não cadastrada.

> [!success] Conteúdo único com fato real e citável
> Fundada em 1869, sediou a primeira indústria têxtil da região e — o
> achado mais forte — fabricou em 1956 o **primeiro automóvel genuinamente
> brasileiro** (Romi-Isetta). 12 bairros reais confirmados por busca.
> Imagens (logo + hero) geradas via Canva MCP; logo veio com texto
> embutido ilegível sobre fundo claro — corrigido cortando só o ícone.

> [!bug] Bug real achado e corrigido: Netlify 401 em cidade nova
> Toda cidade NOVA publicada na Netlify nascia com `401 Login Redirect`
> na home inteira — o PATCH que desativa a proteção de login/SSO só
> rodava pro branch "site já existe", nunca no primeiro deploy. Corrigido
> em `deployEngine.cjs` (rodava sempre agora). Provavelmente afetava
> outras cidades Netlify no passado, mascarado por redeploy manual
> posterior.

Pontuação: `audit_live_sites.cjs` 13/13 sem falha, auditoria interna
Astro 100% (11/11 — achou e corrigiu no processo a regra "desentupidora"
tem que aparecer nas primeiras 30 palavras do 1º parágrafo, não só
"entupimento"), isitagentready.com 33/100 Nível 2 (Netlify, esperado),
PageSpeed mobile 68/95/100/100, navegação agêntica 3/3.

## Varredura completa das 13 cidades: mais 2 bairros fictícios + regra de ouro 15

Pedido do usuário: "veja se tem bairros fictícios nas outras cidades e
deixe isso como regra de ouro pra nunca mais inventar bairros". Todas as
13 cidades cross-checadas contra fonte real (WebSearch/Wikipédia), não
por memória — a maioria já estava limpa, inclusive nomes que pareciam
suspeitos (Batel/Santana em Guarapuava, Baiminas/Coronel Borges em
Cachoeiro) se confirmaram reais.

> [!bug] 2 achados reais, corrigidos
> - **Linhares**: um bairro literalmente chamado `"teste"` — sobra de
>   dado de teste publicada em produção. Trocado por `"Planalto"` (real).
> - **Poços de Caldas**: `"Zona Sul"` — não é fictício, mas também não é
>   um bairro: é uma macrorregião administrativa oficial da prefeitura.
>   Trocado por `"Jardim Kennedy"` (bairro real dentro dela).
>
> Corrigidos com o mesmo mecanismo de redirect já existente, verificados
> em produção, reauditadas as 13 cidades sem regressão.

**Regra de ouro 15** (nova, permanente) em
`.agents/skills/checklist-pre-publicacao/SKILL.md`: nunca inventar,
copiar de outra cidade, ou deixar valor de teste/nome de zona no campo
`bairros` — todo nome tem que ser confirmado por busca real. Também virou
item obrigatório do checklist de verificação (seção 3), não só algo que
se confere quando alguém pergunta.

## Render: 4º provedor de hospedagem

Pedido do usuário, com print do dashboard da Render criando uma API Key.
Investigado antes de programar: a Render **não tem API de upload direto
de arquivo/zip** como os outros 3 provedores — só publica puxando de um
repositório Git conectado. Perguntado ao usuário (`AskUserQuestion`) como
resolver isso; decisão: reusar o **próprio repositório deste projeto**
(pasta `dist-sites/<cidade>/` nele) em vez de criar repositório novo por
cidade — evita precisar de um token do GitHub à parte.

> [!success] `deployToRender()` implementado e testado de ponta a ponta
> Copia `dist/` pra `dist-sites/<id>/`, `git add/commit/push` só dessa
> pasta, cria (1ª vez) ou redeploya (guardando `renderServiceId`) o
> Static Site via API da Render, faz *polling* até `status: live`, nunca
> assume a URL — sempre lê `serviceDetails.url` da própria API.
>
> Testado com uma cidade descartável (`renderteste`, apagada depois):
> criação funcionando (home/CSS/imagens/bairro todos 200), redeploy sem
> mudança de conteúdo (achou e corrigiu um bug real — a checagem de "nada
> pra commitar" só reconhecia texto em inglês/português específico, e o
> git real devolveu uma terceira mensagem diferente), redeploy com
> mudança real (propaga depois do cache de CDN da Render expirar, até
> 5min — documentado pra não confundir com falha numa sessão futura).

Detalhe técnico completo (schema da API, ordem das chamadas) em
[[CLAUDE_CODE_GUIDE]], seção "🎨 Render — 4º provedor".

## Pendências em aberto (ver guia pra detalhe)

- [ ] Cores hardcoded fora da variável de tema (achado ao testar
      Blumenau, ainda não levantado por completo).
- [x] ~~Bairros fictícios/copiados em 4 cidades~~ — corrigido em 31/08/2026
      (ver acima).
- [ ] Depoimentos 100% fabricados (decisão antiga do usuário, mantida).
- [ ] Negociação de Markdown só funciona em Cloudflare, não Vercel/Netlify.
