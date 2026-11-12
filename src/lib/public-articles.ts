import { databaseConfigured, getDB } from '@/cms/db'
import type { Article } from '@/cms/article-types'
import { Articles } from '@/collections/Articles'
import { object, validateFields } from '@/cms/validation'
import { contentPath, publicContentPath } from './content-paths'
import { isProductionReady } from './site'

export type ArticleLocale = 'ro' | 'en'
export type PublicArticle = Article & { path: string; locale: ArticleLocale }
export type ArticleSnapshotRow = {
  id: number; created_at: string | Date; updated_at: string | Date; snapshot: unknown
}

export function articleFromSnapshot(row: ArticleSnapshotRow, locale: ArticleLocale): PublicArticle | null {
  if (locale !== 'ro' && locale !== 'en') return null
  try {
    const raw = typeof row.snapshot === 'string' ? JSON.parse(row.snapshot) : row.snapshot
    const article = validateFields(Articles.fields, object(raw)) as unknown as Article
    const path = publicContentPath({ ...article, collection: 'articles', locale })
    if (!path || article.editorialStatus !== 'approved' || !Number.isSafeInteger(Number(row.id)) || Number(row.id) < 1) return null
    return {
      ...article, path, locale, id: Number(row.id),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }
  } catch {
    // Invalid snapshots fail closed. Database errors are not caught here.
    return null
  }
}

function configured() {
  if (databaseConfigured()) return true
  if (isProductionReady) throw new Error('Public articles require a configured production database.')
  return false
}

function publishedQuery(locale: ArticleLocale) {
  return getDB()<ArticleSnapshotRow>('cms_documents as d')
    .join('cms_locales as l', 'l.document_id', 'd.id')
    .where('d.collection', 'articles').where('l.collection', 'articles').where('l.locale', locale)
    .whereNotNull('l.published_data')
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$._status')) = ?", ['published'])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.editorialStatus')) = ?", ['approved'])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.visible')) = ?", ['true'])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.approvedForPublication')) = ?", ['true'])
    .select({ id: 'd.id', created_at: 'd.created_at', updated_at: 'd.updated_at', snapshot: 'l.published_data' })
}

export async function getPublicArticles(locale: ArticleLocale): Promise<PublicArticle[]> {
  if ((locale !== 'ro' && locale !== 'en') || !configured()) return []
  const rows = await publishedQuery(locale).orderBy('d.id', 'desc')
  return rows.map((row) => articleFromSnapshot(row, locale))
    .filter((article): article is PublicArticle => article !== null)
}

export async function getPublicArticle(locale: ArticleLocale, slug: string): Promise<PublicArticle | null> {
  if (!contentPath({ collection: 'articles', locale, slug }) || !configured()) return null
  // l.slug follows the draft; resolve against the published slug instead.
  const row = await publishedQuery(locale)
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.slug')) = ?", [slug]).first()
  return row ? articleFromSnapshot(row, locale) : null
}
