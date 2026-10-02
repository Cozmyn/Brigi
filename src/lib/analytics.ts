import { z } from 'zod'
export const analyticsSchema = z.object({
  consent: z.literal(true),
  event: z.enum([
    'visit',
    'page_view',
    'click_phone',
    'click_contact_cta',
    'contact_form_started',
    'contact_form_submitted',
    'package_selected',
    'media_played',
  ]),
  path: z
    .string()
    .max(150)
    .regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/)
    .refine((x) => !['/admin', '/api', '/next'].includes(x)),
  referrer: z
    .string()
    .max(100)
    .regex(/^[a-z0-9.-]*$/)
    .default(''),
  campaign: z
    .string()
    .max(80)
    .regex(/^[a-zA-Z0-9_-]*$/)
    .default(''),
})
export const analyticsDay = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
