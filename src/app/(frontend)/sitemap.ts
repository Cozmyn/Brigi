import type { MetadataRoute } from 'next'
import { getPublicPages, getSiteContent, getHomeSEO } from '@/lib/cms'
import { getPublicArticles, type PublicArticle } from '@/lib/public-articles'
import { articleCanonical, articleIsIndexable } from '@/lib/article-seo'
import {
  entityKinds, entityCanonical, entityHubPath, entityIsIndexable, getPublicEntities,
  type EntityKind, type PublicEntity,
} from '@/lib/public-entities'
import {
  isSelfCanonical, verifiedLanguagePair, verifiedHubPair, verifiedStaticPair,
} from '@/lib/hreflang'
import { isProductionReady, siteURL } from '@/lib/site'
import { getPublicVideos, videoIsIndexable, videoLanguagePair } from '@/lib/public-videos'
import type { EditorialPage } from '@/lib/editorial'

export const dynamic = 'force-dynamic'

function articleItem(article: PublicArticle, opposite: PublicArticle[]): MetadataRoute.Sitemap[number] {
  const match = opposite.find((candidate) => candidate.id === article.id)
  const languages = verifiedLanguagePair(article, match)
  return {
    url: articleCanonical(article)!,
    ...(article.reviewedAt || article.publishedAt ? { lastModified: article.reviewedAt || article.publishedAt } : {}),
    ...(languages ? { alternates: { languages } } : {}),
  }
}
function entityItem(entity: PublicEntity, opposite: PublicEntity[]): MetadataRoute.Sitemap[number] {
  const match = opposite.find((item) => item.document.id === entity.document.id)
  const languages = verifiedLanguagePair(
    { id: entity.document.id, path: entity.path, locale: entity.locale, seo: entity.document.seo },
    match ? { id: match.document.id, path: match.path, locale: match.locale, seo: match.document.seo } : null,
  )
  return {
    url: entityCanonical(entity)!,
    ...(entity.document.reviewedAt ? { lastModified: entity.document.reviewedAt } : {}),
    ...(languages ? { alternates: { languages } } : {}),
  }
}
function pageItem(page: EditorialPage, locale: 'ro' | 'en', opposite: EditorialPage[]): MetadataRoute.Sitemap[number] {
  const path = (locale === 'en' ? '/en/' : '/') + page.slug
  const sibling = page.id ? opposite.find((candidate) => candidate.id === page.id) : undefined
  const languages = page.id && sibling?.id ? verifiedLanguagePair(
    { id: page.id, locale, path, seo: page.seo },
    { id: sibling.id, locale: locale === 'en' ? 'ro' : 'en',
      path: (locale === 'en' ? '/' : '/en/') + sibling.slug, seo: sibling.seo },
  ) : undefined
  return {
    url: new URL(path, siteURL).href,
    ...(page.updatedAt ? { lastModified: page.updatedAt } : {}),
    ...(languages ? { alternates: { languages } } : {}),
  }
}
const publicPage = (page: EditorialPage, locale: 'ro' | 'en', hasMedia: boolean) =>
  !['ghiduri', 'formate', 'parteneri', 'studii-de-caz'].includes(page.slug) &&
  (page.type !== 'media' || hasMedia) &&
  isSelfCanonical((locale === 'en' ? '/en/' : '/') + page.slug, page.seo)

