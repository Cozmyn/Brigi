import { expect, test } from '@playwright/test'

test('Romanian homepage, configured prices and conditional sections', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('O voce.')
  await expect(page.getByRole('link', { name: 'Verifică disponibilitatea' }).first()).toBeVisible()
  await expect(page.locator('.package-price')).toContainText(['450', '750', '1.050'])
  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
  await page.screenshot({ path: test.info().outputPath('homepage-desktop.png'), fullPage: true })
  await page.goto('/en')
  await expect(page).toHaveURL(/\/$/)
})

test('booking carries the selected package and reports validation errors', async ({ page }) => {
  await page.goto('/rezervare?pachet=2x45')
  await expect(page.getByLabel('Pachet dorit')).toHaveValue('2x45')
  await page.getByRole('button', { name: 'Trimite cererea' }).click()
  await expect(page.locator('[aria-invalid="true"]')).not.toHaveCount(0)
  await expect(page.getByLabel('Email *')).toBeVisible()
})

test('mobile pages fit and missing routes return 404', async ({ page }) => {
  for (const width of [320, 375, 430, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 375)
      await page.screenshot({ path: test.info().outputPath('homepage-mobile.png'), fullPage: true })
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
