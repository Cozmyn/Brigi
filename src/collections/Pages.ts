import { seoFields, sectionFields, faqFields } from '@/fields/editorial'
import type { CollectionConfig } from 'payload'
import {
  canManageContent,
  canPublish,
  isOwnerOrEditor,
  publishedOrBackOffice,
} from '@/access/roles'

export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: { drafts: { autosave: true }, maxPerDoc: 30 },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
  access: {
    create: canManageContent,
    delete: isOwnerOrEditor,
    read: publishedOrBackOffice,
    update: canManageContent,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
          const from = `/${previousDoc.slug}`
          const existing = await req.payload.find({
            collection: 'redirects',
            where: { from: { equals: from } },
            limit: 1,
            req,
            overrideAccess: true,
          })
          const data = { from, to: `/${doc.slug}`, code: '308' as const, active: true }
          if (existing.docs[0])
            await req.payload.update({
              collection: 'redirects',
              id: existing.docs[0].id,
              data,
              req,
              overrideAccess: true,
            })
          else
            await req.payload.create({ collection: 'redirects', data, req, overrideAccess: true })
        }
        return doc
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        if ((req.user as { role?: string } | undefined)?.role === 'automation')
          data._status = 'draft'
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (v: unknown) =>
        (typeof v === 'string' &&
          /^(home|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(v) &&
          ![
            'home',
            'admin',
            'api',
            'next',
            'en',
            'rezervare',
            'contact',
            'confidentialitate',
            'cookies',
            'termeni',
            'solista-nunta',
            'solista-evenimente-corporate',
          ].includes(v)) ||
        'Slug simplu, fără /, spații sau rute rezervate.',
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
    {
      name: 'seo',
      type: 'group',
      fields: seoFields,
    },
    {
      name: 'approvedForPublication',
      type: 'checkbox',
      defaultValue: false,
      access: { update: canPublish },
    },
  ],
}
