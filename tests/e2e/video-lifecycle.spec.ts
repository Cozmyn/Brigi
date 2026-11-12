import { expect, test } from '@playwright/test'
import { getDB, closeDB } from '../../src/cms/db'
import { hashPassword } from '../../src/cms/auth'

test('real CMS media approval controls /video, no autoplay, and structured VideoObject', async ({ page, request }) => {
  const password = crypto.randomUUID() + 'A1!'
  const username = 'qa-video-' + crypto.randomUUID().slice(0, 8)
  const slug = 'qa-video-' + crypto.randomUUID().slice(0, 12)
  const headers = { Origin: process.env.SITE_URL || 'http://127.0.0.1:3000', 'x-brigi-admin': '1' }
  let videoID: number | null = null
  let posterID: number | null = null

  await getDB()('cms_users').insert({
    username, password_hash: await hashPassword(password),
    display_name: 'QA Video Editor', role: 'owner', active: true,
  })
  try {
    const login = await request.post('/api/auth/login', { headers, data: { username, password } })
    expect(login.status()).toBeLessThan(300)

    const sharp = (await import('sharp')).default
    const buffer = await sharp({
      create: { width: 320, height: 180, channels: 3, background: '#143e42' },
    }).png().toBuffer()
    const upload = await request.post('/api/media/upload', {
      headers,
      multipart: {
        alt: 'Poster de test creat doar pentru QA',
        file: { name: 'qa-test-poster.png', mimeType: 'image/png', buffer },
      },
    })
    expect(upload.status(), await upload.text()).toBe(201)
    const poster = (await upload.json()).doc
    posterID = poster.id
    const posterApproval = await request.patch('/api/media/' + poster.id, {
      headers, data: {
        rightsNotes: 'Fixture QA cu permisiunea editorului de test; nu se publică pe site real.',
        approvedForPublication: true,
      },
    })
    expect(posterApproval.ok(), await posterApproval.text()).toBe(true)

    const video = await request.post('/api/videos?locale=ro', {
      headers, data: {
        title: 'Înregistrare test QA (nu material artistic real)',
        slug,
        description: 'Acest conținut este un fixture exclusiv pentru testarea publicării și a interacțiunii video.',
        url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        eventType: 'wedding', kind: 'full',
        recordingContext: 'studio',
        publishedAt: '2020-01-01T12:00:00Z',
        durationSeconds: 180,
        poster: poster.id,
        rightsConfirmed: false, visible: false, approvedForPublication: false,
      },
    })
    expect(video.status(), await video.text()).toBe(201)
    const doc = (await video.json()).doc
    videoID = doc.id

    const hidden = await request.get('/video/' + slug)
    expect(hidden.status()).toBe(404)
    const approval = await request.patch('/api/videos/' + doc.id + '?locale=ro', {
      headers,
      data: { rightsConfirmed: true, visible: true, approvedForPublication: true },
    })
    expect(approval.ok(), await approval.text()).toBe(true)

    const remote: string[] = []
    page.on('request', req => {
      if (req.url().includes('youtube-nocookie.com/embed/')) remote.push(req.url())
    })
    await page.route('https://www.youtube-nocookie.com/**', async route => {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><body>QA</body></html>' })
    })
    const response = await page.goto('/video/' + slug)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Înregistrare test QA (nu material artistic real)')
    await expect(page.getByText('Înregistrare de studio')).toBeVisible()
    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(0)
    expect(remote).toEqual([])
    const scripts = page.locator('script[type="application/ld+json"]')
    const graph = JSON.parse((await scripts.last().textContent()) || '{}')
    expect(graph['@graph'].some((item: { '@type': string }) => item['@type'] === 'VideoObject')).toBe(true)
    expect(JSON.stringify(graph)).not.toContain('LiveStream')
    await page.getByRole('button', { name: /Redă înregistrarea/ }).click()
    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(1)
    await expect.poll(() => remote.length).toBeGreaterThanOrEqual(1)
    await page.getByRole('button', { name: 'Închide playerul' }).click()
    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(0)

    const withdrawal = await request.patch('/api/videos/' + doc.id + '?locale=ro', {
      headers, data: { approvedForPublication: false },
    })
    expect(withdrawal.ok(), await withdrawal.text()).toBe(true)
    expect((await request.get('/video/' + slug)).status()).toBe(404)
  } finally {
    if (videoID) await request.delete('/api/videos/' + videoID, { headers }).catch(() => {})
    if (posterID) await request.delete('/api/media/' + posterID, { headers }).catch(() => {})
    await getDB()('cms_users').where({ username }).delete()
    await closeDB()
  }
})
