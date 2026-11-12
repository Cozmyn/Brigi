import { describe, expect, it } from 'vitest'
import { commercialSEO, suggestedCommercialSEO } from '@/lib/commercial-seo'
import { editorialSEOFeedback, editorialSEOSuggestion, editorialSlug } from '@/lib/seo-editor'
import type { EditorialPage } from '@/lib/editorial'
describe('SEO publishing guidance is safe for Romanian editors', () => {
  it('generates a stable, clean slug for Romanian diacritics', () => {
    expect(editorialSlug('Preț solistă nuntă: Întrebări și răspunsuri')).toBe('pret-solista-nunta-intrebari-si-raspunsuri')
  })
  it('suggests meta and slug only from existing editor text', () => {
    const result = editorialSEOSuggestion({
      title: 'Solistă pentru nuntă', summary: 'Muzică live pentru momente speciale, cu o ofertă individuală.',
    })
    expect(result.slug).toBe('solista-pentru-nunta')
    expect(result.title).toContain('Brigitta')
    expect(result.description).toContain('ofertă individuală')
  })
  it('leaves editor-written titles and descriptions untouched', () => {
    const base: EditorialPage = {
      slug: 'nunti-si-ceremonii', title: 'Solistă pentru nuntă', description: 'Detalii despre recital.',
      h1: '', intro: '', type: 'service', sections: [], faqs: [], related: [],
    }
    expect(suggestedCommercialSEO(base).title).toBe(commercialSEO[base.slug].title)
    const custom = { ...base, seo: { title: 'Titlu editorial ales de autor', description: 'Meta personalizat', noindex: true } }
    expect(suggestedCommercialSEO(custom)).toEqual(custom.seo)
  })
  it('reports useful checks, never a fictitious Google ranking score', () => {
    const result = editorialSEOFeedback({ slug: '', title: 'Mic', seo: { noindex: true } })
    expect(result.issues).toContain('Pagina este setată noindex.')
    expect(result.issues).toContain('Lipsește slugul pentru URL.')
    expect(result).not.toHaveProperty('ranking')
    for (const item of Object.values(commercialSEO)) {
      expect(item.title.length).toBeLessThanOrEqual(90)
      expect(item.description.length).toBeLessThanOrEqual(200)
    }
  })
})
