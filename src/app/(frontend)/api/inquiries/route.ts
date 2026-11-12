import { createHash } from 'node:crypto'
import { contentStore } from '@/cms/store'
import { handleAdminAPI } from '@/cms/api'
import { inquirySchema, normalizePhone, withConsentOnlyAttribution } from '@/lib/inquiry'
import { rateLimit } from '@/cms/auth'
import { readBody } from '@/cms/http'
const HOUR = 60 * 60 * 1000

function getIP(request: Request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export async function POST(request: Request) {
  const siteURL =
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const origin = request.headers.get('origin')
  try {
    if (origin && new URL(origin).origin !== new URL(siteURL).origin)
      return Response.json({ error: 'Invalid request.' }, { status: 403 })
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 403 })
  }

  const ip = getIP(request)
  const limit = Number(process.env.INQUIRY_RATE_LIMIT_PER_HOUR || 5)
  try {
    if (!(await rateLimit('inquiry:' + ip, limit, HOUR)))
      return Response.json({ error: 'Too many requests.' }, { status: 429 })
  } catch {
    return Response.json({ error: 'Service temporarily unavailable.' }, { status: 503 })
  }
  if (Number(request.headers.get('content-length') || 0) > 16384)
    return Response.json({ error: 'Request too large.' }, { status: 413 })
  let body: unknown
  try {
    body = JSON.parse((await readBody(request, 16384)).toString())
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (body && typeof body === 'object' && 'website' in body && body.website)
    return Response.json({ ok: true })
  const parsed = inquirySchema.safeParse(body)
  if (!parsed.success) {
    const fields = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0] || 'form'), issue.message]),
    )
    return Response.json({ error: 'Invalid request.', fields }, { status: 422 })
  }
  if (request.headers.get('x-idempotency-key') !== parsed.data.idempotencyKey)
    return Response.json({ error: 'Invalid request.' }, { status: 400 })

  // Server-side feature flag wins over a stale or forged consent signal.
  let analyticsEnabled = false
  if (parsed.data.attributionConsent) {
    try {
      analyticsEnabled = (await contentStore.findGlobal({ slug: 'site-settings' })).analyticsEnabled === true
    } catch { /* A broken analytics setting must never block a real lead. */ }
  }
  const { website: _honeypot, ...submitted } = withConsentOnlyAttribution({
    ...parsed.data, attributionConsent: analyticsEnabled && parsed.data.attributionConsent,
  })
  const data = {
    ...submitted,
    phone: normalizePhone(submitted.phone),
    eventDate: submitted.datePrecision === 'exact' ? submitted.eventDate : '',
    eventMonth: submitted.datePrecision === 'month' ? submitted.eventMonth : '',
  }
  // Reusing an idempotency key with different data cannot silently discard a new enquiry.
  const fingerprint = createHash('sha256').update(JSON.stringify(data)).digest('hex')
  const findExisting = async () => {
    const existing = await contentStore.find({
      collection: 'inquiries',
      where: { idempotencyKey: { equals: parsed.data.idempotencyKey } },
      limit: 1, overrideAccess: true,
    })
    if (!existing.totalDocs) return null
    return existing.docs[0].submissionFingerprint && existing.docs[0].submissionFingerprint !== fingerprint
      ? Response.json({ error: 'Idempotency key already used for a different inquiry.' }, { status: 409 })
      : Response.json({ ok: true }, { status: 200 })
  }
  try {
    const previous = await findExisting()
    if (previous) return previous
    await contentStore.create({
      collection: 'inquiries',
      data: { ...data, status: 'new', submissionFingerprint: fingerprint },
      overrideAccess: true,
    })
    return Response.json({ ok: true }, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      try {
        const previous = await findExisting()
        if (previous) return previous
      } catch { /* Do not claim success if DB verification fails. */ }
    }
    return Response.json({ error: 'The enquiry could not be saved.' }, { status: 500 })
  }
}
export const GET = (request: Request) => handleAdminAPI(request, ['inquiries'])
