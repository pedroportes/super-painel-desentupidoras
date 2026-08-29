import type { APIRoute } from 'astro';
import cityData from '../data/cityConfig.json';

export const GET: APIRoute = async () => {
  const markdownContent = `
# ${cityData.seo.h1Title}

${cityData.seo.firstParagraphText}

## Serviços Oferecidos em ${cityData.cidade} - ${cityData.uf}
${cityData.services.map(s => `- **${s.title}**: ${s.description}`).join('\n')}

## Áreas Atendidas em ${cityData.cidade}
Atendemos todos os bairros de ${cityData.cidade}: ${cityData.bairros.join(', ')}.

## Perguntas Frequentes (FAQ)
${cityData.faqs.map(f => `### ${f.question}\n${f.answer}`).join('\n\n')}

## ${cityData.seo.lastH2Title}
- **Atendimento 24h**: Chegamos em até 30 minutos.
- **Visita Grátis**: Orçamento sem compromisso.
- **WhatsApp**: +55${cityData.whatsapp}
`;

  return new Response(markdownContent.trim(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
