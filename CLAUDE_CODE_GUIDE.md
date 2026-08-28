# 🤖 GUIA DE ARQUITETURA E INTEGRAÇÃO (Super Painel Desentupidoras)

Este documento atua como a documentação principal (Master Guide) do repositório, destinada a qualquer Inteligência Artificial (Claude, Gemini, ChatGPT) ou desenvolvedor humano que for dar manutenção ou criar novas funcionalidades neste projeto.

---

## 🎯 Objetivo do Projeto
O "Super Painel - Gestão & Editor Visual de Desentupidoras" é uma plataforma híbrida composta por um Painel Administrativo em React (Web Dashboard) e um gerador de sites estáticos super-otimizados em Astro.
O objetivo é escalar a criação de Landing Pages para Desentupidoras fatiadas por **cidade**, garantindo máxima pontuação em SEO (Search Engine Optimization), GEO (Geolocalização para Buscas Locais) e AEO (Answer Engine Optimization - otimização para IA generativas).

---

## 🏗️ Estado Atual e Arquitetura

O ecossistema é dividido em duas aplicações principais no formato monorepo:

### 1. Web Dashboard (Painel)
- **Localização:** `apps/web-dashboard/`
- **Frontend:** React (Vite) hospedado em `App.tsx`.
- **Backend/Proxy:** `server.cjs` (Roda na porta 5002 e exposto via proxy na 5000).
- **Funcionalidades:**
  - Gerenciamento de cidades via SQLite local.
  - Editor Visual "Smart Editor": Um editor visual real-time sem reload via `postMessage`.
  - **Lógica de Preview (MUITO IMPORTANTE):**
    - A aba "Home" é renderizada no Iframe a partir do `server.cjs` (linha ~460+) retornando um HTML puro com estilos injetados. Isso garante que as mudanças de texto reflitam instantaneamente.
    - As **Páginas Internas (Bairros e Serviços)** são renderizadas no Iframe puxando direto do motor do Astro (`http://localhost:4321`).
    - *Nota para IAs:* Ao alterar estilos ou adicionar componentes no Astro (ex: Mapa, Depoimentos, Responsividade), **você deve espelhar essas alterações no HTML hardcoded dentro de `server.cjs`** para que o Editor Visual não fique desalinhado com o site real.

### 2. Site Template Astro (Motor de Geração)
- **Localização:** `apps/site-template-astro/`
- **Funcionamento:** O Astro consome `src/data/cityConfig.json` para compilar as páginas estaticamente.
- **Estrutura de Rotas:**
  - `index.astro`: Gera a Home da cidade.
  - `[slug].astro`: Gera dinamicamente as páginas internas de Serviços e de Bairros.

---

## 🛡️ Regras de Ouro de SEO / GEO / AEO Implementadas

Ao modificar ou criar novas páginas (`[slug].astro` ou `index.astro`), as seguintes regras são estritamente obrigatórias e **já estão implementadas no estado atual**:

1. **Title e Meta Description Exatas:** Devem conter a palavra-chave regional (`[Serviço/Bairro] em [Cidade] [UF]`).
2. **H1 e 1º Parágrafo:** A palavra-chave exata deve estar no H1 e logo na primeira frase do primeiro parágrafo (controlado pelo objeto `pageSeo` em `[slug].astro`).
3. **Último H2:** Antes do rodapé, a página deve conter um H2 de autoridade local.
4. **Canonical URL Dinâmica de Produção:** O `Layout.astro` calcula dinamicamente a URL canônica com base no domínio de produção real (`.pages.dev`, `.vercel.app` ou domínio próprio), garantindo aprovação verde nas extensões de SEO e evitando `localhost:4321`.
5. **Robots e OpenGraph:** Todo o layout possui `<meta name="robots" content="index, follow" />`, tags OpenGraph (`og:title`, `og:description`, `og:url`, `og:site_name`) e Twitter Cards.
6. **FAQ AEO-Focused (Mínimo de 6 - Sem Menção a Preços):** 
   - A Home possui 6 FAQs ricas focadas em atendimento 24h, tempo de chegada, equipamentos rotativos (sem quebra-quebra), garantia por escrito e atendimento a empresas/condomínios.
   - A aba de Bairros reaproveita as 6 FAQs da Home injetando o nome do bairro.
   - A aba de Serviços usa 6 FAQs específicos daquele serviço.
7. **Depoimentos Reais (Mínimo de 3):** Exibição de 3 cards de avaliações com 5 estrelas, nomes e bairros locais da cidade.
8. **Schema.org Dinâmico:** O `Layout.astro` recebe metadados dinâmicos e injeta `LocalBusiness` e `FAQPage` específicos para a URL.
9. **Layout e Cores Globais:** `Layout.astro` aplica o atributo `data-theme` na tag `<html>` com `min-height: 100vh` no body.
10. **Segurança contra Mutações:** O Astro compila todas as rotas em um mesmo processo Node; portanto, **nunca faça mutação in-place em `cityData`** (ex: `cityData.seo = ...`), sempre passe props isoladas.

---

## 🚀 Motor de Deploy Multi-Hospedagem (`deployEngine.cjs`)
- **Vercel:** Executa `vercel deploy` autenticado via token, nomeia o projeto automaticamente com `desentupidora-[cidade]` e sanitiza a URL retornada.
- **Cloudflare Pages:** Cria o projeto automaticamente na conta via `wrangler pages project create` caso não exista, e faz o deploy com `wrangler pages deploy`, retornando o domínio canônico limpo `https://desentupidora-[cidade].pages.dev`.
- **Confirmação Visual no Painel:** Abre modal com status HTTP 200, data/hora e botão direto para abrir o site publicado, além de fixar uma barra verde de status no topo do editor.

---

## ⚙️ Scripts Úteis
- **`upload_github.ps1`**: Faz o commit e push de todas as alterações.
- `npm run dev`: (na pasta dashboard) Roda simultaneamente o `server.cjs` e o `vite`.
- `npm run dev`: (na pasta astro) Sobe o servidor na porta 4321.
