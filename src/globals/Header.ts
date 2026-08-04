import type { GlobalConfig } from 'payload'
import { isOwnerOrEditor } from '@/access/roles'

export const Header: GlobalConfig = {
  slug: 'header',
  access: { read: () => true, update: isOwnerOrEditor },
  fields: [
    {
      name: 'navigation', type: 'array', localized: true, fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'ctaLabel', type: 'text', localized: true },
    { name: 'ctaUrl', type: 'text', localized: true },
  ],
}

