import { describe, expect, it } from 'vitest'
import { inquirySchema, normalizePhone } from '@/lib/inquiry'
const valid = {
  locale: 'ro',
  eventDate: '2099-09-14',
  city: 'București',
  county: 'Ilfov',
  eventType: 'wedding',
  guestCount: 120,
  packageInterest: '2x45',
  name: 'Ana Popescu',
  phone: '0722 123 456',
  email: 'ana@example.com',
  preferredContact: 'phone',
  privacyAcknowledged: true,
  idempotencyKey: 'b9b3ddda-c1ca-4f50-b480-b09581845848',
}
describe('booking validation', () => {
  it('accepts a qualified enquiry', () => expect(inquirySchema.safeParse(valid).success).toBe(true))
  it('rejects missing privacy consent', () =>
    expect(inquirySchema.safeParse({ ...valid, privacyAcknowledged: false }).success).toBe(false))
  it('rejects invalid email, time, dates and a past date', () => {
    for (const invalid of [
      { email: 'invalid' },
      { approximateTime: '29:90' },
      { eventDate: '2099-02-30' },
      { eventDate: '2020-01-01' },
    ])
      expect(inquirySchema.safeParse({ ...valid, ...invalid }).success).toBe(false)
  })
  it('accepts custom packages and email contact', () =>
    expect(
      inquirySchema.safeParse({ ...valid, packageInterest: 'custom', preferredContact: 'email' })
        .success,
    ).toBe(true))
  it('normalises local and international phone numbers', () => {
    expect(normalizePhone('0722 123 456')).toBe('+40722123456')
    expect(normalizePhone('0040 722123456')).toBe('+40722123456')
  })
})
