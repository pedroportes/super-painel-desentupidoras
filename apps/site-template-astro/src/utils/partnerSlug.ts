import { slugify } from './slugify';

// Extraído para módulo próprio (em vez de função local dentro do .astro)
// porque o compilador do Astro separa `getStaticPaths` do corpo do
// componente em escopos diferentes — uma função declarada localmente no
// frontmatter e usada dentro de `getStaticPaths` acaba não visível lá
// (vira "partnerSlug is not defined" só no build/SSG). Import é sempre
// resolvido no escopo do módulo, então funciona nos dois lugares.
export function partnerSlug(p: { cidade?: string; nome?: string }): string {
  return slugify(`${p.cidade || ''}-${p.nome || ''}`);
}
