import type { CollectionConfig, Field } from '@/cms/model'
import type { Data } from '@/cms/validation'
import { seoFields, sectionFields } from '@/fields/editorial'
export type { MusicalFormat, Partner, CaseStudy } from '@/cms/content-entity-types'

const hasText = (value: unknown): value is string => typeof value === 'string' && Boolean(value.trim())

function publication(kind: string, required: string[]) {
  return (value: unknown): string | boolean => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Conținut invalid.'
    const data = value as Data
    if (!hasText(data.title)) return 'Titlul nu poate conține doar spații.'
    if (data._status !== 'published') return true
    if (data.approvedForPublication !== true) return 'Confirmă aprobarea înainte de publicare.'
    for (const key of ['summary', 'reviewer', ...required])
      if (!hasText(data[key])) return `${key}: obligatoriu înainte de publicare.`
    const reviewedAt = typeof data.reviewedAt === 'string' ? Date.parse(data.reviewedAt) : NaN
    if (!Number.isFinite(reviewedAt) || reviewedAt > Date.now()) return 'Revizuire datată, neviitoare, necesară.'
    if (!Array.isArray(data.sections) || !data.sections.length || data.sections.some((section) =>
      !section || !hasText(section.heading) || !hasText(section.body))) return 'Adaugă cel puțin o secțiune completă.'
    if ((kind === 'partners' || kind === 'case-studies') && data.publicationConsent !== true)
      return 'Confirmă dreptul de publicare pentru această înregistrare.'
    if (kind === 'case-studies' && data.evidenceVerified !== true) return 'Verifică dovezile studiului de caz.'
    return true
  }
}

function entity(slug: string, label: string, fields: Field[], required: string[]): CollectionConfig {
  return { slug, versions: { drafts: { autosave: true }, maxPerDoc: 30 },
    admin: { useAsTitle: 'title', description: `${label}. Rutele publice apar doar după aprobare și publicare explicită.`,
      defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
    fields: [{ type: 'group', validate: publication(slug, required), fields: [
      { name: 'title', type: 'text', required: true, localized: true, maxLength: 180 },
      { name: 'slug', type: 'text', required: true, unique: true, maxLength: 180, validate: (value) =>
        (typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) || 'Slug simplu, fără /, spații sau parametri.' },
      { name: 'summary', label: 'Rezumat', type: 'textarea', localized: true, maxLength: 500 },
      ...fields,
      { name: 'sections', label: 'Secțiuni', type: 'array', fields: sectionFields },
      { name: 'reviewer', label: 'Responsabil verificare', type: 'text', maxLength: 160 },
      { name: 'reviewedAt', label: 'Data verificării (ISO 8601)', type: 'date' },
      { name: 'visible', type: 'checkbox', defaultValue: false },
      { name: 'approvedForPublication', type: 'checkbox', defaultValue: false },
      { name: 'seo', type: 'group', fields: seoFields },
      { name: '_status', type: 'select', defaultValue: 'draft', options: [
        { label: 'Ciornă', value: 'draft' }, { label: 'Snapshot publicat în CMS', value: 'published' },
      ] },
    ] }],
  }
}

export const MusicalFormats = entity('musical-formats', 'Formate muzicale', [
  { name: 'lineup', label: 'Componență reală', type: 'text', localized: true, maxLength: 300 },
  { name: 'suitableFor', label: 'Contexte potrivite', type: 'textarea', localized: true, maxLength: 2000 },
  { name: 'technicalRequirements', label: 'Cerințe tehnice', type: 'textarea', localized: true, maxLength: 4000 },
  { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
], ['lineup', 'suitableFor', 'technicalRequirements'])

export const Partners = entity('partners', 'Parteneri', [
  { name: 'relationshipDescription', label: 'Relație și rol confirmate', type: 'textarea', localized: true, maxLength: 2000 },
  { name: 'website', type: 'text', maxLength: 2000, validate: (value) => {
    try {
      const url = new URL(String(value))
      return (url.protocol === 'https:' && !url.username && !url.password && !/[\\\r\n]/.test(String(value))) || 'Website HTTPS fără credențiale necesar.'
    } catch { return 'Website HTTPS valid necesar.' }
  } },
  { name: 'logo', type: 'upload', relationTo: 'media' },
  { name: 'publicationConsent', label: 'Dreptul de publicare confirmat', type: 'checkbox', defaultValue: false },
], ['relationshipDescription'])

export const CaseStudies = entity('case-studies', 'Studii de caz', [
  { name: 'eventYear', label: 'Anul evenimentului, opțional', type: 'number', min: 1900, max: new Date().getFullYear(),
    validate: (value) => (typeof value === 'number' && Number.isInteger(value)) || 'An întreg necesar.' },
  { name: 'context', type: 'textarea', localized: true, maxLength: 4000 },
  { name: 'approach', label: 'Ce am făcut concret', type: 'textarea', localized: true, maxLength: 4000 },
  { name: 'outcome', label: 'Rezultat verificabil', type: 'textarea', localized: true, maxLength: 4000 },
  { name: 'evidenceSummary', label: 'Dovezi publicabile, fără date private', type: 'textarea', localized: true, maxLength: 4000 },
  { name: 'evidenceVerified', type: 'checkbox', defaultValue: false },
  { name: 'publicationConsent', type: 'checkbox', defaultValue: false },
  { name: 'relatedFormats', type: 'relationship', relationTo: 'musical-formats', hasMany: true },
  { name: 'relatedPartners', type: 'relationship', relationTo: 'partners', hasMany: true },
  { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
], ['context', 'approach', 'outcome', 'evidenceSummary'])
