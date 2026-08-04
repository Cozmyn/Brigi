import { describe, expect, it } from 'vitest'
import { inquirySchema, normalizePhone } from '@/lib/inquiry'

const valid = {
  locale: 'ro', eventDate: '14 septembrie 2027', city: 'București', venue: '',
  eventType: 'wedding', guestCount: 120, packageInterest: '2x45', name: 'Ana Popescu',
  phone: '0722 123 456', preferredContact: 'whatsapp', message: '', privacyAcknowledged: true,
  website: '', idempotencyKey: 'b9b3ddda-c1ca-4f50-b480-b09581845848',
}

describe('inquiry validation', () => {
  it('accepts the required phone-first enquiry without email', () => expect(inquirySchema.safeParse(valid).success).toBe(true))
  it('rejects a missing privacy acknowledgement', () => expect(inquirySchema.safeParse({ ...valid, privacyAcknowledged: false }).success).toBe(false))
  it('normalises Romanian phone numbers', () => expect(normalizePhone('0722 123 456')).toBe('+40722123456'))
})

