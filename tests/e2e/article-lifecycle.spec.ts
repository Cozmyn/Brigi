import { expect, test } from '@playwright/test'
import { contentStore } from '@/cms/store'
import { closeDB, getDB } from '@/cms/db'
import { CMSValidationError } from '@/cms/validation'

const isolated = process.env.CI === 'true' && process.env.DB_NAME === 'brigitta_test' &&
  process.env.DB_HOST === '127.0.0.1' && process.env.PRODUCTION_GATES_CLOSED === 'false' &&
  (!process.env.TEST_BASE_URL || process.env.TEST_BASE_URL === 'http://127.0.0.1:3000')
test.skip(!isolated, 'Writes fixtures only to the explicitly isolated local CI database.')

test('article publication, draft isolation, redirects, conflict rollback and withdrawal', async ({ request }) => {
  test.setTimeout(90000)
  const suffix = crypto.randomUUID()
  const original = `ci-guide-${suffix}`
  const second = `ci-second-${suffix}`
  const third = `ci-third-${suffix}`
  const blocked = `ci-blocked-${suffix}`
  let id: number | undefined
  let serviceID: number | undefined
  let manualID: number | undefined
  const data = {
    title: `QA article ${suffix}`, slug: original, summary: 'Temporary CI fixture, not editorial content.',
    topic: 'music', intent: 'CI lifecycle test', author: 'QA fixture author', reviewer: 'QA fixture reviewer',
    originalContribution: 'Synthetic test fixture in isolated CI only.',
    sources: [{ label: 'Test source', url: 'https://example.test/guide' }],
    sections: [{ heading: 'QA section', body: `PUBLIC-${suffix}` }],
    publishedAt: '2020-01-01T12:00:00Z', reviewedAt: '2020-01-02T12:00:00Z',
    editorialStatus: 'approved', approvedForPublication: true, visible: true, _status: 'draft',
  }
  try {
    const service = await contentStore.create({ collection: 'services', overrideAccess: true, locale: 'ro', data: {
      name: `QA package ${suffix}`, sets: '1x45', priceFromEUR: 1, currency: 'EUR',
      _status: 'published', visible: true, priceApproved: true, description: 'Temporary CI package.',
    } })
    serviceID = service.id
    const created = await contentStore.create({ collection: 'articles', locale: 'ro', overrideAccess: true,
      data: { ...data, relatedServices: [serviceID] } })
    id = created.id
    expect((await request.get(`/ghiduri/${original}`)).status()).toBe(404)
    await contentStore.update({ collection: 'articles', id, locale: 'ro', overrideAccess: true, data: { _status: 'published' } })
    const published = await request.get(`/ghiduri/${original}`)
    expect(published.status()).toBe(200)
    expect(await published.text()).toContain(`PUBLIC-${suffix}`)
    expect(await published.text()).toContain(`/rezervare?selectie=${serviceID}`)
    expect(await (await request.get('/')).text()).toContain('href="/ghiduri"')
    await contentStore.update({ collection: 'articles', id, locale: 'ro', overrideAccess: true,
      data: { _status: 'draft', slug: second, sections: [{ heading: 'QA draft', body: `PRIVATE-${suffix}` }] } })
    const unchanged = await request.get(`/ghiduri/${original}`)
    expect(unchanged.status()).toBe(200)
    expect(await unchanged.text()).not.toContain(`PRIVATE-${suffix}`)
    expect((await request.get(`/ghiduri/${second}`)).status()).toBe(404)
    await contentStore.update({ collection: 'articles', id, locale: 'ro', overrideAccess: true, data: { _status: 'published' } })
    const firstRedirect = await request.get(`/ghiduri/${original}`, { maxRedirects: 0 })
    expect(firstRedirect.status()).toBe(308)
    expect(firstRedirect.headers().location).toBe(`/ghiduri/${second}`)
    await contentStore.update({ collection: 'articles', id, locale: 'ro', overrideAccess: true, data: { slug: third } })
    const collapsed = await request.get(`/ghiduri/${original}`, { maxRedirects: 0 })
    expect(collapsed.status()).toBe(308)
    expect(collapsed.headers().location).toBe(`/ghiduri/${third}`)
    const manual = await contentStore.create({ collection: 'redirects', overrideAccess: true, data: {
      from: `/ghiduri/${blocked}`, to: '/repertoriu', code: '308', active: true,
    } })
    manualID = manual.id
    await expect(contentStore.update({ collection: 'articles', id, locale: 'ro', overrideAccess: true, data: { slug: blocked } }))
      .rejects.toBeInstanceOf(CMSValidationError)
    expect((await contentStore.byID('articles', id, { locale: 'ro', overrideAccess: true, draft: false, depth: 0 }))?.slug).toBe(third)
    expect((await request.get(`/ghiduri/${third}`)).status()).toBe(200)
    await contentStore.update({ collection: 'articles', id, locale: 'ro', overrideAccess: true, data: { slug: original } })
    expect((await request.get(`/ghiduri/${original}`, { maxRedirects: 0 })).status()).toBe(200)
    expect((await request.get(`/ghiduri/${second}`, { maxRedirects: 0 })).headers().location).toBe(`/ghiduri/${original}`)
    const enSlug = `ci-en-${suffix}`
    await contentStore.update({ collection: 'articles', id, locale: 'en', overrideAccess: true,
      data: { ...data, slug: enSlug, _status: 'published' } })
    expect((await request.get(`/en/ghiduri/${enSlug}`)).status()).toBe(200)
    expect((await request.get(`/ghiduri/${enSlug}`)).status()).toBe(404)
    await contentStore.unpublish('articles', id, { locale: 'ro', overrideAccess: true })
    expect((await request.get(`/ghiduri/${original}`, { maxRedirects: 0 })).status()).toBe(404)
    expect((await request.get(`/ghiduri/${second}`, { maxRedirects: 0 })).status()).toBe(404)
    expect((await request.get(`/en/ghiduri/${enSlug}`)).status()).toBe(200)
  } finally {
    const db = getDB()
    try {
      if (id) {
        const aliases = await db('cms_locales').where({ collection: 'redirects', locale: 'ro' })
          .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.managedBy')) = ?", ['article-slug-v1'])
          .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.articleId')) = ?", [String(id)]).select('document_id')
        for (const alias of aliases) await contentStore.delete('redirects', Number(alias.document_id), { overrideAccess: true })
        await contentStore.delete('articles', id, { overrideAccess: true })
      }
      if (manualID) await contentStore.delete('redirects', manualID, { overrideAccess: true })
      if (serviceID) await contentStore.delete('services', serviceID, { overrideAccess: true })
    } finally { await closeDB() }
  }
})
