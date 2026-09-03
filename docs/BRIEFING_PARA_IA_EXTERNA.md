---
title: Briefing Completo — Super Painel Desentupidoras (pra qualquer IA executar sem erro)
date: 2026-09-01
tags:
  - super-painel-desentupidoras
  - briefing
  - handoff
---

# Briefing Completo — Super Painel Desentupidoras

> Este documento é autossuficiente: uma IA que nunca viu este projeto deve
> conseguir criar/corrigir uma cidade sem repetir nenhum dos bugs reais já
> encontrados e corrigidos aqui. Se você é uma IA lendo isto: siga as
> regras de ouro **à risca**, na ordem, e rode os comandos de verificação
> **de verdade** antes de dizer que algo está pronto — não estime, não
> "acho que está certo".

---

## 1. O que é o projeto

Um sistema que gera e publica dezenas de sites estáticos de "desentupidora"
(empresa de desentupimento/limpeza de fossa), um por cidade brasileira,
cada um num domínio/subdomínio próprio. Duas partes:

1. **Painel (`apps/web-dashboard/`)** — app React + backend Express
   (`server.cjs`, porta 5002) que edita o "banco de dados" das cidades
   (`apps/web-dashboard/data/cities.json`, um array de objetos, um por
   cidade) e dispara build/deploy.
2. **Gerador Astro (`apps/site-template-astro/`)** — template estático que
   lê **um único arquivo**, `apps/site-template-astro/src/data/cityConfig.json`
   (dados de UMA cidade por vez — o painel escreve nele antes de cada
   build), e gera o site inteiro em `dist/` via `npm run build`.

Fluxo: `cities.json` (todas as cidades) → painel escolhe 1 → escreve em
`cityConfig.json` (`syncCityToAstro()` em `server.cjs`) → `astro build` →
`dist/` → publicado no provedor de hospedagem da cidade (Cloudflare Pages,
Vercel, Netlify ou Render — 4 provedores suportados, cada cidade usa 1,
salvo em `city.hospedagem`).

**Nunca editar `cityConfig.json` como fonte de verdade** — ele é
sobrescrito a cada build/deploy de qualquer cidade. A fonte de verdade é
sempre `cities.json`.

---

## 2. Por que este documento existe

Numa sessão anterior, o mesmo tipo de erro foi cometido e corrigido
repetidas vezes porque a verificação era refeita manualmente (curl avulso)
a cada sessão e sempre pulava algum ponto. O usuário pediu explicitamente
que isso pare de se repetir. Por isso este documento junta TUDO — regras,
comandos, bugs já corrigidos, e o que ainda falta — num lugar só.

---

## 3. Regras de Ouro — JAMAIS PODEM SER QUEBRADAS

### Conteúdo (SEO/GEO/AEO)

**R1 — Nunca conteúdo clonado entre cidades.** H1, primeiro parágrafo,
"sobre a cidade", FAQs e depoimentos têm que ser escritos com fatos reais
e específicos daquela cidade (geografia, clima, economia local, um
problema hidráulico plausível pra região). Nunca usar a função geradora
(`generateUniqueCityContent()` em `cityGenerator.ts`) direto pra produção
sem reescrever manualmente o texto. Risco real: penalização Google por
"scaled content abuse" e "doorway pages" — cada cidade é um domínio
separado, então o Google trata como uma REDE de sites do mesmo operador,
não como páginas internas de 1 site só; uma ação manual pode afetar vários
domínios de uma vez.

**R2 — Faixas numéricas de título/descrição (piso E teto, não só um
máximo):**
- Título de página **escrita à mão** (home/cidade): **40–60 caracteres**.
- Título de página **auto-gerada** (serviço/bairro, template `[slug].astro`):
  **40–80 caracteres** (nome de serviço + nome de cidade compostos podem
  empurrar o teto — aceito até 80 em vez de cortar o nome real).
