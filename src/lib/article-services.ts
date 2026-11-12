import { contentStore } from '@/cms/store'
import type { PublicArticle } from './public-articles'

export async function articleRelatedServices(article: PublicArticle) {
  const ids = [...new Set((article.relatedServices || []).filter((id): id is number =>
    typeof id === 'number' && Number.isSafeInteger(id) && id > 0))].slice(0, 8)
  const results = await Promise.all(ids.map(async (id) => {
    const service = await contentStore.byID('services', id, {
      locale: article.locale, overrideAccess: false, draft: false, depth: 0,
    })
    if (!service || service._status !== 'published' || service.visible !== true || service.priceApproved !== true ||
        service.commerciallyVerified !== true ||
        typeof service.name !== 'string' || !service.name.trim()) return null
    return { id: service.id, name: service.name,
      href: `${article.locale === 'en' ? '/en/booking' : '/rezervare'}?selectie=${encodeURIComponent(String(service.id))}` }
  }))
  return results.filter((service): service is NonNullable<typeof service> => service !== null)
}
