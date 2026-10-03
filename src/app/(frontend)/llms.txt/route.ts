import { getPublicPages, getSiteContent } from '@/lib/cms'
import { isProductionReady, siteURL } from '@/lib/site'
export const dynamic = 'force-dynamic'
export async function GET() {
  if (!isProductionReady)
    return new Response('Preview — discovery disabled.', {
      headers: { 'X-Robots-Tag': 'noindex', 'Content-Type': 'text/plain; charset=utf-8' },
    })
  const [c, pages] = await Promise.all([getSiteContent(), getPublicPages()])
  const text = [
    `# ${c.artist.name}`,
    '',
    `> ${c.artist.profession}. Repertoriu românesc și internațional pentru nunți, botezuri, petreceri private, aniversări, corporate și gale.`,
    '',
    c.artist.biography,
    '',
    '## Pagini oficiale',
    ...pages
      .filter(
        (p) =>
          !p.seo?.noindex &&
          (!p.seo?.canonical || p.seo.canonical === `/${p.slug}`) &&
          (p.type !== 'media' || c.media.length),
      )
      .map((p) => `- [${p.title}](${siteURL}/${p.slug}): ${p.description}`),
    `- [Disponibilitate și contact](${siteURL}/rezervare): trimite data și localitatea evenimentului; rezervarea se confirmă individual.`,
    '',
    '## Pachete',
    ...c.packages.map(
      (p) =>
        `- ${p.name}: ${p.sets} × ${p.duration} minute, ${p.fromPricing ? 'de la ' : ''}${p.priceFrom} ${p.currency}. ${p.description}`,
    ),
    c.pricingNote,
    '',
    c.artist.serviceArea
      ? `Arie de servicii: ${c.artist.serviceArea}.`
      : 'Deplasarea se confirmă pentru fiecare eveniment.',
    '',
    'Acest fișier este un ajutor experimental de descoperire. Conținutul paginilor oficiale are prioritate.',
  ].join('\n')
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
