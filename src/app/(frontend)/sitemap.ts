import type { MetadataRoute } from 'next'
import { getPublicPages, getSiteContent, getHomeSEO } from '@/lib/cms'
import { getPublicArticles } from '@/lib/public-articles'
import { articleCanonical, articleIsIndexable } from '@/lib/article-seo'
import { entityKinds, entityCanonical, entityHubPath, entityIsIndexable, getPublicEntities } from '@/lib/public-entities'
import { isProductionReady, siteURL } from '@/lib/site'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionReady) return []
  const [pages, c, home] = await Promise.all([getPublicPages(), getSiteContent(), getHomeSEO()])
  const english = await getPublicPages('en')
  const englishHome = await getHomeSEO('en')
  const [roArticles, enArticles] = await Promise.all([getPublicArticles('ro'), getPublicArticles('en')])
  const guides: MetadataRoute.Sitemap = []
  for (const [locale, articles] of [['ro', roArticles], ['en', enArticles]] as const) {
    const indexable = articles.filter((article) => articleIsIndexable(article))
    if (indexable.length) guides.push({ url: new URL(locale === 'en' ? '/en/ghiduri' : '/ghiduri', siteURL).href })
    for (const article of indexable) guides.push({ url: articleCanonical(article)!, lastModified: article.reviewedAt || article.publishedAt })
  }
  const entities: MetadataRoute.Sitemap = []
  for (const locale of ['ro', 'en'] as const) {
    const lists = await Promise.all(entityKinds.map((kind) => getPublicEntities(kind, locale)))
    for (const [index, kind] of entityKinds.entries()) {
      const docs = lists[index].filter((entity) => entityIsIndexable(entity))
      if (docs.length) entities.push({ url: new URL(entityHubPath(kind, locale), siteURL).href })
      for (const entity of docs) entities.push({ url: entityCanonical(entity)!, lastModified: entity.document.reviewedAt })
    }
  }
  const availablePage = (slug: string) => !['formate', 'parteneri', 'studii-de-caz'].includes(slug)
  const entries: MetadataRoute.Sitemap = [
    ...(!home?.noindex && (!home?.canonical || home.canonical === '/') ? [{ url: siteURL + '/' }] : []),
    { url: siteURL + '/rezervare' },
    ...(!englishHome?.noindex && (!englishHome?.canonical || englishHome.canonical === '/en') ? [{ url: siteURL + '/en' }] : []),
    { url: siteURL + '/en/booking' },
    ...english.filter((p) => availablePage(p.slug) && !p.seo?.noindex && (!p.seo?.canonical || p.seo.canonical === `/en/${p.slug}`))
      .map((p) => ({ url: `${siteURL}/en/${p.slug}`, ...(p.updatedAt ? { lastModified: p.updatedAt } : {}) })),
    ...pages.filter((p) => availablePage(p.slug) && !p.seo?.noindex && (!p.seo?.canonical || p.seo.canonical === `/${p.slug}`) && (p.type !== 'media' || c.media.length))
      .map((p) => ({ url: `${siteURL}/${p.slug}`, ...(p.updatedAt ? { lastModified: p.updatedAt } : {}) })),
    ...guides, ...entities,
  ]
  const seen = new Set<string>()
  return entries.filter((entry) => { if (seen.has(entry.url)) return false; seen.add(entry.url); return true })
}
