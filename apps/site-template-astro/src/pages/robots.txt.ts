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

# Sinais de Conteúdo (contentsignals.org) e Arquivo llms.txt para IAs
Content-Signal: search=yes, ai-train=yes, ai-input=yes
Sitemap: ${baseUrl}/sitemap-index.xml
llms-txt: ${baseUrl}/llms.txt
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
