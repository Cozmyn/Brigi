import type { CollectionConfig } from '@/cms/model'
export const Media: CollectionConfig = {
  slug: 'media',
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    { name: 'caption', type: 'text', localized: true },
    { name: 'credit', type: 'text' },
    { name: 'rightsNotes', type: 'textarea' },
    { name: 'approvedForPublication', type: 'checkbox', defaultValue: false },
  ],
}
