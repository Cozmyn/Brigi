import { expect, test, request as apiRequest } from '@playwright/test'

test.describe.configure({ retries: 0 })

test('CMS publication, prices, consent analytics and lead privacy work end to end', async ({
  request,
  page,
}) => {
  const password = crypto.randomUUID() + 'A1!'
  const registered = await request.post('/api/users/first-register', {
    data: { username: 'qa-owner', password, displayName: 'QA Owner' },
  })
  expect(registered.status()).toBeLessThan(300)
  const { token } = await registered.json()
  expect(token).toBeTruthy()
  const headers = { Authorization: `JWT ${token}` }
  const create = await request.post('/api/pages', {
    headers,
    data: {
      title: 'Pagină editorială QA',
      slug: 'verificare-editoriala',
      heroTitle: 'Conținut administrat',
      heroSummary: 'Introducere distinctă pentru verificare.',
      pageType: 'editorial',
      sections: [
        {
          heading: 'Program vocal',
          body: 'Conținut public de verificare pentru un program vocal live.',
        },
      ],
      seo: {
        title: 'Titlu SEO QA',
        description: 'Descriere publicată din administrare.',
        noindex: true,
      },
      visible: true,
      approvedForPublication: true,
      _status: 'draft',
    },
  })
  expect(create.status()).toBe(201)
  const doc = (await create.json()).doc
  expect((await request.get('/verificare-editoriala')).status()).toBe(404)
  const published = await request.patch(`/api/pages/${doc.id}`, {
    headers,
    data: { _status: 'published' },
  })
  expect(published.ok()).toBe(true)
  await page.goto('/verificare-editoriala')
  await expect(page.locator('h1')).toHaveText('Conținut administrat')
  await expect(page).toHaveTitle(/Titlu SEO QA/)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await request.patch(`/api/pages/${doc.id}`, {
    headers,
    data: { slug: 'verificare-editoriala-noua' },
  })
  const old = await request.get('/verificare-editoriala', { maxRedirects: 0 })
  expect(old.status()).toBe(308)
  expect(old.headers().location).toBe('/verificare-editoriala-noua')

  const services = (await (await request.get('/api/services?locale=ro', { headers })).json()).docs
  const essential = services.find((p: { sets: string }) => p.sets === '1x45')
  expect(essential).toBeTruthy()
  await request.patch(`/api/services/${essential.id}?locale=ro`, {
    headers,
    data: { priceFromEUR: 499, _status: 'published' },
  })
  await page.goto('/')
  await expect(page.locator('.package-price').first()).toContainText('499')
  expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain(
    '"minPrice":499',
  )
  await request.patch(`/api/services/${essential.id}?locale=ro`, {
    headers,
    data: { priceFromEUR: 450, _status: 'published' },
  })

  const anonymous = await apiRequest.newContext({
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
  })
  expect((await anonymous.get('/api/inquiries')).status()).toBe(403)
  expect((await anonymous.get('/api/dashboard')).status()).toBe(401)
  await anonymous.dispose()
  expect((await request.get('/api/inquiries', { headers })).status()).toBe(200)
  await request.post('/api/globals/site-settings', { headers, data: { analyticsEnabled: true } })
  const analyticsCalls: string[] = []
  page.on('request', (r) => {
    if (r.url().endsWith('/api/analytics')) analyticsCalls.push(r.url())
  })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Refuz', exact: true })).toBeVisible()
  expect(analyticsCalls).toHaveLength(0)
  await page.getByRole('button', { name: 'Accept statistici', exact: true }).click()
  await expect.poll(() => analyticsCalls.length).toBeGreaterThanOrEqual(2)
  await expect
    .poll(async () => {
      const stats = await request.get('/api/dashboard', { headers })
      return (await stats.json()).visits.today
    })
    .toBeGreaterThanOrEqual(1)
  await page.getByRole('button', { name: 'Preferințe statistici' }).click()
  await page.getByRole('button', { name: 'Refuz', exact: true }).click()
  const before = analyticsCalls.length
  await page.goto('/repertoriu')
  await expect(page.locator('h1')).toBeVisible()
  expect(analyticsCalls.length).toBe(before)
  await request.post('/api/globals/site-settings', { headers, data: { analyticsEnabled: false } })
  await request.delete(`/api/pages/${doc.id}`, { headers })
})
