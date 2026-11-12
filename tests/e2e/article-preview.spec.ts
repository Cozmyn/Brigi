import { expect, test } from '@playwright/test'

test('article preview is private, non-indexable and not cacheable', async ({ request }) => {
  for (const locale of ['ro', 'en']) {
    const response = await request.get(`/admin/preview/articles/1?locale=${locale}`)
    expect(response.status()).toBe(404)
    expect(response.headers()['x-robots-tag']).toContain('noindex')
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(response.headers()['referrer-policy']).toBe('no-referrer')
    expect(await response.text()).not.toContain('Private preview of the saved draft')
  }
})
