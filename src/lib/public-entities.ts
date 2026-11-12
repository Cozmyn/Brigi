import { cache } from 'react'
import type { Metadata } from 'next'
import type { LanguageAlternates } from './hreflang'
import { databaseConfigured, getDB } from '@/cms/db'
import { contentStore } from '@/cms/store'
import { object, validateFields } from '@/cms/validation'
import { MusicalFormats, Partners, CaseStudies } from '@/collections/ContentEntities'
import type { ModelMap } from '@/cms/types'
import { contentPath, contentHubPath, publicContentPath } from './content-paths'
import { readApprovedArticleImage, type ArticleImage } from './article-references'
import { isProductionReady, siteURL } from './site'
const configs = { 'musical-formats': MusicalFormats, partners: Partners, 'case-studies': CaseStudies }
export const entityKinds = ['musical-formats', 'partners', 'case-studies'] as const
export type EntityKind = typeof entityKinds[number]
export type EntityLocale = 'ro' | 'en'
export type EntityRow = { id: number; created_at: string | Date; updated_at: string | Date; snapshot: unknown }
export type PublicEntity = { kind: EntityKind; locale: EntityLocale; path: string; document: ModelMap[EntityKind] }
export const entityLabels = {
  'musical-formats': { ro: 'Formate muzicale', en: 'Musical formats' },
  partners: { ro: 'Parteneri', en: 'Partners' },
  'case-studies': { ro: 'Studii de caz', en: 'Case studies' },
}
export const entityHubPath = (kind: EntityKind, locale: EntityLocale) => contentHubPath(kind, locale)!
function rawSnapshot(row: EntityRow) { return object(typeof row.snapshot === 'string' ? JSON.parse(row.snapshot) : row.snapshot) }
export function entityFromSnapshot(row: EntityRow, kind: EntityKind, locale: EntityLocale): PublicEntity | null {
  if (!Object.hasOwn(configs, kind) || (locale !== 'ro' && locale !== 'en')) return null
  try {
    const data = validateFields(configs[kind].fields, rawSnapshot(row)) as unknown as ModelMap[EntityKind]
    const path = publicContentPath({ ...data, collection: kind, locale })
    const id = Number(row.id)
    if (!path || !Number.isSafeInteger(id) || id < 1) return null
    return { kind, locale, path, document: { ...data, id,
      createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() } }
  } catch { return null }
}
export function entitiesFromRows(rows: EntityRow[], kind: EntityKind, locale: EntityLocale): PublicEntity[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    try {
      const slug = rawSnapshot(row).slug
      const path = typeof slug === 'string' ? contentPath({ collection: kind, locale, slug }) : null
      if (path) counts.set(path, (counts.get(path) || 0) + 1)
    } catch { /* Corrupt JSON is not a public document. */ }
  }
  return rows.map((row) => entityFromSnapshot(row, kind, locale))
    .filter((entity): entity is PublicEntity => entity !== null && counts.get(entity.path) === 1)
}
function configured() {
  if (databaseConfigured()) return true
  if (isProductionReady) throw new Error('Public entities require a configured production database.')
  return false
}
function query(kind: EntityKind, locale: EntityLocale) {
  return getDB()<EntityRow>('cms_documents as d').join('cms_locales as l', 'l.document_id', 'd.id')
    .where('d.collection', kind).where('l.collection', kind).where('l.locale', locale).whereNotNull('l.published_data')
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$._status')) = ?", ['published'])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.visible')) = ?", ['true'])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.approvedForPublication')) = ?", ['true'])
    .select({ id: 'd.id', created_at: 'd.created_at', updated_at: 'd.updated_at', snapshot: 'l.published_data' })
}
export const getPublicEntities = cache(async (kind: EntityKind, locale: EntityLocale): Promise<PublicEntity[]> => {
  if (!Object.hasOwn(configs, kind) || (locale !== 'ro' && locale !== 'en') || !configured()) return []
  return entitiesFromRows(await query(kind, locale).orderBy('d.id', 'desc'), kind, locale)
})
export const getPublicEntity = cache(async (kind: EntityKind, slug: string, locale: EntityLocale): Promise<PublicEntity | null> => {
  if (!Object.hasOwn(configs, kind) || !contentPath({ collection: kind, locale, slug }) || !configured()) return null
  const rows = await query(kind, locale).whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.published_data, '$.slug')) = ?", [slug]).limit(2)
  return rows.length === 1 ? entityFromSnapshot(rows[0], kind, locale) : null
})
const byID = cache(async (kind: EntityKind, id: number, locale: EntityLocale) => {
  const row = await query(kind, locale).where('d.id', id).first()
  const entity = row ? entityFromSnapshot(row, kind, locale) : null
  if (!entity) return null
  const resolved = await getPublicEntity(kind, entity.document.slug, locale)
  return resolved?.document.id === id ? resolved : null
})
export async function entityNavigation(locale: EntityLocale) {
  const lists = await Promise.all(entityKinds.map((kind) => getPublicEntities(kind, locale)))
  return entityKinds.flatMap((kind, index) => lists[index].length ? [{ label: entityLabels[kind][locale], href: entityHubPath(kind, locale) }] : [])
}
export function entityCanonical(entity: PublicEntity): string | null {
  try {
    const url = new URL(entity.document.seo?.canonical || entity.path, siteURL)
    return url.origin === new URL(siteURL).origin && !url.search && !url.hash && !url.username && !url.password ? url.href : null
  } catch { return null }
}
export function entityIsIndexable(entity: PublicEntity, ready = isProductionReady) {
  return ready && !entity.document.seo?.noindex && entityCanonical(entity) === new URL(entity.path, siteURL).href
}
export function entityMetadata(entity: PublicEntity, image?: ArticleImage, languages?: LanguageAlternates): Metadata {
  const doc = entity.document
  const title = doc.seo?.title || doc.title
  const description = doc.seo?.description || doc.summary || ''
  const canonical = entityCanonical(entity) || new URL(entity.path, siteURL).href
  return { metadataBase: new URL(siteURL), title: { absolute: `${title} | Brigitta` }, description,
    alternates: { canonical, ...(entityIsIndexable(entity) && languages ? { languages } : {}) }, robots: { index: entityIsIndexable(entity), follow: true },
    openGraph: { type: 'website', title: doc.seo?.ogTitle || title, description: doc.seo?.ogDescription || description,
      url: canonical, locale: entity.locale === 'en' ? 'en_GB' : 'ro_RO',
      images: image ? [{ url: image.src, alt: image.alt, width: image.width, height: image.height }] : [] },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image.src] : [] } }
}
export function entityStructuredData(entity: PublicEntity, image?: ArticleImage) {
  const url = new URL(entity.path, siteURL).href
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: entity.document.title, description: entity.document.summary,
      inLanguage: entity.locale === 'en' ? 'en-GB' : 'ro-RO', dateModified: entity.document.reviewedAt,
      ...(image ? { image: { '@type': 'ImageObject', url: new URL(image.src, siteURL).href, width: image.width, height: image.height } } : {}) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Brigitta', item: new URL(entity.locale === 'en' ? '/en' : '/', siteURL).href },
      { '@type': 'ListItem', position: 2, name: entityLabels[entity.kind][entity.locale], item: new URL(entityHubPath(entity.kind, entity.locale), siteURL).href },
      { '@type': 'ListItem', position: 3, name: entity.document.title, item: url },
    ] },
  ] }
}
function ids(values: unknown): number[] {
  return Array.isArray(values) ? [...new Set(values.filter((id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0))].slice(0, 8) : []
}
export async function entityReferences(entity: PublicEntity) {
  const doc = entity.document
  const images = new Map<number, Promise<ArticleImage | null>>()
  const load = (id: unknown): Promise<ArticleImage | null> => {
    if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1) return Promise.resolve(null)
    if (images.has(id)) return images.get(id)!
    if (images.size >= 16) return Promise.resolve(null)
    const task = readApprovedArticleImage(id)
    images.set(id, task)
    return task
  }
  const socialTask = load(doc.seo?.image)
  const logoTask = load('logo' in doc ? doc.logo : null)
  const sectionImages = await Promise.all((doc.sections || []).map((section) => load(section.image)))
  const data = doc as unknown as Record<string, unknown>
  const relatedTasks = ([['relatedFormats', 'musical-formats'], ['relatedPartners', 'partners']] as const).flatMap(([key, kind]) =>
    ids(data[key]).map((id) => byID(kind, id, entity.locale)))
  const serviceTasks = ids(data.relatedServices).map(async (id) => {
    const service = await contentStore.byID('services', id, { locale: entity.locale, overrideAccess: false, draft: false, depth: 0 })
    return service && service._status === 'published' && service.visible === true && service.priceApproved === true && service.commerciallyVerified === true && service.name.trim()
      ? { label: service.name, href: `${entity.locale === 'en' ? '/en/booking' : '/rezervare'}?selectie=${service.id}` } : null
  })
  const related = await Promise.all(relatedTasks)
  const services = await Promise.all(serviceTasks)
  return { socialImage: await socialTask, logo: await logoTask, sectionImages,
    links: [...related.filter((item): item is PublicEntity => item !== null).map((item) => ({ label: item.document.title, href: item.path })),
      ...services.filter((item): item is NonNullable<typeof item> => item !== null)] }
}
