import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { captureAttribution, getInquiryAttribution } from '@/lib/attribution'
const consentKey = 'brigitta:analytics-consent'
const firstKey = 'brigitta:attribution:first'
const lastKey = 'brigitta:attribution:last'
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})
afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})
describe('consent-gated first and last touch', () => {
  it('stores no attribution before consent and never requires statistics for an inquiry', () => {
    window.history.replaceState({}, '', '/rezervare?utm_source=google')
    captureAttribution()
    expect(sessionStorage.getItem(firstKey)).toBeNull()
    expect(sessionStorage.getItem(lastKey)).toBeNull()
    expect(getInquiryAttribution()).toEqual({ attributionConsent: false })
  })
  it('preserves first touch, updates qualified last touch, and purges when revoked', () => {
    localStorage.setItem(consentKey, 'yes')
    window.history.replaceState({}, '', '/nunti-si-ceremonii?utm_source=search')
    captureAttribution()
    window.history.replaceState({}, '', '/rezervare')
    captureAttribution()
    const first = JSON.parse(sessionStorage.getItem(firstKey) || '{}')
    const last = JSON.parse(sessionStorage.getItem(lastKey) || '{}')
    expect(first.landingPath).toBe('/nunti-si-ceremonii')
    expect(first.utmSource).toBe('search')
    expect(last.utmSource).toBe('search')
    window.history.replaceState({}, '', '/rezervare?utm_source=new_campaign')
    captureAttribution()
    const result = getInquiryAttribution()
    expect(result).toMatchObject({
      attributionConsent: true,
      firstTouchLandingPath: '/nunti-si-ceremonii',
      firstTouchUtmSource: 'search',
      landingPath: '/rezervare', utmSource: 'new_campaign',
    })
    localStorage.setItem(consentKey, 'no')
    captureAttribution()
    expect(sessionStorage.getItem(firstKey)).toBeNull()
    expect(sessionStorage.getItem(lastKey)).toBeNull()
  })
  it('honors a disabled analytics feature and does not capture private paths', () => {
    localStorage.setItem(consentKey, 'yes')
    window.history.replaceState({}, '', '/api/dashboard?utm_source=secret')
    captureAttribution()
    expect(sessionStorage.getItem(firstKey)).toBeNull()
    expect(getInquiryAttribution(false)).toEqual({ attributionConsent: false })
  })
})
