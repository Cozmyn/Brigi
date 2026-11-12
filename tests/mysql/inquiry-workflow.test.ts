import 'dotenv/config'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { contentStore as store } from '../../src/cms/store'
import { getDB, closeDB } from '../../src/cms/db'
import { dispatchInquiryNotifications } from '../../src/lib/inquiry-notifications'

const ids: number[] = []
after(async () => {
  if (ids.length) await getDB()('cms_documents').whereIn('id', ids).delete()
  await closeDB()
})

test('atomic lead/outbox, editable CRM fields and notification retries', async () => {
  const inquiry = await store.create({ collection: 'inquiries', data: {
    locale: 'ro', inquiryMode: 'quick', datePrecision: 'unknown', eventDate: '',
    city: 'Brașov', eventType: 'wedding', packageInterest: 'unsure',
    name: 'QA Notificări', phone: '', email: 'qa@example.com',
    preferredContact: 'email', privacyAcknowledged: true,
    idempotencyKey: randomUUID(), submissionFingerprint: 'a'.repeat(64),
  } })
  ids.push(inquiry.id)
  const db = getDB()
  let job = await db('inquiry_outbox').where({ inquiry_id: inquiry.id }).first()
  assert.equal(job.status, 'pending')
  assert.equal(job.attempts, 0)

  await store.update({ collection: 'inquiries', id: inquiry.id, data: {
    status: 'negotiation', assignedTo: 'coordonator',
    qualification: 'qualified', quoteAmount: 850, currency: 'EUR',
  } })
  const updated = await store.byID('inquiries', inquiry.id)
  assert.equal(updated?.status, 'negotiation')
  assert.equal(updated?.quoteAmount, 850)
  assert.equal((await db('inquiry_outbox').where({ inquiry_id: inquiry.id })).length, 1)

  const originalFetch = globalThis.fetch
  const oldUrl = process.env.INQUIRY_NOTIFY_WEBHOOK_URL
  const oldToken = process.env.INQUIRY_NOTIFY_TOKEN
  let calls = 0
  process.env.INQUIRY_NOTIFY_WEBHOOK_URL = 'https://hooks.example.test/notice'
  process.env.INQUIRY_NOTIFY_TOKEN = 'test-token'
  globalThis.fetch = async (_input, init) => {
    calls++
    const payload = JSON.parse(String(init?.body))
    assert.equal(payload.inquiryId, inquiry.id)
    assert.equal(payload.event, 'inquiry.created')
    assert.equal(payload.email, undefined)
    return new Response(null, { status: calls === 1 ? 503 : 200 })
  }
  try {
    const first = await dispatchInquiryNotifications()
    assert.equal(first.retried, 1)
    job = await db('inquiry_outbox').where({ inquiry_id: inquiry.id }).first()
    assert.equal(job.attempts, 1)
    assert.equal(job.status, 'pending')
    await db('inquiry_outbox').where({ inquiry_id: inquiry.id })
      .update({ next_attempt_at: new Date(Date.now() - 60_000) })
    const second = await dispatchInquiryNotifications()
    assert.equal(second.delivered, 1)
    job = await db('inquiry_outbox').where({ inquiry_id: inquiry.id }).first()
    assert.equal(job.attempts, 2)
    assert.equal(job.status, 'delivered')
    assert.equal(calls, 2)
  } finally {
    globalThis.fetch = originalFetch
    if (oldUrl === undefined) delete process.env.INQUIRY_NOTIFY_WEBHOOK_URL
    else process.env.INQUIRY_NOTIFY_WEBHOOK_URL = oldUrl
    if (oldToken === undefined) delete process.env.INQUIRY_NOTIFY_TOKEN
    else process.env.INQUIRY_NOTIFY_TOKEN = oldToken
  }
})
