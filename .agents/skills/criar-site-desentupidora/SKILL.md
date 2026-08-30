---
name: criar-site-desentupidora
description: Tutorial e script completo de como a IA deve proceder para criar um novo site de desentupidora para uma nova cidade do início ao fim (Painel, Astro e Hospedagem Cloudflare).
---

# 🚀 Como Criar e Fazer Deploy de um Novo Site de Desentupidora

Esta skill deve ser ativada **Sempre que o usuário pedir para:** "Criar um site para a cidade X", "Subir o site de [Nome da Cidade]", ou "Fazer a página de uma nova cidade até o final".

O ecossistema é dividido em duas partes principais:
1. **O Super Painel (Dashboard):** Um painel React que edita o JSON global das cidades (`apps/web-dashboard/data/cities.json`).
2. **O Template Astro:** Um gerador de sites estáticos super rápido que lê o JSON (`apps/site-template-astro/src/data/cityConfig.json`) e renderiza centenas de páginas em segundos.

Siga **EXATAMENTE** os 6 passos abaixo para criar o site completo da cidade com sucesso.

---

## 🛠️ Passo 1: Cadastro da Cidade no Painel

Antes de tocar no código do site, precisamos cadastrar a cidade no "banco de dados" do sistema (`cities.json`).

1. Use a ferramenta `run_command` para rodar um script Node.js simples que adiciona a nova cidade ao arquivo `apps/web-dashboard/data/cities.json`.
2. Os dados obrigatórios para a cidade são:
   - `id`: (ex: "sao-paulo-sp")
   - `cidade`: (Nome da cidade com acentos, ex: "São Paulo")
   - `uf`: (Sigla do estado, ex: "SP")
   - `ddd`: (ex: "11")
   - `empresaNome`: (ex: "Desentupidora SP 24h")
   - `whatsapp`: (telefone apenas números)
   - `telefoneFixo`: (telefone apenas números)
   - `endereco`: (endereço com rua e número)
   - `geoCoordinates`: `{ "latitude": "", "longitude": "" }`
   - `bairros`: (Um array com pelo menos 15 a 30 bairros principais da cidade). *Gere essa lista usando seu conhecimento geográfico.*
   - `services`: (Um array fixo com os 6 serviços: Desentupimento de Esgoto, Pia, Vaso Sanitário, Ralo, Esgotamento de Fossa e Hidrojateamento).

⚠️ **Conteúdo tem que ser único de verdade, não template com find-replace**
(regra 9 do `CLAUDE_CODE_GUIDE.md`, testada e validada em 30/08/2026 com
Vitória da Conquista): escrever `h1Title`, `firstParagraph`,
`aboutCityTitle`, `aboutCityText` e os `faqs` **manualmente, com fatos
reais e específicos daquela cidade** (relevo, clima, características
econômicas, um problema hidráulico plausível pra região, etc.) — nunca
usar `generateUniqueCityContent()` direto pra produção sem reescrever.
Isso não é opcional: cidades com o mesmo conteúdo template são o mesmo
risco de "scaled content abuse" documentado na skill `rede-de-parceiros`.

⚠️ **`metaTitle` ≤ ~60 caracteres, `metaDescription` ≤ ~155-160** (regra 10
do guia, bug real encontrado 30/08/2026): a fórmula padrão de
`server.cjs` já foi corrigida pra caber em nomes de cidade longos
(`Desentupidora em [Cidade] [UF] 24h`, sem sufixo), mas se for escrever um
`metaTitle`/`h1Title` customizado, **contar caracteres de verdade**
(`str.length`) antes de aprovar — nunca estimar de cabeça. Um título
"bonito" mas longo (ex: com um qualificador regional extra) estoura fácil
pra cidades de nome composto (Cachoeiro de Itapemirim, São José dos
Pinhais, Vitória da Conquista).

---

## 🎨 Passo 2: Sincronização e Mídia (Identidade Visual)

A nova cidade precisa ter sua própria Logo, Favicon e Foto de Fundo (Hero)
— **3 arquivos distintos, nunca o mesmo arquivo reaproveitado** (isso já
aconteceu de verdade em produção com a cidade de Linhares e é tratado como
bug, não como atalho válido).

1. Gerar os 3 (ou 4, incluindo o OG bônus) ativos visuais seguindo **ao pé
   da letra** o prompt mestre e os tamanhos exatos documentados em
   [`PROMPT-IDENTIDADE-VISUAL.md`](PROMPT-IDENTIDADE-VISUAL.md) — ele já
   vem calibrado contra o CSS real do projeto (tamanho do logo no header,
   caixa do hero nas páginas de serviço, etc.) e contra a paleta de cores
   real da cidade (`paletaCores`). Usar o Canva (MCP conectado) ou outro
   gerador de imagem disponível pra rodar os 4 prompts — o hero tem uma
   **variante em português escrita pelo usuário**, testada e aprovada,
   preferir ela (ver seção 3 do prompt master).
   - **Se o usuário já baixou imagens prontas** (ChatGPT, Gemini/Nano
     Banana, etc.) em vez de pedir pra gerar: **não gerar de novo** — pedir
     o caminho local do arquivo (ex: uma pasta em `_uploads-imagens/` na
     raiz do repo, ou direto na pasta padrão de Downloads do usuário),
     conferir a ortografia do texto pintado no caminhão em resolução real
     (o `Read` tool mostra a imagem inteira, zoom não é necessário — dá
     pra ler o texto direto), e só então recortar (`sharp-cli resize`
     `--fit cover`) e converter pra WebP no tamanho certo. Sempre perguntar
     pra qual cidade é cada imagem antes de salvar, a menos que o usuário
     já tenha dito "pode usar na que quiser" — nesse caso, distribuir entre
     as cidades publicadas que ainda não têm imagem própria.
   - Guardar as variações não escolhidas (quando o usuário pedir) num
     lugar fora de `public/` — nunca deixar arquivo intermediário/opção
     descartada dentro da pasta pública do site (ela vai pro deploy
     senão). Usar algo como
     `.agents/skills/criar-site-desentupidora/exemplos-gerados/<cidade>/`.
