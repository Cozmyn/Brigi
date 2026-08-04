import type { CollectionConfig } from 'payload'
import { isOwnerOrEditor } from '@/access/roles'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  access: { create: isOwnerOrEditor, delete: isOwnerOrEditor, read: () => true, update: isOwnerOrEditor },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true },
    { name: 'to', type: 'text', required: true },
    { name: 'code', type: 'select', defaultValue: '301', options: ['301', '302', '307', '308'] },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}

