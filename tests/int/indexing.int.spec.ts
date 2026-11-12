import { afterEach, describe, expect, it, vi } from 'vitest'

// Keep these tests independent of the production database and CMS.
vi.mock('@/lib/cms', () => ({
  getPublicPages: vi.fn(async () => []),
  getSiteContent: vi.fn(async () => ({ media: [] })),
  getHomeSEO: vi.fn(async () => undefined),
}))
vi.mock('@/lib/public-articles', () => ({ getPublicArticles: vi.fn(async () => []) }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function loadIndexing(gate: string) {
  vi.resetModules()
  vi.stubEnv('SITE_URL', 'https://public-site.test')
  vi.stubEnv('PRODUCTION_GATES_CLOSED', gate)
  const { default: robots } = await import('@/app/robots')
  const { default: sitemap } = await import('@/app/(frontend)/sitemap')
  const { pageMetadata } = await import('@/lib/seo')
  return { robots, sitemap, pageMetadata }
}

describe('production indexing gate', () => {
  it.each(['', 'false', 'TRUE', '1'])('keeps preview non-indexable for gate %s', async (gate) => {
    const { robots, sitemap, pageMetadata } = await loadIndexing(gate)
    expect(robots().rules).toEqual({ userAgent: '*', disallow: '/' })
    expect(await sitemap()).toEqual([])
    expect(pageMetadata('Preview', 'Description', '/').robots).toEqual({ index: false, follow: true })
  })

  it('permits approved production while retaining private exclusions', async () => {
    const { robots, sitemap, pageMetadata } = await loadIndexing('true')
    expect(robots().rules).toEqual({
      userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/next'],
    })
    expect(robots().sitemap).toBe('https://public-site.test/sitemap.xml')
    const entries = await sitemap()
    expect(entries.map((entry) => entry.url)).toContain('https://public-site.test/')
    expect(entries.every((entry) => entry.url.startsWith('https://public-site.test/'))).toBe(true)
    expect(entries.some((entry) => entry.url.includes('/ghiduri'))).toBe(false)
    expect(pageMetadata('Public', 'Description', '/').robots).toEqual({ index: true, follow: true })
    expect(pageMetadata('Private', 'Description', '/private', undefined, { noindex: true }).robots)
      .toEqual({ index: false, follow: true })
  })
})