2. Subir os arquivos gerados via `POST /api/upload-image` (`server.cjs`)
   ou pelo painel web (`http://localhost:5000`), preenchendo os campos
   `logoUrl`, `faviconUrl` e `heroImage` da cidade — nunca deixar dois
   campos apontando pro mesmo arquivo.
3. Certifique-se de que, dentro do Astro, o arquivo `apps/site-template-astro/src/data/cityConfig.json` esteja preenchido **exatamente** com os dados da nova cidade que será exportada. O Astro usa **APENAS** este arquivo para gerar o site no build.

---

## 🏗️ Passo 3: Validação do Template (Astro)

A IA deve conferir se o site de destino está operando corretamente e sem falhas estéticas.

1. Navegue para `apps/site-template-astro`.
2. Faça um check rápido em `src/pages/index.astro` e `src/pages/[slug].astro` para garantir que o código base está intacto.
3. Certifique-se de que o CSS (estilos globais) estão funcionando, caso contrário lembre-se da regra: *No Astro, estilos de design em componentes filhos que devem quebrar o tema global do Layout precisam usar `<style is:global>` no final do arquivo.*

---

## ⚙️ Passo 4: Build Estático (Geração das Páginas)

O Astro precisa gerar o site. Isso vai criar as pastas com arquivos `index.html` estáticos ultrarrápidos para cada serviço e cada bairro cadastrado.

1. Execute o comando de build na pasta do Astro:
   ```bash
   cd apps/site-template-astro && npm run build
   ```
2. Após rodar o build com sucesso, todos os arquivos finais (HTML, CSS, imagens) estarão dentro da pasta `apps/site-template-astro/dist/`.

---

## 🚀 Passo 5: Deploy (Hospedagem no Cloudflare Pages, Vercel ou Netlify)

⚠️ **Não rodar `wrangler`/`vercel` manualmente** — o painel já tem um motor
de deploy real (`apps/web-dashboard/scripts/deployEngine.cjs`) que builda
e publica pro provedor certo com as credenciais já salvas em
"Hospedagem & Chaves API". Usar sempre os endpoints do próprio painel:

```bash
curl -s -X POST http://localhost:5002/api/build-city/<id> -H "Content-Type: application/json"
curl -s -X POST http://localhost:5002/api/deploy-city/<id> -H "Content-Type: application/json"
```

(`build-city` builda + roda a auditoria interna sem publicar — usar
primeiro pra conferir `auditScore`; `deploy-city` builda de novo e publica
de verdade no provedor configurado pra cidade, `city.hospedagem`).

**Bugs reais já corrigidos nesse motor (30/08/2026), não repetir**:
- **Cloudflare**: a URL de deploy **nunca é assumida** — é sempre extraída
  do output real do `wrangler` (`deployEngine.cjs` faz isso automático
  agora). Se o nome do projeto colidir com outro subdomínio `.pages.dev`
  já existente (é global, não só da sua conta), o Cloudflare renomeia o
  projeto sozinho — sempre conferir a `deployUrl` retornada de verdade, não
  assumir `https://desentupidora-<cidade>.pages.dev` de cabeça.
- **Vercel**: o arquivo `_headers` (formato Netlify/Cloudflare) **não
  funciona** — precisa de `apps/site-template-astro/public/vercel.json`
  (já existe, cobre o header `Link` usado pro isitagentready.com achar
  `llms.txt`/política de privacidade/termos). Se algum header novo for
  adicionado a `public/_headers` no futuro, replicar no `vercel.json`
  também, senão cidades no Vercel ficam sem esse header silenciosamente.
- **Depois de editar `deployEngine.cjs` ou `server.cjs`**: reiniciar o
  backend (`node server.cjs`) antes de testar — Node cacheia `require`,
  não há hot-reload.

**Sempre confirmar com `curl` que o site publicado é o esperado antes de
considerar terminado** — já aconteceu de um deploy "ter sucesso" mas
publicar num projeto/URL diferente do que o painel achava que era (ver
histórico de correções, caso Curitiba). Checar título e conteúdo reais:

```bash
curl -s https://<deployUrl>/ | grep -o "<title>[^<]*</title>"
curl -sI https://<deployUrl>/ | grep -i "^link"
```

---

## 🏁 Passo 6: Revisão Final e Entrega

Com o link do deploy gerado (ex: `https://desentupidora-nomedacidade.pages.dev`):
1. Teste o funcionamento do WhatsApp em um dos botões (verifique se o número foi formatado sem espaços).
2. Rode o site real em [isitagentready.com](https://isitagentready.com/) (mobile) e no
   [PageSpeed Insights](https://pagespeed.web.dev/) — regra 11/12 do
   `CLAUDE_CODE_GUIDE.md`. O auditor interno (`npm run audit`) dar 100% não
   garante nada sobre o mundo real (já achou robots.txt inválido, Link
   header ausente no Vercel, imagem sem `width`/`height`, link sem nome
   acessível — tudo isso passa no auditor interno sem reclamar). Corrigir
   o que aparecer antes de considerar a cidade pronta.
3. Entregue o link de produção para o usuário e anuncie que a nova cidade está oficialmente no ar e indexável pelo Google!
