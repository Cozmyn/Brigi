import { expect, test } from '@playwright/test'

for (const path of ['/', '/en']) {
  for (const width of [390, 1440]) {
    test(`local fonts and Romanian characters at ${path}, width ${width}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 })
      const googleRequests: string[] = []
      const failedFontResponses: string[] = []
      await page.route('**/*', async (route) => {
        const hostname = new URL(route.request().url()).hostname
        if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(hostname)) {
          googleRequests.push(route.request().url())
          await route.abort()
        } else await route.continue()
      })
      page.on('response', (response) => {
        if (response.request().resourceType() === 'font' && !response.ok())
          failedFontResponses.push(`${response.status()} ${response.url()}`)
      })
      const response = await page.goto(path)
      expect(response?.ok()).toBe(true)
      await expect(page.locator('h1').first()).toBeVisible()

      const results = await page.evaluate(async () => {
        const sample = 'Ăă Ââ Îî Șș Țț — Muzică, nunți și petreceri'
        const root = getComputedStyle(document.documentElement)
        const serifFamily = root.getPropertyValue('--font-serif').trim().split(',')[0]
        const sansFamily = root.getPropertyValue('--font-sans').trim().split(',')[0]
        if (!serifFamily || !sansFamily) throw new Error('Missing shared font variables.')
        const variants = [
          { family: serifFamily, style: 'normal', weight: '400' },
          { family: serifFamily, style: 'normal', weight: '500' },
          { family: serifFamily, style: 'italic', weight: '400' },
          { family: serifFamily, style: 'italic', weight: '500' },
          { family: sansFamily, style: 'normal', weight: '400' },
          { family: sansFamily, style: 'normal', weight: '600' },
          { family: sansFamily, style: 'normal', weight: '700' },
        ]
        const container = document.createElement('section')
        container.dataset.fontQa = 'true'
        container.style.cssText = 'position:relative;z-index:100;padding:24px;background:#102b30;color:#f2f4ee;overflow-wrap:anywhere;'
        const loaded = []
        for (const variant of variants) {
          const descriptor = `${variant.style} ${variant.weight} 28px ${variant.family}`
          const faces = await document.fonts.load(descriptor, sample)
          loaded.push({ descriptor, count: faces.length, ready: faces.every((face) => face.status === 'loaded') })
          const line = document.createElement('p')
          line.style.cssText = `font:${descriptor};margin:16px 0;max-width:100%;`
          line.textContent = sample
          container.appendChild(line)
        }
        document.body.prepend(container)
        await document.fonts.ready
        return loaded
      })

      for (const result of results) {
        expect(result.count, result.descriptor).toBeGreaterThan(0)
        expect(result.ready, result.descriptor).toBe(true)
      }
      expect(googleRequests).toEqual([])
      expect(failedFontResponses).toEqual([])
      await testInfo.attach('romanian-font-samples', {
        body: await page.locator('[data-font-qa]').screenshot(),
        contentType: 'image/png',
      })
      await page.locator('[data-font-qa]').evaluate((element) => element.remove())
      await testInfo.attach('homepage-fonts', {
        body: await page.screenshot({ fullPage: false }),
        contentType: 'image/png',
      })
    })
  }
}