/** The production gate remains closed unless explicitly enabled by hosting settings. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionReady) return []
  const [pages, c, home, english, englishHome, roArticles, enArticles] = await Promise.all([
    getPublicPages(), getSiteContent(), getHomeSEO(),
    getPublicPages('en'), getHomeSEO('en'),
    getPublicArticles('ro'), getPublicArticles('en'),
  ])
  const indexableRo = roArticles.filter((article) => articleIsIndexable(article))
  const indexableEn = enArticles.filter((article) => articleIsIndexable(article))
  const guides: MetadataRoute.Sitemap = []
  const guideLanguages = verifiedHubPair(indexableRo, indexableEn, '/ghiduri', '/en/ghiduri')
  if (indexableRo.length) guides.push({
    url: new URL('/ghiduri', siteURL).href,
    ...(guideLanguages ? { alternates: { languages: guideLanguages } } : {}),
  })
  if (indexableEn.length) guides.push({
    url: new URL('/en/ghiduri', siteURL).href,
    ...(guideLanguages ? { alternates: { languages: guideLanguages } } : {}),
  })
  for (const article of indexableRo) guides.push(articleItem(article, indexableEn))
  for (const article of indexableEn) guides.push(articleItem(article, indexableRo))

  const entityLists = {} as Record<'ro' | 'en', Record<EntityKind, PublicEntity[]>>
  for (const locale of ['ro', 'en'] as const) {
    const result = await Promise.all(entityKinds.map((kind) => getPublicEntities(kind, locale)))
    entityLists[locale] = Object.fromEntries(entityKinds.map((kind, index) =>
      [kind, result[index].filter((entity) => entityIsIndexable(entity))])) as Record<EntityKind, PublicEntity[]>
  }
  const entities: MetadataRoute.Sitemap = []
  for (const kind of entityKinds) {
    const ro = entityLists.ro[kind]
    const en = entityLists.en[kind]
    const languages = verifiedHubPair(
      ro.map((item) => ({ id: item.document.id, locale: item.locale, path: item.path, seo: item.document.seo })),
      en.map((item) => ({ id: item.document.id, locale: item.locale, path: item.path, seo: item.document.seo })),
      entityHubPath(kind, 'ro'), entityHubPath(kind, 'en'),
    )
    if (ro.length) entities.push({
      url: new URL(entityHubPath(kind, 'ro'), siteURL).href,
      ...(languages ? { alternates: { languages } } : {}),
    })
    if (en.length) entities.push({
      url: new URL(entityHubPath(kind, 'en'), siteURL).href,
      ...(languages ? { alternates: { languages } } : {}),
    })
    for (const item of ro) entities.push(entityItem(item, en))
    for (const item of en) entities.push(entityItem(item, ro))
  }

  const [allRoVideos, allEnVideos] = await Promise.all([getPublicVideos('ro'), getPublicVideos('en')])
  const roVideos = allRoVideos.filter((video) => videoIsIndexable(video))
  const enVideos = allEnVideos.filter((video) => videoIsIndexable(video))
  const videoHubLanguages = verifiedHubPair(roVideos, enVideos, '/video', '/en/video')
  const videoEntries: MetadataRoute.Sitemap = []
  if (roVideos.length) videoEntries.push({
    url: new URL('/video', siteURL).href,
    ...(videoHubLanguages ? { alternates: { languages: videoHubLanguages } } : {}),
  })
  if (enVideos.length) videoEntries.push({
    url: new URL('/en/video', siteURL).href,
    ...(videoHubLanguages ? { alternates: { languages: videoHubLanguages } } : {}),
  })
  for (const video of roVideos.concat(enVideos)) {
    const siblings = video.locale === 'ro' ? enVideos : roVideos
    const languages = videoLanguagePair(video, siblings)
    videoEntries.push({
      url: new URL(video.path, siteURL).href,
      ...(languages ? { alternates: { languages } } : {}),
    })
  }
  const publicRo = pages.filter((page) => publicPage(page, 'ro', Boolean(c.media.length)))
  const publicEn = english.filter((page) => publicPage(page, 'en', Boolean(c.media.length)))
  const homeLanguages = verifiedStaticPair('/', '/en', home, englishHome)
  const bookingLanguages = verifiedStaticPair('/rezervare', '/en/booking')
  const entries: MetadataRoute.Sitemap = [
    ...(isSelfCanonical('/', home) ? [{ url: new URL('/', siteURL).href,
      ...(homeLanguages ? { alternates: { languages: homeLanguages } } : {}) }] : []),
    { url: new URL('/rezervare', siteURL).href,
      ...(bookingLanguages ? { alternates: { languages: bookingLanguages } } : {}) },
    ...(isSelfCanonical('/en', englishHome) ? [{ url: new URL('/en', siteURL).href,
      ...(homeLanguages ? { alternates: { languages: homeLanguages } } : {}) }] : []),
    { url: new URL('/en/booking', siteURL).href,
      ...(bookingLanguages ? { alternates: { languages: bookingLanguages } } : {}) },
    ...publicRo.map((page) => pageItem(page, 'ro', publicEn)),
    ...publicEn.map((page) => pageItem(page, 'en', publicRo)),
    ...guides,
    ...entities,
    ...videoEntries,
  ]
  const seen = new Set<string>()
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}
