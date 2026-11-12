import { getDB } from '@/cms/db'
import { getCMS } from '@/lib/cms'
import { isOwnerOrEditor } from '@/access/roles'
import { analyticsDay } from '@/lib/analytics'
import { getPublicVideos } from '@/lib/public-videos'
import { getSiteContent } from '@/lib/cms'
export async function GET(request: Request) {
  const cms = await getCMS()
  if (!cms) return Response.json({ error: 'Unavailable' }, { status: 503 })
  const { user } = await cms.auth({ headers: request.headers })
  if (!isOwnerOrEditor({ req: { user } }))
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const today = analyticsDay()
  const week = analyticsDay(new Date(Date.now() - 6 * 86400000))
  const month = analyticsDay(new Date(Date.now() - 29 * 86400000))
  const result = await getDB()('analytics_daily').where('day', '>=', month).select('day', 'event', 'path', 'referrer', 'campaign', 'count')
  const rows = result.map(row => ({ ...row, count: Number(row.count) })) as {
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
  const [settings, videos, videoCount, site] = await Promise.all([
    cms.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    getPublicVideos('ro'),
    cms.count({ collection: 'videos', overrideAccess: true }),
    getSiteContent('ro'),
  ])
  const mediaReadiness = {
    verifiedVideoCount: videos.length,
    pendingVideoReview: Math.max(0, videoCount.totalDocs - videos.length),
    heroPhotoApproved: Boolean(site.photos.hero.src),
    approvedOfferCount: site.packages.length,
    credentialSourceCount: site.verifiedCredentials.length,
  }
  const canReadLeads =
    user?.role === 'owner' ||
    Boolean(user && 'canAccessInquiries' in user && user.canAccessInquiries)
  const queue = canReadLeads
    ? await getDB()('inquiry_outbox').groupBy('status').select('status').count('* as count')
    : []
  const notifications = { pending: 0, processing: 0, failed: 0, delivered: 0 }
  for (const row of queue) {
    const status = String(row.status) as keyof typeof notifications
    if (status in notifications) notifications[status] = Number(row.count)
  }
  const inquiries = canReadLeads
    ? await cms.find({
        collection: 'inquiries',
        user,
        overrideAccess: false,
        limit: 5,
        sort: '-createdAt',
        select: { name: true, city: true, eventDate: true, eventMonth: true, status: true, createdAt: true },
      })
    : null
  return Response.json(
    {
      enabled: Boolean(settings.analyticsEnabled),
      mediaReadiness,
      visits: { today: sum('visit', today), week: sum('visit', week), month: sum('visit') },
      views: sum('page_view'),
      conversions: {
        calls: sum('click_phone'),
        whatsapp: sum('click_whatsapp'),
        cta: sum('click_contact_cta'),
        starts: sum('contact_form_started'),
        completed: sum('contact_form_submitted'),
        packages: sum('package_selected'),
        plannerExports: sum('planner_exported'),
        comparisons: sum('format_compared'),
        budgetChecks: sum('budget_calculated'),
      },
      pages: rank('path'),
      referrers: rank('referrer'),
      campaigns: rank('campaign'),
      recent: inquiries?.docs || [],
      ...(canReadLeads ? { notifications } : {}),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
