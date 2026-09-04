#!/usr/bin/env node
/**
 * Gera a fila de "próximas cidades a criar" (docs/PROXIMAS_CIDADES.md +
 * docs/proximas-cidades.json) a partir do endpoint /api/opportunity-ranking
 * do próprio painel (apps/web-dashboard/server.cjs) — que já cruza a
 * planilha de scoring de concorrência com as cidades reais de cities.json.
 *
 * Existe pra QUALQUER IA ou humano que pegue este projeto (Claude,
 * Antigravity/Gemini, ChatGPT, etc.) saber, sem precisar abrir o painel
 * nem reler a planilha inteira, qual é a próxima cidade com maior chance
 * de ranquear rápido — a fila já vem ordenada (mais fácil primeiro).
 *
 * Uso:
 *   node apps/web-dashboard/scripts/generate_proximas_cidades.cjs
 *
 * Precisa do backend rodando em localhost:5002 (BACKEND_PORT). Se não
 * estiver rodando, sobe uma instância temporária dele mesmo (lendo direto
 * cities.json + fallback do CSV local), sem precisar do Vite/frontend.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const OUT_MD = path.join(ROOT, 'docs', 'PROXIMAS_CIDADES.md');
const OUT_JSON = path.join(ROOT, 'docs', 'proximas-cidades.json');

async function fetchRanking() {
  const url = 'http://localhost:5002/api/opportunity-ranking';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.log(`[generate_proximas_cidades] Backend não respondeu em ${url} (${e.message}). Subindo instância temporária...`);
    return await fetchRankingViaTempServer();
  }
}

// Sobe o server.cjs numa porta temporária só pra reusar a lógica real de
// fetchOpportunityRows() (mesmo cache/fallback que o painel usa) sem
// precisar duplicar código aqui.
async function fetchRankingViaTempServer() {
  const { execFileSync } = require('child_process');
  const tmpPort = 15002;
  const child = require('child_process').spawn('node', [path.join(__dirname, '..', 'server.cjs')], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, BACKEND_PORT: String(tmpPort) },
    stdio: 'ignore',
  });
  try {
    // espera o servidor subir (poll simples)
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 300));
      try {
        const res = await fetch(`http://localhost:${tmpPort}/api/opportunity-ranking`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) return await res.json();
      } catch { /* ainda subindo */ }
    }
    throw new Error('instância temporária do backend não respondeu a tempo');
  } finally {
    child.kill();
  }
}

function pct(n) {
  return n === null ? '—' : `${Math.round(n * 100)}%`;
}

