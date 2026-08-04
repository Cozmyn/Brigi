import type { CollectionConfig } from 'payload'
import { canManageContent, isOwnerOrEditor, visibleOrBackOffice } from '@/access/roles'

export const FAQ: CollectionConfig = {
  slug: 'faq',
  admin: { useAsTitle: 'question' },
  access: { create: canManageContent, delete: isOwnerOrEditor, read: visibleOrBackOffice, update: canManageContent },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true },
    { name: 'answer', type: 'textarea', required: true, localized: true },
    { name: 'category', type: 'text', localized: true },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'visible', type: 'checkbox', defaultValue: true },
  ],
}
