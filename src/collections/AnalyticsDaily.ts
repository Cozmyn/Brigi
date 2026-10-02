import type { CollectionConfig } from 'payload'
import { isOwnerOrEditor } from '@/access/roles'
export const AnalyticsDaily: CollectionConfig = {
  slug: 'analytics-daily',
  admin: {
    group: 'Statistici',
    useAsTitle: 'day',
    description: 'Contoare agregate, cu acord. Fără profiluri individuale. Păstrare 90 zile.',
    defaultColumns: ['day', 'event', 'path', 'count'],
  },
  access: {
    read: isOwnerOrEditor,
    create: () => false,
    update: () => false,
    delete: isOwnerOrEditor,
  },
  timestamps: false,
  fields: [
    { name: 'key', type: 'text', unique: true, required: true, admin: { hidden: true } },
    { name: 'day', type: 'text', required: true, index: true },
    { name: 'event', type: 'text', required: true },
    { name: 'path', type: 'text', required: true },
    { name: 'referrer', type: 'text' },
    { name: 'campaign', type: 'text' },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
  ],
}
