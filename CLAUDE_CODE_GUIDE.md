# 🤖 GUIA DE INTEGRAÇÃO COM CLAUDE CODE

Este documento orienta como utilizar o **Claude Code (CLI)** como motor acelerador de geração de novos módulos, temas e personalizações a partir das escolhas feitas no **Painel Web**.

---

## 🎯 Papel do Claude Code no Fluxo

1. **O Painel Web decide "O Quê":**
   - Escolha da Cidade, UF, População e Bairros
   - Seleção da Hospedagem Exclusiva (`cloudflare` | `vercel` | `netlify`)
   - Seleção da Paleta de Cores (`urgencia-azul-laranja`, `corporativo-verde-cinza`, `residencial-bege`, etc.)
   - Seleção das Variações de Módulo (`HeroV1`/`HeroV2`, `ServicesGridV1`/`ServicesGridV2`, etc.)

2. **O Claude Code executa a geração do código:**
   - Lê o `cityConfig.json` atualizado.
   - Gera novos módulos em `.astro` quando necessário.
   - Executa a auditoria automática (`npm run audit`) para garantir 100% de aprovação On-Page, GEO e Agent Readiness.

---

## 🛠️ Exemplo de Comando para o Claude Code

Para solicitar ao Claude Code a geração de um novo módulo ou site:

```bash
claude "Leia o arquivo apps/site-template-astro/src/data/cityConfig.json e crie uma nova variação de módulo HeroV3.astro focada em empresas e condomínios para a cidade configurada, garantindo palavra-chave no H1 e nas primeiras 30 palavras do 1º parágrafo."
```

---

## 📊 Checklist de Validação para o Claude Code

Toda alteração gerada pelo Claude Code deve obrigatoriamente rodar os comandos:

```powershell
cd apps/site-template-astro
npm run build
npm run audit
```

Se o `npm run audit` retornar **`📊 SCORE AUDIT AUTOMÁTICO: 100%`**, a nova variação está validada e pronta para publicação!
