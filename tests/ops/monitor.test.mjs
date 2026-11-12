import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkSite, validateMonitorURL } from '../../scripts/ops/monitor-core.mjs'

function mockHTTP(indexable, health = true) {
  return async (url) => {
    const path = new URL(url).pathname
    if (path === '/api/health')
      return Response.json({ status: health ? 'ok' : 'unavailable' }, {
        status: health ? 200 : 503, headers: { 'Cache-Control': 'private, no-store' },
      })
    if (path === '/') return new Response('<h1>BRIGITTA</h1>', { status: 200 })
    if (path === '/robots.txt') return new Response(indexable
      ? 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n'
      : 'User-agent: *\nDisallow: /\n', { status: 200 })
    if (path === '/sitemap.xml') return new Response(indexable
      ? '<urlset><url><loc>https://public.test/rezervare</loc></url></urlset>' : '<urlset></urlset>',
      { status: 200 })
    throw new Error('unexpected endpoint')
  }
}
test('read-only checks recognize healthy preview and healthy indexable site', async () => {
  const preview = await checkSite('https://public.test', { expectedIndexable: false, fetcher: mockHTTP(false) })
  assert.equal(preview.status, 'ok')
  assert.equal(preview.checks.length, 4)
  const live = await checkSite('https://public.test', { expectedIndexable: true, fetcher: mockHTTP(true) })
  assert.equal(live.status, 'ok')
})
test('wrong indexing gate or unavailable DB correctly fails monitoring', async () => {
  assert.equal((await checkSite('https://public.test', {
    expectedIndexable: false, fetcher: mockHTTP(true),
  })).status, 'degraded')
  assert.equal((await checkSite('https://public.test', {
    expectedIndexable: true, fetcher: mockHTTP(true, false),
  })).status, 'degraded')
})
test('only HTTPS origins or explicit loopback HTTP are accepted', () => {
  assert.equal(validateMonitorURL('https://public.test/'), 'https://public.test')
  assert.equal(validateMonitorURL('http://127.0.0.1:3000'), 'http://127.0.0.1:3000')
  assert.throws(() => validateMonitorURL('http://public.test'))
  assert.throws(() => validateMonitorURL('https://user:secret@public.test'))
  assert.throws(() => validateMonitorURL('https://public.test/api/health'))
})
