import { describe, expect, it } from 'vitest'
import { editorialPages } from '@/lib/editorial'
import { analyticsDay, analyticsSchema } from '@/lib/analytics'
import { jsonLD, pageMetadata, structuredData } from '@/lib/seo'
import { siteContent } from '@/lib/site'
import { repairPublicText, vocalistCopy } from '@/lib/positioning'

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
  const valid = {
    consent: true,
    event: 'page_view',
    path: '/repertoriu',
    referrer: 'example.com',
    campaign: 'autumn_2026',
  }

  it.each([
    '/', '/repertoriu', '/en', '/en/booking', '/en/booking/',
    '/ghiduri/program-nunta', '/instrumente/planner-muzical',
  ])('accepts public path %s', (path) => {
    expect(analyticsSchema.safeParse({ ...valid, path }).success).toBe(true)
  })

  it.each([
    '/admin', '/admin/users', '/api/inquiries', '/next/preview',
    '/en/admin', '/en/api/inquiries', '/en/next/preview',
    '/?email=person@example.com', '/en/booking?email=person@example.com',
    '/repertoriu#contact', 'https://example.com/en', '//example.com',
    '/en//booking', '/en/../admin', '/en/%61dmin', '/en/Booking',
    '/en/booking\\private', '/' + 'a'.repeat(150),
  ])('rejects private or malformed path %s', (path) => {
    expect(analyticsSchema.safeParse({ ...valid, path }).success).toBe(false)
  })

  it('rejects tracking without agreement and personal attribution values', () => {
    for (const changed of [
      { consent: false },
      { referrer: 'https://example.com/private' },
      { campaign: 'person@example.com' },
    ])
      expect(analyticsSchema.safeParse({ ...valid, ...changed }).success).toBe(false)
  })

  it('counts calendar days in Bucharest, including the UTC boundary', () => {
    expect(analyticsDay(new Date('2026-09-30T22:30:00Z'))).toBe('2026-10-01')
  })
})

describe('editorial content preservation', () => {
  it.each([
    'Saxofonistă pentru evenimente', 'DJ și saxofon live',
    'Live saxophone', 'sax performance', 'Saxophonist & live band',
  ])('preserves approved copy: %s', (text) => {
    expect(vocalistCopy(text)).toBe(text)
    expect(repairPublicText(text)).toBe(text)
  })

  it('preserves nested copy, names, quotes, URLs and identifiers without mutation', () => {
    const input = {
      title: 'Saxofonistă pentru evenimente',
      seo: { description: 'Live saxophone' },
      slug: 'old-saxophone',
      url: '/saxophone.jpg',
      quote: 'Am ales DJ și saxofon.',
      name: 'Saxophonist & Band',
      content: { root: { children: [{ text: 'sax performance' }] } },
    }
    const snapshot = JSON.stringify(input)
    expect(repairPublicText(input)).toEqual(JSON.parse(snapshot))
    expect(JSON.stringify(input)).toBe(snapshot)
  })

  it('preserves null, undefined, arrays and primitive values', () => {
    expect(repairPublicText(null)).toBeNull()
    expect(repairPublicText(undefined)).toBeUndefined()
    expect(repairPublicText(42)).toBe(42)
    expect(repairPublicText(false)).toBe(false)
    expect(repairPublicText(['saxofon', { text: 'saxophone' }])).toEqual([
      'saxofon', { text: 'saxophone' },
    ])
  })
})
