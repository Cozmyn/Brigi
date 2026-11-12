import { describe, expect, it } from 'vitest'
import { articleRedirectKey, parseArticleAlias } from '@/cms/article-redirects'

const alias = { from: '/ghiduri/vechi', to: '/ghiduri/nou', code: '308', active: true,
  managedBy: 'article-slug-v1', articleId: 7, articleLocale: 'ro' }

describe('managed article redirect policy', () => {
  it('keeps short keys compatible and hashes long paths without truncation', () => {
    expect(articleRedirectKey(alias.from)).toBe(alias.from)
    const long = '/en/ghiduri/' + 'a'.repeat(180)
    expect(articleRedirectKey(long).length).toBeLessThanOrEqual(180)
    expect(articleRedirectKey(long)).toBe(articleRedirectKey(long))
    expect(articleRedirectKey(long)).not.toBe(articleRedirectKey(long.slice(0, -1) + 'b'))
  })
  it('accepts only owned same-language active article aliases', () => {
    expect(parseArticleAlias(JSON.stringify(alias))).toEqual(alias)
    for (const patch of [
      { managedBy: 'manual' }, { articleId: -1 }, { active: false }, { code: '302' },
      { to: alias.from }, { to: 'https://external.test/' }, { to: '/admin' },
      { to: '/en/ghiduri/nou' }, { from: '/ghiduri/%61' },
    ]) expect(parseArticleAlias({ ...alias, ...patch })).toBeNull()
    expect(parseArticleAlias('{')).toBeNull()
  })
})
