import { contentStore } from '@/cms/store'
import type { Media } from '@/cms/types'
import type { PublicArticle } from './public-articles'
import { publicContentPath } from './content-paths'

export type ArticleImage = {
  src: string; alt: string; width: number; height: number; caption?: string; credit?: string
}
export type ArticleRelatedPage = { id: number; title: string; path: string }

function referenceID(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null
}

export function approvedArticleImage(media: Media | null): ArticleImage | null {
  if (!media || media.approvedForPublication !== true || typeof media.alt !== 'string' || !media.alt.trim()) return null
  if (typeof media.filename !== 'string' || !/^[a-f0-9-]+-[a-z]+\.webp$/.test(media.filename) ||
      media.url !== `/media/${media.filename}`) return null
  const { width, height } = media
  if (typeof width !== 'number' || typeof height !== 'number' ||
      !Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width <= 0 || height <= 0 || width * height > 40000000) return null
  return { src: media.url, alt: media.alt, width, height, caption: media.caption, credit: media.credit }
}

export async function readApprovedArticleImage(reference: unknown): Promise<ArticleImage | null> {
  const id = referenceID(reference)
  if (!id) return null
  const media = await contentStore.byID('media', id, {
    locale: 'ro', overrideAccess: false, draft: false, depth: 0,
  })
  return approvedArticleImage(media)
}

export async function resolveArticleReferences(article: PublicArticle) {
  const images = new Map<number, Promise<ArticleImage | null>>()
  const loadImage = (reference: unknown): Promise<ArticleImage | null> => {
    const id = referenceID(reference)
    if (!id) return Promise.resolve(null)
    const cached = images.get(id)
    if (cached) return cached
    if (images.size >= 16) return Promise.resolve(null)
    const result = readApprovedArticleImage(id)
    images.set(id, result)
    return result
  }
  // Reserve one slot for the social image, then resolve section images.
  const socialTask = loadImage(article.seo?.image)
  const sectionImages = await Promise.all((article.sections || []).map((section) => loadImage(section.image)))
  const socialImage = await socialTask
  const ids = [...new Set((article.relatedPages || []).map(referenceID).filter((id): id is number => id !== null))].slice(0, 8)
  const related = await Promise.all(ids.map(async (id): Promise<ArticleRelatedPage | null> => {
    const page = await contentStore.byID('pages', id, {
      locale: article.locale, overrideAccess: false, draft: false, depth: 0,
    })
    if (!page || typeof page.title !== 'string' || !page.title.trim()) return null
    const path = publicContentPath({ ...page, collection: 'pages', locale: article.locale })
    return path ? { id: page.id, title: page.title, path } : null
  }))
  return { sectionImages, socialImage, relatedPages: related.filter((page): page is ArticleRelatedPage => page !== null) }
}
