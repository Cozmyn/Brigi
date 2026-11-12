import { beforeEach, describe, expect, it, vi } from 'vitest'
import { contentStore } from '@/cms/store'
import type { Media, Page } from '@/cms/types'
import type { PublicArticle } from '@/lib/public-articles'
import { approvedArticleImage, readApprovedArticleImage, resolveArticleReferences } from '@/lib/article-references'
import { articleMetadata, articleStructuredData } from '@/lib/article-seo'

vi.mock('@/cms/store', () => ({ contentStore: { byID: vi.fn() } }))
beforeEach(() => { vi.mocked(contentStore.byID).mockReset() })
const media: Media = {
  id: 3, createdAt: '2020-01-01', updatedAt: '2020-01-01', approvedForPublication: true,
  filename: '1234-abcd-original.webp', url: '/media/1234-abcd-original.webp',
  width: 1600, height: 1000, alt: 'Saxofon la eveniment', caption: 'Cadru aprobat', credit: 'Credit confirmat',
}
const page: Page = {
  id: 9, title: 'Program muzical', heroTitle: 'Program muzical', slug: 'program-muzical',
  createdAt: '2020-01-01', updatedAt: '2020-01-01',
  _status: 'published', visible: true, approvedForPublication: true,
}
const article: PublicArticle = {
  id: 1, title: 'Ghid', slug: 'ghid', locale: 'en', path: '/en/ghiduri/ghid',
  createdAt: '2020-01-01', updatedAt: '2020-01-01',
  _status: 'published', editorialStatus: 'approved', visible: true, approvedForPublication: true,
  sections: [{ heading: 'Saxofon', body: 'DJ + saxophone', image: 3 }],
  seo: { image: 3 }, relatedPages: [9, 9],
}

describe('approved article references', () => {
  it('accepts only approved local processed images with real alt and dimensions', () => {
    expect(approvedArticleImage(media)).toMatchObject({ src: media.url, width: 1600, height: 1000, alt: media.alt })
    for (const patch of [
      { approvedForPublication: false }, { alt: '   ' }, { width: 0 }, { height: -1 },
      { url: 'https://external.test/photo.webp' }, { url: '/media/../secret.webp' },
      { filename: '../secret.webp' }, { width: 40000001 },
    ]) expect(approvedArticleImage({ ...media, ...patch })).toBeNull()
    expect(approvedArticleImage(null)).toBeNull()
  })

  it('never trusts embedded media objects or invalid IDs', async () => {
    for (const value of [undefined, null, 0, -1, '3', media])
      expect(await readApprovedArticleImage(value)).toBeNull()
    expect(contentStore.byID).not.toHaveBeenCalled()
  })

  it('deduplicates image and page references and uses public same-locale snapshots', async () => {
    vi.mocked(contentStore.byID).mockResolvedValueOnce(media).mockResolvedValueOnce(page)
    const result = await resolveArticleReferences(article)
    expect(result.socialImage?.src).toBe(media.url)
    expect(result.sectionImages[0]?.src).toBe(media.url)
    expect(result.relatedPages).toEqual([{ id: 9, title: page.title, path: '/en/program-muzical' }])
    expect(contentStore.byID).toHaveBeenCalledTimes(2)
    expect(contentStore.byID).toHaveBeenCalledWith('media', 3, { locale: 'ro', overrideAccess: false, draft: false, depth: 0 })
    expect(contentStore.byID).toHaveBeenCalledWith('pages', 9, { locale: 'en', overrideAccess: false, draft: false, depth: 0 })
  })

  it('omits withdrawn images and non-public related pages without removing section text', async () => {
    vi.mocked(contentStore.byID).mockResolvedValueOnce(null).mockResolvedValueOnce({ ...page, _status: 'draft' })
    const result = await resolveArticleReferences(article)
    expect(result.socialImage).toBeNull()
    expect(result.sectionImages).toEqual([null])
    expect(result.relatedPages).toEqual([])
    expect(article.sections?.[0].body).toBe('DJ + saxophone')
  })

  it('shares actual approved image dimensions across metadata and structured data', () => {
    const image = approvedArticleImage(media)!
    const metadata = JSON.stringify(articleMetadata(article, undefined, image))
    const graph = JSON.stringify(articleStructuredData(article, image))
    expect(metadata).toContain(media.url!)
    expect(metadata).toContain('1600')
    expect(graph).toContain(media.url!)
    expect(graph).toContain('1600')
    expect(graph).not.toContain('OfferCatalog')
  })
})
