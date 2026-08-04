import { z } from 'zod'

const phonePattern = /^\+?[0-9][0-9\s().-]{7,20}$/

export const inquirySchema = z.object({
  locale: z.enum(['ro', 'en']),
  eventDate: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(120),
  venue: z.string().trim().max(160).optional().default(''),
  eventType: z.enum(['wedding', 'ceremony', 'corporate', 'anniversary', 'cocktail', 'public', 'other']),
  guestCount: z.coerce.number().int().min(1).max(100000),
  packageInterest: z.enum(['1x45', '2x45', '3x45', 'unsure']),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(phonePattern).max(24),
  preferredContact: z.enum(['phone', 'whatsapp']),
  message: z.string().trim().max(2000).optional().default(''),
  privacyAcknowledged: z.literal(true),
  website: z.string().max(0).optional().default(''),
  idempotencyKey: z.string().uuid(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(160).optional(),
  utmContent: z.string().max(160).optional(),
  utmTerm: z.string().max(160).optional(),
  referrer: z.string().max(500).optional(),
  landingPath: z.string().max(500).optional(),
})

export type InquiryInput = z.infer<typeof inquirySchema>

export function normalizePhone(value: string) {
  const compact = value.replace(/[^+\d]/g, '')
  if (compact.startsWith('00')) return `+${compact.slice(2)}`
  if (compact.startsWith('0') && compact.length === 10) return `+40${compact.slice(1)}`
  return compact
}

