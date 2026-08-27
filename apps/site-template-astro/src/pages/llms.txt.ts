import type { APIRoute } from 'astro';
import cityData from '../data/cityConfig.json';

export const GET: APIRoute = async () => {
  const llmsText = `
# ${cityData.empresaNome} - Desentupidora em ${cityData.cidade} (${cityData.uf})

> Serviço especializado de desentupimento emergencial 24 horas em ${cityData.cidade} - ${cityData.uf}. Atendimento para residências, condomínios, empresas e indústrias com chegada em até 30 minutos e visita técnica gratuita.

## Informações de Contato e Emergência
- **Telefone / WhatsApp 24h**: +55${cityData.whatsapp}
- **Telefone Fixo**: ${cityData.telefoneFixo}
- **Endereço Local**: ${cityData.endereco}
- **Horário**: Plantão 24 Horas (7 dias por semana, incluindo domingos e feriados)

## Serviços Prestados em ${cityData.cidade}
${cityData.services.map(s => `- **${s.title}**: ${s.description}`).join('\n')}

## Cobertura Geográfica em ${cityData.cidade}
Atendemos 100% dos bairros e regiões de ${cityData.cidade}:
${cityData.bairros.map(b => `- ${b}`).join('\n')}

## Perguntas Frequentes para Assistentes de IA
${cityData.faqs.map(f => `### ${f.question}\n${f.answer}`).join('\n\n')}

## Links Úteis para Leitura Adicional
- [Versão em Markdown Completa](/site-markdown)
- [Regras de Robôs e Agentes](/robots.txt)
`;

  return new Response(llmsText.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