- Meta description: **sempre 120–160 caracteres**, qualquer tipo de página.
- Contar caractere de verdade (`string.length` em JS), nunca estimar de
  cabeça. Nomes de cidade compostos (Cachoeiro de Itapemirim, São José dos
  Pinhais, Vitória da Conquista) estouram o teto fácil; nomes curtos
  (Linhares, Itabuna) ficam abaixo do piso fácil.

**R3 — Palavra-chave regional obrigatória.** A palavra literal
`"desentupidora"` (não basta `"desentupimento"`) tem que aparecer em:
title, meta description, H1, primeira frase do primeiro parágrafo, **e no
último `<h2>` antes do rodapé** (confirmar que é *literalmente* o último
H2 renderizado — isso já quebrou por reordenação de componente). Vale pra
TODA página, inclusive serviço e bairro gerados por template.

**R4 — Nunca inventar dado.** CNPJ, endereço, coordenadas GPS: se não foi
cadastrado de verdade, **omitir o campo**, nunca usar placeholder/exemplo.

**R5 — FAQs específicas da cidade**, nunca a mesma pergunta/resposta só
trocando o nome.

**R6 — Bairros (`city.bairros`) SEMPRE reais, confirmados por busca**
(WebSearch/Wikipédia/site de CEP oficial) — **nunca por memória, nunca
copiado de outra cidade, nunca valor de teste** (`"teste"` etc.), **nunca
nome de zona/região administrativa** (ex: "Zona Sul") no lugar de um
bairro específico. Mínimo recomendado: **15 a 30 bairros principais**.
Cada bairro vira uma URL própria indexável (`/[slug-do-bairro]/`) — um
nome errado é conteúdo enganoso publicado como se fosse real.

  - **Achados reais que geraram esta regra**: Curitiba foi publicada com a
    lista de bairros REAL de Linhares (cidade errada, estado errado);
    3 cidades (São José dos Pinhais, Araucária, Londrina) compartilhavam
    a mesma lista fictícia genérica; Linhares tinha um bairro literalmente
    chamado `"teste"`; Poços de Caldas tinha `"Zona Sul"` (região, não
    bairro).
  - **Ao trocar bairro fictício por real**: o slug antigo pode já estar
    indexado pelo Google — nunca simplesmente apagar. Preservar a lista
    antiga em `city.bairrosAntigos` e deixar `writeBairroRedirects()`
    (em `server.cjs`) gerar redirect 301/308 permanente do slug antigo
    pra home (nunca pra um bairro novo qualquer sem correspondência
    geográfica real).

### Infraestrutura de Deploy

**R7 — A URL/canonical/og:url/schema publicados têm que ser a URL REAL de
deploy, nunca calculada por fórmula.** Provedores podem atribuir sufixo
aleatório em colisão de nome. Sempre usar `city.deployUrl` salvo (nunca
recalcular), e confirmar que chega até `cityConfig.json`.
  - **Achado real**: o 1º deploy de qualquer cidade NOVA builda o site
    ANTES de a URL real existir (é a própria resposta do deploy que revela
    a URL) — então o 1º build sempre usa uma URL calculada/fallback errada
    no canonical. `server.cjs` (`/api/deploy-city/:id`) já detecta isso e
    refaz build+deploy uma 2ª vez com a URL certa — não desfazer essa
    lógica.

**R8 — Nome do projeto na nuvem ≠ subdomínio público** (ex: Cloudflare
Pages). Guardar o nome real retornado pela API na 1ª vez
(`cloudflareProjectName`/`renderServiceId` em `cities.json`) e sempre
reusar — senão cada redeploy cria um projeto órfão novo.

**R9 — Nenhuma integração Git automática pode rodar por trás do deploy
manual do painel.** Um projeto de hospedagem com Git conectado dispara
build concorrente descontrolado a cada `git push`, que pode roubar o alias
de produção. Checar via API do provedor e desconectar se existir. (Exceção
conhecida e intencional: Render, que só publica via Git por natureza — ver
seção 6.)

