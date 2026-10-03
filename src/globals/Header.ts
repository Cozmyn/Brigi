import type { GlobalConfig } from '@/cms/model'
export const Header: GlobalConfig = {
  slug: 'header',
  fields: [
    {
      name: 'navigation',
      type: 'array',
      localized: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'ctaLabel', type: 'text', localized: true },
    { name: 'ctaUrl', type: 'text', localized: true },
  ],
}
