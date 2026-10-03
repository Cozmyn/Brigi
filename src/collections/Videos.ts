import type { CollectionConfig } from '@/cms/model'
export const Videos: CollectionConfig = {
  slug: 'videos',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'eventType', type: 'select', options: ['wedding', 'corporate', 'private', 'other'] },
    { name: 'kind', type: 'select', required: true, options: ['showreel', 'full', 'short'] },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    { name: 'url', type: 'text' },
    { name: 'file', type: 'upload', relationTo: 'media' },
    { name: 'captions', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'approvedForPublication', type: 'checkbox', defaultValue: false },
  ],
}
