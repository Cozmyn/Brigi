import type { CollectionConfig } from '@/cms/model'
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  fields: [
    { name: 'quote', type: 'textarea', required: true, localized: true },
    { name: 'author', type: 'text', required: true },
    { name: 'eventType', type: 'text', localized: true },
    { name: 'city', type: 'text' },
    { name: 'year', type: 'number' },
    { name: 'publicationConsent', type: 'checkbox', defaultValue: false },
    { name: 'visible', type: 'checkbox', defaultValue: false },
  ],
}
