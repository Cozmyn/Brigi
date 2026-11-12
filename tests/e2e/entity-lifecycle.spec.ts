import { test, expect } from '@playwright/test'
import { contentStore } from '@/cms/store'
import { closeDB } from '@/cms/db'
const isolated = process.env.CI === 'true' && process.env.DB_NAME === 'brigitta_test' && process.env.DB_HOST === '127.0.0.1' &&
  process.env.PRODUCTION_GATES_CLOSED === 'false' && (!process.env.TEST_BASE_URL || process.env.TEST_BASE_URL === 'http://127.0.0.1:3000')
test.skip(!isolated, 'Writes temporary fixtures only in the isolated local CI database.')
test('all entity types preserve drafts, locale separation, relations and withdrawal', async ({ request }) => {
  test.setTimeout(120000)
  const suffix = crypto.randomUUID()
  const created: { collection: 'musical-formats' | 'partners' | 'case-studies'; id: number }[] = []
  const fixture = { title: `QA ${suffix}`, summary: `PUBLIC-${suffix}`, sections: [{ heading: 'QA', body: 'Temporary CI content.' }],
    reviewer: 'QA', reviewedAt: '2020-01-01T12:00:00Z', visible: true, approvedForPublication: true,
    lineup: 'QA', suitableFor: 'QA', technicalRequirements: 'QA', relationshipDescription: 'QA', publicationConsent: true,
    context: 'QA', approach: 'QA', outcome: 'QA', evidenceSummary: 'QA', evidenceVerified: true }
  try {
    for (const [collection, hub] of [['musical-formats', 'formate'], ['partners', 'parteneri'], ['case-studies', 'studii-de-caz']] as const) {
      const slug = `ci-${hub}-${suffix}`
      const enSlug = `en-${slug}`
      const related = collection === 'case-studies' ? { relatedFormats: [created[0].id], relatedPartners: [created[1].id] } : {}
      const doc = await contentStore.create({ collection, locale: 'ro', overrideAccess: true, data: { ...fixture, ...related, slug, _status: 'draft' } })
      created.push({ collection, id: doc.id })
      expect((await request.get(`/${hub}/${slug}`)).status()).toBe(404)
      await contentStore.update({ collection, id: doc.id, locale: 'ro', overrideAccess: true, data: { _status: 'published' } })
      const live = await request.get(`/${hub}/${slug}`)
      expect(live.status()).toBe(200)
      expect(await live.text()).toContain(`PUBLIC-${suffix}`)
      if (collection === 'case-studies') expect(await live.text()).toContain(`/formate/ci-formate-${suffix}`)
      await contentStore.update({ collection, id: doc.id, locale: 'ro', overrideAccess: true,
        data: { _status: 'draft', slug: `private-${slug}`, summary: `PRIVATE-${suffix}` } })
      const unchanged = await request.get(`/${hub}/${slug}`)
      expect(unchanged.status()).toBe(200)
      expect(await unchanged.text()).not.toContain(`PRIVATE-${suffix}`)
      expect((await request.get(`/${hub}/private-${slug}`)).status()).toBe(404)
      expect((await request.get(`/en/${hub}/${slug}`)).status()).toBe(404)
      await contentStore.update({ collection, id: doc.id, locale: 'en', overrideAccess: true,
        data: { ...fixture, ...related, slug: enSlug, _status: 'published' } })
      expect((await request.get(`/en/${hub}/${enSlug}`)).status()).toBe(200)
      expect(await (await request.get('/en')).text()).toContain(`/en/${hub}`)
    }
    expect(await (await request.get('/')).text()).toContain('Explorează')
    for (const [index, hub] of ['formate', 'parteneri', 'studii-de-caz'].entries()) {
      const doc = created[index]
      await contentStore.unpublish(doc.collection, doc.id, { locale: 'ro', overrideAccess: true })
      expect((await request.get(`/${hub}/ci-${hub}-${suffix}`)).status()).toBe(404)
      expect((await request.get(`/en/${hub}/en-ci-${hub}-${suffix}`)).status()).toBe(200)
    }
  } finally {
    try { for (const doc of created.reverse()) await contentStore.delete(doc.collection, doc.id, { overrideAccess: true }) }
    finally { await closeDB() }
  }
})
