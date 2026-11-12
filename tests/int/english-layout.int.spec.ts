import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/fonts', () => ({
  serif: { variable: 'test-serif' },
  sans: { variable: 'test-sans' },
}))
vi.mock('@/lib/cms', () => ({
  getSiteContent: vi.fn(async () => ({ analyticsEnabled: false })),
}))
vi.mock('@/components/site/Analytics', () => ({ Analytics: () => null }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function loadMetadata(gate: string) {
  vi.resetModules()
  vi.stubEnv('SITE_URL', 'https://public-site.test')
  vi.stubEnv('PRODUCTION_GATES_CLOSED', gate)
  const { metadata } = await import('@/app/(english)/layout')
  return metadata
}

describe('English layout indexing defaults', () => {
  it.each(['', 'false', 'TRUE', '1'])('blocks indexing by default for gate %s', async (gate) => {
    const metadata = await loadMetadata(gate)
    expect(metadata.metadataBase?.toString()).toBe('https://public-site.test/')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('uses the configured origin and permits indexing only for the explicit production gate', async () => {
    const metadata = await loadMetadata('true')
    expect(metadata.metadataBase?.toString()).toBe('https://public-site.test/')
    expect(metadata.robots).toEqual({ index: true, follow: true })
  })
})
