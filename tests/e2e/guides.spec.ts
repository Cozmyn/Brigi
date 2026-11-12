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
