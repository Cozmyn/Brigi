import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Knex } from 'knex'
import { getDB } from '@/cms/db'
import { contentPath } from '@/lib/content-paths'
import { entityFromSnapshot, entitiesFromRows, entityKinds, entityIsIndexable, entityCanonical, entityStructuredData, getPublicEntity, type EntityRow } from '@/lib/public-entities'
vi.mock('@/cms/db', () => ({ databaseConfigured: vi.fn(() => true), getDB: vi.fn(), closeDB: vi.fn(async () => {}) }))
beforeEach(() => { vi.clearAllMocks() })
const snapshot = { title: 'DJ + saxophone', slug: 'qa-public', summary: 'Test only.', sections: [{ heading: 'Știință', body: 'Text exact.' }],
  reviewer: 'QA', reviewedAt: '2020-01-01T12:00:00Z', _status: 'published', visible: true, approvedForPublication: true,
  lineup: 'QA', suitableFor: 'QA', technicalRequirements: 'QA', relationshipDescription: 'QA', publicationConsent: true,
  context: 'QA', approach: 'QA', outcome: 'QA', evidenceSummary: 'QA', evidenceVerified: true }
const row: EntityRow = { id: 1, created_at: '2020-01-01', updated_at: '2020-01-02', snapshot }
describe('public entity snapshots', () => {
  for (const kind of entityKinds) it(`${kind}: validates both languages and fails closed`, () => {
    const ro = entityFromSnapshot(row, kind, 'ro')!
    expect(ro.path).toBe(contentPath({ collection: kind, locale: 'ro', slug: snapshot.slug }))
    expect(entityFromSnapshot(row, kind, 'en')?.path).toBe(`/en${ro.path}`)
    for (const patch of [{ _status: 'draft' }, { visible: false }, { approvedForPublication: false }, { reviewer: '' }, { sections: [] }])
      expect(entityFromSnapshot({ ...row, snapshot: { ...snapshot, ...patch } }, kind, 'ro')).toBeNull()
    expect(entityFromSnapshot({ ...row, snapshot: '{' }, kind, 'ro')).toBeNull()
    expect(entitiesFromRows([row, { ...row, id: 2 }], kind, 'ro')).toEqual([])
    expect(entityIsIndexable(ro, false)).toBe(false)
    expect(entityIsIndexable(ro, true)).toBe(true)
    expect(entityIsIndexable({ ...ro, document: { ...ro.document, seo: { noindex: true } } }, true)).toBe(false)
    expect(entityCanonical({ ...ro, document: { ...ro.document, seo: { canonical: 'https://external.test/' } } })).toBeNull()
    expect(JSON.stringify(entityStructuredData(ro))).not.toMatch(/OfferCatalog|AggregateRating/)
  })
  it('does not reserve hub slugs as editable root pages', () => {
    for (const slug of ['formate', 'parteneri', 'studii-de-caz']) expect(contentPath({ collection: 'pages', locale: 'ro', slug })).toBeNull()
  })
  it('queries published slug and explicit locale, rejecting ambiguous targets', async () => {
    const q = { join: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), whereNotNull: vi.fn().mockReturnThis(),
      whereRaw: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue([row]) }
    vi.mocked(getDB).mockReturnValue((() => q) as unknown as Knex)
    expect((await getPublicEntity('partners', snapshot.slug, 'en'))?.path).toBe('/en/parteneri/qa-public')
    expect(q.where).toHaveBeenCalledWith('l.locale', 'en')
    expect(q.select).toHaveBeenCalledWith(expect.objectContaining({ snapshot: 'l.published_data' }))
    expect(q.whereRaw).toHaveBeenCalledWith("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.slug')) = ?", [snapshot.slug])
    q.limit.mockResolvedValueOnce([row, row])
    expect(await getPublicEntity('partners', snapshot.slug, 'ro')).toBeNull()
  })
})
