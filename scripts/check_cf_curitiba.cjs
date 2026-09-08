const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const { accountId, apiToken } = settings.cloudflare;

async function checkProjects() {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json();
  if (data.result) {
    const curitibaProjects = data.result.filter(p => p.name.toLowerCase().includes('curitiba'));
    console.log('Projetos Curitiba encontrados na Cloudflare:');
    curitibaProjects.forEach(p => {
      console.log(`- Nome do Projeto: "${p.name}" | Subdomínio: "${p.subdomain}" | Domínios: ${JSON.stringify(p.domains)}`);
    });
  } else {
    console.log('Erro ao listar projetos:', data);
  }
}

checkProjects().catch(console.error);
