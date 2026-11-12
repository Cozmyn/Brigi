import { test, expect } from '@playwright/test'

for (const locale of ['ro', 'en'] as const) {
  for (const width of [360, 1440]) {
    test(`local fonts and Romanian samples: ${locale}, ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 })
      const remoteFontRequests: string[] = []
      const fontNetworkErrors: string[] = []
      page.on('request', (request) => {
        if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(request.url()).hostname))
          remoteFontRequests.push(request.url())
      })
      page.on('requestfailed', (request) => {
        if (request.resourceType() === 'font')
          fontNetworkErrors.push(`${request.url()}: ${request.failure()?.errorText}`)
      })
      page.on('response', (response) => {
        if (response.request().resourceType() === 'font' && !response.ok())
          fontNetworkErrors.push(`${response.status()} ${response.url()}`)
      })
      const response = await page.goto(locale === 'ro' ? '/' : '/en')
      expect(response?.status()).toBe(200)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('main h1').first()).toBeVisible()

      const results = await page.evaluate(async () => {
        const sample = 'Ăă Ââ Îî Șș Țț — Muzică, nunți și petreceri'
        const panel = document.createElement('section')
        panel.id = 'local-font-test-panel'
        panel.style.cssText = 'padding:24px;background:#fff;color:#111;position:relative;z-index:100;overflow-wrap:anywhere;'
        document.body.prepend(panel)
        const configurations = [
          { variable: '--font-serif', weight: '400', style: 'normal' },
          { variable: '--font-serif', weight: '500', style: 'normal' },
          { variable: '--font-serif', weight: '400', style: 'italic' },
          { variable: '--font-serif', weight: '500', style: 'italic' },
          { variable: '--font-sans', weight: '400', style: 'normal' },
          { variable: '--font-sans', weight: '500', style: 'normal' },
          { variable: '--font-sans', weight: '600', style: 'normal' },
          { variable: '--font-sans', weight: '700', style: 'normal' },
        ]
        const outcomes = []
        for (const config of configurations) {
          const variable = getComputedStyle(document.documentElement).getPropertyValue(config.variable).trim()
          if (!variable) throw new Error(`Missing CSS font variable ${config.variable}`)
          const line = document.createElement('p')
          line.textContent = `${config.variable} ${config.style} ${config.weight}: ${sample}`
          line.style.cssText = `font-family:var(${config.variable});font-style:${config.style};font-weight:${config.weight};font-size:24px;line-height:1.5;margin:12px 0;`
          panel.append(line)
          const computed = getComputedStyle(line)
          // Load only the primary webfont; system fallback faces are not the subject of this test.
          const primaryFamily = computed.fontFamily.split(',')[0].trim()
          let count = 0
          let loaded = false
          let error = ''
          try {
            const faces = await document.fonts.load(
              `${config.style} ${config.weight} 24px ${primaryFamily}`, sample,
            )
            count = faces.length
            loaded = faces.every((face) => face.status === 'loaded')
          } catch (failure) {
            error = failure instanceof Error ? failure.message : String(failure)
          }
          outcomes.push({
            family: primaryFamily, error, count, loaded,
            weight: computed.fontWeight,
            style: computed.fontStyle,
            expectedWeight: config.weight,
            expectedStyle: config.style,
          })
        }
        await document.fonts.ready
        return outcomes
      })

      await testInfo.attach('local-font-diagnostics', {
        body: JSON.stringify({ results, fontNetworkErrors }, null, 2),
        contentType: 'application/json',
      })
      expect(results).toHaveLength(8)
      for (const result of results) {
        expect(result.error, result.family).toBe('')
        expect(result.count, result.family).toBeGreaterThan(0)
        expect(result.loaded, result.family).toBe(true)
        expect(result.weight).toBe(result.expectedWeight)
        expect(result.style).toBe(result.expectedStyle)
      }
      expect(fontNetworkErrors).toEqual([])
      expect(remoteFontRequests).toEqual([])
      await testInfo.attach('local-font-samples', {
        body: await page.locator('#local-font-test-panel').screenshot(),
        contentType: 'image/png',
      })
      await page.locator('#local-font-test-panel').evaluate((element) => element.remove())
      await testInfo.attach('homepage-local-fonts', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      })
    })
  }
}
