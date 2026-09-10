# 📋 Fila de Próximas Cidades a Criar

> **Para qualquer IA (Claude, Antigravity/Gemini, ChatGPT) ou humano que pegue este projeto:**
> este arquivo responde "qual cidade eu crio agora?" — a fila já vem ordenada
> pela **maior chance de ranquear rápido primeiro** (menor concorrência real
> no Google, não só maior população). Pegue a cidade na posição 1 que ainda
> não tenha sido criada; se ela já foi criada desde a última geração deste
> arquivo, rode o comando abaixo de novo antes de continuar.

⚠️ **Este arquivo é um snapshot gerado automaticamente — pode ficar
desatualizado assim que uma cidade da lista for cadastrada.** Antes de
confiar cegamente na posição 1, regenere:

```bash
node apps/web-dashboard/scripts/generate_proximas_cidades.cjs
```

(Precisa do backend do painel rodando em `localhost:5002` — se não estiver,
o script sobe uma instância temporária sozinho, não precisa fazer nada
extra.) Isso reescreve este arquivo e o `docs/proximas-cidades.json`
(mesmo dado em formato máquina, caso prefira ler via script).

## Como escolher e criar a próxima cidade

1. **Regenere a fila** (comando acima) — a ordem pode ter mudado se alguém
   raspou mais dados de SERP ou cadastrou uma cidade.
2. **Pegue a primeira linha da tabela abaixo que ainda não existe em**
   `apps/web-dashboard/data/cities.json` (confira pelo nome da cidade — a
   fila já filtra as cadastradas no momento em que foi gerada, mas confirme
   se o snapshot não estiver velho).
3. **Siga a skill `criar-site-desentupidora`** (`.agents/skills/criar-site-desentupidora/SKILL.md`)
   pra criar o site da cidade escolhida — ela tem o passo a passo completo
   (bairros reais, texto único por bairro, schema, etc.).
4. **Antes de publicar**, rode o checklist obrigatório da skill
   `checklist-pre-publicacao` (`.agents/skills/checklist-pre-publicacao/SKILL.md`)
   — inclui a checagem dos 7 itens de SEO on-page (ver `CLAUDE_CODE_GUIDE.md`).
5. **Hospedagem**: nunca usar Netlify enquanto o aviso ativo em
   `CLAUDE_CODE_GUIDE.md` (topo do arquivo) estiver valendo — usar
   Cloudflare Pages, Vercel ou Render.
6. Depois de cadastrar a cidade em `cities.json`, regenere este arquivo de
   novo — ela sai automaticamente da fila (o script cruza com
   `cities.json` toda vez que roda).

## O que significa cada coluna

- **Concorrência Fraca**: proporção do top 10 do Google pra "desentupidora
  `<cidade>`" que NÃO é site próprio de concorrente (é rede social,
  diretório ou marketplace) — quanto maior, mais fácil ranquear. Ver
  metodologia completa em `docs/mapa-oportunidades-expansao.md`.
- **Nota Oportunidade**: população × % de saneamento real da cidade — quanto
  maior, mais gente tem esgoto (logo, mais clientes em potencial).
- **Nota Final**: Nota Oportunidade ajustada pela concorrência fraca —
  critério combinado, mas a ordenação da fila usa primeiro Concorrência
  Fraca e só desempata por Nota Oportunidade (prioriza "fácil de ranquear"
  sobre "mercado grande").

## Fila (top 50 de 474 candidatas — ver `proximas-cidades.json` pra lista completa)

