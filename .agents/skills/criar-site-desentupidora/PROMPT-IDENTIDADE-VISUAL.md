---
name: prompt-identidade-visual-desentupidora
description: Prompt mestre e especificação de tamanhos para gerar logo, favicon, imagem hero e imagem OG/social de uma cidade nova, via Canva (MCP conectado) ou qualquer gerador de imagem por IA. Usado pelo Passo 2 de criar-site-desentupidora/SKILL.md.
---

# 🎨 Prompt Mestre de Identidade Visual — Super Painel Desentupidoras

Este documento existe pra resolver um problema real encontrado em produção:
as imagens da cidade de Linhares foram criadas manualmente (fora do painel)
e **`logo.png` e `hero.png` acabaram sendo byte-a-byte o mesmo arquivo**
(3.822.920 bytes, idênticos) — alguém colou a imagem errada no campo
errado. Este guia dá o tamanho exato, a proporção exata e o prompt exato
pra cada um dos 4 ativos visuais de uma cidade, calibrados **contra o
código real do projeto** (não são tamanhos "de boa prática" genéricos —
foram medidos direto no CSS que renderiza cada imagem), pra isso nunca mais
acontecer.

Sempre que este guia for seguido por um agente automatizado, gerar os 3-4
ativos **em chamadas separadas**, um por vez, cada um com seu próprio
arquivo de saída — nunca reaproveitar o output de um prompt pro campo de
outro.

---

## 📐 Tabela de tamanhos (verificados no código-fonte)

| Ativo | Onde é usado no código | Como é renderizado | Proporção ideal | Tamanho de exportação | Formato | Fundo |
|---|---|---|---|---|---|---|
| **Logo** | `Header.astro` / `HeaderV1.astro`: `<img style="height:46px; max-width:140px; object-fit:contain">`, dentro do cabeçalho fixo (`.header-v1`, `background: var(--color-bg-dark)`) | Pequeno, no topo, sempre sobre fundo **escuro** | ~3:1 (paisagem larga) | **900×300px** (gerar em @2x, 1800×600px, se a ferramenta permitir — fica nítido em telas retina) | **WebP** (ver nota de conversão abaixo) | Fundo sólido na cor exata `--color-bg-dark` da paleta (ver nota de transparência abaixo) |
| **Favicon** | `Layout.astro`: `<link rel="icon" href={faviconUrl}>` — ícone da aba do navegador | Minúsculo (o Chrome mostra a 16×16px de fato) | 1:1 (quadrado) | **512×512px** master | **WebP** (ver nota de conversão abaixo) | Símbolo isolado, **sem texto** (texto nessa escala vira mancha ilegível), fundo sólido na cor `--color-bg-dark` da paleta |
| **Hero (páginas de serviço)** | `[slug].astro`: `.service-hero-img-box { max-height:300px }`, `object-fit:cover`, coluna de `grid-template-columns: 1.3fr 0.7fr` (~460px de largura útil no desktop, full-width no mobile) | Foto ao lado do texto, cortada pelas bordas conforme o viewport | 8:5 ou 16:9 (paisagem) | **1600×1000px** | **WebP** | Foto realista — sujeito centralizado, com margem de segurança pra corte (crop-safe) |
| **OG / Social Share** (bônus — **ainda não existe no código**, ver nota abaixo) | Nenhum. `Layout.astro` hoje tem `og:title`/`og:description` mas **nenhum `og:image`** — gap real encontrado nesta auditoria | Preview de link no WhatsApp/Twitter/LinkedIn | 1200×630 (padrão OG) | **1200×630px** | JPG (WhatsApp/Twitter nem sempre respeitam webp em preview — manter JPG aqui) | Composição com paleta da cidade + logo + headline |

### ⚠️ Nota de formato: por que WebP e como converter

**Todo ativo servido pelo site (logo, favicon, hero) tem que terminar em
`.webp`**, nunca ficar em `.png` — confirmado na prática nesta sessão: a
mesma logo (900×300px) ficou com **63,9 KB em PNG** e **5,4 KB em WebP**
(mesma qualidade visual, ~92% menor). Isso é ainda mais crítico depois do
bug real já encontrado de imagens de **3,8 MB** paradas no repositório
(ver seção de regra de ouro abaixo).

