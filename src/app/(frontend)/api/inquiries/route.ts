import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { inquirySchema, normalizePhone } from '@/lib/inquiry'

const attempts = new Map<string, number[]>()
const HOUR = 60 * 60 * 1000

function getIP(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(request: Request) {
  const siteURL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).origin !== new URL(siteURL).origin) return Response.json({ error: 'Invalid request.' }, { status: 403 })

  const ip = getIP(request); const now = Date.now(); const limit = Number(process.env.INQUIRY_RATE_LIMIT_PER_HOUR || 5)
  const recent = (attempts.get(ip) || []).filter((time) => now - time < HOUR)
  if (recent.length >= limit) return Response.json({ error: 'Too many requests.' }, { status: 429 })
  attempts.set(ip, [...recent, now])

  let body: unknown
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }) }
  const parsed = inquirySchema.safeParse(body)
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] || 'form'), 'Invalid value.']))
    return Response.json({ error: 'Invalid request.', fields }, { status: 422 })
  }
  if (parsed.data.website) return Response.json({ ok: true })
  if (request.headers.get('x-idempotency-key') !== parsed.data.idempotencyKey) return Response.json({ error: 'Invalid request.' }, { status: 400 })

  try {
    const payload = await getPayload({ config: configPromise })
    const existing = await payload.find({ collection: 'inquiries', where: { idempotencyKey: { equals: parsed.data.idempotencyKey } }, limit: 1, overrideAccess: true })
    if (existing.totalDocs > 0) return Response.json({ ok: true }, { status: 200 })
    const { website: _honeypot, ...data } = parsed.data
    // Payload's generated create overload expects hook-populated fields even though beforeChange supplies them.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'inquiries', data: { ...data, phone: normalizePhone(data.phone) }, overrideAccess: true } as any)
    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ error: 'The enquiry could not be saved.' }, { status: 500 })
  }
}
