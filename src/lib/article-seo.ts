import type { Metadata } from 'next'
import type { LanguageAlternates } from './hreflang'
import type { PublicArticle } from './public-articles'
import type { ArticleImage } from './article-references'
import { isProductionReady, siteURL, siteContent, type SiteContent } from './site'
import { pageMetadata } from './seo'

export function articleCanonical(article: PublicArticle): string | null {
  try {
    const url = new URL(article.seo?.canonical || article.path, siteURL)
    if (url.origin !== new URL(siteURL).origin || url.search || url.hash || url.username || url.password) return null
    return url.href
  } catch { return null }
}

export function articleIsIndexable(article: PublicArticle, ready = isProductionReady): boolean {
  return ready && !article.seo?.noindex &&
    articleCanonical(article) === new URL(article.path, siteURL).href
}

export function articleMetadata(article: PublicArticle, c: SiteContent = siteContent, image?: ArticleImage, languages?: LanguageAlternates): Metadata {
  const canonical = articleCanonical(article) || new URL(article.path, siteURL).href
  const metadata = pageMetadata(article.title, article.summary || '', article.path, c, {
    title: article.seo?.title, description: article.seo?.description, canonical,
    noindex: !articleIsIndexable(article), ogTitle: article.seo?.ogTitle, ogDescription: article.seo?.ogDescription,
    languages,
  })
  return { ...metadata, openGraph: {
    ...metadata.openGraph, type: 'article', publishedTime: article.publishedAt,
    modifiedTime: article.reviewedAt, authors: article.author ? [article.author] : [],
    ...(image ? { images: [{ url: image.src, alt: image.alt, width: image.width, height: image.height }] } : {}),
  }, twitter: {
    ...metadata.twitter, card: 'summary_large_image', ...(image ? { images: [image.src] } : {}),
  } }
}

export function articleStructuredData(article: PublicArticle, image?: ArticleImage) {
  const url = new URL(article.path, siteURL).href
  const hub = new URL(article.locale === 'en' ? '/en/ghiduri' : '/ghiduri', siteURL).href
  const home = new URL(article.locale === 'en' ? '/en' : '/', siteURL).href
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', '@id': `${url}#article`, url, mainEntityOfPage: url,
      headline: article.title, description: article.summary,
      inLanguage: article.locale === 'en' ? 'en-GB' : 'ro-RO',
      author: { '@type': 'Person', name: article.author },
      datePublished: article.publishedAt, dateModified: article.reviewedAt,
      citation: article.sources?.map((source) => source.url),
      articleBody: article.sections?.map((section) => `${section.heading}\n${section.body}`).join('\n\n'),
      ...(image ? { image: { '@type': 'ImageObject', url: new URL(image.src, siteURL).href,
        width: image.width, height: image.height, caption: image.caption || image.alt } } : {}),
    },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Brigitta', item: home },
      { '@type': 'ListItem', position: 2, name: article.locale === 'en' ? 'Guides' : 'Ghiduri', item: hub },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ] },
  ] }
}
