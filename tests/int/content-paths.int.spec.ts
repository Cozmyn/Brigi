import { describe, expect, it } from 'vitest'
import { contentPath, publicContentPath, type ContentReference } from '@/lib/content-paths'

describe('content path resolver foundation', () => {
  it.each([
    ['pages', 'ro', '/program-nunta'],
    ['pages', 'en', '/en/program-nunta'],
    ['articles', 'ro', '/ghiduri/program-nunta'],
    ['articles', 'en', '/en/ghiduri/program-nunta'],
  ] as const)('resolves %s in %s without changing existing page paths', (collection, locale, expected) => {
    expect(contentPath({ collection, locale, slug: 'program-nunta' })).toBe(expected)
  })

  it.each([
    '', '/', '../admin', 'a/b', '/admin', 'admin', 'api', 'next', 'en', '_next',
    'Program', 'program nunta', 'program--nunta', '-program', 'program-',
    'program?email=x', 'program#x', '%61dmin', 'https://example.test', '//example.test',
    'muzică', 'a'.repeat(181),
  ])('rejects malformed or private slug %s', (slug) => {
    for (const collection of ['pages', 'articles'] as const)
      expect(contentPath({ collection, locale: 'ro', slug })).toBeNull()
  })

  it.each(['home', 'rezervare', 'booking', 'ghiduri', 'formate', 'artisti', 'evenimente-reale', 'instrumente'])
  ('rejects a reserved root page %s', (slug) => {
    expect(contentPath({ collection: 'pages', locale: 'ro', slug })).toBeNull()
  })

  it('does not silently fall back for an unknown locale or collection', () => {
    expect(contentPath({ collection: 'articles', locale: 'fr', slug: 'program' } as unknown as ContentReference)).toBeNull()
    expect(contentPath({ collection: 'users', locale: 'ro', slug: 'program' } as unknown as ContentReference)).toBeNull()
  })

  const published = {
    collection: 'articles', locale: 'ro', slug: 'program-nunta',
    _status: 'published', visible: true, approvedForPublication: true,
  } as const

  it('exposes only an explicitly published, visible and approved reference', () => {
    expect(publicContentPath(published)).toBe('/ghiduri/program-nunta')
    expect(publicContentPath({ ...published, _status: 'draft' })).toBeNull()
    expect(publicContentPath({ ...published, visible: false })).toBeNull()
    expect(publicContentPath({ ...published, approvedForPublication: false })).toBeNull()
    expect(publicContentPath({ collection: 'articles', locale: 'ro', slug: 'program-nunta' })).toBeNull()
  })

  it('keeps approval independent in each language and collection', () => {
    expect(publicContentPath({ ...published, locale: 'en' })).toBe('/en/ghiduri/program-nunta')
    expect(publicContentPath({ ...published, locale: 'en', approvedForPublication: false })).toBeNull()
    expect(publicContentPath({ ...published, collection: 'pages' })).toBe('/program-nunta')
    expect(publicContentPath({ ...published, slug: '../admin' })).toBeNull()
  })
})
