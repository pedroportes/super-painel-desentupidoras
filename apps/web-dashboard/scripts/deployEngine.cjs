/**
 * DEPLOY ENGINE - Publicação Individual por Cidade (Cloudflare | Vercel | Netlify | Render)
 *
 * IMPORTANTE: este módulo executa deploys DE VERDADE via CLI oficial de cada
 * provedor (wrangler / vercel / netlify-cli, via npx) — Render é a exceção,
 * ver nota grande na função `deployToRender` abaixo sobre por que o
 * mecanismo dela é fundamentalmente diferente. Ele NUNCA retorna
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
    case 'render':
      return deployToRender(cityConfig, apiKeys.render, distDir);
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
    }

    // Garantir que a proteção por senha/SSO está desativada para acesso
    // público. BUG REAL CORRIGIDO (31/08/2026): esse PATCH só rodava no
    // branch "site já existe" (`else` acima) — nunca no primeiro deploy de
    // uma cidade nova. O `sso_login: false` mandado no corpo do POST de
    // criação NÃO é suficiente: a Netlify aplica a proteção de
    // login/SSO da conta/team como padrão em site recém-criado mesmo
    // assim. Resultado: toda cidade nova na Netlify nascia com a home e
    // todos os assets (imagens, CSS) devolvendo 401 "Login Redirect" pro
    // público — só sumia se alguém rodasse um SEGUNDO deploy manualmente
    // depois. Confirmado em produção com Santa Bárbara d'Oeste (primeira
    // cidade nova na Netlify desde a correção do bug do zip). Agora o
    // PATCH roda sempre, criado ou não.
    await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sso_login: false, password: '' })
    });

    // 2. Compactar o diretório dist para zip
    // IMPORTANTE (bug real corrigido 30/08/2026): NUNCA usar o
    // `Compress-Archive` do PowerShell aqui. Ele grava metadado de origem
    // Windows/FAT no cabeçalho de cada entrada do zip, e o parser da
    // Netlify, ao ver esse metadado, reinterpreta o separador de pasta
    // como barra invertida — mesmo com os nomes internos gravados
    // corretamente com `/`. Resultado: toda a estrutura de pastas
    // (`_astro/`, `images/`, cada página) virava um nome de arquivo
    // achatado com `\` literal, e só o `index.html` da raiz funcionava —
    // o site publicado ficava sem CSS e sem imagens. Confirmado isolando
    // o teste (mesmo `dist/` compactado com metadado Unix funcionou).
    // `zipUtil.cjs` cria o zip nativamente em Node com metadado Unix,
    // sem depender de shell nenhum.
    const fs = require('fs');
    const path = require('path');
    const { zipDirectory } = require('./zipUtil.cjs');
    const zipPath = path.join(path.dirname(distDir), `${siteName}.zip`);
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

    zipDirectory(distDir, zipPath);

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

// IMPORTANTE (mecanismo fundamentalmente diferente dos outros 3
// provedores, decidido com o usuário em 31/08/2026): a Render NÃO tem API
// de upload direto de arquivo/zip pra site estático — ela só publica
// puxando de um repositório Git conectado (a cada push ou chamada
// explícita de "trigger deploy", ela builda e serve). Em vez de criar um
// repositório novo por cidade (mais um token, mais superfície), reusamos
// o PRÓPRIO repositório deste projeto: cada cidade Render ganha uma pasta
// `dist-sites/<id-da-cidade>/` nele, onde o `dist/` já buildado é
// copiado e commitado a cada deploy — e o serviço Render aponta o
// `rootDir` pra essa pasta, sem build command nenhum (arquivo já pronto).
async function deployToRender(cityConfig, keys, distDir) {
  const provider = 'render';
  if (!keys || !keys.apiToken || !keys.ownerId) {
    return {
      success: false,
      provider,
      error: 'Faltam as credenciais da Render. Configure a API Key e o Owner ID em "Hospedagem & Chaves API" antes de publicar.'
    };
  }

  const fs = require('fs');
  const token = (keys.apiToken || '').trim();
  const ownerId = (keys.ownerId || '').trim();
  const cityId = cityConfig.id;
  if (!cityId) {
    return { success: false, provider, error: 'Cidade sem `id` — não é possível determinar a pasta dist-sites/.' };
  }

  const API = 'https://api.render.com/v1';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  // Raiz do repositório deste próprio projeto (deployEngine.cjs mora em
  // apps/web-dashboard/scripts/, a raiz é 3 níveis acima).
  const repoRoot = path.join(__dirname, '..', '..', '..');
  const relFolder = `dist-sites/${cityId}`;
  const targetDir = path.join(repoRoot, 'dist-sites', cityId);

  // 1. Copiar o dist/ já buildado pra dentro da pasta rastreada pelo Git.
  try {
    if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });
    fs.mkdirSync(targetDir, { recursive: true });
    fs.cpSync(distDir, targetDir, { recursive: true });
  } catch (err) {
    return { success: false, provider, error: `Falha ao copiar o build pra dist-sites/${cityId}: ${err.message}` };
  }

  // 2. Commit + push só dessa pasta (nunca mexe em mais nada do repo).
  const gitAdd = await run(`git add "${relFolder}"`, { cwd: repoRoot });
  if (gitAdd.error) {
    return { success: false, provider, error: `Falha no "git add" de ${relFolder}: ${gitAdd.stderr || gitAdd.error.message}` };
  }
  // Checa via CÓDIGO DE SAÍDA se há mudança de verdade staged pra essa
  // pasta (exit 0 = sem diferença), em vez de tentar reconhecer a
  // mensagem de texto do "git commit" — mensagem varia entre versões e
  // idioma do git instalado (achado real: "no changes added to commit"
  // não bate com o regex que só cobria "nothing to commit"/"nada a
  // submeter", fazendo um redeploy sem mudança de conteúdo falhar à toa).
  const diffCheck = await run(`git diff --cached --quiet -- "${relFolder}"`, { cwd: repoRoot });
  const hasChanges = !!diffCheck.error; // exit code != 0 → há diferença staged
  if (hasChanges) {
    const commitMsg = `deploy(render): ${cityConfig.cidade || cityId} - ${new Date().toISOString()}`;
    const gitCommit = await run(`git commit -m "${commitMsg}"`, { cwd: repoRoot });
    if (gitCommit.error) {
      return { success: false, provider, error: `Falha no "git commit": ${gitCommit.stderr || gitCommit.error.message}`, log: gitCommit.stdout };
    }
    const gitPush = await run(`git push origin HEAD`, { cwd: repoRoot });
    if (gitPush.error) {
      return { success: false, provider, error: `Falha no "git push" de dist-sites/${cityId}: ${gitPush.stderr || gitPush.error.message}`, log: gitPush.stdout + gitPush.stderr };
    }
  }

  const repoUrlRes = await run('git config --get remote.origin.url', { cwd: repoRoot });
  const repoUrl = (repoUrlRes.stdout || '').trim();
  if (!repoUrl) {
    return { success: false, provider, error: 'Não consegui determinar a URL do repositório Git (remote.origin.url) pra configurar o serviço na Render.' };
  }

  let serviceId = cityConfig.renderServiceId;
  let deployId = null;

  try {
    if (!serviceId) {
      // 3a. Primeira vez: cria o serviço Static Site na Render apontando
      // pra essa pasta do repositório.
      const createRes = await fetch(`${API}/services`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'static_site',
          name: getCleanProjectName(cityConfig.cidade || cityId),
          ownerId,
          repo: repoUrl,
          branch: 'main',
          rootDir: relFolder,
          autoDeploy: 'yes',
          serviceDetails: {
            buildCommand: 'true',
            publishPath: '.'
          }
        })
      });
      if (!createRes.ok) {
        const errText = await createRes.text();
        return { success: false, provider, error: `Falha ao criar serviço na Render: ${errText}` };
      }
      const created = await createRes.json();
      serviceId = created.service && created.service.id;
      deployId = created.deployId;
      if (!serviceId) {
        return { success: false, provider, error: `Render não retornou um service id válido: ${JSON.stringify(created)}` };
      }
    } else {
      // 3b. Serviço já existe: dispara um deploy explícito da última
      // versão da pasta (não confia só no webhook automático do push).
      const deployRes = await fetch(`${API}/services/${serviceId}/deploys`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ clearCache: 'do_not_clear' })
      });
      if (!deployRes.ok) {
        const errText = await deployRes.text();
        return { success: false, provider, error: `Falha ao disparar deploy na Render: ${errText}` };
      }
      const deployData = await deployRes.json();
      deployId = deployData.id;
    }

    // 4. Espera o deploy terminar de verdade (nunca assume sucesso só por
    // ter disparado) — polling com timeout de ~2min, tempo de sobra pra
    // um site estático sem build de verdade.
    let finalStatus = null;
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 4000));
      const statusRes = await fetch(`${API}/services/${serviceId}/deploys/${deployId}`, { headers });
      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();
      finalStatus = statusData.status;
      if (finalStatus === 'live') break;
      if (['build_failed', 'update_failed', 'canceled', 'deactivated'].includes(finalStatus)) {
        return { success: false, provider, error: `Deploy na Render terminou com status "${finalStatus}".`, renderServiceId: serviceId };
      }
    }
    if (finalStatus !== 'live') {
      return { success: false, provider, error: `Deploy na Render não confirmou "live" dentro do tempo esperado (último status: "${finalStatus}"). Confira o painel da Render — o deploy pode só estar demorando.`, renderServiceId: serviceId };
    }

    // 5. Nunca assumir a URL — sempre ler a real retornada pela própria API.
    const serviceRes = await fetch(`${API}/services/${serviceId}`, { headers });
    if (!serviceRes.ok) {
      return { success: false, provider, error: 'Deploy concluído, mas não consegui confirmar a URL real do serviço na Render.', renderServiceId: serviceId };
    }
    const serviceData = await serviceRes.json();
    const liveUrl = serviceData.serviceDetails && serviceData.serviceDetails.url;
    if (!liveUrl) {
      return { success: false, provider, error: 'Deploy concluído, mas a Render não retornou a URL pública do serviço.', renderServiceId: serviceId };
    }

    return {
      success: true,
      provider,
      url: liveUrl,
      renderServiceId: serviceId,
      log: `Render service: ${serviceId}\nDeploy: ${deployId}\nURL: ${liveUrl}`,
      deployedAt: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, provider, error: `Erro inesperado no deploy Render: ${err.message}`, renderServiceId: serviceId || undefined };
  }
}

module.exports = { deployCitySite };
