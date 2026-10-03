import type { CollectionConfig } from '@/cms/model'
export const Services: CollectionConfig = {
  slug: 'services',
  versions: { drafts: true },
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'sets', type: 'select', required: true, options: ['1x45', '2x45', '3x45'] },
    {
      name: 'setCount',
      type: 'number',
      min: 1,
      max: 12,
      admin: {
        description: 'Numărul de seturi afișat. Dacă lipsește, folosim formatul de mai sus.',
      },
    },
    { name: 'duration', type: 'number', defaultValue: 45, min: 10, max: 240 },
    { name: 'currency', type: 'select', defaultValue: 'EUR', options: ['EUR', 'RON'] },
    { name: 'fromPricing', type: 'checkbox', defaultValue: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'priceFromEUR',
      label: 'Preț (în moneda selectată)',
      type: 'number',
      required: true,
      min: 0,
    },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'suitedFor', type: 'text', localized: true },
    {
      name: 'inclusions',
      type: 'array',
      localized: true,
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'visible', type: 'checkbox', defaultValue: true },
    {
      name: 'priceApproved',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
