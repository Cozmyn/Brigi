import type { CollectionConfig } from '@/cms/model'
export const FAQ: CollectionConfig = {
  slug: 'faq',
  admin: { useAsTitle: 'question' },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true },
    { name: 'answer', type: 'textarea', required: true, localized: true },
    { name: 'category', type: 'text', localized: true },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'visible', type: 'checkbox', defaultValue: true },
  ],
}
