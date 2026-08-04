import type { GlobalConfig } from 'payload'
import { isOwnerOrEditor } from '@/access/roles'

export const HomeSettings: GlobalConfig = {
  slug: 'home-settings',
  access: { read: () => true, update: isOwnerOrEditor },
  fields: [
    { name: 'heroEyebrow', type: 'text', localized: true },
    { name: 'heroTitle', type: 'text', localized: true },
    { name: 'heroSubtitle', type: 'textarea', localized: true },
    { name: 'showreelVisible', type: 'checkbox', defaultValue: false },
    { name: 'testimonialsVisible', type: 'checkbox', defaultValue: false },
    { name: 'trustStripVisible', type: 'checkbox', defaultValue: false },
    {
      name: 'sectionOrder', type: 'select', hasMany: true,
      defaultValue: ['events', 'packages', 'benefits', 'process', 'repertoire', 'about', 'faq', 'finalCta'],
      options: ['events', 'packages', 'benefits', 'process', 'repertoire', 'about', 'faq', 'finalCta'],
    },
  ],
}

