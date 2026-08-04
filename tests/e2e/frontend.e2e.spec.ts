import { expect, test } from '@playwright/test'

test('Romanian homepage and English alternate render', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Muzică live')
  await expect(page.getByRole('link', { name: 'Verifică data' }).first()).toBeVisible()
  await page.goto('/en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Live music')
})

test('booking is two-step and has no email field', async ({ page }) => {
  await page.goto('/rezervare')
  await expect(page.locator('input[type="email"]')).toHaveCount(0)
  await page.getByLabel('Data evenimentului').fill('14 septembrie 2027')
  await page.getByLabel('Oraș / localitate').fill('București')
  await page.getByLabel('Tip de eveniment').selectOption('wedding')
  await page.getByLabel('Număr aproximativ de invitați').fill('120')
  await page.getByRole('button', { name: 'Continuă la contact' }).click()
  await expect(page.getByRole('heading', { name: 'Cum putem reveni la tine?' })).toBeVisible()
})
