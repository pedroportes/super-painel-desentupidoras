# Quality Gate de Previa

Este procedimento impede que uma cidade em rascunho pareca pronta somente porque a pagina abriu no navegador.

## O que a previa valida

Execute no projeto Astro, apos sincronizar a cidade correta:

```bash
npm run build
npm run audit:preview
```

O comando varre home, todos os bairros e todos os servicos e consulta as fontes HTTPS dos bairros. Para cada rota de conteudo, ele exige:

- um `main`, title e meta description nas faixas corretas e com `desentupidora`;
- palavra-chave em H1, primeiro paragrafo e ultimo H2;
- seis FAQs visiveis e schema `FAQPage`;
- fonte publica correspondente em toda pagina de bairro;
- fonte do bairro respondendo `200` e, para HTML, contendo o trecho registrado; PDFs oficiais sao conferidos pelo tipo de arquivo e pela evidência editorial registrada;
- corpo diferente entre as rotas;
- em rascunho: `noindex, nofollow`, sem canonical/OG de producao e sem `LocalBusiness` comercial.

## O que a previa nao autoriza

Previa verde nao e autorizacao para publicar. Uma cidade sem `deployUrl` confirmado permanece em rascunho e nao recebe sitemap, canonical ou OG de producao inventados. Dados comerciais ausentes devem ser omitidos, nunca preenchidos com estimativas.

Depois de publicar de verdade e persistir `deployUrl`, execute o checklist externo completo:

```bash
node apps/web-dashboard/scripts/checklist_completo.cjs <cityId>
```

Somente `CHECKLIST: TUDO VERDE` na URL publicada permite declarar a cidade indexavel.

## Ferraz de Vasconcelos

Em 2026-09-03, a copia isolada da configuracao de Ferraz passou em `npm run build` e `npm run audit:preview`: 24 rotas de conteudo, sendo uma home, 17 bairros e seis servicos. A cidade continua em rascunho, sem `deployUrl` e sem dados comerciais validados; portanto nao esta pronta para publicacao ou indexacao.
