import { randomUUID } from 'node:crypto'
import { getDB } from '@/cms/db'

const MAX_ATTEMPTS = 10
const LEASE_MS = 2 * 60_000

/** Exponential backoff with a 6-hour ceiling. */
export function retryDelayMs(attempt: number) {
  return Math.min(6 * 3_600_000, 60_000 * 2 ** Math.min(attempt, 12))
}
/** The receiver is configured server-side; no personal details are transmitted. */
export function notificationEndpoint() {
  const endpoint = process.env.INQUIRY_NOTIFY_WEBHOOK_URL
  const token = process.env.INQUIRY_NOTIFY_TOKEN
  if (!endpoint || !token) return null
  const url = new URL(endpoint)
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname)
    throw new Error('INQUIRY_NOTIFY_WEBHOOK_URL must be a valid HTTPS endpoint.')
  return { url: url.toString(), token }
}
export async function requeueFailedNotifications() {
  const db = getDB()
  return db('inquiry_outbox').where({ status: 'failed' }).update({
    status: 'pending', attempts: 0, next_attempt_at: new Date(),
    lease_token: null, leased_until: null, last_error: null, updated_at: db.fn.now(),
  })
}
/** Execute via cPanel cron; never on the HTTP request path. */
export async function dispatchInquiryNotifications(limit = 20) {
  const endpoint = notificationEndpoint()
  if (!endpoint) return { enabled: false, delivered: 0, retried: 0, failed: 0 }
  const db = getDB()
  const now = new Date()
  const rows = await db('inquiry_outbox')
    .where(function () {
      this.where(function () {
        this.where('status', 'pending').where('next_attempt_at', '<=', now)
      }).orWhere(function () {
        this.where('status', 'processing').where('leased_until', '<', now)
      })
    })
    .orderBy('id', 'asc').limit(Math.min(Math.max(limit, 1), 100))
    .select('id', 'inquiry_id', 'attempts')
  let delivered = 0, retried = 0, failed = 0
  for (const row of rows) {
    const lease = randomUUID()
    const claimed = await db('inquiry_outbox').where({ id: row.id })
      .where(function () {
        this.where(function () {
          this.where('status', 'pending').where('next_attempt_at', '<=', new Date())
        }).orWhere(function () {
          this.where('status', 'processing').where('leased_until', '<', new Date())
        })
      }).update({
        status: 'processing', lease_token: lease, leased_until: new Date(Date.now() + LEASE_MS),
        attempts: db.raw('attempts + 1'), updated_at: db.fn.now(),
      })
    if (!claimed) continue
    const attempt = Number(row.attempts) + 1
    try {
      const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''
      const adminUrl = /^https:\/\//.test(base)
        ? base.replace(/\/$/, '') + '/admin/collections/inquiries/' + row.inquiry_id : undefined
      const response = await fetch(endpoint.url, {
        method: 'POST', redirect: 'error',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + endpoint.token },
        body: JSON.stringify({ event: 'inquiry.created', inquiryId: Number(row.inquiry_id), adminUrl }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) throw new Error('HTTP ' + response.status)
      await db('inquiry_outbox').where({ id: row.id, lease_token: lease }).update({
        status: 'delivered', delivered_at: db.fn.now(), leased_until: null,
        lease_token: null, last_error: null, updated_at: db.fn.now(),
      })
      delivered++
    } catch (error) {
      const terminal = attempt >= MAX_ATTEMPTS
      const detail = error instanceof Error && /^HTTP \d{3}$/.test(error.message)
        ? error.message : 'Transport failed or timed out'
      await db('inquiry_outbox').where({ id: row.id, lease_token: lease }).update({
        status: terminal ? 'failed' : 'pending',
        next_attempt_at: new Date(Date.now() + retryDelayMs(attempt)),
        last_error: detail, lease_token: null, leased_until: null, updated_at: db.fn.now(),
      })
      if (terminal) failed++
      else retried++
    }
  }
  return { enabled: true, delivered, retried, failed }
}