**O Canva não exporta em WebP diretamente** (`get-export-formats` só lista
`pdf, jpg, png, pptx, gif, mp4`). O fluxo correto é: exportar do Canva em
PNG (`export-design`, `format.type: "png"`, no tamanho exato da tabela
acima) e depois converter pra WebP com `sharp-cli` via `npx` (não precisa
instalar nada global, o `npx` baixa e roda na hora):

```bash
npx --yes sharp-cli -i logo.png -o logo.webp -f webp -q 90
```

**Depois de converter, apagar o `.png` intermediário** — ele não deve
sobrar no repositório (é exatamente o tipo de arquivo morto que já causou
o problema de peso em Linhares). Só o `.webp` final fica salvo em
`public/images/<citySlug>/`.

### ⚠️ Nota de transparência: limitação real do Canva encontrada nesta sessão

**O Canva não permite exportar a logo com fundo realmente transparente**
quando o design foi gerado com `design_type: "logo"` — o fundo vem como
uma **imagem raster de verdade** (`page.background.media`), não como uma
cor de canvas, e não existe locator_id nem operação de `edit-design` capaz
de removê-la (testado e confirmado: `delete_element` no locator da página
falha com `not_permitted`, e a flag `transparent_background: true` do
`export-design` não afeta esse tipo de fundo).

**Solução que funciona na prática**: em vez de pedir fundo transparente no
prompt, pedir explicitamente um **fundo sólido, chapado, na cor hexadecimal
exata `--color-bg-dark` da paleta da cidade** (ver tabela de paletas
abaixo), com instrução clara de "zero gradiente, zero vinheta, zero
textura, cobrindo a borda inteira do canvas". Testado e medido: o resultado
saiu em **RGB (21,21,23) contra o alvo #18181b = (24,24,27)** — diferença
de 1 a 4 unidades por canal, imperceptível a olho nu quando embutido no
header de verdade. Efeito visual final idêntico a "transparente" sem
depender de um recurso que o Canva não expõe.

**Nota sobre o OG image**: gerar esse 4º ativo já deixa o material pronto,
mas **usá-lo de fato exige uma mudança de código** (`Layout.astro` precisa
ganhar `<meta property="og:image">` e o pipeline precisa de um campo novo
tipo `ogImageUrl`, que hoje não existe em `CityConfig`). Trate isso como
uma pendência separada a resolver quando for automatizar — gerar a imagem
sem fio nenhum não adianta nada sozinho.

---

## 🚫 Regra de ouro (o bug que já aconteceu)

**Nunca usar o mesmo arquivo de imagem pra dois campos diferentes.** Logo,
favicon e hero têm propósitos visuais opostos:
- Logo = marca **abstrata e pequena**, vetorial, cabe em 140×46px.
- Favicon = **só o símbolo**, sem texto, legível a 16px.
- Hero = **foto realista** de um profissional trabalhando, nada de símbolo
  ou texto.

Se o agente/skill gerar os 3 e algum arquivo de saída bater exatamente com
outro em tamanho de bytes ou hash, **isso é sinal de bug de pipeline**, não
coincidência — pare e investigue antes de subir.

---

## 🎨 Cores por paleta (nunca inventar cor — usar a paleta real da cidade)

Ler sempre de `apps/site-template-astro/src/styles/themePalettes.css`. Na
data desta auditoria (29/08/2026), as 5 paletas existentes são:

| `paletaCores` | `--color-bg-dark` (fundo escuro do header) | `--color-primary` | `--color-accent` | `--color-text-main` |
|---|---|---|---|---|
| `urgencia-azul-laranja` | `#0f172a` | `#0284c7` | `#f97316` | `#f8fafc` |
| `corporativo-verde-cinza` | `#052e16` | `#10b981` | `#34d399` | `#f0fdf4` |
| `residencial-bege` | `#1c1917` | `#d97706` | `#f59e0b` | `#fafaf9` |
| `industrial-amarelo` | `#18181b` | `#eab308` | `#facc15` | `#f4f4f5` |
| `clean-azul` | `#0f172a` | `#2563eb` | `#3b82f6` | `#ffffff` |

Todas as 5 paletas têm fundo de header **escuro** — ou seja, **a logo e o
favicon têm que ser desenhados pra funcionar sobre fundo escuro sempre**,
independente da paleta da cidade.

---

## ✍️ Ficha de brief (preencher por cidade antes de gerar)

