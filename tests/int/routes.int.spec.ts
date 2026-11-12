import { describe, expect, it } from 'vitest'
import { siteContent } from '@/lib/site'
import { structuredData } from '@/lib/seo'
describe('artist entities and offers', () => {
  it('uses configured minimum prices and a consistent provider', () => {
    const graph = structuredData()['@graph']
    const person = graph.find((item) => item['@type'] === 'Person')!
    const service = graph.find((item) => item['@type'] === 'Service')!
    expect(service.provider).toEqual({ '@id': person['@id'] })
    expect(JSON.stringify(service)).toContain('"minPrice":450')
    expect(siteContent.packages.map((p) => p.priceFrom)).toEqual([450, 750, 1050])
  })
  it('does not output unconfigured sameAs or fabricated reviews', () => {
    const json = JSON.stringify(structuredData())
    expect(json).not.toContain('sameAs')
    expect(json).not.toContain('AggregateRating')
  })
  it('uses page-type schema without claiming a service on legal/editorial pages', () => {
    const legal = structuredData('/confidentialitate', 'Confidențialitate', false, siteContent, false, false)['@graph']
    expect(legal.some((item) => item['@type'] === 'Service')).toBe(false)
    expect(legal.some((item) => item['@type'] === 'WebPage')).toBe(true)
    expect(legal.some((item) => item['@type'] === 'BreadcrumbList')).toBe(true)
    const service = structuredData('/nunti-si-ceremonii', 'Nuntă', false, siteContent, true, true)['@graph']
    expect(service.some((item) => item['@type'] === 'Service')).toBe(true)
  })
  it('keeps FAQ structured data aligned with visible answers', () => {
    const faq = structuredData('/', 'Brigitta', true)['@graph'].find(
      (item) => item['@type'] === 'FAQPage',
    )!
    expect(JSON.stringify(faq)).toContain(siteContent.faqs[0].answer)
  })
})
