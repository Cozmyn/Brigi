import type { CollectionConfig } from '@/cms/model'
import { seoFields, sectionFields } from '@/fields/editorial'
import { contentPath } from '@/lib/content-paths'
export type { Article } from '@/cms/article-types'

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateArticlePublication(value: unknown): string | boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Articol invalid.'
  const data = value as Record<string, unknown>
  if (!hasText(data.title)) return 'Titlul nu poate conține doar spații.'
  if (data._status !== 'published') return true
  if (data.editorialStatus !== 'approved' || data.approvedForPublication !== true)
    return 'Publicarea necesită revizuire editorială aprobată și confirmarea aprobării.'
  for (const key of ['summary', 'intent', 'author', 'reviewer', 'originalContribution'])
    if (!hasText(data[key])) return `${key}: obligatoriu înainte de publicare.`
  if (!data.topic) return 'Alege tema articolului înainte de publicare.'
  if (!Array.isArray(data.sections) || data.sections.length === 0 || data.sections.some((section) =>
    !section || !hasText(section.heading) || !hasText(section.body)))
    return 'Publicarea necesită cel puțin o secțiune completă.'
  if (!Array.isArray(data.sources) || data.sources.length === 0 || data.sources.some((source) =>
    !source || !hasText(source.label) || !hasText(source.url)))
    return 'Publicarea necesită cel puțin o sursă identificată.'
  for (const key of ['publishedAt', 'reviewedAt']) {
    const timestamp = typeof data[key] === 'string' ? Date.parse(data[key]) : NaN
    if (!Number.isFinite(timestamp) || timestamp > Date.now())
      return `${key}: dată validă, neviitoare, obligatorie; publicarea programată nu este disponibilă.`
  }
  return true
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  versions: { drafts: { autosave: true }, maxPerDoc: 30 },
  admin: {
    useAsTitle: 'title',
    description: 'Ghiduri editoriale. Folosește acțiunea dedicată de preview pentru draftul salvat în limba selectată.',
    defaultColumns: ['title', 'slug', 'editorialStatus', '_status', 'updatedAt'],
  },
  fields: [{ type: 'articlePreview' }, {
    type: 'group',
    validate: validateArticlePublication,
    fields: [
      { name: 'title', type: 'text', required: true, localized: true, maxLength: 180 },
      {
        name: 'slug', type: 'text', required: true, unique: true, index: true, maxLength: 180,
        admin: { description: 'Identificator local fără /. Folosește „Previzualizează draftul salvat” de la începutul formularului; linkul generic din bara de salvare nu este încă adaptat articolelor.' },
        validate: (value) => (typeof value === 'string' &&
          contentPath({ collection: 'articles', locale: 'ro', slug: value }) !== null) || 'Slug simplu, valid și nerezervat.',
      },
      { name: 'summary', label: 'Rezumat', type: 'textarea', localized: true, maxLength: 500 },
      { name: 'topic', label: 'Temă', type: 'select', options: [
        { label: 'Muzică', value: 'music' }, { label: 'Petreceri', value: 'parties' },
        { label: 'Evenimente', value: 'events' },
      ] },
      { name: 'intent', label: 'Întrebarea cititorului', type: 'text', localized: true, maxLength: 300 },
      { name: 'author', label: 'Autor real', type: 'text', maxLength: 160 },
      { name: 'reviewer', label: 'Recenzor real', type: 'text', maxLength: 160 },
      { name: 'originalContribution', label: 'Contribuție originală și experiență', type: 'textarea', localized: true, maxLength: 4000 },
      { name: 'sections', label: 'Secțiuni', type: 'array', fields: sectionFields },
      { name: 'sources', label: 'Surse', type: 'array', fields: [
        { name: 'label', type: 'text', required: true, maxLength: 200 },
        { name: 'url', type: 'text', required: true, maxLength: 2000, validate: (value) => {
          if (typeof value !== 'string' || /[\\\r\n]/.test(value)) return 'Sursă HTTPS validă necesară.'
          try {
            const url = new URL(value)
            return (url.protocol === 'https:' && !url.username && !url.password) || 'Sursă HTTPS fără credențiale necesară.'
          } catch { return 'Sursă HTTPS validă necesară.' }
        } },
      ] },
      { name: 'relatedPages', label: 'Pagini asociate', type: 'relationship', relationTo: 'pages', hasMany: true },
      { name: 'relatedServices', label: 'Pachete asociate', type: 'relationship', relationTo: 'services', hasMany: true },
      { name: 'publishedAt', label: 'Data publicării (ISO 8601)', type: 'date' },
      { name: 'reviewedAt', label: 'Data revizuirii (ISO 8601)', type: 'date' },
      { name: 'editorialStatus', label: 'Revizuire editorială', type: 'select', defaultValue: 'draft', options: [
        { label: 'Ciornă', value: 'draft' }, { label: 'În revizuire', value: 'review' },
        { label: 'Aprobat editorial', value: 'approved' },
      ] },
      { name: 'visible', type: 'checkbox', defaultValue: false },
      { name: 'approvedForPublication', type: 'checkbox', defaultValue: false },
      { name: 'seo', type: 'group', fields: seoFields },
      { name: '_status', label: 'Salvare snapshot publicat', type: 'select', defaultValue: 'draft', options: [
        { label: 'Ciornă', value: 'draft' }, { label: 'Publicat', value: 'published' },
      ] },
    ],
  }],
}