| # | Cidade/UF | População | Concorrência Fraca | Nota Oportunidade | Nota Final |
|---|-----------|-----------|---------------------|--------------------|------------|
| 1 | **Lagarto/SE** | 105.957 | 38% | 8.243 | 11.334 |
| 2 | **Biguaçu/SC** | 83.756 | 38% | 0 | 0 |
| 3 | **Rio do Sul/SC** | 77.451 | 38% | 0 | 0 |
| 13 | **Ouricuri/PE** | 68.489 | 38% | 0 | 0 |
| 14 | **Mafra/SC** | 57.262 | 38% | 0 | 0 |
| 15 | **Apucarana/PR** | 134.910 | 33% | 127.962 | 170.616 |
| 16 | **Jequié/BA** | 169.201 | 33% | 127.324 | 169.765 |
| 17 | **Varginha/MG** | 143.676 | 33% | 126.262 | 168.349 |
| 18 | **Barreiras/BA** | 171.634 | 33% | 117.260 | 156.347 |
| 19 | **Tatuí/SP** | 129.130 | 33% | 104.337 | 139.116 |
| 20 | **Trindade/GO** | 153.560 | 33% | 98.877 | 131.836 |
| 21 | **Conselheiro Lafaiete/MG** | 138.946 | 33% | 97.082 | 129.443 |
| 22 | **Muriaé/MG** | 108.447 | 33% | 95.889 | 127.852 |
| 23 | **Ituiutaba/MG** | 106.775 | 33% | 93.353 | 124.471 |
| 24 | **Lavras/MG** | 110.682 | 33% | 92.895 | 123.860 |
| 25 | **Teixeira de Freitas/BA** | 153.738 | 33% | 85.694 | 114.259 |
| 26 | **Catalão/GO** | 122.760 | 33% | 72.441 | 96.588 |
| 27 | **Paracatu/MG** | 99.005 | 33% | 71.729 | 95.639 |
| 28 | **Vacaria/RS** | 66.146 | 33% | 64.036 | 85.381 |
| 29 | **Ponta Porã/MS** | 98.598 | 33% | 55.136 | 73.515 |
| 30 | **Cacoal/RO** | 98.280 | 33% | 54.496 | 72.661 |
| 31 | **Santiago/RS** | 50.336 | 33% | 48.937 | 65.249 |
| 32 | **Porto Nacional/TO** | 69.551 | 33% | 42.092 | 56.123 |
| 33 | **Palmas/PR** | 50.238 | 33% | 39.648 | 52.864 |
| 34 | **São Lourenço da Mata/PE** | 118.258 | 33% | 35.655 | 47.540 |
| 35 | **Santa Cruz do Sul/RS** | 138.270 | 33% | 29.645 | 39.527 |
| 36 | **Prudentópolis/PR** | 50.946 | 33% | 27.292 | 36.389 |
| 37 | **Alta Floresta/MT** | 62.158 | 33% | 23.608 | 31.477 |
| 38 | **Santo Ângelo/RS** | 79.146 | 33% | 23.459 | 31.279 |
| 39 | **Santo Antônio de Jesus/BA** | 109.791 | 33% | 22.968 | 30.624 |
| 40 | **Concórdia/SC** | 87.206 | 33% | 19.351 | 25.801 |
| 41 | **Araranguá/SC** | 76.611 | 33% | 15.797 | 21.063 |
| 42 | **Paraíso do Tocantins/TO** | 55.704 | 33% | 13.842 | 18.456 |
| 43 | **Eunápolis/BA** | 121.067 | 33% | 12.058 | 16.077 |
| 44 | **Irecê/BA** | 78.781 | 33% | 10.951 | 14.601 |
| 45 | **Canoinhas/SC** | 56.948 | 33% | 9.009 | 12.012 |
| 46 | **Sapé/PB** | 53.457 | 33% | 8.842 | 11.789 |
| 47 | **Araquari/SC** | 52.079 | 33% | 7.963 | 10.617 |
| 48 | **Eusébio/CE** | 82.016 | 33% | 7.480 | 9.973 |
| 49 | **Igarassu/PE** | 123.017 | 33% | 5.191 | 6.921 |
| 50 | **Ji-Paraná/RO** | 140.101 | 33% | 1.723 | 2.297 |

---

*Gerado em 2026-09-08T20:06:08.806Z · fonte: planilha-google · dados da planilha atualizados em 2026-09-08T20:06:07.343Z · 526 cidades no universo, 52 já cadastradas, 474 na fila.*
