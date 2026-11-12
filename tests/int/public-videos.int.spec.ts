import { describe, expect, it } from 'vitest'
import type { Videos, Media } from '@/cms/types'
import {
  approvedPublicVideo, verifiedYouTubeID, videoStructuredData, videoIsIndexable,
} from '@/lib/public-videos'

const poster: Media = {
  id: 13, createdAt: '2020-01-01T12:00:00Z', updatedAt: '2020-01-01T12:00:00Z',
  alt: 'Brigitta cântă într-un recital publicat cu acord', approvedForPublication: true,
  rightsNotes: 'Drepturi de publicare și credit verificate',
  filename: '12345678-abcd-original.webp', url: '/media/12345678-abcd-original.webp',
  width: 1600, height: 900, mimeType: 'image/webp', credit: 'Autor foto aprobat',
}
const draft: Videos = {
  id: 1, createdAt: '2020-01-01T12:00:00Z', updatedAt: '2020-01-01T12:00:00Z',
  title: 'Probă de recital - TEST QA',
  slug: 'recital-qa',
  description: 'Înregistrare de test cu context și drepturi confirmate în setul de QA.',
  publishedAt: '2020-01-01T12:00:00Z',
  durationSeconds: 180, recordingContext: 'studio', rightsConfirmed: true,
  visible: true, approvedForPublication: true,
  eventType: 'other', kind: 'full',
  poster, url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
}
describe('real recordings and video schema safety', () => {
  it('accepts only exact YouTube domains and 11-character IDs', () => {
    expect(verifiedYouTubeID('https://www.youtube.com/watch?v=aqz-KE-bpKQ')).toBe('aqz-KE-bpKQ')
    expect(verifiedYouTubeID('https://youtu.be/aqz-KE-bpKQ')).toBe('aqz-KE-bpKQ')
    expect(verifiedYouTubeID('https://www.youtube.com/shorts/aqz-KE-bpKQ')).toBe('aqz-KE-bpKQ')
    for (const url of [
      'http://www.youtube.com/watch?v=aqz-KE-bpKQ',
      'https://www.youtube.com.evil.example/watch?v=aqz-KE-bpKQ',
      'https://www.youtube.com/watch?v=invalid',
      'javascript:alert(1)', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ#private',
      'https://user:password@www.youtube.com/watch?v=aqz-KE-bpKQ',
    ]) expect(verifiedYouTubeID(url)).toBeNull()
  })
  it('keeps missing or unapproved videos off public pages', () => {
    for (const patch of [
      { approvedForPublication: false }, { visible: false },
      { rightsConfirmed: false }, { title: ' ' }, { slug: '../../admin' },
      { description: 'Short' }, { durationSeconds: 0 },
      { publishedAt: '2099-01-01T00:00:00Z' }, { recordingContext: undefined },
      { poster: { ...poster, approvedForPublication: false } },
      { poster: { ...poster, rightsNotes: '' } },
      { url: 'https://fake-youtube.test/watch?v=aqz-KE-bpKQ' },
    ]) expect(approvedPublicVideo({ ...draft, ...patch } as Videos, 'ro')).toBeNull()
  })
  it('does not mislabel studio recordings as genuine live and uses real approved poster', () => {
    const result = approvedPublicVideo(draft, 'ro')!
    expect(result).toMatchObject({
      path: '/video/recital-qa', recordingContext: 'studio',
      youtubeID: 'aqz-KE-bpKQ', durationSeconds: 180,
      thumbnail: { src: poster.url, width: 1600, height: 900 },
    })
    expect(videoIsIndexable(result, false)).toBe(false)
    expect(videoIsIndexable(result, true)).toBe(true)
    const graph = videoStructuredData(result)
    const item = graph['@graph'][0] as Record<string, unknown>
    expect(item['@type']).toBe('VideoObject')
    expect(item.name).toBe(draft.title)
    expect(item.duration).toBe('PT180S')
    expect(item.thumbnailUrl).toBeDefined()
    expect(item.embedUrl).toBe('https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ')
    expect(JSON.stringify(graph)).not.toMatch(/AggregateRating|OfferCatalog|synthetic-live|@type":"Review/)
    expect(approvedPublicVideo({ ...draft, seo: { noindex: true } }, 'en')?.path).toBe('/en/video/recital-qa')
  })
})
