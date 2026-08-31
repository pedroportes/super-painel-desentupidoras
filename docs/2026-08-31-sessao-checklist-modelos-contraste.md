---
title: Sessão 30-31/08/2026 — Checklist, contraste e 8 modelos
date: 2026-08-31
tags:
  - super-painel-desentupidoras
  - sessao-dev
  - checklist
  - seo
  - acessibilidade
aliases:
  - Sessão checklist e modelos
---

# Sessão 30-31/08/2026 — Checklist de publicação, contraste WCAG e 8 modelos estruturais

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

## Pendências em aberto (ver guia pra detalhe)

- [ ] Cores hardcoded fora da variável de tema (achado ao testar
      Blumenau, ainda não levantado por completo).
- [x] ~~Bairros fictícios/copiados em 4 cidades~~ — corrigido em 31/08/2026
      (ver acima).
- [ ] Depoimentos 100% fabricados (decisão antiga do usuário, mantida).
- [ ] Negociação de Markdown só funciona em Cloudflare, não Vercel/Netlify.
