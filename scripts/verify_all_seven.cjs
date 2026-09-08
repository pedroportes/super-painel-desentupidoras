const cities = [
  { id: 'mineiros', url: 'https://desentupidora-mineiros.pages.dev' },
  { id: 'luiseduardomagalhaes', url: 'https://desentupidora-luiseduardomagalhaes.pages.dev' },
  { id: 'timoteo', url: 'https://desentupidora-timoteo.pages.dev' },
  { id: 'uba', url: 'https://desentupidora-uba.pages.dev' },
  { id: 'angradosreis', url: 'https://desentupidora-angradosreis.pages.dev' },
  { id: 'ariquemes', url: 'https://desentupidora-ariquemes.pages.dev' },
  { id: 'tucano', url: 'https://desentupidora-tucano.pages.dev' }
];

async function verify() {
  console.log('🔍 INICIANDO AUDITORIA FINAL DOS SITES EM PRODUÇÃO...\n');

  for (const c of cities) {
    // 1. Check Home
    const resHome = await fetch(c.url + '/');
    const htmlHome = await resHome.text();

    // Check testimonials
    const hasEmptyQuotes = htmlHome.includes('class="testimonial-text" data-astro-cid-aadlzisc>""</p>') ||
                           htmlHome.includes('class="testimonial-text">""</p>');

    const sampleQuoteMatch = htmlHome.match(/class="testimonial-text"[^>]*>"([^"]+)"<\/p>/i);
    const sampleQuote = sampleQuoteMatch ? sampleQuoteMatch[1] : 'NENHUMA';

    const descHomeMatch = htmlHome.match(/<meta name="description" content="([^"]*)"/i);
    const descHome = descHomeMatch ? descHomeMatch[1] : '';

    console.log(`🏙️  ${c.id.toUpperCase()} (${c.url})`);
    console.log(`   - Home HTTP: ${resHome.status}`);
    console.log(`   - Home Desc: "${descHome.substring(0, 50)}..." (${descHome.length} chars) -> ${descHome.length <= 150 ? '✅ OK' : '❌ > 150'}`);
    console.log(`   - Aspas vazias (""): ${hasEmptyQuotes ? '❌ ENCONTRADO' : '✅ NENHUMA (Corrigido)'}`);
    console.log(`   - Exemplo depoimento: "${sampleQuote.substring(0, 60)}..."`);

    // 2. Check 1 Bairro subpage
    const subRoute = c.id === 'luiseduardomagalhaes' ? '/cidade-universitaria/' :
                     c.id === 'mineiros' ? '/setor-martins/' :
                     c.id === 'timoteo' ? '/timirim/' :
                     c.id === 'uba' ? '/sao-domingos/' :
                     c.id === 'angradosreis' ? '/japuiba/' :
                     c.id === 'ariquemes' ? '/setor-01/' : '/caldas-do-jorro/';

    const resSub = await fetch(c.url + subRoute);
    const htmlSub = await resSub.text();
    const descSubMatch = htmlSub.match(/<meta name="description" content="([^"]*)"/i);
    const descSub = descSubMatch ? descSubMatch[1] : '';

    console.log(`   - Bairro ${subRoute} Desc: ${descSub.length} chars -> ${descSub.length >= 120 && descSub.length <= 150 ? '✅ 120-150 chars (Verde)' : '❌ FORA'}`);
    console.log('------------------------------------------------------');
  }
}

verify().catch(console.error);
