import { expect, test } from '@playwright/test'

test('premium homepage and booking remain usable from 360px without automatic video playback', async ({ page }, testInfo) => {
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 850 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const externalVideoRequests: string[] = []
    page.on('request', request => {
      if (/youtube-nocookie\.com\/embed/.test(request.url())) externalVideoRequests.push(request.url())
    })
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('link', { name: /Verifică disponibilitatea/ }).first()).toBeVisible()
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0)
    await expect(page.locator('.video-proof')).toHaveCount(0)
    await expect(page.locator('.credibility-strip')).toHaveCount(0)
    await expect(page.locator('.package-price')).toHaveCount(0)
    expect(externalVideoRequests).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.goto('/rezervare')
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.getByRole('button', { name: 'Cerere rapidă' })).toBeVisible()
    if (width <= 390) {
      await page.screenshot({ path: testInfo.outputPath('premium-booking-' + width + '.png'), fullPage: true })
      const element = page.getByRole('button', { name: 'Trimite cererea' })
      await element.scrollIntoViewIfNeeded()
      expect(await element.evaluate((node) => {
        const rect = node.getBoundingClientRect()
        const styles = getComputedStyle(node)
        return rect.width >= 40 && rect.bottom <= innerHeight && styles.visibility === 'visible'
      })).toBe(true)
    }
  }
})

test('mobile navigation, editorial and video fallback contain no invented examples', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto('/')
  const menu = page.locator('.site-header .mobile-menu')
  await menu.locator('summary').click()
  await expect(menu).toHaveAttribute('open', '')
  await expect(menu.getByRole('link', { name: 'Despre Brigitta' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Verifică disponibilitatea' })).toBeVisible()
  await page.goto('/video')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ro')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0)
  await expect(page.locator('.video-card')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.goto('/en/video')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await expect(page.locator('.video-card')).toHaveCount(0)
  const missing = await page.goto('/video/nu-exista')
  expect(missing?.status()).toBe(404)
})
