/**
 * DEPLOY ENGINE - Publicação Individual por Cidade (Cloudflare | Vercel | Netlify)
 *
 * IMPORTANTE: este módulo executa deploys DE VERDADE via CLI oficial de cada
 * provedor (wrangler / vercel / netlify-cli, via npx). Ele NUNCA retorna
 * success:true sem ter realmente rodado o comando de deploy e conferido o
 * resultado. Se faltar credencial ou o comando falhar, retorna success:false
 * com o erro real — nunca finge sucesso.
 *
 * Garante a REGRA 1 do escopo: cada cidade publica APENAS no provedor
 * configurado para ela.
 */

const { exec } = require('child_process');

function run(cmd, opts = {}) {
  return new Promise((resolve) => {
    exec(cmd, { ...opts, maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout || '', stderr: stderr || '' });
    });
  });
}

async function deployCitySite(cityConfig, apiKeys = {}, distDir) {
  const provider = cityConfig.hospedagem ? cityConfig.hospedagem.toLowerCase() : 'cloudflare';

  switch (provider) {
    case 'cloudflare':
      return deployToCloudflarePages(cityConfig, apiKeys.cloudflare, distDir);
    case 'vercel':
      return deployToVercel(cityConfig, apiKeys.vercel, distDir);
    case 'netlify':
      return deployToNetlify(cityConfig, apiKeys.netlify, distDir);
    default:
      return { success: false, provider, error: `Provedor desconhecido: ${provider}` };
  }
}

async function deployToCloudflarePages(cityConfig, keys, distDir) {
  const provider = 'cloudflare';
  if (!keys || !keys.apiToken || !keys.accountId) {
    return {
      success: false,
      provider,
      error: 'Faltam as credenciais da Cloudflare. Configure o Account ID e o API Token em "Hospedagem & Chaves API" antes de publicar.'
    };
  }

  const apiToken = (keys.apiToken || '').trim();
  const accountId = (keys.accountId || '').trim();
  const projectName = `desentupidora-${cityConfig.cidade.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const cmd = `npx --yes wrangler@latest pages deploy "${distDir}" --project-name=${projectName} --branch=main`;
  const env = {
    ...process.env,
    CLOUDFLARE_API_TOKEN: apiToken,
    CLOUDFLARE_ACCOUNT_ID: accountId
  };

  const { error, stdout, stderr } = await run(cmd, { env });
  const output = stdout + '\n' + stderr;

  if (error) {
    return { success: false, provider, error: `Falha no deploy Cloudflare Pages: ${stderr || error.message}`, log: output };
  }

  const urlMatch = output.match(/https:\/\/[a-z0-9.-]+\.pages\.dev/i);
  return {
    success: true,
    provider,
    url: urlMatch ? urlMatch[0].replace(/["',;]/g, '').trim() : `https://${projectName}.pages.dev`,
    log: output,
    deployedAt: new Date().toISOString()
  };
}

async function deployToVercel(cityConfig, keys, distDir) {
  const provider = 'vercel';
  if (!keys || !keys.apiToken) {
    return {
      success: false,
      provider,
      error: 'Falta o token da Vercel. Configure em "Hospedagem & Chaves API" antes de publicar.'
    };
  }

  const projectName = `desentupidora-${cityConfig.cidade.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const teamFlag = keys.teamId ? ` --scope=${keys.teamId}` : '';
  const cmd = `npx --yes vercel@latest deploy "${distDir}" --name=${projectName} --prod --yes --token=${keys.apiToken}${teamFlag}`;

  const { error, stdout, stderr } = await run(cmd);
  const output = stdout + '\n' + stderr;

  if (error) {
    return { success: false, provider, error: `Falha no deploy Vercel: ${stderr || error.message}`, log: output };
  }

  // Extract all valid clean .vercel.app URLs
  const urls = output.match(/https:\/\/[a-zA-Z0-9.-]+\.vercel\.app/g);
  let cleanUrl = urls ? urls[urls.length - 1] : null;
  if (cleanUrl) {
    cleanUrl = cleanUrl.replace(/["',;]/g, '').trim();
  }

  return {
    success: true,
    provider,
    url: cleanUrl || `https://${projectName}.vercel.app`,
    log: output,
    deployedAt: new Date().toISOString()
  };
}

async function deployToNetlify(cityConfig, keys, distDir) {
  const provider = 'netlify';
  if (!keys || !keys.apiToken) {
    return {
      success: false,
      provider,
      error: 'Falta o token da Netlify. Configure em "Hospedagem & Chaves API" antes de publicar.'
    };
  }

  const siteName = `desentupidora-${cityConfig.cidade.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  // --site aceita nome ou ID; se o site ainda não existir na conta, a Netlify
  // CLI cria automaticamente com esse nome na primeira publicação.
  const cmd = `npx --yes netlify-cli@latest deploy --prod --dir="${distDir}" --auth=${keys.apiToken} --site=${siteName}`;

  const { error, stdout, stderr } = await run(cmd);
  const output = stdout + '\n' + stderr;

  if (error) {
    return { success: false, provider, error: `Falha no deploy Netlify: ${stderr || error.message}`, log: output };
  }

  const urlMatch = output.match(/https:\/\/[a-z0-9.-]+\.netlify\.app\S*/i);
  return {
    success: true,
    provider,
    url: urlMatch ? urlMatch[0].trim() : null,
    log: output,
    deployedAt: new Date().toISOString()
  };
}

module.exports = { deployCitySite };
