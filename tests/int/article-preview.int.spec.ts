import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticate, type User } from '@/cms/auth'
import { contentStore } from '@/cms/store'
import { getArticlePreview } from '@/lib/article-preview'

vi.mock('@/cms/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/cms/auth')>()
  return { ...actual, authenticate: vi.fn() }
})
vi.mock('@/cms/store', () => ({ contentStore: { byID: vi.fn() } }))

const user: User = {
  id: 1, username: 'preview-editor', displayName: 'Editor test',
  role: 'editor', active: true, canAccessInquiries: false,
}
const draft = {
  id: 7, title: 'Draft cu saxofon', slug: 'draft-cu-saxofon',
  createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z',
  _status: 'draft' as const, visible: false, approvedForPublication: false,
}

beforeEach(() => {
  vi.mocked(authenticate).mockReset()
  vi.mocked(contentStore.byID).mockReset()
})

describe('private article preview access', () => {
  it('denies anonymous access without reading the draft', async () => {
    vi.mocked(authenticate).mockResolvedValue(null)
    expect(await getArticlePreview(new Headers(), '7', 'ro')).toBeNull()
    expect(contentStore.byID).not.toHaveBeenCalled()
  })

  it('denies inactive sessions without reading the draft', async () => {
    vi.mocked(authenticate).mockResolvedValue({ ...user, active: false })
    expect(await getArticlePreview(new Headers(), '7', 'ro')).toBeNull()
    expect(contentStore.byID).not.toHaveBeenCalled()
  })

  it.each(['0', '-1', '1.5', 'abc', '01', '9007199254740992', '../7'])('rejects invalid ID %s', async (id) => {
    expect(await getArticlePreview(new Headers(), id, 'ro')).toBeNull()
    expect(authenticate).not.toHaveBeenCalled()
    expect(contentStore.byID).not.toHaveBeenCalled()
  })

  it.each(['fr', '', ['ro', 'en']])('rejects unsupported or ambiguous locale %j', async (locale) => {
    expect(await getArticlePreview(new Headers(), '7', locale)).toBeNull()
    expect(contentStore.byID).not.toHaveBeenCalled()
  })

  it.each(['ro', 'en'] as const)('reads the saved %s draft only with authenticated CMS permissions', async (locale) => {
    const requestHeaders = new Headers({ cookie: 'brigi_session=test-fixture' })
    vi.mocked(authenticate).mockResolvedValue(user)
    vi.mocked(contentStore.byID).mockResolvedValue(draft)
    expect(await getArticlePreview(requestHeaders, '7', locale)).toEqual({ article: draft, locale })
    expect(authenticate).toHaveBeenCalledWith(requestHeaders)
    expect(contentStore.byID).toHaveBeenCalledWith('articles', 7, {
      locale, user, overrideAccess: false, draft: true, depth: 0,
    })
  })

  it('returns no preview when the locale/document does not exist', async () => {
    vi.mocked(authenticate).mockResolvedValue(user)
    vi.mocked(contentStore.byID).mockResolvedValue(null)
    expect(await getArticlePreview(new Headers(), '7', 'en')).toBeNull()
  })
})
