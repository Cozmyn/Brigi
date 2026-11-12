import { describe, expect, it } from 'vitest'
import {
  normalizedInternalURL, isSelfCanonical, verifiedLanguagePair, verifiedStaticPair,
  verifiedHubPair, type LocalizedDocument,
} from '@/lib/hreflang'
import { siteURL } from '@/lib/site'

const ro: LocalizedDocument = { id: 7, locale: 'ro', path: '/ghiduri/organizare-nunta' }
const en: LocalizedDocument = { id: 7, locale: 'en', path: '/en/ghiduri/wedding-planning' }
const languages = {
  'ro-RO': new URL(ro.path, siteURL).href,
  'en-GB': new URL(en.path, siteURL).href,
}

describe('strict canonical normalization', () => {
  it('accepts a same-origin absolute canonical and an equivalent relative canonical', () => {
    expect(normalizedInternalURL(ro.path, ro.path)).toBe(languages['ro-RO'])
    expect(normalizedInternalURL(ro.path, languages['ro-RO'])).toBe(languages['ro-RO'])
    expect(isSelfCanonical(ro.path, { canonical: languages['ro-RO'] })).toBe(true)
  })
  it('rejects external origins, fragments, queries, invalid URLs and mismatched canonical', () => {
    for (const canonical of [
      'https://other.test/ghiduri/organizare-nunta',
      'https://other.test/ghiduri/organizare-nunta?utm_source=bad',
      '/ghiduri/organizare-nunta?email=private',
      '/ghiduri/organizare-nunta#private', '/ghiduri/alta',
      'javascript:alert(1)', '//other.test/phishing',
    ]) expect(isSelfCanonical(ro.path, { canonical })).toBe(false)
    expect(isSelfCanonical(ro.path, { noindex: true })).toBe(false)
  })
})
describe('hreflang only for actual approved bilingual publication', () => {
  it('connects published same-ID RO/EN counterparts with different slugs', () => {
    expect(verifiedLanguagePair(ro, en, true)).toEqual(languages)
    expect(verifiedLanguagePair(en, ro, true)).toEqual(languages)
  })
  it('omits absent, unpublished, nonindexable, mismatched or unapproved counterparts', () => {
    expect(verifiedLanguagePair(ro, null, true)).toBeUndefined()
    expect(verifiedLanguagePair(ro, { ...en, id: 9 }, true)).toBeUndefined()
    expect(verifiedLanguagePair(ro, { ...en, seo: { noindex: true } }, true)).toBeUndefined()
    expect(verifiedLanguagePair(ro, { ...en, seo: { canonical: '/ghiduri/not-english' } }, true)).toBeUndefined()
    expect(verifiedLanguagePair(ro, en, false)).toBeUndefined()
  })
  it('requires both hub collections to contain the same approved document ID', () => {
    const hubs = { 'ro-RO': new URL('/ghiduri', siteURL).href,
      'en-GB': new URL('/en/ghiduri', siteURL).href }
    expect(verifiedHubPair([ro], [en], '/ghiduri', '/en/ghiduri', true)).toEqual(hubs)
    expect(verifiedHubPair([ro], [{ ...en, id: 100 }], '/ghiduri', '/en/ghiduri', true)).toBeUndefined()
    expect(verifiedHubPair([ro], [], '/ghiduri', '/en/ghiduri', true)).toBeUndefined()
  })
  it('exposes static translations only when both are self-canonical and indexable', () => {
    expect(verifiedStaticPair('/', '/en', undefined, undefined, true)).toEqual({
      'ro-RO': new URL('/', siteURL).href, 'en-GB': new URL('/en', siteURL).href,
    })
    expect(verifiedStaticPair('/', '/en', { noindex: true }, undefined, true)).toBeUndefined()
    expect(verifiedStaticPair('/', '/en', undefined, { canonical: '/other' }, true)).toBeUndefined()
  })
})