**R10 — Caminho de imagem tem que bater exatamente com a pasta real em
disco**, inclusive maiúscula/minúscula e acento. Gerar `logoUrl`/`heroImage`
sempre a partir do slug (`city.id`, minúsculo/sem acento), nunca do nome
"bonito" (`city.cidade`).

**R11 — Nunca aplicar mudança em lote (redeploy de todas as cidades,
script que varre `cities.json` inteiro) sem testar numa cidade só
primeiro, verificar de verdade, e só depois replicar.**

**R12 — Nunca gerar zip de deploy via `Compress-Archive` do PowerShell**
(quebra estrutura de pastas na Netlify). Usar sempre
`apps/web-dashboard/scripts/zipUtil.cjs`.

**R13 — Toda página precisa de exatamente 1 `<main>`** envolvendo o
conteúdo principal, e **heading nunca pode pular nível** (h1 → h3 sem h2
no meio).

**R14 — Ao gerar logo/favicon com fundo sólido pedido por hex exato, nunca
confiar que a ferramenta respeitou o hex.** Amostrar a cor real de um
pixel da imagem gerada antes de usar em chroma-key.

**R15 — Contraste de texto branco sobre `--color-primary`/`--color-accent`
da paleta pode falhar WCAG AA — medir de verdade (fórmula de contraste),
nunca assumir "parece escura o bastante".**

**R16 — JAMAIS auditar só a home.** TODA página (serviço, bairro, contato,
política, termos) tem que passar pelas mesmas checagens. Ver seção 5 —
comando único que já faz isso.

**R17 — Nunca reconstruir verificação manualmente (curl avulso).** Usar
sempre o comando único da seção 5.

---

## 4. Passo a passo — criar uma cidade nova

1. **Cadastro em `cities.json`**: `id` (slug), `cidade`, `uf`, `ddd`,
   `populacao`, `empresaNome`, `whatsapp`/`telefoneFixo` (sem inventar),
   `endereco`/`cnpj` (só se real, senão deixar `""`), `modeloTemplate`
   (ver lista de modelos abaixo), `hospedagem`, `paletaCores`,
   `heroVariant`, `servicesVariant`.
2. **Bairros**: pesquisar de verdade (WebSearch/Wikipédia) e listar 15-30
   reais — ver R6.
3. **Conteúdo único da home**: escrever à mão `h1Title`, `firstParagraph`,
   `ctaButtonText`, `lastH2`, `aboutCityTitle`, `aboutCityText`, 6 `faqs`,
   3 `testimonials` — com fatos reais da cidade (história, indústria,
   geografia). NÃO usar o texto padrão do `modeloTemplate` sem reescrever
   — ver R1.
4. **Identidade visual**: logo (ícone puro, sem texto, fundo transparente
   via chroma-key), favicon (mesmo ícone simplificado), hero (foto
   realista de caminhão de desentupidora, com texto pintado no caminhão
   correto ortograficamente) — 3 arquivos DIFERENTES, nunca reaproveitar
   um arquivo pra dois campos. Salvar em
   `apps/site-template-astro/public/images/<cityId>/` com nome descritivo
   (`logo-desentupidora-<cityId>.webp`, não `logo.webp` genérico).
5. **Build local**: `POST /api/build-city/:id` — builda e roda a
   auditoria interna (`seoGeoAuditor.js`). Só prosseguir com
   `auditScore: 100`.
6. **Deploy real**: `POST /api/deploy-city/:id` — publica de verdade no
   provedor configurado. Nunca assumir a URL retornada — ler o campo real.
7. **Verificação completa** — ver seção 5, comando único. Só declarar
   "está no ar" com esse comando retornando `✅ tudo verde`.
