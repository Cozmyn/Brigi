import type { CollectionConfig } from '@/cms/model'
export const Repertoire: CollectionConfig = {
  slug: 'repertoire',
  admin: { useAsTitle: 'song' },
  fields: [
    { name: 'song', type: 'text', required: true },
    { name: 'originalArtist', type: 'text', required: true },
    { name: 'category', type: 'text', required: true, localized: true },
    { name: 'language', type: 'select', options: ['ro', 'en', 'fr', 'it', 'other'] },
    {
      name: 'momentType',
      type: 'select',
      options: ['ceremony', 'cocktail', 'dinner', 'party', 'corporate'],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'sample', type: 'relationship', relationTo: 'videos' },
  ],
}
