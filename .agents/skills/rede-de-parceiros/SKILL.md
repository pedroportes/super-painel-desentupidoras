---
name: rede-de-parceiros
description: Como cadastrar, gerenciar e evoluir o módulo de Sites Parceiros / Rede de Atendimento ("Fora da Área de Cobertura") no Super Painel — inclui as regras de risco de SEO/link scheme que qualquer IA ou humano DEVE respeitar antes de tocar nesse módulo.
---

# 🤝 Rede de Parceiros ("Fora da Área de Cobertura")

Esta skill deve ser ativada sempre que o usuário pedir para: "adicionar um
parceiro", "gerenciar parceiros de [cidade]", "mexer na rede de parceiros",
ou qualquer variação de indicação/link entre sites da rede.

**Decisão de arquitetura tomada em 30/08/2026** (ver conversa original —
o usuário queria inicialmente um "rodapé com rede de parceiros em círculo
entre 3 hospedagens" pra tentar burlar a detecção do Google; essa ideia foi
substituída pelo modelo abaixo depois de analisar riscos reais de link
scheme e exemplos de mercado). **Leia a seção de risco antes de implementar
qualquer coisa nova aqui.**

---

## ⚠️ 1. Por que isso é sensível (leia antes de mexer)

O objetivo de negócio é real: nem toda "Desentupidora [Cidade] 24h" gerada
pelo painel atende de fato aquela região, e indicar uma empresa parceira que
atende é útil para o usuário. **O risco não é ter uma página de parceiros —
é ela virar, na prática, uma rede de links entre sites do mesmo dono
otimizada para ranking**, o que o Google trata como link scheme
independente da topologia (círculo, malha completa, hospedagem
diferente por site — nada disso engana a detecção, que olha template
repetido, conteúdo raso e padrão de link, não hospedagem).

Duas referências reais de mercado que confirmam o risco (pesquisadas ao
vivo, não hipotéticas):
- Um concorrente (`desentupidorakennedy.com.br`) tem um rodapé com 3 colunas
  "PARCEIROS" repetindo variações de keyword exata ("desentupidora maringá",
  "desentupidora em maringá", "desentupidora em maringá 24h") — exatamente o
  padrão de anchor text manipulation que o Google documenta como sinal de
  spam.
- Um "diretório" (`desentupidoralitoral.com.br/cidades-atendidas`) lista
  **940 localidades**, cada uma com um artigo de "19 min de leitura"
  claramente templated (mesma estrutura, trocando o nome da cidade) — um
  caso de doorway pages / scaled content abuse em escala industrial.

**Nenhum dos dois é modelo a seguir.** Servem só como "o que não fazer".

### Regras inegociáveis (documentar decisão nova aqui se alguma mudar)

1. **Nunca gerar a página se não houver parceiro ativo real cadastrado.**
   Zero parceiro = zero URL, zero link no rodapé. Nunca criar "página de
   cidade" fake sem parceiro por trás (isso vira doorway page).
2. **Poucos parceiros por cidade** (o ideal é 1 a 3). Isso nunca deve virar
   um diretório de dezenas/centenas de localidades.
3. **Link de saída (externo) só existe na subpágina daquele parceiro
   específico** — nunca no hub, nunca no rodapé, nunca em lista solta.
4. **Âncora do link de saída é sempre o nome comercial do parceiro**, nunca
   uma palavra-chave exata tipo "desentupidora cidade 24h".
5. **Texto de cada subpágina varia** (ver `introVariations` no código) — não
   pode virar um template idêntico replicado em centenas de sites, isso é
   o footprint mais fácil de detectar em escala.
6. **Nunca dado de teste/placeholder em produção.** Dado de exemplo usado
   durante desenvolvimento deve ser marcado explicitamente com
   `(EXEMPLO)` no nome e nunca publicado assim — ver seção 5.
7. **Parceiro = empresa de terceiro real com acordo de indicação**, não
   outro site da própria rede disfarçado de "parceiro". Se um dia a
   necessidade for linkar entre sites da própria rede (ex: uma cidade
   nossa cobre outra que não tem site ainda), isso precisa ser decidido
   explicitamente com o usuário de novo — não é o que este módulo faz hoje
   por padrão.

Se o usuário pedir pra "voltar" a um modelo de rede fechada/circular entre
sites próprios, ou pedir uma lista extensa de parceiros por cidade, **alertar
antes de implementar** — não seguir silenciosamente.

---

## 🏗️ 2. Arquitetura implementada

```
cidade (CityConfig)
└── parceiros: PartnerItem[]   ← fonte de verdade, um array por cidade

Astro (por cidade, gerado automaticamente no build):
  /fora-da-area-de-cobertura/                          → hub (lista os parceiros ativos)
  /fora-da-area-de-cobertura/{cidade-nome-slugificado}/ → 1 subpágina por parceiro ativo
```

Arquivos-chave:
- [`apps/site-template-astro/src/pages/fora-da-area-de-cobertura/[...partner].astro`](../../../apps/site-template-astro/src/pages/fora-da-area-de-cobertura/%5B...partner%5D.astro)
  — hub + subpágina, tudo num arquivo só via **rest param** do Astro.
  Só existe alguma rota se `cityData.parceiros` tiver pelo menos 1 item
  `status: 'ativo'` (`getStaticPaths` retorna `[]` senão).
- [`apps/site-template-astro/src/utils/partnerSlug.ts`](../../../apps/site-template-astro/src/utils/partnerSlug.ts)
  — gera o slug da URL do parceiro (`cidade-nome`). **Importante:** essa
  função tem que ficar num arquivo próprio, nunca declarada localmente
  dentro do `.astro` — o compilador do Astro separa o escopo de
  `getStaticPaths` do corpo do componente, e uma função local usada dentro
  de `getStaticPaths` quebra o build com `X is not defined` (bug real,
  já corrigido uma vez — ver histórico de commits).
