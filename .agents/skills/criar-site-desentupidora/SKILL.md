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

---

## 🎨 Passo 2: Sincronização e Mídia (Identidade Visual)

A nova cidade precisa ter sua própria Logo, Favicon e Foto de Fundo (Hero).

1. No terminal, crie as imagens de exemplo (se o usuário não as forneceu) ou instrua o usuário a usar o painel web (em `http://localhost:5000`) para fazer upload da Logo e do Favicon da nova empresa.
2. Certifique-se de que, dentro do Astro, o arquivo `apps/site-template-astro/src/data/cityConfig.json` esteja preenchido **exatamente** com os dados da nova cidade que será exportada. O Astro usa **APENAS** este arquivo para gerar o site no build.

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

## 🚀 Passo 5: Deploy (Hospedagem no Cloudflare Pages ou Vercel)

A última etapa é colocar o site estático no ar. A recomendação padrão para velocidade extrema (SEO Local) é o **Cloudflare Pages**.

1. Instale o CLI do Cloudflare globalmente (caso não exista):
   ```bash
   npm install -g wrangler
   ```
2. Realize o deploy direto da pasta `dist`:
   ```bash
   cd apps/site-template-astro
   npx wrangler pages deploy dist --project-name="desentupidora-[nomedacidade]"
   ```
   *(Nota: Isso exigirá que o usuário faça o login no Cloudflare via terminal na primeira vez `npx wrangler login`)*.
3. Se o usuário preferir usar a **Vercel**, basta rodar:
   ```bash
   cd apps/site-template-astro && npx vercel --prod
   ```

---

## 🏁 Passo 6: Revisão Final e Entrega

Com o link do deploy gerado (ex: `https://desentupidora-nomedacidade.pages.dev`):
1. Teste o funcionamento do WhatsApp em um dos botões (verifique se o número foi formatado sem espaços).
2. Entregue o link de produção para o usuário e anuncie que a nova cidade está oficialmente no ar e indexável pelo Google!
