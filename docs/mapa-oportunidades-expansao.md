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

## Status em 27/08/2026

- ✅ Planilha de 524 cidades criada e populada (população real IBGE).
- ✅ Dados de saneamento (SNIS 2022) cruzados: `Banco_Cidades!T` (Saneamento) e `!U` (Rede de esgoto) ligados por PROCV/ÍNDICE+CORRESP à aba `Saneamento_SNIS` pela chave Cidade|UF (coluna L). Usa a métrica corrigida `Saneamento_pct_real`.
- ✅ Nota Oportunidade Parcial (`Banco_Cidades!AI` = população × %saneamento real) e Ranking Parcial (`!AJ`) calculados pras 524 cidades.
- ✅ Caderno NotebookLM criado com fontes e prompts de análise salvos.
- ⏳ Pendente: rodar SERP pra mais cidades (cota de ~45 buscas/mês restantes) — priorizar top da Nota Oportunidade Parcial e/ou PR/SC.
- ⏳ Pendente: scraping do Google Maps por cidade (reviews, site, WhatsApp, 24h) — precisa de ferramenta paga externa.
- ⏳ Pendente: dados internos da Desentupidora Curitibana (ticket médio, origem do cliente, chamados/mês) — fonte mais diferenciadora, ainda não coletada.
- ⏳ Pendente: Nota Oportunidade final (com concorrência) — hoje só existe a versão parcial.
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
| 7 | Ferraz de Vasconcelos | SP | 186.479 | 86,8% | 161.901 | ⚠️ rascunho em `cities.json` (`isDraft: true`, feito pelo ChatGPT em sessão paralela — ainda não publicada, ver `docs/MODELOS_09_A_11_2026-09-02.md`) |
| 8 | Jaraguá do Sul | SC | 199.519 | 78,2% | 156.044 | pendente |
| 9 | Pindamonhangaba | SP | 172.681 | 90,3% | 155.983 | pendente |
| 10 | Fazenda Rio Grande | PR | 165.943 | 89,7% | 148.851 | pendente |
| 11 | Linhares | ES | 183.797 | 80,6% | 148.214 | ✅ cadastrada |
| 12 | Mogi Guaçu | SP | 160.318 | 91,5% | 146.659 | pendente |

⚠️ Essa lista ainda não considera concorrência — cidades com muitos concorrentes fortes podem cair no ranking final quando o dado de SERP/Google Maps entrar.

## Lições técnicas (Google Sheets)

- BigQuery: colar uma lista `IN(...)` de 500+ valores numa linha só quebra ("unclosed string literal") — quebrar em várias linhas curtas resolve.
- Exportar resultado do BigQuery pro Google Sheets embaralha colunas quando há vírgula decimal brasileira colidindo com separador de coluna — exportar como **CSV local** e ler o CSV bruto evita o problema.
- Criar planilha nova via Drive API (`create_file` com `textContent` CSV) é mais confiável que upload pela UI do Sheets. Parâmetros certos: `textContent` + `contentMimeType` (nunca `content`/`mimeType`, deprecated e exigem base64).
- **Bug grave (27/08)**: nessa planilha específica, `SEERRO`/`IFERROR` retornava valor errado (parecido com serial de data) em certas linhas, de forma determinística. Solução: evitar `IFERROR` e usar `SE(ÉNÃOVÁLIDO(...))` / `SE(ÉERROS(...))` no lugar.
- Dado importado via CSV pro Sheets vira **texto**, não número, mesmo parecendo número. Corrigir com `VALOR(SUBSTITUIR(celula;".";","))` (locale pt-BR usa vírgula decimal).
- `ARRAYFORMULA` numa coluna não pode receber `Ctrl+D` por cima — dá `#REF!`. Preencher só colunas que não são array formula.
- Automação do Sheets via Claude in Chrome foi instável nesta sessão: preferir clicar direto nas células a usar a caixa de nome; conferir com screenshot após cada edição de fórmula importante.