- [`apps/site-template-astro/src/components/Footer.astro`](../../../apps/site-template-astro/src/components/Footer.astro)
  — mostra **um único** link "Fora da Área de Cobertura" no rodapé, só
  quando existe pelo menos 1 parceiro ativo. Nunca lista parceiros aqui.
- [`apps/web-dashboard/src/cityGenerator.ts`](../../../apps/web-dashboard/src/cityGenerator.ts)
  — interface `PartnerItem` (nome, cidade, uf, dominio, url, descricao,
  logo?, status, tipo) e campo `parceiros?: PartnerItem[]` em `CityConfig`.
- [`apps/web-dashboard/server.cjs`](../../../apps/web-dashboard/server.cjs)
  — `syncCityToAstro()` já copia `city.parceiros` pro `cityConfig.json` que
  o Astro lê. Nenhum endpoint dedicado foi criado — o CRUD de parceiro é
  feito editando o array `parceiros` da cidade e salvando pelo fluxo normal
  (`POST /api/cities`), igual bairros/FAQs/depoimentos.

### Por que `[...partner].astro` (rest param) e não `[[partner]].astro` (optional param)

Astro tem sintaxe de "parâmetro opcional" (`[[partner]]`) que parece a
escolha óbvia pra "uma rota base + uma rota com parâmetro". **Não usar** —
o gerador de manifesto do Astro (`core/routing/manifest/generator.js`)
lança `TypeError: Missing parameter` quando o valor do parâmetro é
`undefined` num segmento `dynamic`. Rest param (`[...partner]`) não tem
esse bug porque o segmento é tratado como `spread` (`params[x] || ''`).
Testado e confirmado nesta sessão — usar sempre rest param pra esse padrão
de "hub + subpágina condicional" no Astro 5.

---

## 🖥️ 3. Como gerenciar parceiros pelo painel (usuário final)

1. Abrir o painel (`http://localhost:5000`), aba **📋 Central de Cidades**.
2. Na coluna **PARCEIROS**, clicar no badge da cidade desejada (mostra a
   contagem de parceiros ativos) — ou abrir a cidade no **✏️ Abrir Editor**
   e clicar na aba **🤝 Parceiros** dentro do editor visual.
3. Preencher o formulário "+ Adicionar Parceiro": Nome, Tipo de parceria,
   Cidade + UF do parceiro, URL do site, Descrição curta.
4. Clicar em **+ Adicionar Parceiro** (ou **💾 Atualizar Parceiro** se
   estiver editando um existente). Isso atualiza o estado local e já
   sincroniza o preview ao vivo (iframe à direita).
5. Clicar em **💾 Salvar Alterações** (topo da tela) pra persistir de
   verdade em `cities.json`.
6. Clicar em **🚀 Publicar** (ou rodar Build) pra gerar `/fora-da-area-de-cobertura/`
   no site publicado daquela cidade.

Ativar/desativar um parceiro sem excluir: clicar no badge de status
("🟢 Ativo" / "⚪ Inativo") no card do parceiro — isso alterna sem apagar o
cadastro (útil pra pausar uma indicação sem perder os dados).

---

## 🧩 4. Gaps conhecidos / próximos passos (não implementados ainda)

- **Não existe endpoint de backend dedicado** para parceiro (`/api/cities/:id/parceiros`)
  — hoje tudo passa pelo upsert genérico de cidade (`POST /api/cities`).
  Funciona bem para o volume esperado (poucos parceiros por cidade); só
  vale criar endpoints dedicados se o volume crescer muito.
- **Um parceiro não pode ser compartilhado entre múltiplas cidades** hoje
  — cada cidade tem seu próprio array `parceiros`, cadastro duplicado se o
  mesmo parceiro real atender regiões de mais de uma cidade nossa. Se isso
  virar necessidade real, seria um `parceiros.json` global + campo
  "exibir em quais cidades" (era a ideia original do prompt do usuário)
  — mas só vale a complexidade extra se o número de parceiros justificar.
- **Sem upload de logo do parceiro** — campo `logo` existe no tipo mas não
  tem UI de upload no painel ainda (usa só nome/descrição/link hoje).
- **Sitemap**: `@astrojs/sitemap` já inclui `/fora-da-area-de-cobertura/*`
  automaticamente no `sitemap-index.xml` (confirmado no build) — nenhuma
  ação extra necessária aqui.

---

## 🧹 5. Estado atual dos dados (limpo)

Durante a prototipagem desta skill (30/08/2026), a cidade **Linhares**
recebeu 2 parceiros de exemplo (`(EXEMPLO)`, domínios fictícios) só para
validar visualmente o hub + subpágina. Depois de aprovados o texto e o
layout, **todos os registros de exemplo/teste foram removidos** das 10
cidades — incluindo o lixo pré-existente `"nome": "Desentupidora teste"`
que já estava em 9 delas antes desta skill existir.

Resultado: hoje **todas as cidades têm `parceiros: []`**. Isso é o estado
correto e esperado — nenhuma cidade deve gerar `/fora-da-area-de-cobertura/`
até que um parceiro **real** seja cadastrado pela UI do painel (seção 3
acima). Se algum dia aparecer de novo um registro com `(EXEMPLO)` no nome
ou `"cidade": "teste"` em produção, é sinal de regressão — remover pela UI
do painel (editar a cidade → aba 🤝 Parceiros → 🗑️ Excluir), nunca deixar
subir pro site publicado.
