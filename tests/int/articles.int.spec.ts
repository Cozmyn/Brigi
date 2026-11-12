import { describe, expect, it } from 'vitest'
import type { Knex } from 'knex'
import { Articles } from '@/collections/Articles'
import { collections, labels } from '@/cms/schema'
import { CMSValidationError, defaults, fieldsForLocale, validateFields, type Data } from '@/cms/validation'
import { AccessError, ContentStore } from '@/cms/store'
import type { ModelMap } from '@/cms/types'

const approved: Data = {
  title: 'Saxofon live și program muzical', slug: 'saxofon-live',
  summary: 'Rezumat editorial pentru verificarea fluxului.', topic: 'music',
  intent: 'Cum coordonezi momentele muzicale?', author: 'Autor de test', reviewer: 'Recenzor de test',
  originalContribution: 'Exemplu editorial de test, nu dovadă de eveniment real.',
  sections: [{ heading: 'DJ și saxofon', body: 'DJ + saxophone; citatul rămâne neschimbat.' }],
  sources: [{ label: 'Documentație de test', url: 'https://example.test/guide' }],
  publishedAt: '2020-01-01T12:00:00Z', reviewedAt: '2020-01-02T12:00:00Z',
  editorialStatus: 'approved', approvedForPublication: true, visible: true, _status: 'published',
}

describe('private Articles CMS', () => {
  it('registers a typed, versioned collection and safe defaults', () => {
    const key: keyof ModelMap = 'articles'
    expect(collections[key]).toBe(Articles)
    expect(labels[key]).toBe('Ghiduri & articole')
    expect(Articles.versions).toBeTruthy()
    expect(defaults(Articles.fields)).toMatchObject({
      _status: 'draft', editorialStatus: 'draft', visible: false, approvedForPublication: false,
    })
  })

  it('saves an incomplete draft but refuses publication with only a status toggle', () => {
    const draft = { title: 'Ghid în lucru', slug: 'ghid-in-lucru' }
    expect(validateFields(Articles.fields, draft)._status).toBe('draft')
    expect(() => validateFields(Articles.fields, { ...draft, _status: 'published' }))
      .toThrow(CMSValidationError)
  })

  it.each([
    { author: '' }, { reviewer: '   ' }, { summary: '' }, { intent: '' },
    { originalContribution: '' }, { topic: '' }, { sections: [] }, { sources: [] },
    { approvedForPublication: false }, { editorialStatus: 'review' },
    { publishedAt: '' }, { reviewedAt: '' },
    { sections: [{ heading: '   ', body: 'Text' }] },
    { sources: [{ label: '   ', url: 'https://example.test' }] },
  ])('rejects incomplete publication %j', (patch) => {
    expect(() => validateFields(Articles.fields, { ...approved, ...patch })).toThrow(CMSValidationError)
  })

  it.each(['http://example.test', 'javascript:alert(1)', '//example.test', 'https://user:password@example.test'])
  ('rejects unsafe source %s', (url) => {
    expect(() => validateFields(Articles.fields, { ...approved, sources: [{ label: 'Sursă', url }] }))
      .toThrow(CMSValidationError)
  })

  it.each(['../admin', 'admin', '/ghiduri/program', 'program?email=x'])('rejects invalid slug %s', (slug) => {
    expect(() => validateFields(Articles.fields, { ...approved, slug })).toThrow(CMSValidationError)
  })

  it('rejects future publication and preserves valid content in both locales', () => {
    expect(() => validateFields(Articles.fields, {
      ...approved, publishedAt: new Date(Date.now() + 86400000).toISOString(),
    })).toThrow(CMSValidationError)
    for (const locale of ['ro', 'en']) {
      const doc = validateFields(fieldsForLocale(Articles.fields, locale), approved)
      expect(doc.title).toBe(approved.title)
      expect(doc.sections).toEqual(approved.sections)
      expect(doc._status).toBe('published')
    }
  })

  it('validates unnamed groups after nested fields and defaults without retaining unknown data', () => {
    expect(validateFields([{ type: 'group', fields: [{ name: 'ok', type: 'checkbox', defaultValue: true }],
      validate: (value) => (value as Data).ok === true || 'Aprobare necesară.',
    }], { unknown: 'discarded' })).toEqual({ ok: true })
    expect(() => validateFields([{ type: 'group', fields: [], validate: () => false }], {}))
      .toThrow(CMSValidationError)
  })

  it('keeps anonymous article reads denied until public integration', async () => {
    const builder = {
      join() { return this }, where() { return this }, whereNotNull() { return this },
    }
    const connection = (() => builder) as unknown as Knex
    const store = new ContentStore(connection)
    await expect(store.find({ collection: 'articles', overrideAccess: false, depth: 0 }))
      .rejects.toBeInstanceOf(AccessError)
    await expect(store.byID('articles', 1, { overrideAccess: false, depth: 0 }))
      .rejects.toBeInstanceOf(AccessError)
  })
})
