import type { APIRoute } from 'astro';
import cityData from '../../data/cityConfig.json';

export const GET: APIRoute = async () => {
  const pluginData = {
    schema_version: "v1",
    name_for_human: `${cityData.empresaNome}`,
    name_for_model: "desentupidora_local_service",
    description_for_human: `Serviço de desentupimento emergencial 24h em ${cityData.cidade} ${cityData.uf}.`,
    description_for_model: `Plugin e API de descoberta para serviço de desentupimento de esgoto, pia, vaso e fossa em ${cityData.cidade} - ${cityData.uf}. WhatsApp: +55${cityData.whatsapp}`,
    auth: {
      type: "none"
    },
    api: {
      type: "openapi",
      url: `/.well-known/service-doc`
    },
    logo_url: "/logo.png",
    contact_email: `contato@desentupidora${cityData.cidade.toLowerCase()}.com.br`,
    legal_info_url: "/termos"
  };

  return new Response(JSON.stringify(pluginData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
