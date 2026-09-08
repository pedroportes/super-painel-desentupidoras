import type { APIRoute } from 'astro';
import cityData from '../data/cityConfig.json';

export const GET: APIRoute = async () => {
  const h1 = cityData.seo?.h1Title || cityData.h1Title || `Desentupidora em ${cityData.cidade} ${cityData.uf}`;
  const firstP = cityData.seo?.firstParagraphText || cityData.firstParagraph || '';
  const lastH2 = cityData.seo?.lastH2Title || cityData.lastH2 || `Por que contratar em ${cityData.cidade}?`;

  const isPublicResearch = cityData.isDraft || cityData.commercialClaimsVerified === false;
  const markdownContent = isPublicResearch ? `
# ${h1}

${firstP}

## Referências locais
${(cityData.citySources || []).map(source => `- [${source.title}](${source.url}): ${source.note}`).join('\n')}

## ${lastH2}
Esta é uma publicação de pesquisa sem indexação. Disponibilidade, valores, cobertura e contato comercial não são informados enquanto a validação não estiver concluída.
` : `
# ${h1}

${firstP}

## Serviços Oferecidos em ${cityData.cidade} - ${cityData.uf}
${(cityData.services || []).map(s => `- **${s.title}**: ${s.description}`).join('\n')}

## Áreas Atendidas em ${cityData.cidade}
Atendemos todos os bairros de ${cityData.cidade}: ${(cityData.bairros || []).join(', ')}.

## Perguntas Frequentes (FAQ)
${(cityData.faqs || []).map(f => `### ${f.question}\n${f.answer}`).join('\n\n')}

## ${lastH2}
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
