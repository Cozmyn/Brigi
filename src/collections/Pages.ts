import type { CollectionConfig } from 'payload'
import { canManageContent, canPublish, isOwnerOrEditor, publishedOrBackOffice } from '@/access/roles'

export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: { drafts: { autosave: true }, maxPerDoc: 30 },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
  access: { create: canManageContent, delete: isOwnerOrEditor, read: publishedOrBackOffice, update: canManageContent },
  hooks: {
    beforeChange: [({ data, req }) => {
      if ((req.user as { role?: string } | undefined)?.role === 'automation') data._status = 'draft'
      return data
    }],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'heroEyebrow', type: 'text', localized: true },
    { name: 'heroTitle', type: 'text', required: true, localized: true },
    { name: 'heroSummary', type: 'textarea', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'visible', type: 'checkbox', defaultValue: true },
    {
      name: 'seo', type: 'group', fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true, maxLength: 170 },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'approvedForPublication', type: 'checkbox', defaultValue: false, access: { update: canPublish } },
  ],
}
