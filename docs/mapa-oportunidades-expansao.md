# Mapa de Oportunidades — Expansão Desentupidoras Brasil 2026

Sistema de inteligência de mercado pra decidir em quais cidades brasileiras abrir uma **nova** operação de desentupidora — expansão da rede, distinta dos sites já existentes (Hidro Curitiba, São José, Curitibana, Cidade, Aqui Perto). Iniciado em 26/08/2026.

Esse documento é a fonte de verdade do projeto de decisão de cidades. As cidades escolhidas aqui viram input pro `web-dashboard` / `cityConfig.json` deste repo, que gera o site novo em `apps/site-template-astro`.

⚠️ **O painel NÃO puxa a planilha automaticamente** (achado 03/09/2026) —
não existe nenhuma integração entre o Google Sheets
`BANCO_CIDADES_DESENTUPIDORAS_2026` e `cities.json`. A tabela "Top 12
atual" abaixo é uma **cópia manual congelada** do ranking da planilha,
atualizada à mão sempre que uma cidade é cadastrada. Se a planilha for
recalculada (nova rodada de SERP, dado de concorrência, etc.), essa tabela
fica desatualizada até alguém copiar de novo — sempre conferir a planilha
original se o ranking parecer antigo.

## Artefatos principais (links)

- **Caderno NotebookLM**: "MAPA DE OPORTUNIDADES — DESENTUPIDORAS BRASIL 2026" — https://notebook.google.com/notebook/7956e02e-7fcf-4aab-a233-e2db4e92a995 — contém notas "Descrição" e "Prompts de Análise" (prompt mestre + 2 prompts de ranking) e fontes públicas (IBGE, Receita Federal/CNPJ, Google Trends, SINISA, DATASUS, Portal de Dados Abertos).
- **Planilha principal (Google Sheets)**: "BANCO_CIDADES_DESENTUPIDORAS_2026" — https://docs.google.com/spreadsheets/d/1JnhZ1fVngKpJgvsF6jm83YH1Kzmj71U1WAz5mvW_IaI/edit — abas: `Banco_Cidades` (524 cidades), `Legenda`, `SERP_Bruto` (concorrência via busca Google), `Google_Maps_Concorrentes` (vazia, aguardando scraping), `Saneamento_SNIS` (dado real de saneamento), `Pop_Atendida_Esgoto` (auxiliar).
- **Planilha de scoring de concorrência (Google Sheets, 03/09/2026)**: "SCORING_CONCORRENCIA_DESENTUPIDORAS_2026_COMPLETO" — https://docs.google.com/spreadsheets/d/1g2snXkPohdDVS75nHTCJJP4JW6XiLOjE8OqxlGiencE/edit — planilha à parte (não é aba da principal), gerada via raspagem real de SERP (ver seção "Índice de Concorrência Fraca (SERP)" abaixo). Contém as 524 cidades do universo + Joinville/Maringá (fora do universo, mas já publicadas), com Índice de Concorrência Fraca calculado para 522 das 524 (faltam só Araucária e Porto Seguro, cadastradas antes da raspagem começar).

## Metodologia

**Universo de cidades**: 524 municípios brasileiros com população entre 50 mil e 200 mil habitantes (fonte: IBGE, estimativa oficial 01/07/2025, baixada diretamente de ftp.ibge.gov.br). Distribuição: Sudeste 184, Nordeste 154, Sul 93 (PR 29, SC 27), Norte 60, Centro-Oeste 33.

**Nota de oportunidade** (fórmula-alvo, versão parcial já calculada — falta o componente de concorrência):
```
Nota Oportunidade = (% rede de esgoto × população) ÷ (nº de concorrentes fortes + 1)
```
Princípio central (definido pelo Pedro): não procurar a cidade com menos concorrentes, e sim a cidade com o maior número de potenciais clientes por concorrente forte — uma cidade de 200 mil habitantes com 5 concorrentes fracos pode valer mais que uma de 20 mil com 1 concorrente.

**Fonte de saneamento**: SNIS via Base dos Dados (basedosdados.org, dataset `basedosdados.br_mdr_snis.municipio_agua_esgoto`), acessível via BigQuery (grátis, modo Sandbox). 436 das 524 cidades têm dado de 2022; 88 não reportaram (marcadas "a confirmar" na planilha, nunca inventado).