```
EMPRESA: {{empresaNome}}
CIDADE / UF: {{cidade}} - {{uf}}
SEGMENTO: desentupidora / serviço de desentupimento e limpeza de fossa 24h
PALETA: {{paletaCores}}
  → cor primária: {{colorPrimary}}
  → cor de destaque: {{colorAccent}}
  → fundo escuro do header: {{colorBgDark}}
  → texto principal: {{colorTextMain}}
TOM DE MARCA: confiável, resposta rápida, urgência controlada (não é
  susto/pânico), profissional — não confundir com elétrica, construção
  civil genérica ou chaveiro.
```

---

## 🖼️ Os 4 prompts mestres

Os prompts abaixo estão **em inglês de propósito** — modelos de geração de
imagem (incluindo os usados pelo Canva) seguem instruções em inglês com
muito mais precisão e consistência do que em português, especialmente pra
termos de composição/fotografia. Preencha os `{{placeholders}}` antes de
enviar.

### 1. LOGO (wordmark + símbolo)

```
Design a professional, modern logo for a 24-hour drain-cleaning / plumbing
emergency company called "{{empresaNome}}", based in {{cidade}}, {{uf}},
Brazil.

STYLE: flat vector logo, minimalist, corporate-trustworthy — like a modern
local-service brand. NOT clipart, NOT a generic stock icon pack, NOT the
overused "wrench + water drop" combo seen on every plumbing logo.

SYMBOL: one simple abstract mark suggesting fast response + water/drain
flow (for example: a stylized water drop merged with a lightning bolt, or
a circular arrow implying a 24-hour cycle). Keep it a single recognizable
shape that still reads clearly when shrunk to 32px.

WORDMARK: the text "{{empresaNome}}" in a bold geometric sans-serif
typeface, high legibility, one or two lines maximum. No script/handwriting
fonts.

COLOR: symbol and text using ONLY {{colorAccent}} and an off-white/white
tone ({{colorTextMain}}).

LAYOUT: horizontal lockup (symbol on the left, wordmark on the right),
composed inside a wide 3:1 landscape frame with a safe margin on all sides
— nothing touching the edges.

BACKGROUND REQUIREMENT: the background must be a single FLAT SOLID COLOR
fill, exact hex {{colorBgDark}}, covering the entire canvas edge-to-edge
with ZERO gradient, ZERO vignette, ZERO texture, ZERO glow radiating into
the background — completely flat and uniform. This exact color must match
the website's navbar background pixel-for-pixel (Canva does not support
true transparent export for AI-generated logos — a solid matching color is
the proven workaround, tested and confirmed close enough to be
indistinguishable once embedded in the real header).

NEGATIVE PROMPT: no photorealistic elements, no drop shadows, no busy
gradients (max a simple 2-tone blend on the symbol/text only, never on the
background), no watermark, no extra tagline text, no stock "plumber
holding a wrench" clipart, no lightbulb/idea icon, no text distortion, no
misspelled letters.

OUTPUT: generate as PNG at 900x300px, then convert to WebP (`npx --yes
sharp-cli -i logo.png -o logo.webp -f webp -q 90`) and delete the PNG.
```

### 2. FAVICON (derivado do símbolo da logo — NUNCA da wordmark)

```
Take ONLY the abstract symbol from the logo above (the drop/lightning
mark) — completely remove the company name / wordmark — and center it
alone in a 1:1 square canvas.

STYLE: same colors as the logo symbol ({{colorAccent}}), on a flat solid
square background filled with the exact hex {{colorBgDark}} — same
transparency limitation and workaround as the logo above applies here.

SIMPLICITY: simplify strokes so the icon stays recognizable when scaled
down to 16x16px — thick, bold shapes, zero fine detail, absolutely no
text.

OUTPUT: generate as PNG at 512x512px, then convert to WebP (`npx --yes
sharp-cli -i favicon.png -o favicon.webp -f webp -q 90`) and delete the
PNG. Small safe margin (~10%) around the symbol.
```

### 3. HERO (foto realista — páginas de serviço)

