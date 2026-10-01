import { sql } from '@payloadcms/db-postgres'
import { getCMS } from '@/lib/cms'
import { isOwnerOrEditor } from '@/access/roles'
import { analyticsDay } from '@/lib/analytics'
export async function GET(request: Request) {
  const cms = await getCMS()
  if (!cms) return Response.json({ error: 'Unavailable' }, { status: 503 })
  const { user } = await cms.auth({ headers: request.headers })
  if (!isOwnerOrEditor({ req: { user } }))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const today = analyticsDay()
  const week = analyticsDay(new Date(Date.now() - 6 * 86400000))
  const month = analyticsDay(new Date(Date.now() - 29 * 86400000))
  const result = await cms.db.drizzle.execute(
    sql`SELECT "day", "event", "path", "referrer", "campaign", SUM("count")::int as "count" FROM "analytics_daily" WHERE "day" >= ${month} GROUP BY "day", "event", "path", "referrer", "campaign"`,
  )
  const rows = result.rows as {
    day: string
    event: string
    path: string
    referrer: string
    campaign: string
    count: number
  }[]
  const sum = (event: string, since = month) =>
    rows.filter((x) => x.event === event && x.day >= since).reduce((n, x) => n + x.count, 0)
  const rank = (field: 'path' | 'referrer' | 'campaign') => {
    const totals = new Map<string, number>()
    for (const row of rows.filter((x) => x.event === (field === 'path' ? 'page_view' : 'visit'))) {
      const name = row[field] || (field === 'referrer' ? 'Direct / necunoscut' : 'Fără campanie')
      totals.set(name, (totals.get(name) || 0) + row.count)
    }
    return Array.from(totals, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
  const settings = await cms.findGlobal({ slug: 'site-settings', overrideAccess: false })
  const canReadLeads =
    user?.role === 'owner' ||
    Boolean(user && 'canAccessInquiries' in user && user.canAccessInquiries)
  const inquiries = canReadLeads
    ? await cms.find({
        collection: 'inquiries',
        user,
        overrideAccess: false,
        limit: 5,
        sort: '-createdAt',
        select: { name: true, city: true, eventDate: true, status: true, createdAt: true },
      })
    : null
  return Response.json(
    {
      enabled: Boolean(settings.analyticsEnabled),
      visits: { today: sum('visit', today), week: sum('visit', week), month: sum('visit') },
      views: sum('page_view'),
      conversions: {
        calls: sum('click_phone'),
        cta: sum('click_contact_cta'),
        starts: sum('contact_form_started'),
        completed: sum('contact_form_submitted'),
        packages: sum('package_selected'),
      },
      pages: rank('path'),
      referrers: rank('referrer'),
      campaigns: rank('campaign'),
      recent: inquiries?.docs || [],
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
