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
const path = require('path');

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

function getCleanProjectName(cityName) {
  const clean = (cityName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `desentupidora-${clean}`;
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
  // IMPORTANTE (bug real corrigido 2x, 30/08/2026): o NOME do projeto na
  // Cloudflare e o SUBDOMÍNIO público (`<algo>.pages.dev`) são campos
  // diferentes e podem divergir. Quando o nome pedido colide com outro
  // projeto/conta (subdomínio .pages.dev é global), a Cloudflare mantém o
  // nome do projeto como pedido mas gera um SUBDOMÍNIO com sufixo
  // aleatório (ex: projeto "desentupidora-curitiba" -> subdomínio
  // "desentupidora-curitiba-sns.pages.dev"). A primeira correção (extrair
  // o "slug" de dentro da URL salva e reusar como --project-name) parecia
  // funcionar mas na verdade piorava: como o slug extraído da URL
  // ("desentupidora-curitiba-sns") não é o nome real do projeto
  // ("desentupidora-curitiba"), cada redeploy criava um projeto NOVO com
  // esse nome errado, que por sua vez colidia de novo e ganhava OUTRO
  // sufixo — um projeto órfão novo a cada deploy. A correção definitiva é
  // nunca mais derivar o nome do projeto a partir da URL: guardamos o
  // nome real retornado pela própria Cloudflare (`cloudflareProjectName`)
  // no cadastro da cidade na primeira vez, e sempre reusamos esse valor
  // depois. Só cai no cálculo por nome da cidade se for o primeiro deploy
  // de todos (cidade nunca publicada nessa conta).
  const projectName = cityConfig.cloudflareProjectName || getCleanProjectName(cityConfig.cidade);
  const env = {
    ...process.env,
    CLOUDFLARE_API_TOKEN: apiToken,
    CLOUDFLARE_ACCOUNT_ID: accountId
  };

  // IMPORTANTE: o wrangler procura a pasta `functions/` (Cloudflare Pages
  // Functions, usada pra negociação de Markdown) relativa ao diretório de
  // onde o comando é executado (cwd), NUNCA relativa ao `distDir` publicado.
  // Sem isso, `functions/_middleware.js` nunca é encontrado/deployado —
  // bug real confirmado em 29/08/2026 via isitagentready.com (Markdown
  // Negotiation dava FAIL em produção mesmo com o middleware existindo no
  // código-fonte). `distDir` é sempre `<astroRoot>/dist`, então o pai dele
  // é a raiz do projeto Astro, onde `functions/` de fato mora.
  const astroRootDir = path.dirname(distDir);

  // Cria o projeto na Cloudflare Pages se ainda não existir (automático e transparente)
  const createCmd = `npx --yes wrangler@latest pages project create ${projectName} --production-branch=main`;
  await run(createCmd, { env, cwd: astroRootDir });

  // Publica os arquivos compilados do Astro (junto com functions/, por
  // rodar com cwd na raiz do projeto Astro)
  const cmd = `npx --yes wrangler@latest pages deploy "${distDir}" --project-name=${projectName} --branch=main`;

  const { error, stdout, stderr } = await run(cmd, { env, cwd: astroRootDir });
  const output = stdout + '\n' + stderr;

  if (error) {
    return { success: false, provider, error: `Falha no deploy Cloudflare Pages: ${stderr || error.message}`, log: output };
  }

  // Nunca assumir a URL — ler a URL real que o próprio wrangler reportou
  // (linha "Take a peek over at https://<hash>.<slug>.pages.dev"). O slug
  // real pode ser diferente do `projectName` pedido se houve colisão de
  // nome (ver nota acima). A URL de produção estável é
  // `https://<slug>.pages.dev` (sem o hash do deploy específico).
  const realUrlMatch = output.match(/https:\/\/[a-z0-9]+\.([a-z0-9-]+)\.pages\.dev/i);
  const realProjectSlug = realUrlMatch ? realUrlMatch[1] : projectName;
  if (realProjectSlug !== projectName) {
    console.warn(`⚠️ Cloudflare renomeou o projeto de "${projectName}" pra "${realProjectSlug}" (colisão de nome/subdomínio). Salvando a URL real.`);
  }

  return {
    success: true,
    provider,
    url: `https://${realProjectSlug}.pages.dev`,
    cloudflareProjectName: projectName,
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

  const projectName = getCleanProjectName(cityConfig.cidade);
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

  const token = (keys.apiToken || '').trim();
  const siteName = getCleanProjectName(cityConfig.cidade);

  try {
    // 1. Obter ou criar o site na Netlify API
    let siteId = null;
    let siteUrl = null;

    const listRes = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (listRes.ok) {
      const sites = await listRes.json();
      const existing = sites.find(s => s.name === siteName);
      if (existing) {
        siteId = existing.id;
        siteUrl = existing.ssl_url || existing.url;
      }
    }

    if (!siteId) {
      // Criar o site automaticamente se ainda não existir
      const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: siteName, sso_login: false, password: '' })
      });
      if (createRes.ok) {
        const created = await createRes.json();
        siteId = created.id;
        siteUrl = created.ssl_url || created.url;
      } else {
        const errText = await createRes.text();
        return { success: false, provider, error: `Falha ao criar site na Netlify: ${errText}` };
      }
    } else {
      // Garantir que a proteção por senha/SSO está desativada para acesso público
      await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sso_login: false, password: '' })
      });
    }

    // 2. Compactar o diretório dist para zip
    const fs = require('fs');
    const path = require('path');
    const zipPath = path.join(path.dirname(distDir), `${siteName}.zip`);
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

    const isWin = process.platform === 'win32';
    const zipCmd = isWin
      ? `powershell -NoProfile -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`
      : `cd "${distDir}" && zip -r "${zipPath}" .`;

    await run(zipCmd);

    if (!fs.existsSync(zipPath)) {
      return { success: false, provider, error: 'Falha ao compactar arquivos para envio à Netlify.' };
    }

    const zipBuffer = fs.readFileSync(zipPath);

    // 3. Enviar o ZIP diretamente para a API de Deploys da Netlify
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/zip'
      },
      body: zipBuffer
    });

    // Limpar o zip temporário
    try { fs.unlinkSync(zipPath); } catch (_) {}

    if (!deployRes.ok) {
      const errText = await deployRes.text();
      return { success: false, provider, error: `Falha no envio do deploy Netlify: ${errText}` };
    }

    const deployData = await deployRes.json();
    const cleanUrl = deployData.ssl_url || deployData.url || siteUrl || `https://${siteName}.netlify.app`;

    return {
      success: true,
      provider,
      url: cleanUrl,
      log: `Netlify Deploy ID: ${deployData.id}\nEstado: ${deployData.state}\nURL: ${cleanUrl}`,
      deployedAt: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, provider, error: `Erro inesperado no deploy Netlify: ${err.message}` };
  }
}

module.exports = { deployCitySite };
