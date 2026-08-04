import type { CollectionConfig } from 'payload'
import { activeOrBackOffice, canManageContent, isOwnerOrEditor } from '@/access/roles'

export const Repertoire: CollectionConfig = {
  slug: 'repertoire',
  admin: { useAsTitle: 'song' },
  access: { create: canManageContent, delete: isOwnerOrEditor, read: activeOrBackOffice, update: canManageContent },
  fields: [
    { name: 'song', type: 'text', required: true },
    { name: 'originalArtist', type: 'text', required: true },
    { name: 'category', type: 'text', required: true, localized: true },
    { name: 'language', type: 'select', options: ['ro', 'en', 'fr', 'it', 'other'] },
    { name: 'momentType', type: 'select', options: ['ceremony', 'cocktail', 'dinner', 'party', 'corporate'] },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'sample', type: 'relationship', relationTo: 'videos' },
  ],
}
