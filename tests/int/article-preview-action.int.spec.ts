import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ArticlePreviewAction, articlePreviewURL } from '@/components/admin/ArticlePreviewAction'
import { Fields } from '@/components/admin/Fields'
import { Articles } from '@/collections/Articles'
import { defaults, validateFields } from '@/cms/validation'

describe('article preview action in the CMS editor', () => {
  it.each(['ro', 'en'])('uses document ID and selected locale %s', (locale) => {
    expect(articlePreviewURL(7, locale)).toBe(`/admin/preview/articles/7?locale=${locale}`)
    const html = renderToStaticMarkup(createElement(ArticlePreviewAction, { documentID: 7, locale }))
    expect(html).toContain(`/admin/preview/articles/7?locale=${locale}`)
    expect(html).toContain('target="_blank"')
    expect(html).toContain('noopener noreferrer')
    expect(html).toContain('Modificările nesalvate nu apar')
  })

  it.each([undefined, null, 0, -1, 1.5, '7', 'create', Infinity, 9007199254740992])
  ('does not expose a preview link for invalid or unsaved ID %s', (documentID) => {
    expect(articlePreviewURL(documentID, 'ro')).toBeNull()
    const html = renderToStaticMarkup(createElement(ArticlePreviewAction, { documentID, locale: 'ro' }))
    expect(html).not.toContain('href=')
    expect(html).toContain('Salvează articolul')
  })

  it('does not accept an unsupported locale', () => {
    expect(articlePreviewURL(7, 'fr')).toBeNull()
    expect(articlePreviewURL(7, 'en&other=x')).toBeNull()
  })

  it('renders through the actual Fields dispatcher and creates no persisted field', () => {
    const onChange = vi.fn()
    const html = renderToStaticMarkup(createElement(Fields, {
      fields: Articles.fields.filter((field) => field.type === 'articlePreview'),
      value: { id: 7 }, locale: 'en', onChange,
    }))
    expect(html).toContain('/admin/preview/articles/7?locale=en')
    expect(onChange).not.toHaveBeenCalled()
    expect(defaults(Articles.fields)).not.toHaveProperty('articlePreview')
    const data = validateFields(Articles.fields, { title: 'Draft cu saxofon', slug: 'draft-cu-saxofon', articlePreview: 'ignored' })
    expect(data).not.toHaveProperty('articlePreview')
    expect(data._status).toBe('draft')
  })
})
