import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() || '').replace(/\/$/, '');

  const content = `User-agent: *
Allow: /

# Permissões Explícitas para Agentes de IA e Motores de Resposta (AEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

# Sinais de Conteúdo (contentsignals.org)
Content-Signal: search=yes, ai-train=yes, ai-input=yes
Sitemap: ${baseUrl}/sitemap-index.xml
`;
// NOTA (30/08/2026): "llms-txt:" chegou a existir aqui como diretiva, mas
// não é reconhecida pelo Lighthouse/robots-parser (nem faz parte do padrão
// real de robots.txt/REP) — o Google PageSpeed Insights reporta isso como
// "Unknown directive" e marca o robots.txt inteiro como inválido (SEO
// audit cai de 100 pra 92). A descoberta do llms.txt já acontece de forma
// válida via HTTP Link header (ver public/_headers: `rel="llms-txt"`),
// que o próprio isitagentready.com lê corretamente — não duplicar essa
// informação aqui dentro do robots.txt de novo.

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
