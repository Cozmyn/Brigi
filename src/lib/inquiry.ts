import { z } from 'zod'
import { isPublicAnalyticsPath } from './analytics'

const required = 'Completează acest câmp.'
const bucharestToday = () => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Alege o dată validă.')
  .refine((value) => {
    const date = new Date(value + 'T12:00:00Z')
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'Alege o dată validă.')
  .refine((value) => value >= bucharestToday(), 'Alege o dată din prezent sau viitor.')
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Alege o lună validă.')
  .refine((value) => value >= bucharestToday().slice(0, 7), 'Alege o lună din prezent sau viitor.')
const phoneSchema = z.string().trim().max(24)
  .refine((value) => !value || /^\+?[0-9][0-9\s().-]{7,20}$/.test(value), 'Introdu un număr de telefon valid.')
  .default('')
const emailSchema = z.string().trim().max(254)
  .refine((value) => !value || z.string().email().safeParse(value).success, 'Introdu o adresă de email validă.')
  .default('')
const pathSchema = z.string().max(150)
  .refine(isPublicAnalyticsPath, 'Adresă publică invalidă.').optional()
const campaignSchema = (max = 120) => z.string().max(max).regex(/^[a-zA-Z0-9._-]*$/).optional()
const domainSchema = z.string().max(100).regex(/^[a-zA-Z0-9.-]*$/).optional()

export const inquirySchema = z.object({
  locale: z.enum(['ro', 'en']),
  inquiryMode: z.enum(['quick', 'detailed']).default('detailed'),
  datePrecision: z.enum(['exact', 'month', 'unknown']).default('exact'),
  eventDate: z.string().trim().default(''),
  eventMonth: z.string().trim().default(''),
  approximateTime: z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Alege o oră validă.').optional().default(''),
  city: z.string().trim().min(2, required).max(120),
  county: z.string().trim().max(120).optional().default(''),
  venue: z.string().trim().max(160).optional().default(''),
  eventType: z.enum(['wedding', 'ceremony', 'corporate', 'anniversary', 'cocktail', 'public', 'other'], {
    errorMap: () => ({ message: 'Alege tipul evenimentului.' }),
  }),
  guestCount: z.preprocess((value) => value === '' || value === null ? undefined : value,
    z.coerce.number().int('Introdu un număr întreg.').min(1).max(100000).optional()),
  packageInterest: z.enum(['1x45', '2x45', '3x45', 'unsure', 'custom']).default('unsure'),
  name: z.string().trim().min(2, required).max(120),
  phone: phoneSchema,
  email: emailSchema,
  preferredContact: z.enum(['phone', 'whatsapp', 'email']).default('phone'),
  selectedPackageName: z.string().max(180).optional(),
  musicPreferences: z.string().trim().max(1000).optional().default(''),
  approximateBudget: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
  privacyAcknowledged: z.literal(true, {
    errorMap: () => ({ message: 'Confirmă că ai citit informarea privind datele.' }),
  }),
  website: z.string().max(0).optional().default(''),
  idempotencyKey: z.string().uuid(),
  attributionConsent: z.boolean().default(false),
  // Stored only with explicit attribution consent; see withConsentOnlyAttribution.
  utmSource: campaignSchema(), utmMedium: campaignSchema(),
  utmCampaign: campaignSchema(160), utmContent: campaignSchema(160),
  utmTerm: campaignSchema(160), referrer: domainSchema, landingPath: pathSchema,
  firstTouchUtmSource: campaignSchema(), firstTouchUtmMedium: campaignSchema(),
  firstTouchUtmCampaign: campaignSchema(160),
  firstTouchReferrer: domainSchema, firstTouchLandingPath: pathSchema,
}).superRefine((data, ctx) => {
  const invalid = (path: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })
  if (data.datePrecision === 'exact') {
    const result = dateSchema.safeParse(data.eventDate)
    if (!result.success) invalid('eventDate', result.error.issues[0]?.message || 'Alege data.')
  } else if (data.datePrecision === 'month') {
    const result = monthSchema.safeParse(data.eventMonth)
    if (!result.success) invalid('eventMonth', result.error.issues[0]?.message || 'Alege luna.')
  }
  if (!data.phone && !data.email) invalid('phone', 'Completează telefonul sau emailul.')
  if (data.preferredContact === 'email' && !data.email)
    invalid('email', 'Adaugă un email pentru acest mod de contact.')
  if (data.preferredContact !== 'email' && !data.phone)
    invalid('phone', 'Adaugă un telefon sau alege contactul prin email.')
})
export type InquiryInput = z.infer<typeof inquirySchema>
const attributionFields = [
  'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm',
  'referrer', 'landingPath', 'firstTouchUtmSource', 'firstTouchUtmMedium',
  'firstTouchUtmCampaign', 'firstTouchReferrer', 'firstTouchLandingPath',
] as const
/** Defense in depth: no marketing attribution without explicit consent. */
export function withConsentOnlyAttribution(data: InquiryInput): InquiryInput {
  if (data.attributionConsent) return data
  const cleaned: InquiryInput = { ...data }
  for (const key of attributionFields) delete cleaned[key]
  return cleaned
}
export function normalizePhone(value: string) {
  const compact = value.replace(/[^+\d]/g, '')
  if (!compact) return ''
  if (compact.startsWith('00')) return '+' + compact.slice(2)
  if (compact.startsWith('0') && compact.length === 10) return '+40' + compact.slice(1)
  return compact
}
