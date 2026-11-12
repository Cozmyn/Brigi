import { expect, test, request as apiRequest } from '@playwright/test'
import { getDB, closeDB } from '../../src/cms/db'
import { hashPassword } from '../../src/cms/auth'
import { contentStore } from '../../src/cms/store'

test.describe.configure({ retries: 0 })
test.beforeAll(async () => {
  // Exact fixture names only: make interrupted test runs repeatable.
  const pages = await contentStore.find({
    collection: 'pages',
    where: { slug: { in: ['verificare-editoriala', 'verificare-editoriala-noua', 'english-qa'] } },
    limit: 20,
  })
  for (const doc of pages.docs) await contentStore.delete('pages', doc.id)
  const english = await contentStore.find({
    collection: 'pages',
    locale: 'en',
    where: { slug: { equals: 'english-qa' } },
    limit: 20,
  })
  for (const doc of english.docs) await contentStore.delete('pages', doc.id)
  const redirects = await contentStore.find({
    collection: 'redirects',
    where: { from: { in: ['/verificare-editoriala', '/verificare-editoriala-noua'] } },
    limit: 20,
  })
  for (const doc of redirects.docs) await contentStore.delete('redirects', doc.id)
  await getDB()('cms_users').where('username', 'like', 'qa-%').delete()
})
test.afterAll(async () => {
  await getDB()('cms_users').where('username', 'like', 'qa-%').delete()
  await closeDB()
})

