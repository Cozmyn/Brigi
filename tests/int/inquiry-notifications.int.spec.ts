import { afterEach, describe, expect, it, vi } from 'vitest'
import { notificationEndpoint, retryDelayMs } from '@/lib/inquiry-notifications'
afterEach(() => vi.unstubAllEnvs())
describe('notification worker configuration and retry', () => {
  it('does not send data until explicitly configured', () => {
    vi.stubEnv('INQUIRY_NOTIFY_WEBHOOK_URL', '')
    vi.stubEnv('INQUIRY_NOTIFY_TOKEN', '')
    expect(notificationEndpoint()).toBeNull()
  })
  it('rejects insecure or credential-bearing webhook URLs', () => {
    vi.stubEnv('INQUIRY_NOTIFY_TOKEN', 'test-token')
    for (const url of ['http://hooks.example.test', 'https://u:p@hooks.example.test']) {
      vi.stubEnv('INQUIRY_NOTIFY_WEBHOOK_URL', url)
      expect(() => notificationEndpoint()).toThrow()
    }
    vi.stubEnv('INQUIRY_NOTIFY_WEBHOOK_URL', 'https://hooks.example.test/notify')
    expect(notificationEndpoint()?.url).toBe('https://hooks.example.test/notify')
  })
  it('exponentially backs off with a 6h ceiling', () => {
    expect(retryDelayMs(1)).toBe(120_000)
    expect(retryDelayMs(2)).toBe(240_000)
    expect(retryDelayMs(12)).toBe(6 * 3_600_000)
  })
})
