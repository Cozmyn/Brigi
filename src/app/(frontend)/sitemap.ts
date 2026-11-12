import type { MetadataRoute } from 'next'
import { getPublicPages, getSiteContent, getHomeSEO } from '@/lib/cms'
import { getPublicArticles } from '@/lib/public-articles'
import { articleCanonical, articleIsIndexable } from '@/lib/article-seo'
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
    for (const article of indexable) guides.push({
      url: articleCanonical(article)!, lastModified: article.reviewedAt || article.publishedAt,
    })
  }
  return [
    ...(!home?.noindex && (!home?.canonical || home.canonical === '/')
      ? [{ url: siteURL + '/' }] : []),
    { url: siteURL + '/rezervare' },
    ...(!englishHome?.noindex && (!englishHome?.canonical || englishHome.canonical === '/en')
      ? [{ url: siteURL + '/en' }] : []),
    { url: siteURL + '/en/booking' },
    ...english
      .filter((p) => !p.seo?.noindex && (!p.seo?.canonical || p.seo.canonical === `/en/${p.slug}`))
      .map((p) => ({ url: `${siteURL}/en/${p.slug}`, ...(p.updatedAt ? { lastModified: p.updatedAt } : {}) })),
    ...pages.filter((p) => !p.seo?.noindex &&
      (!p.seo?.canonical || p.seo.canonical === `/${p.slug}`) && (p.type !== 'media' || c.media.length))
      .map((p) => ({ url: `${siteURL}/${p.slug}`, ...(p.updatedAt ? { lastModified: p.updatedAt } : {}) })),
    ...guides,
  ]
}