```
A photorealistic, editorial-style photograph of a professional drain-
cleaning / plumbing technician at work inside a residential Brazilian
home, in {{cidade}}, {{uf}}.

SCENE: technician wearing dark/navy branded workwear with a small
{{colorAccent}}-colored accent (no readable logo or text on the uniform),
using professional rotary drain-cleaning equipment on a kitchen sink or
bathroom drain. Clean, well-lit, modern middle-class Brazilian home
interior. Warm, reassuring lighting — this image should sell competence
and trust, not an emergency/disaster mood.

COMPOSITION: subject positioned in the center-left third of the frame
(rule of thirds), with enough headroom and surrounding context that the
image survives being cropped tighter from both left/right and top/bottom
(crop-safe for a responsive layout).

STYLE: photorealistic, natural light, shot on a modern mirrorless camera,
shallow depth of field. NOT a cartoon or illustration. NOT AI-plastic-
looking skin. NOT an obviously staged stock photo (no forced smiling
directly at camera).

NEGATIVE PROMPT: no visible faces smiling directly at the camera (keep it
candid, mid-task), no text overlays, no logos on the uniform, no
exaggerated mess/gore, no distorted or extra fingers, no malformed hands
holding tools, no watermark, no visible brand names on equipment.

OUTPUT: generate at 1600x1000px (8:5 landscape) and save/convert as WebP
(quality ~85 é suficiente pra foto).
```

### 4. OG / SOCIAL SHARE (bônus — requer mudança de código pra usar)

```
Create a clean social-share banner (Open Graph preview image) for
"{{empresaNome}}" — {{cidade}}, {{uf}}.

LAYOUT: solid or subtly diagonal gradient background from {{colorBgDark}}
to {{colorPrimary}}. Place the logo lockup (reuse the generated logo
asset) in the top-left corner. Large, bold headline text reading
"Desentupidora em {{cidade}} {{uf}} 24h" in {{colorTextMain}}, positioned
center-left. A small WhatsApp/phone icon badge in {{colorAccent}} in the
bottom-right corner — icon only, do NOT bake in an actual phone number
(it can go stale if the number changes later).

STYLE: flat, modern, high-contrast — this image is viewed mostly as a tiny
thumbnail in chat apps, so it must stay legible at small sizes.

NEGATIVE PROMPT: no photorealistic photo background here (keep it
graphic/flat, distinct from the hero photo), no clutter, no more than one
headline of text.

OUTPUT: 1200x630px, JPG.
```

---

## 📁 Convenção de arquivos e onde salvar

Todos os 3 ativos servidos pelo site terminam em `.webp` (ver nota de
formato acima). Confirmado na prática com a logo de Itabuna
(29/08/2026: `logo.webp`, 900×300px, 5,4 KB):

```
apps/site-template-astro/public/images/<citySlug>/
  logo.webp     → campo cities.json: logoUrl    = "/images/<citySlug>/logo.webp"
  favicon.webp  → campo cities.json: faviconUrl = "/images/<citySlug>/favicon.webp"
  hero.webp     → campo cities.json: heroImage  = "/images/<citySlug>/hero.webp"
  og.jpg        → (bônus, sem campo ainda — ver nota do OG acima; JPG mesmo, não webp)
```

Pra subir automaticamente sem passar pela UI do painel, usar o endpoint já
existente `POST /api/upload-image` (`server.cjs`), passando `cityId` e o
arquivo — ele salva em `public/images/<cityId>/<nome-original>` e devolve
o `path` relativo pra gravar no campo certo de `cities.json`.

**Nunca salvar dois campos apontando pro mesmo arquivo físico.** Se o
agente for gerar os 3-4 ativos em lote, cada um precisa do seu próprio
nome de arquivo de saída antes mesmo de chamar o gerador — não reaproveitar
variável de path entre chamadas.

---

## ✅ Checklist antes de aprovar uma imagem gerada

- [ ] Logo continua legível quando reduzido de verdade a 140×46px (não só
      "olhando grande e imaginando")
- [ ] Favicon continua reconhecível reduzido a 16×16px
- [ ] Hero não tem mãos/dedos deformados (erro clássico de gerador de
      imagem em cenas com mãos segurando ferramenta)
- [ ] Nenhum dos arquivos gerados é idêntico a outro (mesmo tamanho em
      bytes é sinal de alerta — bug real já visto em produção)
- [ ] Cores batem com a paleta real da cidade (tabela acima), nunca
      inventadas ou "aproximadas de cabeça"
- [ ] Hero não tem texto nem logo "queimados" na imagem — o HTML já
      desenha texto por cima, texto embutido na foto vira ruído/duplicado
- [ ] Nenhuma marca/logo de terceiros aparece sem querer no fundo da cena
      (erro comum de geradores de imagem fotorrealista)
