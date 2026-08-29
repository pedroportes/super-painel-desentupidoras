import type { APIRoute } from 'astro';
import cityData from '../data/cityConfig.json';
import { slugify } from '../utils/slugify';

// Gera a versão em Markdown de cada página de serviço/bairro, no mesmo
// caminho da página HTML equivalente + '.md'. Usa exatamente a mesma lógica
// de montagem de pageSeo/pageFaqs que '[slug].astro', para o conteúdo em
// Markdown nunca divergir do conteúdo real da página em HTML.
export async function getStaticPaths() {
  const cidadeSlug = slugify(cityData.cidade);

  const servicePaths = cityData.services.map((service) => ({
    params: { slug: `${slugify(service.title)}-em-${cidadeSlug}` },
    props: {
      type: 'service',
      title: service.title,
      description: service.description
    }
  }));

  const neighborhoodPaths = cityData.bairros.map((bairro) => ({
    params: { slug: slugify(bairro) },
    props: { type: 'neighborhood', name: bairro }
  }));

  return [...servicePaths, ...neighborhoodPaths];
}

export const GET: APIRoute = async ({ props }) => {
  let pageSeo = { ...cityData.seo };
  let pageFaqs: { question: string; answer: string }[] = [];

  if (props.type === 'service') {
    const serviceName = props.title as string;
    const description = props.description as string;
    pageSeo.metaTitle = `Desentupidora de ${serviceName} em ${cityData.cidade} ${cityData.uf} | Atendimento 24h`;
    pageSeo.h1Title = `Desentupidora de ${serviceName} em ${cityData.cidade} ${cityData.uf}`;
    pageSeo.firstParagraph = `Problemas com entupimento? Nossa equipe é especializada em desentupidora de ${serviceName.toLowerCase()} em ${cityData.cidade} ${cityData.uf}. Oferecemos atendimento emergencial rápido, serviço 100% limpo sem quebrar azulejos, com garantia por escrito e orçamento gratuito na sua residência ou empresa.`;
    pageSeo.lastH2 = `Por que somos a melhor opção para ${serviceName.toLowerCase()} em ${cityData.cidade}?`;

    pageFaqs = [
      { question: `Vocês atendem emergência para ${serviceName.toLowerCase()} em ${cityData.cidade}?`, answer: `Sim! Nosso plantão é 24 horas. Chegamos na sua residência ou empresa em até 30 minutos em qualquer bairro de ${cityData.cidade}.` },
      { question: `Precisa quebrar a parede para resolver o problema de ${serviceName.toLowerCase()}?`, answer: 'Na grande maioria das vezes não. Utilizamos equipamentos modernos rotativos e de hidrojateamento que desobstruem o encanamento por dentro, sem necessidade de quebra-quebra.' },
      { question: `A visita técnica para ${serviceName.toLowerCase()} é cobrada?`, answer: `Não cobramos taxa de visita em ${cityData.cidade}. Nossos técnicos vão até o local, avaliam a situação e passam um orçamento transparente sem compromisso.` }
    ];

    const markdownContent = `
# ${pageSeo.h1Title}

${pageSeo.firstParagraph}

## Sobre este serviço
${description}

## ${pageSeo.lastH2}
${pageFaqs.map(f => `### ${f.question}\n${f.answer}`).join('\n\n')}

## Contato
- **WhatsApp 24h**: +55${cityData.whatsapp}
- **Cidade**: ${cityData.cidade} - ${cityData.uf}
`;

    return new Response(markdownContent.trim(), {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // neighborhood
  const bairroName = props.name as string;
  pageSeo.h1Title = `Desentupidora Plantão 24h no Bairro ${bairroName} em ${cityData.cidade} ${cityData.uf}`;
  pageSeo.firstParagraph = `Se você mora ou tem empresa e precisa de uma desentupidora no bairro ${bairroName} em ${cityData.cidade} ${cityData.uf}, nós chegamos em até 30 minutos! Nosso plantão emergencial 24 horas garante desentupimento rápido e limpo de esgotos, pias, ralos e vasos sanitários diretamente na sua região, com orçamento gratuito.`;
  pageSeo.lastH2 = `Serviços de Desentupimento Especializados no bairro ${bairroName}`;

  const markdownContent = `
# ${pageSeo.h1Title}

${pageSeo.firstParagraph}

## ${pageSeo.lastH2}
${cityData.services.map(s => `- **${s.title}**: ${s.description}`).join('\n')}

## Contato
- **WhatsApp 24h**: +55${cityData.whatsapp}
- **Bairro**: ${bairroName} - ${cityData.cidade} - ${cityData.uf}
`;

  return new Response(markdownContent.trim(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
};
