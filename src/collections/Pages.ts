import { seoFields, sectionFields, faqFields } from '@/fields/editorial'
import { isContentSlug } from '@/lib/content-paths'
import type { CollectionConfig } from '@/cms/model'
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: { drafts: { autosave: true }, maxPerDoc: 30 },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 140,
      admin: {
        description:
          'Păstrează URL-urile existente. Pentru conținut nou: ghiduri/titlu, formate/titlu, parteneri/nume sau evenimente-reale/titlu. Fără / la început.',
      },
      validate: (value, { previousValue }) =>
        isContentSlug(value === undefined ? previousValue : value) ||
        'Folosește un slug simplu sau namespace/slug aprobat, fără rute rezervate ori parametri.',
    },
    {
      name: 'pageType',
      type: 'select',
      defaultValue: 'editorial',
      options: ['service', 'editorial', 'location', 'about', 'repertoire', 'media'],
    },
    { name: 'excerpt', type: 'textarea', maxLength: 240 },
    {
      name: 'serviceArea',
      type: 'text',
      admin: {
        description:
          'Doar zone în care prestațiile sunt confirmate. Nu genera automat pagini pentru orașe.',
      },
    },
    { name: 'sections', type: 'array', fields: sectionFields },
    { name: 'faqs', type: 'array', fields: faqFields },
    { name: 'relatedPages', type: 'relationship', relationTo: 'pages', hasMany: true },
    { name: 'showPackages', type: 'checkbox', defaultValue: false },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Verifică disponibilitatea' },
    { name: 'heroEyebrow', type: 'text', localized: true },
    { name: 'heroTitle', type: 'text', required: true, localized: true },
    { name: 'heroSummary', type: 'textarea', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'visible', type: 'checkbox', defaultValue: true },
    { name: 'seo', type: 'group', fields: seoFields },
    { name: 'approvedForPublication', type: 'checkbox', defaultValue: false },
  ],
}
