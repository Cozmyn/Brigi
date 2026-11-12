import { getPublicPages } from './cms'
import { verifiedLanguagePair } from './hreflang'

/**
 * A public editorial page is an actual translation only when the same CMS ID
 * is published and approved in both locales. Built-in RO fallback pages have
 * no ID, so they never generate fictional EN alternates.
 */
export async function publishedPageLanguagePair(locale: 'ro' | 'en', slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined
  const [ro, en] = await Promise.all([getPublicPages('ro'), getPublicPages('en')])
  const own = locale === 'ro' ? ro.find((page) => page.slug === slug)
    : en.find((page) => page.slug === slug)
  if (!own?.id) return undefined
  const sibling = (locale === 'ro' ? en : ro).find((page) => page.id === own.id)
  if (!sibling?.id) return undefined
  return verifiedLanguagePair(
    { id: own.id, path: (locale === 'ro' ? '/' : '/en/') + own.slug, locale, seo: own.seo },
    { id: sibling.id, path: (locale === 'ro' ? '/en/' : '/') + sibling.slug,
      locale: locale === 'ro' ? 'en' : 'ro', seo: sibling.seo },
  )
}
