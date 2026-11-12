/** Read-only monitoring; never follows redirects or sends secrets. */
export function validateMonitorURL(value) {
  const url = new URL(value)
  const localhost = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  if (!url.hostname || url.username || url.password || url.pathname !== '/' ||
    url.search || url.hash || (url.protocol !== 'https:' && !(localhost && url.protocol === 'http:')))
    throw new Error('Monitoring requires an HTTPS site origin (or local HTTP for tests).')
  return url.origin
}
export async function checkSite(base, options = {}) {
  const origin = validateMonitorURL(base)
  const fetcher = options.fetcher || fetch
  const expectedIndexable = options.expectedIndexable === true
  const checks = []
  const get = async (name, path) => {
    try {
      const response = await fetcher(origin + path, {
        method: 'GET', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10_000),
      })
      const body = (await response.text()).slice(0, 150000)
      if (!response.ok) throw new Error('HTTP ' + response.status)
      checks.push({ name, status: response.status, ok: true })
      return { body, response }
    } catch {
      checks.push({ name, status: 0, ok: false })
      return null
    }
  }
  const health = await get('health', '/api/health')
  if (health) {
    try {
      if (JSON.parse(health.body).status !== 'ok' ||
          !/no-store/i.test(health.response.headers.get('cache-control') || ''))
        checks.find((c) => c.name === 'health').ok = false
    } catch { checks.find((c) => c.name === 'health').ok = false }
  }
  const home = await get('homepage', '/')
  if (home && !/<h1\b/i.test(home.body)) checks.find((c) => c.name === 'homepage').ok = false
  const robots = await get('robots', '/robots.txt')
  if (robots) {
    const blocked = /^Disallow:\s*\/\s*$/im.test(robots.body)
    if (blocked === expectedIndexable) checks.find((c) => c.name === 'robots').ok = false
    if (expectedIndexable && !/Disallow:\s*\/admin/i.test(robots.body))
      checks.find((c) => c.name === 'robots').ok = false
  }
  const sitemap = await get('sitemap', '/sitemap.xml')
  if (sitemap) {
    const populated = /<loc>https?:\/\//i.test(sitemap.body)
    if (populated !== expectedIndexable) checks.find((c) => c.name === 'sitemap').ok = false
  }
  return { status: checks.every((check) => check.ok) ? 'ok' : 'degraded',
    expectedIndexable, checks }
}
