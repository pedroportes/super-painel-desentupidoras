const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const { accountId, apiToken } = settings.cloudflare;

async function listAllProjects() {
  let page = 1;
  let all = [];
  while (true) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects?page=${page}&per_page=25`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (!data.success || !data.result || data.result.length === 0) break;
    all.push(...data.result);
    page++;
    if (page > 10) break;
  }

  console.log('Total projetos encontrados na conta:', all.length);
  all.forEach(p => {
    console.log(`- ${p.name} -> ${p.subdomain}`);
  });
}

listAllProjects().catch(console.error);
