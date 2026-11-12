import { cache } from 'react'
import type { Metadata } from 'next'
import { contentStore } from '@/cms/store'
import { databaseConfigured } from '@/cms/db'
import type { Media, Videos } from '@/cms/types'
import { approvedArticleImage, type ArticleImage } from './article-references'
import { contentPath } from './content-paths'
import { isProductionReady, siteURL } from './site'
import { isSelfCanonical, verifiedLanguagePair } from './hreflang'
import type { LanguageAlternates } from './hreflang'
import { pageMetadata } from './seo'

export type VideoLocale = 'ro' | 'en'
export type PublicVideo = {
  id: number
  locale: VideoLocale
  path: string
  title: string
  description: string
  url: string
  embedURL: string
  youtubeID: string
  thumbnail: ArticleImage
  uploadDate: string
  durationSeconds: number
  recordingContext: 'live' | 'studio' | 'rehearsal' | 'other'
  eventType?: Videos['eventType']
  transcript?: string
  seo?: Videos['seo']
}

export function verifiedYouTubeID(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 500) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) return null
    let id = ''
    if (url.hostname === 'youtu.be') {
      if (url.pathname.split('/').filter(Boolean).length !== 1) return null
      id = url.pathname.slice(1)
    } else if (['www.youtube.com', 'youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      const path = url.pathname.split('/').filter(Boolean)
      if (path.length === 1 && path[0] === 'watch') id = url.searchParams.get('v') || ''
      else if (path.length === 2 && ['shorts', 'embed', 'live'].includes(path[0])) id = path[1]
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch { return null }
}
function validUploadDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && timestamp > 0 && timestamp <= Date.now()
}
export function approvedPublicVideo(value: Videos, locale: VideoLocale): PublicVideo | null {
  const path = typeof value.slug === 'string' ? contentPath({ collection: 'videos', slug: value.slug, locale }) : null
  const youtubeID = verifiedYouTubeID(value.url)
  const poster = typeof value.poster === 'object' ? value.poster as Media : null
  const thumbnail = approvedArticleImage(poster)
  const context = value.recordingContext
  if (value.approvedForPublication !== true || value.visible !== true ||
      value.rightsConfirmed !== true || !path || !youtubeID || !thumbnail ||
      !poster?.rightsNotes?.trim() ||
      typeof value.title !== 'string' || !value.title.trim() ||
      typeof value.description !== 'string' || value.description.trim().length < 30 ||
      !validUploadDate(value.publishedAt) ||
      !Number.isSafeInteger(value.durationSeconds) || !value.durationSeconds ||
      value.durationSeconds < 1 || value.durationSeconds > 86400 ||
      !(['live', 'studio', 'rehearsal', 'other'] as unknown[]).includes(context) ||
      !Number.isSafeInteger(value.id) || value.id < 1) return null
  return {
    id: value.id, locale, path,
    title: value.title.trim(), description: value.description.trim(),
    url: 'https://www.youtube.com/watch?v=' + youtubeID,
    embedURL: 'https://www.youtube-nocookie.com/embed/' + youtubeID,
    youtubeID, thumbnail,
    uploadDate: value.publishedAt,
    durationSeconds: value.durationSeconds,
    recordingContext: context!,
    ...(value.eventType ? { eventType: value.eventType } : {}),
    ...(value.transcript?.trim() ? { transcript: value.transcript.trim() } : {}),
    seo: value.seo,
  }
}
function contentIsAvailable() {
  if (databaseConfigured()) return true
  if (isProductionReady) throw new Error('Public videos require a configured production database.')
  return false
}
export const getPublicVideos = cache(async (locale: VideoLocale): Promise<PublicVideo[]> => {
  if ((locale !== 'ro' && locale !== 'en') || !contentIsAvailable()) return []
  const result = await contentStore.find({
    collection: 'videos', locale, overrideAccess: false, draft: false, depth: 1,
    limit: 200,
    where: { and: [
      { approvedForPublication: { equals: true } },
      { visible: { equals: true } },
      { rightsConfirmed: { equals: true } },
    ] },
  })
  const published = result.docs.map((doc) => approvedPublicVideo(doc, locale))
    .filter((video): video is PublicVideo => video !== null)
  const counts = new Map<string, number>()
  for (const video of published) counts.set(video.path, (counts.get(video.path) || 0) + 1)
  return published.filter((video) => counts.get(video.path) === 1)
})
export async function getPublicVideo(locale: VideoLocale, slug: string): Promise<PublicVideo | null> {
  if (!contentPath({ collection: 'videos', slug, locale })) return null
  return (await getPublicVideos(locale)).find((item) => item.path.endsWith('/' + slug)) || null
}
export function videoIsIndexable(video: PublicVideo, ready = isProductionReady) {
  return ready && isSelfCanonical(video.path, video.seo)
}
export function videoMetadata(
  video: PublicVideo, languages?: LanguageAlternates,
): Metadata {
  const result = pageMetadata(video.title, video.description, video.path, undefined, {
    ...video.seo, image: { src: video.thumbnail.src, alt: video.thumbnail.alt },
    languages, noindex: !videoIsIndexable(video),
  })
  return {
    ...result,
    openGraph: {
      ...result.openGraph,
      images: [{ url: video.thumbnail.src, alt: video.thumbnail.alt,
        width: video.thumbnail.width, height: video.thumbnail.height }],
    },
  }
}
export function videoLanguagePair(video: PublicVideo, opposite: PublicVideo[]) {
  const sibling = opposite.find((item) => item.id === video.id)
  return verifiedLanguagePair(video, sibling, isProductionReady)
}
export function videoStructuredData(video: PublicVideo) {
  const url = new URL(video.path, siteURL).href
  const home = new URL(video.locale === 'en' ? '/en' : '/', siteURL).href
  const hub = new URL(video.locale === 'en' ? '/en/video' : '/video', siteURL).href
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoObject', '@id': url + '#video', url,
        name: video.title, description: video.description,
        thumbnailUrl: new URL(video.thumbnail.src, siteURL).href,
        uploadDate: video.uploadDate, duration: 'PT' + video.durationSeconds + 'S',
        embedUrl: video.embedURL,
        mainEntityOfPage: url, inLanguage: video.locale === 'en' ? 'en-GB' : 'ro-RO',
        ...(video.transcript ? { transcript: video.transcript } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Brigitta', item: home },
          { '@type': 'ListItem', position: 2, name: video.locale === 'en' ? 'Video' : 'Video live și înregistrări', item: hub },
          { '@type': 'ListItem', position: 3, name: video.title, item: url },
        ],
      },
    ],
  }
}

/** A service page may show only a verified recording tagged for that real event type. */
export function videoForService(videos: PublicVideo[], slug: string): PublicVideo | undefined {
  const mapping: Record<string, NonNullable<PublicVideo['eventType']>> = {
    'nunti-si-ceremonii': 'wedding',
    'evenimente-corporate': 'corporate',
    'evenimente-private': 'private',
  }
  const category = mapping[slug]
  return category ? videos.find((video) => video.eventType === category) : undefined
}
