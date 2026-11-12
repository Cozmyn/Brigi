import { describe, expect, it } from 'vitest'
import { Pages } from '@/collections/Pages'
import { editorialPages } from '@/lib/editorial'
import { contentPath, isContentNamespace, isContentSlug } from '@/lib/content-paths'
import { validateFields } from '@/cms/validation'

describe('content architecture paths', () => {
  it('keeps every existing editorial URL valid', () => {
    for (const page of editorialPages) {
      expect(isContentSlug(page.slug)).toBe(true)
      expect(contentPath(page.slug)).toBe(`/${page.slug}`)
    }
  })

  it.each([
    'ghiduri/playlist-petrecere', 'formate/dj-si-solista',
    'parteneri/nume-confirmat', 'evenimente-reale/exemplu-aprobat',
  ])('accepts namespaced slug %s through CMS validation', (slug) => {
    expect(isContentSlug(slug)).toBe(true)
    expect(contentPath(slug)).toBe(`/${slug}`)
    const field = Pages.fields.find((item) => item.name === 'slug')!
    expect(validateFields([field], { slug })).toEqual({ slug })
  })

  it.each([
    '', '/ghiduri/test', 'ghiduri/test/', 'ghiduri', 'formate',
    'parteneri', 'evenimente-reale', 'necunoscut/test',
    'ghiduri/categorie/test', 'admin', 'api', 'next', 'en',
    'rezervare', 'contact', 'solista-nunta',
    'ghiduri/admin', 'ghiduri/api', 'ghiduri/en',
    'ghiduri/../test', 'ghiduri/%61dmin', 'ghiduri/Test',
    'ghiduri/test?email=person@example.com', 'ghiduri/test#contact',
    '//external.test', 'https://external.test', 'ghiduri//test',
    'a'.repeat(141),
  ])('rejects unsupported slug %s', (slug) => {
    expect(isContentSlug(slug)).toBe(false)
    expect(() => contentPath(slug)).toThrow('Invalid public content slug.')
    const field = Pages.fields.find((item) => item.name === 'slug')!
    expect(() => validateFields([field], { slug })).toThrow()
  })

  it('does not accept inherited object properties as namespaces', () => {
    expect(isContentNamespace('toString')).toBe(false)
    expect(isContentNamespace('__proto__')).toBe(false)
    expect(isContentNamespace('ghiduri')).toBe(true)
  })
})
