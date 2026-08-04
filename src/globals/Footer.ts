import type { GlobalConfig } from 'payload'
import { isOwnerOrEditor } from '@/access/roles'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: { read: () => true, update: isOwnerOrEditor },
  fields: [
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'legalNavigation', type: 'array', localized: true, fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'copyright', type: 'text', localized: true },
  ],
}

