import { describe, expect, it } from 'vitest'
import { editorialPages } from '@/lib/editorial'
import { analyticsDay, analyticsSchema } from '@/lib/analytics'
import { jsonLD, pageMetadata, structuredData } from '@/lib/seo'
import { siteContent } from '@/lib/site'
describe('editorial publishing and discovery', () => {
  it('has distinct intent and valid contextual links for every content page', () => {
    const slugs = new Set(editorialPages.map((p) => p.slug))
    expect(slugs.size).toBe(editorialPages.length)
    expect(new Set(editorialPages.map((p) => p.description)).size).toBe(editorialPages.length)
    for (const page of editorialPages) {
      expect(page.description.length).toBeLessThanOrEqual(170)
      for (const related of page.related) expect(slugs.has(related.slug)).toBe(true)
      if (page.type !== 'media') expect(page.sections.length).toBeGreaterThanOrEqual(3)
    }
  })
  it('uses the page FAQs and suppresses offers where packages are not visible', () => {
    const page = editorialPages.find((p) => p.slug === 'muzica-live-evenimente')!
    const graph = structuredData('/' + page.slug, page.title, page.faqs, siteContent, false)
    expect(JSON.stringify(graph)).not.toContain('OfferCatalog')
    expect(JSON.stringify(graph)).toContain(page.faqs[0].answer)
    expect(JSON.stringify(graph)).not.toContain(siteContent.faqs[0].answer)
  })
  it('uses configured canonical and social values, safely escapes JSON-LD', () => {
    const meta = pageMetadata('Title', 'Description', '/one', siteContent, {
      canonical: '/two',
      noindex: true,
      ogTitle: 'Social',
    })
    expect(meta.alternates?.canonical).toBe('/two')
    expect(meta.openGraph?.title).toBe('Social')
    expect(meta.robots).toEqual({ index: false, follow: true })
    expect(jsonLD({ name: '</script>' })).not.toContain('</script>')
  })
})
describe('private aggregate analytics', () => {
  it('rejects tracking without agreement and rejects personal paths or URLs', () => {
    const valid = {
      consent: true,
      event: 'page_view',
      path: '/repertoriu',
      referrer: 'example.com',
      campaign: 'autumn_2026',
    }
    expect(analyticsSchema.safeParse(valid).success).toBe(true)
    for (const changed of [
      { consent: false },
      { path: '/admin' },
      { path: '/?email=person@example.com' },
      { referrer: 'https://example.com/private' },
      { campaign: 'person@example.com' },
    ])
      expect(analyticsSchema.safeParse({ ...valid, ...changed }).success).toBe(false)
  })
  it('counts calendar days in Bucharest, including the UTC boundary', () => {
    expect(analyticsDay(new Date('2026-09-30T22:30:00Z'))).toBe('2026-10-01')
  })
})

describe('vocalist positioning repair', () => {
  it('corrects obsolete public copy without changing URLs or identifiers', async () => {
    const { repairPublicText } = await import('@/lib/positioning')
    const result = repairPublicText({
      title: 'Saxofonistă pentru evenimente',
      seo: { description: 'Live saxophone' },
      slug: 'old-saxophone',
      url: '/saxophone.jpg',
      content: { root: { children: [{ text: 'sax performance' }] } },
    })
    expect(result).toMatchObject({
      title: 'Solistă vocală pentru evenimente',
      seo: { description: 'Live vocals' },
      slug: 'old-saxophone',
      url: '/saxophone.jpg',
    })
  })
})
