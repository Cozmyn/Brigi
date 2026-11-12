import { expect, test } from '@playwright/test'

test('Romanian homepage hides unapproved prices and shows approved content only', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Brigitta.')
  await expect(page.getByRole('link', { name: 'Verifică disponibilitatea' }).first()).toBeVisible()
  await expect(page.locator('.package-price')).toHaveCount(0)
  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => document.fonts.ready)
  expect(await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(
    /sans/i,
  )
  await page.screenshot({ path: test.info().outputPath('homepage-desktop.png'), fullPage: true })
  await page.screenshot({ path: test.info().outputPath('hero-desktop.png') })
  await page.goto('/en')
  await expect(page).toHaveURL(/\/en$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Brigitta.')
})

test('booking carries the selected package and reports validation errors', async ({ page }) => {
  await page.goto('/rezervare?pachet=2x45')
  await expect(page.getByLabel('Pachet dorit')).toHaveValue('unsure')
  await page.getByRole('button', { name: 'Trimite cererea' }).click()
  await expect(page.locator('[aria-invalid="true"]')).not.toHaveCount(0)
  await expect(page.getByLabel('Email (sau telefon)')).toBeVisible()
})

test('mobile pages fit and missing routes return 404', async ({ page }) => {
  for (const width of [320, 375, 430, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 375) {
      const columns = await page
        .locator('.experience-section')
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
      expect(columns.split(' ')).toHaveLength(1)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: test.info().outputPath('homepage-mobile.png'), fullPage: true })
      await page.screenshot({ path: test.info().outputPath('hero-mobile.png') })
    }
    await page.goto('/rezervare')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  const response = await page.goto('/pagina-inexistenta')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ne întoarcem')
})

test('real inquiry is saved and retry does not duplicate it', async ({ request }) => {
  const data = {
    locale: 'ro',
    eventDate: '2099-09-14',
    approximateTime: '20:00',
    city: 'București',
    county: 'Ilfov',
    venue: 'Locație test',
    eventType: 'wedding',
    guestCount: 120,
    packageInterest: '2x45',
    name: 'Cerere QA',
    phone: '0722 123 456',
    email: 'qa@example.com',
    preferredContact: 'email',
    musicPreferences: 'Pop',
    approximateBudget: '750 €',
    message: 'Cerere automată de test',
    privacyAcknowledged: true,
    idempotencyKey: crypto.randomUUID(),
  }
  const headers = { 'X-Idempotency-Key': data.idempotencyKey }
  const first = await request.post('/api/inquiries', { data, headers })
  expect(first.status()).toBe(201)
  expect((await request.post('/api/inquiries', { data, headers })).status()).toBe(200)
  const invalid = await request.post('/api/inquiries', {
    data: { ...data, email: 'invalid' },
    headers,
  })
  expect(invalid.status()).toBe(422)
})

test('editorial pages have crawlable unique content, canonicals and working links', async ({
  page,
  request,
}) => {
  const titles = new Set<string>()
  for (const slug of [
    'nunti-si-ceremonii',
    'evenimente-corporate',
    'evenimente-private',
    'solista-botez',
    'muzica-live-evenimente',
    'repertoriu',
    'despre',
  ]) {
    const response = await page.goto('/' + slug)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await page.locator('.editorial-section').count()).toBeGreaterThanOrEqual(3)
    const title = await page.title()
    expect(titles.has(title)).toBe(false)
    titles.add(title)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp('/' + slug + '$'),
    )
    const graph = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) || '{}',
    )
    expect(graph['@graph'].some((x: { '@type': string }) => x['@type'] === 'Person')).toBe(true)
    await page.setViewportSize({ width: 375, height: 812 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  expect((await request.get('/api/dashboard')).status()).toBe(401)
  expect(
    (await request.post('/api/analytics', { data: { event: 'page_view', path: '/' } })).status(),
  ).toBe(403)
  expect((await request.get('/admin/login')).headers()['x-robots-tag']).toContain('noindex')
})

test('quick availability request accepts email only and an undecided date', async ({ page }) => {
  await page.goto('/rezervare')
  await expect(page.getByRole('button', { name: 'Cerere rapidă' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('Când are loc evenimentul?').selectOption('unknown')
  await page.getByLabel('Tip eveniment *').selectOption('wedding')
  await page.getByLabel('Oraș / localitate *').fill('Brașov')
  await page.getByLabel('Nume *').fill('Cerere rapidă QA')
  await page.getByLabel('Email (sau telefon)').fill('qa-rapid@example.com')
  await page.locator('input[name="privacyAcknowledged"]').check()
  await page.getByRole('button', { name: 'Trimite cererea' }).click()
  await expect(page.getByText('Cerere primită')).toBeVisible()
})

test('parallel retries deduplicate; reusing the same key with changed data conflicts', async ({ request }) => {
  const idempotencyKey = crypto.randomUUID()
  const data = {
    locale: 'ro', inquiryMode: 'quick', datePrecision: 'unknown',
    city: 'Cluj-Napoca', eventType: 'corporate', name: 'QA Concurent',
    phone: '0722 123 456', preferredContact: 'phone',
    privacyAcknowledged: true, idempotencyKey,
  }
  const headers = { 'X-Idempotency-Key': idempotencyKey }
  const concurrent = await Promise.all(Array.from({ length: 3 },
    () => request.post('/api/inquiries', { data, headers })))
  expect(concurrent.map((x) => x.status()).sort()).toEqual([200, 200, 201])
  const conflict = await request.post('/api/inquiries', {
    data: { ...data, name: 'Altă cerere QA' }, headers,
  })
  expect(conflict.status()).toBe(409)
})
