import { describe, expect, it, vi } from 'vitest'
import type { Knex } from 'knex'
import { MusicalFormats, Partners, CaseStudies } from '@/collections/ContentEntities'
import { defaults, fieldsForLocale, validateFields } from '@/cms/validation'
import { collections, labels } from '@/cms/schema'
import { AccessError, ContentStore } from '@/cms/store'
import type { ModelMap } from '@/cms/types'

const models = [MusicalFormats, Partners, CaseStudies]
const fixture = { title: 'Știință, muzică și experiență', slug: 'qa-entity', summary: 'Rezumat de test.',
  sections: [{ heading: 'Context', body: 'DJ + saxophone; text păstrat exact.' }],
  reviewer: 'QA fixture', reviewedAt: '2020-01-01T12:00:00Z', approvedForPublication: true,
  lineup: 'Componență de test', suitableFor: 'Context de test', technicalRequirements: 'Cerințe de test',
  relationshipDescription: 'Relație de test', publicationConsent: true, evidenceVerified: true,
  context: 'Context verificat', approach: 'Abordare de test', outcome: 'Rezultat de test', evidenceSummary: 'Dovadă de test',
  _status: 'published' }

describe('guarded content entity CMS foundation', () => {
  it('registers all three collection keys and labels', () => {
    const keys: (keyof ModelMap)[] = ['musical-formats', 'partners', 'case-studies']
    for (const key of keys) { expect(collections[key]).toBeDefined(); expect(labels[key]).toBeTruthy() }
  })
  for (const model of models) {
    it(`${model.slug}: starts private and validates a complete approved snapshot`, () => {
      expect(defaults(model.fields)).toMatchObject({ _status: 'draft', visible: false, approvedForPublication: false })
      expect(validateFields(model.fields, fixture).title).toBe(fixture.title)
      expect(() => validateFields(model.fields, { ...fixture, approvedForPublication: false })).toThrow()
      expect(() => validateFields(model.fields, { ...fixture, reviewer: '   ' })).toThrow()
      expect(() => validateFields(model.fields, { ...fixture, sections: [] })).toThrow()
      expect(() => validateFields(model.fields, { ...fixture, slug: '../admin' })).toThrow()
    })
    it(`${model.slug}: preserves EN content without copied text defaults`, () => {
      const en = validateFields(fieldsForLocale(model.fields, 'en'), { ...fixture, title: 'DJ + saxophone guide' })
      expect(en.title).toBe('DJ + saxophone guide')
      expect(en.sections).toEqual(fixture.sections)
    })
  }
  it('requires consent and verified case evidence', () => {
    for (const model of [Partners, CaseStudies])
      expect(() => validateFields(model.fields, { ...fixture, publicationConsent: false })).toThrow()
    expect(() => validateFields(CaseStudies.fields, { ...fixture, evidenceVerified: false })).toThrow()
    expect(() => validateFields(Partners.fields, { ...fixture, website: 'https://user:pass@example.test/' })).toThrow()
  })
  it('does not enable public ContentStore access to the new entities', async () => {
    const query = { join: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), whereNotNull: vi.fn().mockReturnThis() }
    const connection = vi.fn(() => query) as unknown as Knex
    const store = new ContentStore(connection)
    for (const collection of ['musical-formats', 'partners', 'case-studies'] as const) {
      await expect(store.find({ collection, overrideAccess: false, depth: 0 })).rejects.toBeInstanceOf(AccessError)
      await expect(store.byID(collection, 1, { overrideAccess: false, depth: 0 })).rejects.toBeInstanceOf(AccessError)
      await expect(store.create({ collection, overrideAccess: false, data: fixture })).rejects.toBeInstanceOf(AccessError)
    }
  })
})
