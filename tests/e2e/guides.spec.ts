import { expect, test } from '@playwright/test'

for (const locale of ['ro', 'en'] as const) {
  test(`guides hub and missing article: ${locale}`, async ({ page, request }) => {
    const hub = locale === 'en' ? '/en/ghiduri' : '/ghiduri'
    const response = await page.goto(hub)
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${hub}$`))
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const missing = await request.get(`${hub}/missing-guide-${crypto.randomUUID()}`)
    expect(missing.status()).toBe(404)
  })
}

test('original SEO guides are seeded as editable published CMS articles', async ({ page, request }) => {
  const urls = [
    '/ghiduri/solista-dj-sau-formatie-la-nunta',
    '/ghiduri/pret-solista-nunta-ce-influenteaza-oferta',
    '/ghiduri/program-muzical-nunta-cronologie-checklist',
    '/ghiduri/muzica-live-cununie-civila-si-primire-invitati',
    '/ghiduri/solista-botez-muzica-live-si-momente',
    '/ghiduri/muzica-live-eveniment-corporate-brief-organizare',
  ]
  for (const url of urls) {
    const response = await page.goto(url)
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(url + '$'))
    await expect(page.getByRole('link', { name: /Discută despre muzica evenimentului tău/ })).toBeVisible()
    await expect(page.locator('article .editorial-section')).toHaveCount(6, { timeout: 10000 })
    expect((await (await request.get(url)).text()).includes('https://www.theknot.com')).toBe(true)
  }
})
