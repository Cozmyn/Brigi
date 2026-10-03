import type { GlobalConfig } from '@/cms/model'
export const Footer: GlobalConfig = {
  slug: 'footer',
  fields: [
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'legalNavigation',
      type: 'array',
      localized: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'copyright', type: 'text', localized: true },
  ],
}
