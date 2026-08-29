// Cloudflare Pages Function (middleware) — roda em toda requisição.
//
// Implementa negociação de conteúdo real: se o agente/IA mandar
// `Accept: text/markdown` (ou incluir "markdown" no Accept) na MESMA URL da
// página normal, respondemos com a versão em Markdown daquela página
// (gerada em build-time por index.md.ts / [slug].md.ts), em vez do HTML.
//
// IMPORTANTE — limitação documentada: isso funciona no deploy via
// Cloudflare Pages (o host recomendado/padrão). Vercel e Netlify não usam
// esta pasta 'functions/' — cada um tem seu próprio mecanismo de edge
// functions, com sintaxe diferente, ainda não implementado nesta versão.
// Ver docs/auditoria-seo-DEPOIS.md para o detalhe dessa limitação.
export async function onRequest(context) {
  const { request, next } = context;
  const acceptHeader = request.headers.get('Accept') || '';

  const wantsMarkdown = acceptHeader.includes('text/markdown');
  if (!wantsMarkdown) {
    return next();
  }

  const url = new URL(request.url);
  // Página raiz -> /index.md ; qualquer outra página -> /<slug>.md
  const path = url.pathname === '/' ? '/index.md' : `${url.pathname.replace(/\/$/, '')}.md`;

  const markdownUrl = new URL(path, url.origin);
  const markdownResponse = await context.env.ASSETS.fetch(new Request(markdownUrl, request));

  if (markdownResponse.status === 404) {
    // Não existe versão em Markdown para esta rota específica -> segue o
    // fluxo normal em HTML em vez de devolver um 404 pro agente.
    return next();
  }

  return markdownResponse;
}