**⚠️ Cuidado com o indicador `indice_coleta_esgoto` do SNIS**: NÃO é "% da população com esgoto". É a razão `população atendida por coleta de esgoto ÷ população atendida por água` — em cidades onde a cobertura de água também não é universal, esse índice infla muito o número (ex: Porto Seguro aparecia 100%, o real é ~57%). Detectado em 27/08/2026 ao cruzar com estimativa externa. **Métrica correta**: `Saneamento_pct_real = populacao_atentida_esgoto (SNIS) ÷ Populacao (IBGE) × 100` — já corrigido na planilha (aba `Saneamento_SNIS`, colunas O e P). Se recalcular do zero via BigQuery, sempre puxar `populacao_atentida_esgoto` (valor absoluto) e dividir pela população total do IBGE — nunca usar `indice_coleta_esgoto` puro.

**Fonte de concorrência (SERP)**: MCP de SERP conectado (Ubersuggest/Semrush) — **limite de 50 buscas/mês**, já usadas ~5 (testado com Rondonópolis/MT). Só Rondonópolis foi rodado até agora.

**Fonte de concorrência (Google Maps)**: ainda sem solução automatizada. Opções discutidas: Outscraper ou Apify (scraping pago, fora do Claude) — ainda não contratado.

## Índice de Concorrência Fraca (SERP) — 03/09/2026

Componente de concorrência que faltava na Nota Oportunidade, finalmente resolvido nesta data. Decisão do Pedro (03/09/2026): **não usar Google Maps** — o sinal que importa é se o TOP 10 orgânico do Google pra "desentupidora <cidade>" está dominado por sites próprios de concorrentes reais (`site_proprio`, sinal de mercado difícil) ou por redes sociais/diretórios/marketplaces (sinal de mercado fraco, fácil de ranquear).

**Classificação de domínio** (por posição no top 10):
- `social`: facebook.com, instagram.com, wa.me, linkedin.com, youtube.com
- `diretorio`: akilar.com.br, guiamais.com.br, telelistas.net, solutudo.com.br, apontador.com.br, guialocal.com.br, listacapital.com.br, guiafone.com.br, empresasfaceis.com.br, catalogoempresas.com.br, triponon.com, iguide.com.br, econtreaqui.com.br, anunciar-classificados.com.br, getninjas.com.br, starofservice.com.br, clickdisk.com.br, econodata.com.br, guiafix.com.br, mechameaqui.com.br
- `marketplace`: olx.com.br, mercadolivre.com.br/.com, wa.me, linktr.ee
- `site_proprio`: qualquer outro domínio (é o sinal de concorrência REAL)

`Índice de Concorrência Fraca = (social + diretorio + marketplace) / total de resultados` — quanto maior, mais fácil o mercado (dominado por presença fraca, não por concorrentes com site próprio otimizado).

**Ferramenta tentada primeiro (falhou)**: DataForSEO (`apps/web-dashboard/scripts/serp_scrape_dataforseo.mjs`) — credenciais válidas (confirmado via endpoint `/v3/appendix/user_data`), mas o endpoint de SERP real sempre devolveu `403 — verify your account` mesmo após ativação por e-mail. Causa provável: `day.serp.task_post: 0` no plano gratuito (SERP travado atrás de método de pagamento, distinto da ativação básica de conta). Abandonado por decisão do Pedro ("se não der vamos tentar outro") — script mantido no repo como fallback documentado caso a DataForSEO libere o plano no futuro.

