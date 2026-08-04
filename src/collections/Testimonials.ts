import type { CollectionConfig } from 'payload'
import { canManageContent, canPublish, isOwnerOrEditor } from '@/access/roles'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: {
    create: canManageContent,
    delete: isOwnerOrEditor,
    read: ({ req }) => {
      const user = req.user as { active?: boolean; role?: string } | undefined
      if (user?.active !== false && ['owner', 'editor', 'automation'].includes(user?.role || '')) return true
      return { visible: { equals: true }, publicationConsent: { equals: true } }
    },
    update: canManageContent,
  },
  fields: [
    { name: 'quote', type: 'textarea', required: true, localized: true },
    { name: 'author', type: 'text', required: true },
    { name: 'eventType', type: 'text', localized: true },
    { name: 'city', type: 'text' },
    { name: 'year', type: 'number' },
    { name: 'publicationConsent', type: 'checkbox', defaultValue: false },
    { name: 'visible', type: 'checkbox', defaultValue: false, access: { update: canPublish } },
  ],
}
