import { createHash } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { getCMS } from '@/lib/cms'
import { siteURL } from '@/lib/site'
import { analyticsDay, analyticsSchema } from '@/lib/analytics'
const limits = new Map<string, { until: number; count: number }>()
let cleanedDay = ''
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(siteURL).origin)
    return new Response(null, { status: 403 })
  if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1')
    return new Response(null, { status: 204 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const now = Date.now()
  for (const [key, value] of limits) if (value.until < now) limits.delete(key)
  if (limits.size > 5000) return new Response(null, { status: 429 })
  const limit = limits.get(ip) || { until: now + 60000, count: 0 }
  limits.set(ip, { ...limit, count: limit.count + 1 })
  if (limit.count >= 60) return new Response(null, { status: 429 })
  if (Number(request.headers.get('content-length') || 0) > 1024)
    return new Response(null, { status: 413 })
  let body: unknown
  try {
    const reader = request.body?.getReader()
    if (!reader) return new Response(null, { status: 400 })
    let raw = ''
    let size = 0
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 1024) {
        await reader.cancel()
        return new Response(null, { status: 413 })
      }
      raw += decoder.decode(value, { stream: true })
    }
    body = JSON.parse(raw + decoder.decode())
  } catch {
    return new Response(null, { status: 400 })
  }
  const parsed = analyticsSchema.safeParse(body)
  if (!parsed.success) return new Response(null, { status: 422 })
  try {
    const cms = await getCMS()
    if (!cms) return new Response(null, { status: 204 })
    const settings = await cms.findGlobal({ slug: 'site-settings', overrideAccess: false })
    if (!settings.analyticsEnabled) return new Response(null, { status: 204 })
    const day = analyticsDay()
    const { event, path, referrer, campaign } = parsed.data
    const key = createHash('sha256')
      .update(JSON.stringify([day, event, path, referrer, campaign]))
      .digest('hex')
    await cms.db.drizzle.execute(
      sql`INSERT INTO "analytics_daily" ("key","day","event","path","referrer","campaign","count") VALUES (${key},${day},${event},${path},${referrer},${campaign},1) ON CONFLICT ("key") DO UPDATE SET "count" = "analytics_daily"."count" + 1`,
    )
    if (cleanedDay !== day) {
      await cms.db.drizzle.execute(
        sql`DELETE FROM "analytics_daily" WHERE "day" < ${analyticsDay(new Date(now - 90 * 86400000))}`,
      )
      cleanedDay = day
    }
    return new Response(null, { status: 204 })
  } catch {
    return new Response(null, { status: 503 })
  }
}