8. **Validação externa** (ao menos 1x por leva de publicação):
   [isitagentready.com](https://isitagentready.com/) e
   [PageSpeed Insights](https://pagespeed.web.dev/) (mobile) contra a URL
   real.

### Modelos estruturais disponíveis (`modeloTemplate`)

11 modelos hoje (cada um com combinação própria de Hero + Grid de
Serviços + paleta): `urgencia-24h`, `corporativo-empresarial`,
`residencial-bairros`, `industrial-hidrojato`, `premium-clean`,
`rapido-economico`, `familia-seguranca`, `tecnico-especializado`,
`bairro-referencia`, `agenda-premium`, `condominio-proativo`. O texto
gerado por `generateUniqueCityContent()` em `cityGenerator.ts` é fixo por
modelo — sempre reescrever à mão pra produção (R1).

---

## 5. Verificação — comando único, sempre

**Nunca testar manualmente com `curl` avulso.** Rodar:

```bash
cd apps/web-dashboard
node scripts/checklist_completo.cjs <cityId>       # 1 cidade, TODAS as páginas reais
node scripts/checklist_completo.cjs --all           # todas as cidades, TODAS as páginas (demorado)
node scripts/checklist_completo.cjs --all --sample  # todas as cidades, amostra rápida
```

Testa, em CADA página real (home + cada bairro + cada serviço + as 3
institucionais) do site JÁ PUBLICADO:
- Status 200; CSS e imagem da home retornando 200 de verdade
- Título com `"desentupidora"` + faixa certa por tipo de página
- Meta description com `"desentupidora"` + 120-160 caracteres
- H1 e último H2 com `"desentupidora"`
- Canonical, `og:url` e schema `"url"` batendo exatamente com a URL real
  daquela página específica
- `<main>` presente
- Todo link interno terminando em `/` (bate com o canonical)

Sai com código 1 se algo falhar. **Só declarar sucesso se sair
`🎉 CHECKLIST: TUDO VERDE`.**

O que esse comando NÃO cobre (checar manualmente 1x por cidade nova):
FAQ/depoimento realmente específico da cidade aparecendo no HTML; cada
bairro confirmado real por busca (não é uma checagem automatizável).

---

## 6. Bugs reais já corrigidos — NÃO REPETIR

1. Domínio hardcoded no modelo `urgencia-24h` (`cityGenerator.ts`) —
   corrigido pra usar o slug dinâmico como os outros modelos.
2. Script `update_cities_faqs.cjs` nivelava FAQs/depoimentos pra um texto
   genérico fixo, ignorando `modeloTemplate` — **nunca rodar esse script
   de novo**.
3. Título/descrição fora da faixa (2 bugs, um de estourar, um de ficar
   curto demais) — corrigido, ver R2.
4. Bairros fictícios/copiados/de teste — corrigido, ver R6.
5. `<main>` ausente em `index.astro` e nas páginas institucionais
   (`/contato/`, `/politica-de-privacidade/`, `/termos-de-uso/`) —
   corrigido.
6. Heading pulando nível (h1 → h3 sem h2) no card "Urgência 24h" do Hero —
   corrigido.
7. Contraste WCAG falhando em 4 das 5 paletas — corrigido (paletas
   escurecidas mantendo o matiz).
8. `robots.txt` com diretiva inválida (`llms-txt:`) — removida; descoberta
   de `llms.txt` é via `Link` header, não robots.txt.
9. Imagens sem `width`/`height` explícitos, iframes de mapa sem `title` —
   corrigido.
10. CSS que esconde texto em mobile também escondia o nome acessível do
    link do WhatsApp — corrigido com `aria-label` fixo.
11. Auditor interno (`seoGeoAuditor.js`) sempre só checou a home, nunca
    bairro/serviço — reescrito pra varrer TODO `dist/**/index.html`.
12. Título de serviço estourando até 79 caracteres (nome do serviço já
    vinha prefixado "Desentupimento de" em `cities.json`, template
    duplicava "Desentupidora de" na frente) — corrigido com stripping do
    prefixo redundante + fallback de 2-3 níveis (nunca corta o nome real).
13. Meta description padrão da home dizia "desentupimento", nunca
    "desentupidora" — corrigido em `server.cjs`.
14. Links internos (bairro/serviço/institucionais) sem barra final,
    inconsistente com o canonical (que sempre tem barra final) — corrigido
    em 6 componentes (`LocalAreas.astro`, `ServicesGridV1-4.astro`,
    `Footer.astro`, `Header.astro`).
15. Canonical do 1º deploy de cidade nova apontando pro domínio fake em
    vez da URL real — corrigido (build+deploy em 2 passos, ver R7).
16. Render (hospedagem) só publica via Git — arquitetura decidida: reusar
    o próprio repositório deste projeto, pasta `dist-sites/<cityId>/`
    dedicada por cidade, commitada/pushada automaticamente a cada deploy
    dessa cidade (`deployToRender()` em `deployEngine.cjs`).
17. **(01/09/2026) Texto do corpo de página de bairro 100% idêntico entre
    bairros** — corrigido, ver seção 7 abaixo (que documentava isso como
    pendente e já foi resolvido).

---

## 7. Problema resolvido em 01/09/2026 — texto do corpo de página de bairro

**Estava assim**: o corpo de cada página de bairro (10 blocos de texto:
hero, resposta rápida, 4 cards "Conhecendo o Bairro", 4 caixas
"Referências do Bairro") era 100% template, idêntico palavra por palavra
em todo bairro de toda cidade — só o nome do bairro variava via
`{props.name}`. Título/H1/meta já eram únicos por bairro (corrigido antes
disso) — o problema era só o corpo da página.

**Solução aplicada**: pesquisa individual por bairro em escala (300+
bairros cadastrados) foi descartada por inviabilidade de tempo, e inventar
características específicas não confirmadas de um bairro violaria a R4
(nunca inventar dado). Em vez disso, cada um dos 10 blocos ganhou 3-4
variações escritas à mão (ângulos/redação diferentes, nenhuma alegando
fato específico não verificado) escolhidas de forma **determinística por
hash** de `${city.id}-${bairroName}` — mesmo bairro sempre cai na mesma
variação, bairros diferentes tendem a cair em variações diferentes,
inclusive entre cidades.

Localização: `apps/site-template-astro/src/pages/[slug].astro`, branch
`props.type === 'neighborhood'` — função `pickText()` + arrays
`*Variations` no topo do bloco, usados via `set:html={cardXText}` no
template.

Verificado: lido o `dist/` de 6 bairros de São Caetano do Sul, 3 variações
diferentes realmente distribuídas entre eles (não a mesma pra todos).
Replicado nas 13 cidades já publicadas (build+deploy real em cada,
`checklist_completo.cjs --all` confirmando 14/14 verdes).

**Isso NÃO é pesquisa factual por bairro** — é mitigação honesta do sinal
de "scaled content" sem inventar dado. Texto 100% pesquisado e único por
bairro (se algum dia fizer sentido o investimento) é trabalho novo, não
uma extensão trivial deste fix.

Também foi corrigida a inconsistência documental que existia: a skill
`.agents/skills/criar-site-desentupidora/SKILL.md` (Passo 1) instruía
"gere a lista de bairros usando seu conhecimento geográfico" — em
contradição direta com a R6 (bairro nunca por memória). Corrigida.

---

## 8. Nunca fazer (lista negativa rápida)

- Nunca publicar sem rodar o comando da seção 5 até sair verde.
- Nunca inventar bairro, CNPJ, endereço ou coordenada.
- Nunca copiar `bairros`/conteúdo de uma cidade pra outra.
- Nunca assumir a URL de deploy — sempre ler o valor real retornado.
- Nunca redeployar todas as cidades de uma vez sem testar 1 antes.
- Nunca gerar zip via `Compress-Archive`.
- Nunca rodar `update_cities_faqs.cjs`.
- Nunca declarar "está no ar"/"pronto" sem o checklist da seção 5 verde.