function formatPopulacao(raw) {
  const negativo = raw.startsWith('~') ? '~' : '';
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return raw;
  return negativo + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

async function main() {
  const data = await fetchRanking();
  const fila = data.proximasACriar;

  const geradoEm = new Date().toISOString();

  // --- JSON (consumo por script/IA) ---
  fs.writeFileSync(OUT_JSON, JSON.stringify({
    geradoEm,
    fonteDados: data.source,
    dadosAtualizadosEm: data.atualizadoEm,
    totalCidadesNoUniverso: data.totalCidades,
    totalJaCadastradas: data.totalCadastradas,
    totalNaFila: fila.length,
    fila: fila.map((c, idx) => ({
      posicaoNaFila: idx + 1,
      cidade: c.cidade,
      uf: c.uf,
      populacao: c.populacao,
      notaOportunidade: c.notaOportunidade,
      indiceConcorrenciaFraca: c.indiceConcorrenciaFraca,
      notaFinal: c.notaFinal,
    })),
  }, null, 2) + '\n', 'utf-8');

  // --- Markdown (leitura por humano ou IA) ---
  const top50 = fila.slice(0, 50);
  const linhas = top50.map((c, idx) => {
    return `| ${idx + 1} | **${c.cidade}/${c.uf}** | ${formatPopulacao(c.populacao)} | ${pct(c.indiceConcorrenciaFraca)} | ${Math.round(c.notaOportunidade).toLocaleString('pt-BR')} | ${c.notaFinal !== null ? Math.round(c.notaFinal).toLocaleString('pt-BR') : '—'} |`;
  }).join('\n');

  const md = `# 📋 Fila de Próximas Cidades a Criar

> **Para qualquer IA (Claude, Antigravity/Gemini, ChatGPT) ou humano que pegue este projeto:**
> este arquivo responde "qual cidade eu crio agora?" — a fila já vem ordenada
> pela **maior chance de ranquear rápido primeiro** (menor concorrência real
> no Google, não só maior população). Pegue a cidade na posição 1 que ainda
> não tenha sido criada; se ela já foi criada desde a última geração deste
> arquivo, rode o comando abaixo de novo antes de continuar.

⚠️ **Este arquivo é um snapshot gerado automaticamente — pode ficar
desatualizado assim que uma cidade da lista for cadastrada.** Antes de
confiar cegamente na posição 1, regenere:

\`\`\`bash
node apps/web-dashboard/scripts/generate_proximas_cidades.cjs
\`\`\`

(Precisa do backend do painel rodando em \`localhost:5002\` — se não estiver,
o script sobe uma instância temporária sozinho, não precisa fazer nada
extra.) Isso reescreve este arquivo e o \`docs/proximas-cidades.json\`
(mesmo dado em formato máquina, caso prefira ler via script).

## Como escolher e criar a próxima cidade

1. **Regenere a fila** (comando acima) — a ordem pode ter mudado se alguém
   raspou mais dados de SERP ou cadastrou uma cidade.
2. **Pegue a primeira linha da tabela abaixo que ainda não existe em**
   \`apps/web-dashboard/data/cities.json\` (confira pelo nome da cidade — a
   fila já filtra as cadastradas no momento em que foi gerada, mas confirme
   se o snapshot não estiver velho).
3. **Siga a skill \`criar-site-desentupidora\`** (\`.agents/skills/criar-site-desentupidora/SKILL.md\`)
   pra criar o site da cidade escolhida — ela tem o passo a passo completo
   (bairros reais, texto único por bairro, schema, etc.).
4. **Antes de publicar**, rode o checklist obrigatório da skill
   \`checklist-pre-publicacao\` (\`.agents/skills/checklist-pre-publicacao/SKILL.md\`)
   — inclui a checagem dos 7 itens de SEO on-page (ver \`CLAUDE_CODE_GUIDE.md\`).
5. **Hospedagem**: nunca usar Netlify enquanto o aviso ativo em
   \`CLAUDE_CODE_GUIDE.md\` (topo do arquivo) estiver valendo — usar
   Cloudflare Pages, Vercel ou Render.
6. Depois de cadastrar a cidade em \`cities.json\`, regenere este arquivo de
   novo — ela sai automaticamente da fila (o script cruza com
   \`cities.json\` toda vez que roda).

## O que significa cada coluna

- **Concorrência Fraca**: proporção do top 10 do Google pra "desentupidora
  \`<cidade>\`" que NÃO é site próprio de concorrente (é rede social,
  diretório ou marketplace) — quanto maior, mais fácil ranquear. Ver
  metodologia completa em \`docs/mapa-oportunidades-expansao.md\`.
- **Nota Oportunidade**: população × % de saneamento real da cidade — quanto
  maior, mais gente tem esgoto (logo, mais clientes em potencial).
- **Nota Final**: Nota Oportunidade ajustada pela concorrência fraca —
  critério combinado, mas a ordenação da fila usa primeiro Concorrência
  Fraca e só desempata por Nota Oportunidade (prioriza "fácil de ranquear"
  sobre "mercado grande").

## Fila (top 50 de ${fila.length} candidatas — ver \`proximas-cidades.json\` pra lista completa)

| # | Cidade/UF | População | Concorrência Fraca | Nota Oportunidade | Nota Final |
|---|-----------|-----------|---------------------|--------------------|------------|
${linhas}

---

*Gerado em ${geradoEm} · fonte: ${data.source} · dados da planilha atualizados em ${data.atualizadoEm} · ${data.totalCidades} cidades no universo, ${data.totalCadastradas} já cadastradas, ${fila.length} na fila.*
`;

  fs.writeFileSync(OUT_MD, md, 'utf-8');
  console.log(`✅ Gerado ${OUT_MD}`);
  console.log(`✅ Gerado ${OUT_JSON}`);
  console.log(`Fila com ${fila.length} cidades. Próxima: ${fila[0]?.cidade}/${fila[0]?.uf} (${pct(fila[0]?.indiceConcorrenciaFraca)} de concorrência fraca).`);
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
