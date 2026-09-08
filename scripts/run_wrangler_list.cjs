const { exec } = require('child_process');
const fs = require('fs');

const settings = JSON.parse(fs.readFileSync('./apps/web-dashboard/data/settings.json', 'utf8'));
const { accountId, apiToken } = settings.cloudflare;

exec('npx wrangler pages project list', {
  env: {
    ...process.env,
    CLOUDFLARE_API_TOKEN: apiToken,
    CLOUDFLARE_ACCOUNT_ID: accountId
  }
}, (err, stdout, stderr) => {
  console.log('STDOUT:\n', stdout);
  console.log('STDERR:\n', stderr);
});
