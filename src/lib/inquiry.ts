import { z } from 'zod'
const required = 'Completează acest câmp.'
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Alege o dată validă.')
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'Alege o dată validă.')
  .refine(
    (value) =>
      value >=
      new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Bucharest',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()),
    'Alege o dată din prezent sau viitor.',
  )
export const inquirySchema = z.object({
  locale: z.enum(['ro', 'en']),
  eventDate: dateSchema,
  approximateTime: z
    .string()
    .regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Alege o oră validă.')
    .optional()
    .default(''),
  city: z.string().trim().min(2, required).max(120),
  county: z.string().trim().min(2, required).max(120),
  venue: z.string().trim().max(160).optional().default(''),
  eventType: z.enum(
    ['wedding', 'ceremony', 'corporate', 'anniversary', 'cocktail', 'public', 'other'],
    { errorMap: () => ({ message: 'Alege tipul evenimentului.' }) },
  ),
  guestCount: z.coerce
    .number()
    .int('Introdu un număr întreg.')
    .min(1, 'Introdu cel puțin un invitat.')
    .max(100000),
  packageInterest: z.enum(['1x45', '2x45', '3x45', 'unsure', 'custom']),
  name: z.string().trim().min(2, required).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s().-]{7,20}$/, 'Introdu un număr de telefon valid.')
    .max(24),
  email: z.string().trim().email('Introdu o adresă de email validă.').max(254),
  preferredContact: z.enum(['phone', 'whatsapp', 'email']),
  musicPreferences: z.string().trim().max(1000).optional().default(''),
  approximateBudget: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
  privacyAcknowledged: z.literal(true, {
    errorMap: () => ({ message: 'Confirmă că ai citit informarea privind datele.' }),
  }),
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
