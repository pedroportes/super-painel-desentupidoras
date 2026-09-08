async function test() {
  // Test 1: Mineiros Testimonials
  const r1 = await fetch('https://desentupidora-mineiros.pages.dev/');
  const h1 = await r1.text();
  const testMatches = [...h1.matchAll(/class="testimonial-card"[\s\S]*?<\/div>\s*<\/div>/gi)];
  console.log('Mineiros found cards:', testMatches.length);
  testMatches.forEach((m, idx) => {
    const textMatch = m[0].match(/class="testimonial-text">([\s\S]*?)<\/p>/i);
    const authorMatch = m[0].match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
    const roleMatch = m[0].match(/<small[^>]*>([\s\S]*?)<\/small>/i);
    console.log(`Card ${idx}:`, {
      author: authorMatch ? authorMatch[1] : '',
      role: roleMatch ? roleMatch[1] : '',
      text: textMatch ? textMatch[1].trim() : ''
    });
  });

  // Test 2: LEM Cidade Universitaria Description
  const r2 = await fetch('https://desentupidora-luiseduardomagalhaes.pages.dev/cidade-universitaria/');
  const h2 = await r2.text();
  const descMatch = h2.match(/<meta name="description" content="([^"]*)"/i);
  if (descMatch) {
    console.log('\nLEM Cidade Universitaria Description:');
    console.log('Content:', descMatch[1]);
    console.log('Length:', descMatch[1].length, 'chars (Target 120-150)');
  }
}

test().catch(console.error);
