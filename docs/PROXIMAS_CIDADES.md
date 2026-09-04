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

## Fila (top 50 de 506 candidatas — ver `proximas-cidades.json` pra lista completa)

| # | Cidade/UF | População | Concorrência Fraca | Nota Oportunidade | Nota Final |
|---|-----------|-----------|---------------------|--------------------|------------|
| 1 | **Rio das Ostras/RJ** | 168.455 | 57% | 41.558 | 65.305 |
| 2 | **Patos de Minas/MG** | 169.173 | 56% | 131.904 | 205.184 |
| 3 | **Teófilo Otoni/MG** | 142.851 | 56% | 88.225 | 137.239 |
| 4 | **Altamira/PA** | 138.749 | 56% | 60.189 | 93.627 |
| 5 | **Umuarama/PR** | 123.059 | 50% | 117.078 | 175.617 |
| 6 | **Itabira/MG** | 118.053 | 50% | 102.198 | 153.297 |
| 7 | **Pato Branco/PR** | 97.821 | 50% | 89.868 | 134.802 |
| 8 | **Bagé/RS** | 121.928 | 50% | 75.790 | 113.685 |
| 9 | **Unaí/MG** | 91.320 | 50% | 62.819 | 94.229 |
| 10 | **Tangará da Serra/MT** | 114.603 | 50% | 25.476 | 38.214 |
| 11 | **Tianguá/CE** | 86.968 | 50% | 14.228 | 21.342 |
| 12 | **Tucano/BA** | 51.016 | 50% | 9.397 | 14.096 |
| 13 | **Ariquemes/RO** | 109.170 | 50% | 2.456 | 3.684 |
| 14 | **Angra dos Reis/RJ** | 179.142 | 44% | 92.079 | 133.003 |
| 15 | **Ubá/MG** | 107.423 | 44% | 86.411 | 124.816 |
| 16 | **Timóteo/MG** | 84.172 | 44% | 77.741 | 112.293 |
| 17 | **Luís Eduardo Magalhães/BA** | 118.382 | 44% | 70.496 | 101.828 |
| 18 | **Mineiros/GO** | 74.999 | 44% | 70.072 | 101.215 |
| 19 | **Rio Grande/RS** | 198.935 | 44% | 68.573 | 99.050 |
| 20 | **Primavera do Leste/MT** | 96.006 | 44% | 68.366 | 98.751 |
| 21 | **Frutal/MG** | 61.275 | 44% | 47.194 | 68.169 |
| 22 | **Crato/CE** | 139.027 | 44% | 38.371 | 55.425 |
| 23 | **Medianeira/PR** | 57.910 | 44% | 24.351 | 35.174 |
| 24 | **Brusque/SC** | 155.307 | 44% | 0 | 0 |
| 25 | **Vilhena/RO** | 109.651 | 44% | 0 | 0 |
| 26 | **Itapipoca/CE** | 138.978 | 43% | 25.391 | 36.273 |
| 27 | **Maranguape/CE** | 108.622 | 43% | 12.850 | 18.357 |
| 28 | **Ilhéus/BA** | 189.149 | 40% | 103.767 | 145.274 |
| 29 | **Telêmaco Borba/PR** | 77.479 | 40% | 74.628 | 104.479 |
| 30 | **Patos/PB** | 108.104 | 40% | 13.783 | 19.296 |
| 31 | **Erechim/RS** | 109.609 | 40% | 0 | 0 |
| 32 | **Barra Mansa/RJ** | 181.679 | 38% | 134.897 | 185.483 |
| 33 | **Uruguaiana/RS** | 120.819 | 38% | 106.973 | 147.088 |
| 34 | **Passos/MG** | 116.951 | 38% | 103.817 | 142.748 |
| 35 | **Francisco Beltrão/PR** | 102.312 | 38% | 80.816 | 111.122 |
| 36 | **Timon/MA** | 182.711 | 38% | 58.011 | 79.765 |
| 37 | **Barra do Garças/MT** | 73.878 | 38% | 50.244 | 69.086 |
| 38 | **Inhumas/GO** | 53.884 | 38% | 41.119 | 56.539 |
| 39 | **Cachoeira do Sul/RS** | 82.222 | 38% | 30.365 | 41.752 |
| 40 | **Lagarto/SE** | 105.957 | 38% | 8.243 | 11.334 |
| 41 | **Biguaçu/SC** | 83.756 | 38% | 0 | 0 |
| 42 | **Rio do Sul/SC** | 77.451 | 38% | 0 | 0 |
| 43 | **Ouricuri/PE** | 68.489 | 38% | 0 | 0 |
| 44 | **Mafra/SC** | 57.262 | 38% | 0 | 0 |
| 45 | **Itapetininga/SP** | 164.256 | 33% | 138.024 | 184.032 |
| 46 | **Apucarana/PR** | 134.910 | 33% | 127.962 | 170.616 |
| 47 | **Jequié/BA** | 169.201 | 33% | 127.324 | 169.765 |
| 48 | **Varginha/MG** | 143.676 | 33% | 126.262 | 168.349 |
| 49 | **Barreiras/BA** | 171.634 | 33% | 117.260 | 156.347 |
| 50 | **Tatuí/SP** | 129.130 | 33% | 104.337 | 139.116 |

---

*Gerado em 2026-09-04T13:58:13.052Z · fonte: planilha-google · dados da planilha atualizados em 2026-09-04T13:58:12.189Z · 526 cidades no universo, 20 já cadastradas, 506 na fila.*
