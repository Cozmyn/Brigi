import { createHash } from 'node:crypto'
import type { Knex } from 'knex'
import { getDB, databaseConfigured } from './db'
import { CMSValidationError, type Data } from './validation'
import { contentPath } from '@/lib/content-paths'
import { articleFromSnapshot, type ArticleLocale, type ArticleSnapshotRow } from '@/lib/public-articles'

const managedBy = 'article-slug-v1'
type AliasRow = { document_id: number; data: string | Data }
type ArticleAlias = { from: string; to: string; code: '308'; active: true; managedBy: string; articleId: number; articleLocale: ArticleLocale }

function record(value: unknown): Data | null {
  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value
    return data && typeof data === 'object' && !Array.isArray(data) ? data as Data : null
  } catch { return null }
}

export function articleRedirectKey(path: string): string {
  return path.length <= 180 ? path : `article:${createHash('sha256').update(path).digest('hex')}`
}

function validPath(path: unknown, locale: ArticleLocale): path is string {
  if (typeof path !== 'string') return false
  const prefix = locale === 'en' ? '/en/ghiduri/' : '/ghiduri/'
  return path.startsWith(prefix) && contentPath({ collection: 'articles', locale, slug: path.slice(prefix.length) }) === path
}

export function parseArticleAlias(value: unknown): ArticleAlias | null {
  const data = record(value)
  if (!data || data.managedBy !== managedBy || data.code !== '308' || data.active !== true ||
      typeof data.articleId !== 'number' || !Number.isSafeInteger(data.articleId) || data.articleId < 1 ||
      (data.articleLocale !== 'ro' && data.articleLocale !== 'en')) return null
  if (!validPath(data.from, data.articleLocale) || !validPath(data.to, data.articleLocale) || data.from === data.to) return null
  return data as unknown as ArticleAlias
}

function publishedPath(data: Data | null, locale: ArticleLocale) {
  if (!data || typeof data.slug !== 'string' || data._status !== 'published' || data.visible !== true ||
      data.approvedForPublication !== true || data.editorialStatus !== 'approved') return null
  return contentPath({ collection: 'articles', locale, slug: data.slug })
}

export async function syncArticleRedirects(trx: Knex.Transaction, articleId: number, locale: ArticleLocale, previous: unknown, next: Data) {
  const to = publishedPath(next, locale)
  if (!to) return
  const conflict = await trx('cms_locales').where({ collection: 'articles', locale })
    .whereNot('document_id', articleId).whereNotNull('published_data')
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(published_data, '$.slug')) = ?", [String(next.slug)])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(published_data, '$._status')) = ?", ['published'])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(published_data, '$.visible')) = ?", ['true'])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(published_data, '$.approvedForPublication')) = ?", ['true'])
    .forUpdate().first()
  if (conflict) throw new CMSValidationError('Adresa este folosită de alt articol publicat.')
  const atTarget = await trx<AliasRow>('cms_locales')
    .where({ collection: 'redirects', locale: 'ro', unique_key: articleRedirectKey(to) }).forUpdate().first()
  if (atTarget) {
    const alias = parseArticleAlias(atTarget.data)
    if (!alias || alias.articleId !== articleId || alias.articleLocale !== locale || alias.from !== to)
      throw new CMSValidationError('Adresa nouă este rezervată de un redirect. Rezolvă conflictul explicit.')
    // Returning to an earlier slug removes only this article's own alias at that address.
    await trx('cms_documents').where({ id: atTarget.document_id, collection: 'redirects' }).delete()
  }
  const from = publishedPath(record(previous), locale)
  if (from && from !== to) {
    const existing = await trx<AliasRow>('cms_locales')
      .where({ collection: 'redirects', locale: 'ro', unique_key: articleRedirectKey(from) }).forUpdate().first()
    if (existing) {
      const alias = parseArticleAlias(existing.data)
      if (!alias || alias.articleId !== articleId || alias.articleLocale !== locale || alias.from !== from)
        throw new CMSValidationError('Adresa veche are un redirect care nu poate fi suprascris automat.')
    }
    const data = JSON.stringify({ from, to, code: '308', active: true, managedBy, articleId, articleLocale: locale })
    if (existing) await trx('cms_locales').where({ document_id: existing.document_id, locale: 'ro' })
      .update({ data, published_data: data })
    else {
      const [id] = await trx('cms_documents').insert({ collection: 'redirects' })
      await trx('cms_locales').insert({ document_id: id, locale: 'ro', collection: 'redirects',
        unique_key: articleRedirectKey(from), data, published_data: data })
    }
  }
  const aliases = await trx<AliasRow>('cms_locales').where({ collection: 'redirects', locale: 'ro' })
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.managedBy')) = ?", [managedBy])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.articleId')) = ?", [String(articleId)])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.articleLocale')) = ?", [locale])
    .forUpdate().select('document_id', 'data')
  for (const row of aliases) {
    const alias = parseArticleAlias(row.data)
    if (!alias || alias.articleId !== articleId || alias.articleLocale !== locale) continue
    if (alias.from === to) continue
    const data = JSON.stringify({ ...alias, to })
    await trx('cms_locales').where({ document_id: row.document_id, locale: 'ro' }).update({ data, published_data: data })
  }
}

export async function articleRedirectTarget(locale: ArticleLocale, slug: string): Promise<string | null> {
  const from = contentPath({ collection: 'articles', locale, slug })
  if (!from || !databaseConfigured()) return null
  const row = await getDB()<AliasRow>('cms_locales')
    .where({ collection: 'redirects', locale: 'ro', unique_key: articleRedirectKey(from) }).first()
  const alias = row ? parseArticleAlias(row.data) : null
  if (!alias || alias.from !== from || alias.articleLocale !== locale) return null
  const current = await getDB()<ArticleSnapshotRow>('cms_documents as d')
    .join('cms_locales as l', 'l.document_id', 'd.id')
    .where('d.id', alias.articleId).where('d.collection', 'articles')
    .where('l.collection', 'articles').where('l.locale', locale).whereNotNull('l.published_data')
    .select({ id: 'd.id', created_at: 'd.created_at', updated_at: 'd.updated_at', snapshot: 'l.published_data' }).first()
  const article = current ? articleFromSnapshot(current, locale) : null
  return article && article.path !== from ? article.path : null
}
