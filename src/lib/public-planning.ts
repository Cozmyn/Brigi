import { getSiteContent } from './cms'
import { getPublicEntities } from './public-entities'
import type { ComparisonItem, VerifiedOffer } from './planning-budget'

/** Never use static/example prices: getSiteContent returns only human-verified packages. */
export async function getPlanningCatalog(locale: 'ro' | 'en'):
  Promise<{ formats: ComparisonItem[]; offers: VerifiedOffer[] }> {
  const [formats, content] = await Promise.all([
    getPublicEntities('musical-formats', locale), getSiteContent(locale),
  ])
  const offers: VerifiedOffer[] = content.packages.filter((p) =>
    Number.isFinite(p.priceFrom) && p.priceFrom >= 0 &&
    (p.currency === 'RON' || p.currency === 'EUR') &&
    Number.isSafeInteger(p.sets) && p.sets > 0 &&
    Number.isFinite(p.duration) && p.duration > 0
  ).map((p) => ({
    id: p.id, label: p.name, sets: p.sets, duration: p.duration,
    price: p.priceFrom, currency: p.currency,
    fromPricing: p.fromPricing, description: p.description,
    href: (locale === 'en' ? '/en/booking' : '/rezervare') +
      '?pachet=' + encodeURIComponent(p.formValue) + '&selectie=' + encodeURIComponent(p.id),
  }))
  const output: ComparisonItem[] = formats.map(({ document: d, path }) => ({
    id: 'format:' + d.id, kind: 'format', label: d.title, summary: d.summary || '',
    lineup: d.lineup || '', suitableFor: d.suitableFor || '',
    technicalRequirements: d.technicalRequirements || '', duration: '',
    price: null, currency: null, fromPricing: false, href: path,
  }))
  for (const offer of offers) output.push({
    id: 'package:' + offer.id, kind: 'package', label: offer.label,
    summary: offer.description, lineup: '', suitableFor: '',
    technicalRequirements: '',
    duration: String(offer.sets) + ' x ' + String(offer.duration) + ' min',
    price: offer.price, currency: offer.currency, fromPricing: offer.fromPricing,
    href: offer.href,
  })
  return { formats: output, offers }
}
