import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Knex } from 'knex'
import { databaseConfigured, getDB } from '@/cms/db'
import { articleFromSnapshot, getPublicArticle, type ArticleSnapshotRow } from '@/lib/public-articles'
import { articleCanonical, articleIsIndexable, articleStructuredData } from '@/lib/article-seo'

vi.mock('@/cms/db', () => ({ databaseConfigured: vi.fn(() => true), getDB: vi.fn() }))
beforeEach(() => { vi.clearAllMocks() })
const snapshot = {
  title: 'DJ și saxofon', slug: 'dj-si-saxofon', summary: 'Exemplu pentru teste, nu ghid publicat.',
  topic: 'music', intent: 'Cum se coordonează muzica?', author: 'Autor test', reviewer: 'Recenzor test',
  originalContribution: 'Contribuție de test.', sections: [{ heading: 'Saxofon', body: 'DJ + saxophone.' }],
  sources: [{ label: 'Sursă test', url: 'https://example.test/guide' }],
  publishedAt: '2020-01-01T12:00:00Z', reviewedAt: '2020-01-02T12:00:00Z',
  _status: 'published', editorialStatus: 'approved', visible: true, approvedForPublication: true,
}
const row: ArticleSnapshotRow = { id: 1, created_at: '2020-01-01T12:00:00Z', updated_at: '2020-01-03T12:00:00Z', snapshot }

describe('public article snapshot policy', () => {
  it('validates a published snapshot and keeps language paths separate', () => {
    expect(articleFromSnapshot(row, 'ro')?.path).toBe('/ghiduri/dj-si-saxofon')
    expect(articleFromSnapshot({ ...row, snapshot: JSON.stringify(snapshot) }, 'en')?.path).toBe('/en/ghiduri/dj-si-saxofon')
    expect(articleFromSnapshot(row, 'ro')?.sections).toEqual(snapshot.sections)
  })

  it.each([
    { _status: 'draft' }, { visible: false }, { approvedForPublication: false },
    { editorialStatus: 'review' }, { author: '' }, { sources: [] },
  ])('refuses a non-public or invalid snapshot %j', (patch) => {
    expect(articleFromSnapshot({ ...row, snapshot: { ...snapshot, ...patch } }, 'ro')).toBeNull()
  })

  it('fails closed for absent, malformed and corrupted snapshots', () => {
    for (const value of [null, '{', [], { title: 'Draft', slug: 'draft' }])
      expect(articleFromSnapshot({ ...row, snapshot: value }, 'ro')).toBeNull()
    expect(articleFromSnapshot({ ...row, id: -1 }, 'ro')).toBeNull()
  })

  it('queries published_data and its slug, never the mutable draft slug', async () => {
    const query = {
      join: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), whereNotNull: vi.fn().mockReturnThis(),
      whereRaw: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), first: vi.fn().mockResolvedValue(row),
    }
    vi.mocked(getDB).mockReturnValue((() => query) as unknown as Knex)
    const article = await getPublicArticle('en', snapshot.slug)
    expect(article?.path).toBe('/en/ghiduri/dj-si-saxofon')
    expect(query.where).toHaveBeenCalledWith('l.locale', 'en')
    expect(query.whereNotNull).toHaveBeenCalledWith('l.published_data')
    expect(query.select).toHaveBeenCalledWith(expect.objectContaining({ snapshot: 'l.published_data' }))
    expect(query.whereRaw).toHaveBeenCalledWith(
      "JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.slug')) = ?", [snapshot.slug])
    expect(query.where).not.toHaveBeenCalledWith('l.slug', expect.anything())
  })

  it('rejects invalid slugs before querying the database', async () => {
    expect(await getPublicArticle('ro', '../admin')).toBeNull()
    expect(getDB).not.toHaveBeenCalled()
    expect(databaseConfigured).not.toHaveBeenCalled()
  })

  it('keeps noindex, canonical and the production gate aligned without inventing Service offers', () => {
    const article = articleFromSnapshot(row, 'ro')!
    expect(articleIsIndexable(article, false)).toBe(false)
    expect(articleIsIndexable(article, true)).toBe(true)
    expect(articleIsIndexable({ ...article, seo: { noindex: true } }, true)).toBe(false)
    expect(articleIsIndexable({ ...article, seo: { canonical: '/another-page' } }, true)).toBe(false)
    expect(articleCanonical({ ...article, seo: { canonical: 'https://external.test/' } })).toBeNull()
    const graph = articleStructuredData(article)
    expect(graph['@graph'][0]['@type']).toBe('Article')
    expect(JSON.stringify(graph)).not.toContain('OfferCatalog')
    expect(JSON.stringify(graph)).toContain('DJ + saxophone.')
  })
})
