import type { APIRoute } from 'astro';
import cityData from '../../data/cityConfig.json';

export const GET: APIRoute = async () => {
  const catalog = {
    link_relations: [
      {
        rel: "service-doc",
        href: "/.well-known/service-doc",
        type: "application/json"
      },
      {
        rel: "ai-plugin",
        href: "/.well-known/ai-plugin.json",
        type: "application/json"
      }
    ],
    service: `${cityData.empresaNome}`,
    location: `${cityData.cidade} - ${cityData.uf}`
  };

  return new Response(JSON.stringify(catalog, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