**Ferramenta usada de fato**: [Serper.dev](https://serper.dev) (`apps/web-dashboard/scripts/serp_scrape_serper.mjs`) — funcionou de primeira, sem fricção de verificação. Chave em `apps/web-dashboard/data/settings.json` → `serper.apiKey` (gitignored). Uso:
```bash
# teste com 1 cidade
SERPER_API_KEY=xxx node apps/web-dashboard/scripts/serp_scrape_serper.mjs --cidade "Jaraguá do Sul" --uf SC
# lote (resumível — pula cidades já presentes no --out)
SERPER_API_KEY=xxx node apps/web-dashboard/scripts/serp_scrape_serper.mjs --csv cidades.csv --out resultado.csv
```

**Raspagem completa rodada em 03/09/2026**: as 524 cidades do universo foram testadas (exceto Araucária e Porto Seguro, cadastradas antes de entrarem na fila) + Joinville e Maringá (fora do universo, mas já publicadas) = **522 cidades com dado real**. Custo: **522 créditos de ~2.500 grátis no Serper.dev** (sobram ~1.978). Todas as buscas rodaram com um intervalo de 800ms entre requisições pra não sobrecarregar a API. 0 erros em todas as ~536 buscas feitas.

**Top oportunidades reveladas** (maior Índice de Concorrência Fraca entre cidades ainda `livre`):

| Cidade/UF | Índice Concorrência Fraca | Rank Nota Oportunidade |
|---|---|---|
| Rio das Ostras/RJ | 57% | 237 |
| Patos de Minas/MG | 56% | 21 |
| Teófilo Otoni/MG | 56% | 94 |
| Altamira/PA | 56% | 158 |
| Umuarama/PR | 50% | 39 |
| Itabira/MG | 50% | 64 |
| Pato Branco/PR | 50% | 90 |
| Bagé/RS | 50% | 117 |
| Unaí/MG | 50% | 152 |
| Tangará da Serra/MT | 50% | 287 |

⚠️ **Validação do método**: das 7 cidades já cadastradas testadas (Cachoeiro, Guarapuava, Santa Bárbara d'Oeste, Itabuna, São Caetano do Sul, Poços de Caldas, Ferraz de Vasconcelos, Jaraguá do Sul, Linhares), o índice médio de concorrência fraca ficou em torno de 20-30% — nem sempre alto, ou seja, **a Nota Oportunidade (população × saneamento) não garante por si só um mercado de baixa concorrência**. Ex.: São Caetano do Sul e Ferraz de Vasconcelos deram 0% (mercado dominado por sites próprios) mesmo estando no topo do ranking de oportunidade parcial. A leitura correta é: usar a Nota Oportunidade pra filtrar o universo de cidades grandes/com saneamento bom, e o Índice de Concorrência Fraca pra desempatar/priorizar dentro desse universo — nunca um sozinho.

**Limitação de ferramentas encontrada ao subir os resultados pro Sheets**: as ferramentas de Google Drive disponíveis (`create_file`/`update_file`) **não editam célula em planilha existente** — só criam arquivo novo (sem parâmetro de "sobrescrever") ou alteram metadado (título/pasta). Pra atualizar a planilha com novos dados, o único caminho é regenerar o CSV completo (mesclando o que já existia) e subir como arquivo novo — o link muda a cada atualização. Por isso a fórmula viva do Sheets (`REPT()`/`IF()` por linha) foi trocada por **valores já calculados** na versão final — um CSV com ~524 fórmulas repetidas passou do limite de uma única resposta do modelo e cortou a planilha pela metade na primeira tentativa (gerou um arquivo truncado, corrigido logo em seguida).

## Status em 27/08/2026

- ✅ Planilha de 524 cidades criada e populada (população real IBGE).
- ✅ Dados de saneamento (SNIS 2022) cruzados: `Banco_Cidades!T` (Saneamento) e `!U` (Rede de esgoto) ligados por PROCV/ÍNDICE+CORRESP à aba `Saneamento_SNIS` pela chave Cidade|UF (coluna L). Usa a métrica corrigida `Saneamento_pct_real`.
- ✅ Nota Oportunidade Parcial (`Banco_Cidades!AI` = população × %saneamento real) e Ranking Parcial (`!AJ`) calculados pras 524 cidades.
- ✅ Caderno NotebookLM criado com fontes e prompts de análise salvos.
- ✅ Índice de Concorrência Fraca via SERP (Serper.dev) rodado pra 522 das 524 cidades do universo + Joinville/Maringá — ver seção "Índice de Concorrência Fraca (SERP)" acima. Resultado consolidado na planilha `SCORING_CONCORRENCIA_DESENTUPIDORAS_2026_COMPLETO` (link acima).
- ⏳ Pendente: rodar SERP pras 2 cidades cadastradas que ficaram de fora (Araucária, Porto Seguro) — só pra completar o dado, não bloqueia nada.
- ⏳ Pendente: scraping do Google Maps por cidade — descartado por decisão do Pedro em 03/09/2026 (SERP orgânico é o sinal que importa, não avaliações do Maps).
- ⏳ Pendente: dados internos da Desentupidora Curitibana (ticket médio, origem do cliente, chamados/mês) — fonte mais diferenciadora, ainda não coletada.
- ⏳ Pendente: consolidar Nota Oportunidade × Índice de Concorrência Fraca numa única nota final de decisão (hoje as duas métricas existem lado a lado na planilha de scoring, mas ainda não foram combinadas numa fórmula única validada).
- ⏳ Pendente: conectar a cidade escolhida aqui ao `cityConfig.json` do `web-dashboard` pra gerar o site.

### Top 12 atual — Nota Oportunidade Parcial (só população × saneamento, sem concorrência ainda)

| # | Cidade | UF | População | Saneamento real | Nota | Status |
|---|--------|----|-----------|------------------|------|--------|
| 1 | Cachoeiro de Itapemirim | ES | 198.342 | 93,7% | 185.787 | ✅ cadastrada |
| 2 | Guarapuava | PR | 189.630 | 96,0% | 182.083 | ✅ cadastrada |
| 3 | Santa Bárbara d'Oeste | SP | 189.456 | 95,6% | 181.044 | ✅ cadastrada |
| 4 | Itabuna | BA | 196.344 | 89,8% | 176.219 | ✅ cadastrada |
| 5 | São Caetano do Sul | SP | 172.693 | 95,9% | 165.647 | ✅ cadastrada 31/08/2026 (Render) |
| 6 | Poços de Caldas | MG | 172.339 | 95,0% | 163.739 | ✅ cadastrada |
| 7 | Ferraz de Vasconcelos | SP | 186.479 | 86,8% | 161.901 | ✅ cadastrada (publicada — status atualizado 03/09/2026, era rascunho quando esse documento foi escrito) |
| 8 | Jaraguá do Sul | SC | 199.519 | 78,2% | 156.044 | ✅ cadastrada (publicada — status atualizado 03/09/2026) |
| 9 | Pindamonhangaba | SP | 172.681 | 90,3% | 155.983 | pendente |
| 10 | Fazenda Rio Grande | PR | 165.943 | 89,7% | 148.851 | pendente |
| 11 | Linhares | ES | 183.797 | 80,6% | 148.214 | ✅ cadastrada |
| 12 | Mogi Guaçu | SP | 160.318 | 91,5% | 146.659 | pendente |

⚠️ Essa lista ainda não considera concorrência — ver seção "Índice de Concorrência Fraca (SERP)" abaixo pro dado real de concorrência, já disponível pra quase todo o universo.

**Fora do universo ranqueado, mas já publicadas**: Joinville/SC (~600k hab.) e Maringá/PR (~430k hab.) — população acima do teto de 200k do universo de 524 cidades, mas foram cadastradas mesmo assim (decisão fora deste documento). Incluídas na planilha de scoring de concorrência como linhas informativas extras.

## Lições técnicas (Google Sheets)

- BigQuery: colar uma lista `IN(...)` de 500+ valores numa linha só quebra ("unclosed string literal") — quebrar em várias linhas curtas resolve.
- Exportar resultado do BigQuery pro Google Sheets embaralha colunas quando há vírgula decimal brasileira colidindo com separador de coluna — exportar como **CSV local** e ler o CSV bruto evita o problema.
- Criar planilha nova via Drive API (`create_file` com `textContent` CSV) é mais confiável que upload pela UI do Sheets. Parâmetros certos: `textContent` + `contentMimeType` (nunca `content`/`mimeType`, deprecated e exigem base64).
- **Bug grave (27/08)**: nessa planilha específica, `SEERRO`/`IFERROR` retornava valor errado (parecido com serial de data) em certas linhas, de forma determinística. Solução: evitar `IFERROR` e usar `SE(ÉNÃOVÁLIDO(...))` / `SE(ÉERROS(...))` no lugar.
- Dado importado via CSV pro Sheets vira **texto**, não número, mesmo parecendo número. Corrigir com `VALOR(SUBSTITUIR(celula;".";","))` (locale pt-BR usa vírgula decimal).
- `ARRAYFORMULA` numa coluna não pode receber `Ctrl+D` por cima — dá `#REF!`. Preencher só colunas que não são array formula.
- Automação do Sheets via Claude in Chrome foi instável nesta sessão: preferir clicar direto nas células a usar a caixa de nome; conferir com screenshot após cada edição de fórmula importante.
