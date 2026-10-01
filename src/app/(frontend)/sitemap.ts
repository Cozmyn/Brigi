import type { MetadataRoute } from 'next'
import { getPublicPages, getSiteContent, getHomeSEO } from '@/lib/cms'
import { isProductionReady, siteURL } from '@/lib/site'
export const revalidate = 60
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionReady) return []
  const [pages, c, home] = await Promise.all([getPublicPages(), getSiteContent(), getHomeSEO()])
  return [
    ...(!home?.noindex && (!home?.canonical || home.canonical === '/')
      ? [{ url: siteURL + '/' }]
      : []),
    { url: siteURL + '/rezervare' },
    ...pages
      .filter(
        (p) =>
          !p.seo?.noindex &&
          (!p.seo?.canonical || p.seo.canonical === `/${p.slug}`) &&
          (p.type !== 'media' || c.media.length),
      )
      .map((p) => ({
        url: `${siteURL}/${p.slug}`,
        ...(p.updatedAt ? { lastModified: p.updatedAt } : {}),
      })),
  ]
}
