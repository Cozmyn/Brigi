import { describe, expect, it } from 'vitest'
import { inquirySchema, normalizePhone, withConsentOnlyAttribution } from '@/lib/inquiry'
const valid = {
  locale: 'ro', eventDate: '2099-09-14', city: 'București', county: 'Ilfov',
  eventType: 'wedding', guestCount: 120, packageInterest: '2x45',
  name: 'Ana Popescu', phone: '0722 123 456', email: 'ana@example.com',
  preferredContact: 'phone', privacyAcknowledged: true,
  idempotencyKey: 'b9b3ddda-c1ca-4f50-b480-b09581845848',
}
describe('booking validation and privacy', () => {
  it('accepts qualified detailed enquiry', () =>
    expect(inquirySchema.safeParse(valid).success).toBe(true))
  it('rejects missing privacy acknowledgement', () =>
    expect(inquirySchema.safeParse({ ...valid, privacyAcknowledged: false }).success).toBe(false))
  it('rejects invalid email, time, exact date or a past date', () => {
    for (const invalid of [
      { email: 'invalid' }, { approximateTime: '29:90' },
      { eventDate: '2099-02-30' }, { eventDate: '2020-01-01' },
    ]) expect(inquirySchema.safeParse({ ...valid, ...invalid }).success).toBe(false)
  })
  it('accepts custom packages and email as preferred contact', () =>
    expect(inquirySchema.safeParse({ ...valid, packageInterest: 'custom', preferredContact: 'email' }).success).toBe(true))
  it('accepts quick email-only inquiry with undecided date and no guest count/county', () => {
    const parsed = inquirySchema.safeParse({
      locale: 'ro', inquiryMode: 'quick', datePrecision: 'unknown', city: 'Iași',
      eventType: 'wedding', name: 'Ana Test', email: 'ana@example.com',
      preferredContact: 'email', privacyAcknowledged: true,
      idempotencyKey: valid.idempotencyKey,
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.phone).toBe('')
      expect(parsed.data.guestCount).toBeUndefined()
    }
  })
  it('accepts a month without exact date but not invalid/past months', () => {
    const basic = { ...valid, datePrecision: 'month', eventDate: '', eventMonth: '2099-09' }
    expect(inquirySchema.safeParse(basic).success).toBe(true)
    expect(inquirySchema.safeParse({ ...basic, eventMonth: '2020-02' }).success).toBe(false)
    expect(inquirySchema.safeParse({ ...basic, eventMonth: '2099-13' }).success).toBe(false)
  })
  it('requires at least one viable contact and matching preference', () => {
    expect(inquirySchema.safeParse({ ...valid, phone: '', email: '' }).success).toBe(false)
    expect(inquirySchema.safeParse({ ...valid, phone: '', preferredContact: 'phone' }).success).toBe(false)
    expect(inquirySchema.safeParse({ ...valid, phone: '', preferredContact: 'email' }).success).toBe(true)
    expect(inquirySchema.safeParse({ ...valid, email: '', preferredContact: 'email' }).success).toBe(false)
  })
  it('does not retain marketing attribution without separate consent', () => {
    const parsed = inquirySchema.parse({
      ...valid, attributionConsent: false, utmSource: 'campaign',
      landingPath: '/en/booking', firstTouchUtmCampaign: 'origin',
      firstTouchLandingPath: '/',
    })
    const cleaned = withConsentOnlyAttribution(parsed)
    expect(cleaned.utmSource).toBeUndefined()
    expect(cleaned.landingPath).toBeUndefined()
    expect(cleaned.firstTouchUtmCampaign).toBeUndefined()
    expect(cleaned.firstTouchLandingPath).toBeUndefined()
    expect(withConsentOnlyAttribution({ ...parsed, attributionConsent: true }).utmSource).toBe('campaign')
  })
  it('rejects injected attribution data', () => {
    expect(inquirySchema.safeParse({ ...valid, utmSource: 'ana@example.com' }).success).toBe(false)
    expect(inquirySchema.safeParse({ ...valid, landingPath: '/admin/inquiries' }).success).toBe(false)
  })
  it('normalises local and international phone numbers', () => {
    expect(normalizePhone('0722 123 456')).toBe('+40722123456')
    expect(normalizePhone('0040 722123456')).toBe('+40722123456')
    expect(normalizePhone('')).toBe('')
  })
})
