# 🚀 Super Painel - Gestão & Editor Visual de Desentupidoras

Plataforma híbrida moderna para criação, edição visual ao vivo e publicação instantânea de landing pages de alta conversão e hiper-otimizadas para SEO, GEO e AEO (Agentes de IA) para empresas de desentupimento e limpa fossa em escala multi-cidades.

---

## 🏗️ Arquitetura do Sistema

O projeto é estruturado como um monorepo com duas aplicações integradas:

```
super-painel-desentupidoras/
├── apps/
│   ├── web-dashboard/           # Painel Administrativo em React (Vite + Node Server)
│   │   ├── src/                 # Interface do Painel & Editor Visual
│   │   ├── server.cjs           # API Server, Proxy e Standalone Preview Bridge
│   │   ├── scripts/             # Motor de Deploy Multi-Hospedagem (Vercel, Cloudflare, Netlify)
│   │   └── data/                # Banco de dados local (cities.json, settings.json)
│   │
│   └── site-template-astro/     # Motor Gerador de Sites Estáticos (Astro SSG)
│       ├── src/components/      # Componentes modulares responsivos
│       ├── src/layouts/         # Layout com Schemas, Canonical Dinâmico e Temas
│       └── src/pages/           # Rotas Home (index.astro) e Dinâmicas ([slug].astro)
│
├── CLAUDE_CODE_GUIDE.md         # Documentação Técnica e Guia para IAs / Desenvolvedores
├── PROGRESSO.md                 # Histórico detalhado de evolução e status do projeto
└── upload_github.ps1            # Script de automação de sincronização com o GitHub
```

---

## ✨ Principais Funcionalidades

### 1. Editor Visual em Tempo Real ("Smart Editor")
- Edição instantânea sem reload via `postMessage` bridge.
- Simulador de dispositivos integrado (Desktop, Tablet e Mobile).
- Seletor de rotas para alternar visualização entre a **Home**, páginas de **Bairros** e de **Serviços**.
- Suporte a acentuação e dead keys no teclado brasileiro ABNT2.

### 2. Motor de Deploy Multi-Hospedagem com 1 Clique
- **Vercel:** Compila e publica via Vercel CLI com nomes de projetos limpos (`desentupidora-[cidade]`).
- **Cloudflare Pages:** Cria o projeto automaticamente na conta via API/Wrangler e publica no domínio canônico definitivo `https://desentupidora-[cidade].pages.dev`.
- **Validação com Modal Oficial:** Modal com score 100%, status HTTP 200 OK, data/hora e link direto para o site no ar.

### 3. SEO / GEO / AEO de Alta Performance
- **Title e Meta Description Exatos:** Palavra-chave regional injetada perfeitamente.
- **Hierarquia H1 & Último H2:** H1 rigoroso no topo e H2 de autoridade antes do rodapé.
- **Canonical Dinâmico:** URL canônica real gerada em tempo de build, eliminando alertas de SEO.
- **6 FAQs Estratégicas:** Perguntas completas sem menção a preços fixos.
- **3 Depoimentos Reais:** Avaliações de 5 estrelas fatiadas por bairros locais.
- **Schemas JSON-LD:** `LocalBusiness`, `EmergencyService` e `FAQPage` automáticos por URL.
- **Pronto para Agentes de IA:** Endpoints nativos `/.well-known/ai-plugin.json`, `/.well-known/api-catalog`, `/llms.txt` e `/site-markdown`.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (v18+)
- NPM

### 1. Iniciar o Painel (Dashboard + API Server)
```bash
cd apps/web-dashboard
npm install
npm run dev
```
> O painel estará disponível em: `http://localhost:5000` (com API rodando na porta `5002`).

### 2. Iniciar o Motor Astro (Pré-visualização de Páginas Internas)
```bash
cd apps/site-template-astro
npm install
npm run dev
```
> O servidor Astro estará disponível em: `http://localhost:4321`.

---

## 🔒 Variáveis e Chaves de API
As chaves da Vercel, Cloudflare e Netlify são salvas localmente em `apps/web-dashboard/data/settings.json`, arquivo protegido e ignorado pelo `.gitignore`.
