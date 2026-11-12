import { authenticate, canManage } from '@/cms/auth'
import { contentStore } from '@/cms/store'

export async function getArticlePreview(requestHeaders: Headers, rawID: string, rawLocale: unknown = 'ro') {
  if (!/^[1-9][0-9]{0,14}$/.test(rawID) || !Number.isSafeInteger(Number(rawID))) return null
  if (rawLocale !== 'ro' && rawLocale !== 'en') return null
  const user = await authenticate(requestHeaders)
  if (!user || !canManage(user, 'articles')) return null
  const article = await contentStore.byID('articles', Number(rawID), {
    locale: rawLocale, user, overrideAccess: false, draft: true, depth: 0,
  })
  return article ? { article, locale: rawLocale } : null
}