test('CMS publication, prices, consent analytics and lead privacy work end to end', async ({
  page,
}) => {
  const request = page.request
  const password = crypto.randomUUID() + 'A1!'
  await getDB()('cms_users').insert({
    username: 'qa-owner',
    password_hash: await hashPassword(password),
    display_name: 'QA Owner',
    role: 'owner',
    active: true,
  })
  const headers = { Origin: process.env.SITE_URL || 'http://127.0.0.1:3000', 'x-brigi-admin': '1' }
  const registered = await request.post('/api/auth/login', {
    headers,
    data: { username: 'qa-owner', password },
  })
  expect(registered.status()).toBeLessThan(300)
  expect((await registered.json()).user.role).toBe('owner')
  await page.goto('/admin')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Site, public')
  await page.screenshot({ path: test.info().outputPath('admin-desktop.png'), fullPage: true })
  // SEO guidance and article drafts must be usable by an owner without code edits.
  await page.goto('/admin/seo')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('SEO, conținut')
  await expect(page.getByRole('link', { name: /Articole și ghiduri/ })).toBeVisible()
  await page.goto('/admin/collections/articles/create')
  await page.getByLabel('Titlu *', { exact: true }).fill('Preț solistă pentru nuntă: ghid practic')
  await page.getByLabel('Rezumat').fill('Ce influențează prețul unui recital live și ce verifici înainte de ofertă.')
  await page.getByRole('button', { name: 'Completează slug și meta din textul existent' }).click()
  await expect(page.getByLabel('Adresă pagină *')).toHaveValue('pret-solista-pentru-nunta-ghid-practic')
  await expect(page.locator('#seo\\.title')).toHaveValue(/Brigitta/)
  await expect(page.locator('#seo\\.description')).toContainText('recital live')
  // Leave the draft unsaved: this is an editor usability test, not fake content.
  await page.goto('/admin')

  const create = await request.post('/api/pages?locale=ro&draft=true', {
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
  // Publish the same localized document through the new authenticated API.
  const draft = await (
    await request.get(`/api/pages/${doc.id}?locale=ro&draft=true`, { headers })
  ).json()
  expect(draft.title).toBe('Pagină editorială QA')
  expect(draft.heroTitle).toBe('Conținut administrat')
  const published = await request.patch(`/api/pages/${doc.id}?locale=ro`, {
    headers,
    data: { ...draft, _status: 'published' },
  })
  expect(published.ok(), await published.text()).toBe(true)
  await page.goto('/verificare-editoriala')
  await expect(page.locator('h1')).toHaveText('Conținut administrat')
  await expect(page).toHaveTitle(/Titlu SEO QA/)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  const renamed = await request.patch(`/api/pages/${doc.id}?locale=ro`, {
    headers,
    data: { ...draft, _status: 'published', slug: 'verificare-editoriala-noua' },
  })
  expect(renamed.ok(), await renamed.text()).toBe(true)
  const old = await request.get('/verificare-editoriala', { maxRedirects: 0 })
  expect(old.status()).toBe(308)
  expect(old.headers().location).toBe('/verificare-editoriala-noua')

  const services = (await (await request.get('/api/services?locale=ro', { headers })).json()).docs
  const essential = services.find((p: { sets: string }) => p.sets === '1x45')
  expect(essential).toBeTruthy()
  await request.patch(`/api/services/${essential.id}?locale=ro`, {
    headers,
    data: { ...essential, priceFromEUR: 499, visible: true, priceApproved: true, commerciallyVerified: true, _status: 'published' },
  })
  await page.goto('/')
  await expect(page.locator('.package-price').first()).toContainText('499')
  expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain(
    '"minPrice":499',
  )
  // Restore the unapproved state in the isolated CI fixture (not a real business price).
  await contentStore.unpublish('services', essential.id, { locale: 'ro', overrideAccess: true })

  const anonymous = await apiRequest.newContext({
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
  })
  expect((await anonymous.get('/api/inquiries')).status()).toBe(403)
  expect((await anonymous.get('/api/dashboard')).status()).toBe(401)
  await anonymous.dispose()
  expect((await request.get('/api/inquiries', { headers })).status()).toBe(200)
  await page.goto(`/admin/collections/pages/${doc.id}`)
  await expect(page.getByLabel('Titlu *', { exact: true })).toHaveValue('Pagină editorială QA')
  await page.setViewportSize({ width: 375, height: 812 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: test.info().outputPath('admin-mobile.png'), fullPage: true })
  await page.setViewportSize({ width: 1280, height: 900 })
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
  const history = await request.get('/api/redirects', { headers })
  for (const rule of (await history.json()).docs)
    if (rule.from.startsWith('/verificare-editoriala'))
      await request.delete(`/api/redirects/${rule.id}`, { headers })
})

test('admin login, role restrictions, English publishing and media lifecycle', async ({ page }) => {
  const request = page.request
  const password = crypto.randomUUID() + 'A1!'
  const username = `qa-media-${Date.now()}`
  await getDB()('cms_users').insert({
    username,
    password_hash: await hashPassword(password),
    display_name: 'QA Media',
    role: 'owner',
    active: true,
  })
  await page.goto('/admin/login')
  await page.getByLabel('Utilizator', { exact: true }).fill(username)
  await page.getByLabel('Parolă', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Intră în cont' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Site, public')
  const headers = { Origin: process.env.SITE_URL || 'http://127.0.0.1:3000', 'x-brigi-admin': '1' }
  expect((await request.post('/api/pages', { data: {} })).status()).toBe(403)
  const editor = await request.post('/api/users', {
    headers,
    data: {
      username: 'qa-editor',
      displayName: 'QA editor',
      password,
      role: 'editor',
      active: true,
    },
  })
  expect(editor.status()).toBe(201)
  const isolated = await apiRequest.newContext({
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
  })
  await isolated.post('/api/auth/login', { headers, data: { username: 'qa-editor', password } })
  expect((await isolated.get('/api/inquiries')).status()).toBe(403)
  expect((await isolated.get('/api/users')).status()).toBe(403)
  expect((await isolated.get('/api/globals/privacy-settings')).status()).toBe(403)
  await isolated.dispose()
  const created = await request.post('/api/pages?locale=en', {
    headers,
    data: {
      title: 'English QA',
      slug: 'english-qa',
      heroTitle: 'Live vocals for your event',
      heroSummary: 'English editorial content.',
      _status: 'published',
      visible: true,
      approvedForPublication: true,
      sections: [{ heading: 'Programme', body: 'Romanian and international repertoire.' }],
      seo: { noindex: true },
    },
  })
  expect(created.status()).toBe(201)
  const doc = (await created.json()).doc
  await page.goto('/en/english-qa')
  await expect(page.locator('h1')).toHaveText('Live vocals for your event')
  expect((await request.get('/english-qa')).status()).toBe(404)
  await request.patch(`/api/pages/${doc.id}?locale=en`, {
    headers,
    data: { heroTitle: 'Unpublished revision', _status: 'draft' },
  })
  await page.goto('/en/english-qa')
  await expect(page.locator('h1')).toHaveText('Live vocals for your event')
  await page.goto('/next/preview?path=/en/english-qa')
  await expect(page.locator('h1')).toHaveText('Unpublished revision')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await page.goto('/next/exit-preview')
  await request.delete(`/api/pages/${doc.id}`, { headers })
  const sharp = (await import('sharp')).default
  const buffer = await sharp({
    create: { width: 32, height: 40, channels: 3, background: '#39756d' },
  })
    .png()
    .toBuffer()
  const upload = await request.post('/api/media/upload', {
    headers,
    multipart: { alt: 'QA fixture', file: { name: 'fixture.png', mimeType: 'image/png', buffer } },
  })
  expect(upload.status()).toBe(201)
  const photo = (await upload.json()).doc
  const anonymous = await apiRequest.newContext({
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
  })
  expect((await anonymous.get(photo.url)).status()).toBe(404)
  expect((await request.get(photo.url)).status()).toBe(200)
  await request.patch(`/api/media/${photo.id}`, { headers, data: { approvedForPublication: true } })
  expect((await anonymous.get(photo.url)).status()).toBe(200)
  await request.patch(`/api/media/${photo.id}`, {
    headers,
    data: { approvedForPublication: false },
  })
  expect((await anonymous.get(photo.url)).status()).toBe(404)
  await request.delete(`/api/media/${photo.id}`, { headers })
  expect((await request.get(photo.url)).status()).toBe(404)
  await anonymous.dispose()
})
