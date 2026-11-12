import { afterEach, describe, expect, it, vi } from 'vitest'
import type { EditorialPage } from '@/lib/editorial'
import type { PublicArticle } from '@/lib/public-articles'

vi.mock('@/lib/cms', () => ({
  getPublicPages: vi.fn(), getSiteContent: vi.fn(async () => ({ media: [] })),
  getHomeSEO: vi.fn(async () => undefined),
}))
vi.mock('@/lib/public-articles', () => ({ getPublicArticles: vi.fn() }))
vi.mock('@/lib/public-entities', () => ({
  entityKinds: ['musical-formats', 'partners', 'case-studies'],
  getPublicEntities: vi.fn(async () => []),
  entityCanonical: vi.fn(), entityHubPath: vi.fn(), entityIsIndexable: vi.fn(),
}))
// Isolate indexing tests from a database that is deliberately not migrated yet.
vi.mock('@/lib/public-videos', () => ({
  getPublicVideos: vi.fn(async () => []),
  videoIsIndexable: vi.fn(),
  videoLanguagePair: vi.fn(),
}))
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

const page = (id: number, slug: string): EditorialPage => ({
  id, slug, title: slug, h1: slug, intro: '', description: slug,
  sections: [], faqs: [], related: [], type: 'editorial',
})
const article = (id: number, locale: 'ro' | 'en', slug: string): PublicArticle => ({
  id, locale, slug, path: (locale === 'en' ? '/en/' : '/') + 'ghiduri/' + slug,
  title: slug, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-02T00:00:00Z',
  _status: 'published', visible: true, approvedForPublication: true,
  editorialStatus: 'approved', seo: {},
})
async function load() {
  vi.stubEnv('SITE_URL', 'https://example.test')
  vi.stubEnv('PRODUCTION_GATES_CLOSED', 'true')
  vi.resetModules()
  const cms = await import('@/lib/cms')
  const articles = await import('@/lib/public-articles')
  const { default: sitemap } = await import('@/app/(frontend)/sitemap')
  return { cms, articles, sitemap }
}
describe('production sitemap localization', () => {
  it('exposes languages only when published document IDs match, including different slugs', async () => {
    const { cms, articles, sitemap } = await load()
    vi.mocked(cms.getPublicPages).mockImplementation(async (locale = 'ro') =>
      locale === 'en' ? [page(9, 'english-page')] : [page(9, 'pagina-romana')])
    vi.mocked(articles.getPublicArticles).mockImplementation(async (locale) =>
      locale === 'en' ? [article(11, 'en', 'english-guide')] : [article(11, 'ro', 'ghid-romanesc')])
    const result = await sitemap()
    const find = (path: string) => result.find((entry) => entry.url === 'https://example.test' + path)
    const pageLang = { 'ro-RO': 'https://example.test/pagina-romana',
      'en-GB': 'https://example.test/en/english-page' }
    const guideLang = { 'ro-RO': 'https://example.test/ghiduri/ghid-romanesc',
      'en-GB': 'https://example.test/en/ghiduri/english-guide' }
    expect(find('/pagina-romana')?.alternates?.languages).toEqual(pageLang)
    expect(find('/en/english-page')?.alternates?.languages).toEqual(pageLang)
    expect(find('/ghiduri/ghid-romanesc')?.alternates?.languages).toEqual(guideLang)
    expect(find('/en/ghiduri/english-guide')?.alternates?.languages).toEqual(guideLang)
    expect(find('/ghiduri')?.alternates?.languages).toEqual({
      'ro-RO': 'https://example.test/ghiduri', 'en-GB': 'https://example.test/en/ghiduri',
    })
    expect(find('/rezervare')?.alternates?.languages).toEqual({
      'ro-RO': 'https://example.test/rezervare', 'en-GB': 'https://example.test/en/booking',
    })
  })
  it('omits unpaired translations and noindex/non-self canonical URLs', async () => {
    const { cms, articles, sitemap } = await load()
    vi.mocked(cms.getPublicPages).mockImplementation(async (locale = 'ro') =>
      locale === 'en' ? [page(12, 'not-the-translation')] :
        [page(9, 'pagina-romana'), { ...page(15, 'external'), seo: { canonical: 'https://other.test/external' } }])
    vi.mocked(articles.getPublicArticles).mockImplementation(async (locale) =>
      locale === 'en' ? [] : [article(11, 'ro', 'ghid-fara-traducere')])
    const result = await sitemap()
    expect(result.some((entry) => entry.url.endsWith('/external'))).toBe(false)
    expect(result.find((entry) => entry.url.endsWith('/pagina-romana'))?.alternates).toBeUndefined()
    expect(result.find((entry) => entry.url.endsWith('/ghiduri/ghid-fara-traducere'))?.alternates).toBeUndefined()
    expect(result.find((entry) => entry.url.endsWith('/ghiduri'))?.alternates).toBeUndefined()
    expect(result.some((entry) => entry.url.endsWith('/en/ghiduri'))).toBe(false)
  })
})
