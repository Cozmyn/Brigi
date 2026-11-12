import { describe, expect, it } from 'vitest'
import { evergreenGuides } from '@/lib/evergreen-guides'
import { validateFields } from '@/cms/validation'
import { Articles } from '@/collections/Articles'
import { contentPath } from '@/lib/content-paths'
describe('trustworthy SEO editorial bootstrap', () => {
  it('provides six original, unique and useful conversion-intent guides', () => {
    expect(evergreenGuides.length).toBeGreaterThanOrEqual(6)
    expect(new Set(evergreenGuides.map((x) => x.slug)).size).toBe(evergreenGuides.length)
    for (const guide of evergreenGuides) {
      expect(contentPath({ collection: 'articles', slug: guide.slug, locale: 'ro' })).not.toBeNull()
      expect(guide.seoTitle.length).toBeLessThanOrEqual(90)
      expect(guide.seoDescription.length).toBeLessThanOrEqual(200)
      expect(guide.sections.length).toBeGreaterThanOrEqual(4)
      expect(guide.sections.reduce((n, section) => n + section.body.split(/\s+/).length, 0))
        .toBeGreaterThanOrEqual(250)
      expect(guide.sources.every((s) => s.url.startsWith('https://'))).toBe(true)
    }
  })
  it('passes the same article validations the CMS uses for publication', () => {
    for (const guide of evergreenGuides) {
      const now = new Date(Date.now() - 60_000).toISOString()
      const published = {
        title: guide.title, slug: guide.slug, summary: guide.summary,
        topic: guide.topic, intent: guide.intent,
        author: 'BRIGITTA',
        reviewer: 'Redactare și verificare asistată AI; fără recenzie artistică personală',
        originalContribution: guide.originalContribution,
        sources: guide.sources, sections: guide.sections, relatedPages: [],
        publishedAt: now, reviewedAt: now,
        visible: true, approvedForPublication: true, editorialStatus: 'approved', _status: 'published',
        seo: { title: guide.seoTitle, description: guide.seoDescription, noindex: false },
      }
      expect(() => validateFields(Articles.fields, published)).not.toThrow()
    }
  })
})
