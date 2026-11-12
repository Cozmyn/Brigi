import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

for (const locale of ['ro', 'en'] as const) {
  const prefix = locale === 'en' ? '/en' : ''
  test('planning hub and all three tools work without an account (' + locale + ')', async ({ page, request }) => {
    for (const suffix of ['', '/planner', '/comparator', '/estimator']) {
      const path = prefix + '/instrumente' + suffix
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(path + '$'))
      await page.setViewportSize({ width: 360, height: 800 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await expect(page.locator('iframe')).toHaveCount(0)
    }
    expect((await request.get(prefix + '/instrumente')).status()).toBe(200)
  })
}

test('private planner never saves by default, explicitly stores and loads draft, exports real PDF', async ({ page }) => {
  await page.goto('/instrumente/planner')
  expect(await page.evaluate(() => localStorage.getItem('brigitta:planner:v1'))).toBeNull()
  await page.getByLabel('Numele evenimentului').fill('Nuntă — Cătălina și Ștefan')
  await page.getByLabel('Oraș / localitate').fill('Târgoviște')
  await page.getByLabel('Cât de sigură este data?').selectOption('month')
  await page.getByLabel('Luna aproximativă').fill('2099-09')
  await page.getByLabel('Note suplimentare').fill('Întâmpinare și pregătirea scenei.')
  await page.getByRole('button', { name: 'Adaugă moment' }).click()
  await page.getByLabel('Moment').last().fill('Încă un moment muzical')
  await page.getByRole('button', { name: 'Salvează pe dispozitiv' }).click()
  await expect(page.getByRole('status')).toContainText('Salvat doar pe acest dispozitiv')
  const stored = await page.evaluate(() => localStorage.getItem('brigitta:planner:v1'))
  expect(stored).toContain('Târgoviște')
  await page.reload()
  await expect(page.getByLabel('Numele evenimentului')).toHaveValue('')
  await page.getByRole('button', { name: 'Încarcă planul salvat' }).click()
  await expect(page.getByLabel('Numele evenimentului')).toHaveValue('Nuntă — Cătălina și Ștefan')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descarcă PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('brigitta-plan-eveniment.pdf')
  const bytes = await readFile(await download.path())
  expect(bytes.subarray(0, 8).toString('ascii')).toBe('%PDF-1.4')
  expect(bytes.byteLength).toBeGreaterThan(5000)
  const text = bytes.toString('latin1')
  expect(text).toContain('/Filter /DCTDecode')
  expect(text).toMatch(/\/Count [1-9]/)
  expect(text).toContain('%%EOF')
  await expect(page.getByRole('status')).toContainText('PDF descărcat')
  await page.getByRole('button', { name: 'Șterge planul local' }).click()
  expect(await page.evaluate(() => localStorage.getItem('brigitta:planner:v1'))).toBeNull()
})

test('comparator never invents offers and estimator uses only the visitor budget', async ({ page }) => {
  await page.goto('/instrumente/comparator')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Compară')
  await expect(page.getByTestId('comparison-tool')).toContainText('Preț')
  await page.goto('/instrumente/estimator')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Estimator')
  await page.getByLabel('Bugetul tău pentru deplasare').fill('125,50')
  await page.getByLabel('Bugetul tău pentru tehnic / sonorizare').fill('25')
  await page.getByRole('button', { name: 'Calculează suma de planificare' }).click()
  await expect(page.getByRole('status')).toContainText(/150[,.]5/)
  await expect(page.getByRole('status')).toContainText('nu este o ofertă Brigitta')
  await page.getByLabel('Alte sume introduse de tine').fill('100 EUR')
  await page.getByRole('button', { name: 'Calculează suma de planificare' }).click()
  await expect(page.getByRole('status')).toContainText('Introdu sume')
})

test('health endpoint is read-only and never exposes backend details', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toContain('no-store')
  expect(await response.json()).toEqual({ status: 'ok' })
})
