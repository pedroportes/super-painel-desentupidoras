const fs = require('fs');
const path = require('path');

const cities = JSON.parse(fs.readFileSync('apps/web-dashboard/data/cities.json', 'utf8'));
const proximas = JSON.parse(fs.readFileSync('docs/proximas-cidades.json', 'utf8'));

const obsidianNotePath = 'G:\\Meu Drive\\Minhas memorias Claude\\Minhas Memorias\\Sites\\Desentupidoras-Brasil\\Registro-Expansao-Rede-2026.md';

let tableRows = '';
cities.forEach((c, idx) => {
  const pop = c.populacao ? Number(c.populacao).toLocaleString('pt-BR') : '-';
  const tel = c.telefoneFixo || '-';
  const zap = c.whatsapp ? `(${c.whatsapp.substring(0,2)}) ${c.whatsapp.substring(2)}` : '-';
  const pags = (1 + (c.bairros?.length || 0) + (c.services?.length || 6) + 3);
  tableRows += `| **${idx + 1}** | **${c.cidade} (${c.uf})** | ${pop} | ${c.hospedagem || 'Cloudflare'} | \`${c.modelo || 'tecnico-especializado'}\` / ${c.paletaCores || 'clean-azul'} | ${tel} / ${zap} | ${pags} págs | [Acessar Site](${c.deployUrl}) |\n`;
});

let filaRows = '';
(proximas.fila || []).slice(0, 10).forEach((c, idx) => {
  filaRows += `| **${idx + 1}** | **${c.cidade} (${c.uf})** | ${Number(c.populacao).toLocaleString('pt-BR')} | ${Math.round((c.indiceConcorrenciaFraca || 0) * 100)}% | ${(c.notaFinal || 0).toLocaleString('pt-BR')} pts |\n`;
});

const content = `---
tags:
  - expansao
  - desentupidora
  - producao
  - link-flow
  - cloudflare
  - vercel
  - render
  - seo
  - multi-cidades
  - super-painel
data: 2026-09-08
status: ativo
total_cidades_ativas: ${cities.length}
ultima_cidade_publicada: Barra Mansa (RJ)
---

# 🚀 Registro de Expansão da Rede — Super Painel Desentupidoras (2026)

Documentação técnica oficial do avanço da expansão de cidades, auditorias de SEO/GEO, governança de links, regras de blindagem anti-spam, diversificação multi-hospedagem e arquitetura de telefonia regional exclusiva.

---

## 🌟 1. Status Geral da Rede (${cities.length} Cidades Ativas em Produção — 100% Verde)

| # | Cidade / UF | População | Hospedagem | Modelo / Paleta | Telefone / WhatsApp | URLs / Páginas | Link Oficial |
| :-: | :--- | :-: | :---: | :--- | :--- | :-: | :--- |
${tableRows}

---

## 🛠️ 2. Evolução Arquitetural e Mudanças Recentes no Código

### A. Super Painel (Web Dashboard & API Server)
1. **Editor Visual Inline (WYSIWYG Estilo Elementor)**:
   - Edição de textos ao vivo com \`contenteditable="true"\` diretamente sobre o preview real do Astro.
   - Comunicação bidirecional via \`postMessage\` (\`SELECT_ELEMENT\`, \`SYNC_CONTENT\`, \`UPDATE_ELEMENT\`): seleção com 1 clique pula para a aba do componente na barra lateral; digitação em tempo real não recarrega iframe.
   - Painel lateral redimensionável por clique/arrasto (*drag resizer*) e botões de tela cheia.
2. **Motor de Deploy Multi-Hospedagem (Cloudflare Pages, Vercel, Render)**:
   - Sincronização inteligente e compilação em 2 passos para garantir a URL canônica real reportada pelo provedor no HTML estático compilado.
3. **Mapeamento de Oportunidades & Concorrência SERP**:
   - Algoritmo integrado no backend conectando mais de 500 cidades da planilha oficial com análise de volume populacional, saneamento e concorrência vulnerável no Top 10 Google.
4. **Sistema Próprio de Pixel & Analytics (Zero Dependências)**:
   - Receptor nativo de eventos de conversão (\`/api/pixel/event\`) para rastrear pageviews, cliques em botões de WhatsApp, ligações e redirecionamentos de parceiros com registro em \`analytics_events.jsonl\`.
5. **Quality Gate Automatizado (\`checklist_completo.cjs\`)**:
   - Auditoria determinística pós-deploy que valida 100% das páginas (home, todos os bairros, serviços e institucionais).

### B. Motor de Sites Estáticos (Astro SSG & Modelos)
1. **Core Web Vitals & Otimização Extrema (Lighthouse 100)**:
   - **Google Maps Facade**: Eliminação de ~436 KiB de scripts terceiros no carregamento inicial, ativando mapa interativo apenas sob demanda.
2. **Biblioteca Expandida de Modelos e Variantes**:
   - Modelos 09 a 11 (\`Agenda Premium\`, \`Bairro Referência\`, \`Condomínio Proativo\`).
   - Variantes de Hero: \`HeroV1\` a \`HeroV7\` com fotos e cartões de credibilidade técnica.
   - Variantes de Serviços: \`ServicesGridV1\` a \`ServicesGridV7\`.
   - Sistema de temas com 6 paletas dinâmicas em CSS Tokens.
3. **Calibração Rigorosa de SEO Dinâmico (\`[slug].astro\`)**:
   - Meta Titles: 40 a 60 caracteres.
   - Meta Descriptions: Estritamente calibradas entre 120 e 150 caracteres para todas as rotas.
   - Presença da palavra-chave regional exata no Title, Description, H1, 1º parágrafo e último H2.
   - Endpoints nativos para agentes de IA (\`llms.txt\`, \`site-markdown\`, \`ai-plugin.json\`).

---

## 🛡️ 3. Regras de Qualidade e Blindagem Anti-Spam (Quality Gate)

### A. Regra R18 — Densidade Factual e E-E-A-T por Bairro
- Toda página de bairro possui no \`neighborhoodFacts\` um parágrafo denso (3 a 5 frases, 250 a 450 caracteres) abordando história, avenidas principais, equipamentos públicos e desafios de drenagem/esgoto locais.

### B. Regra R19 — Telefonia e WhatsApp 100% Únicos
- Cada praça possui seu celular com DDD real da região e fixo correspondente, proibida a duplicação de números fictícios.

### C. Regra R20 — Identidade Visual com Imagens Reais
- Caminhão de sucção e hidrojateamento realista gerado para a praça com o nome da cidade pintado no tanque.
- Logos em formato WebP com canal alpha transparente real (fundo transparente sem bordas).

---

## 📈 4. Próxima Fila de Oportunidades (Top 10 da Fila Oficial)

| # | Cidade / UF | População | Concorrência Fraca (Google) | Nota Final |
| :-: | :--- | :-: | :---: | :-: |
${filaRows}
`;

fs.writeFileSync(obsidianNotePath, content, 'utf8');
console.log('✅ Obsidian atualizado com sucesso em:', obsidianNotePath);
