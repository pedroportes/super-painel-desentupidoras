const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const settings = JSON.parse(fs.readFileSync('apps/web-dashboard/data/settings.json', 'utf8'));
const keys = settings.vercel;
const distDir = path.resolve('apps/site-template-astro/dist');
const projectName = 'desentupidora-itapetininga';
const teamFlag = keys.teamId ? ` --scope=${keys.teamId}` : '';
const cmd = `npx --yes vercel@latest deploy "${distDir}" --name=${projectName} --prod --yes --token=${keys.apiToken}${teamFlag}`;

console.log('Running Vercel deploy...');
exec(cmd, { maxBuffer: 1024*1024*10 }, (err, stdout, stderr) => {
  console.log('Error:', err);
  console.log('Stdout:', stdout);
  console.log('Stderr:', stderr);
});
