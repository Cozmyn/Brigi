import type { CollectionConfig } from 'payload'
import { canManageContent, canPublish, isOwnerOrEditor, publishedOrBackOffice } from '@/access/roles'

export const Services: CollectionConfig = {
  slug: 'services',
  versions: { drafts: true },
  admin: { useAsTitle: 'name' },
  access: { create: canManageContent, delete: isOwnerOrEditor, read: publishedOrBackOffice, update: canManageContent },
  hooks: {
    beforeChange: [({ data, req }) => {
      if ((req.user as { role?: string } | undefined)?.role === 'automation') data._status = 'draft'
      return data
    }],
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'sets', type: 'select', required: true, options: ['1x45', '2x45', '3x45'] },
    { name: 'priceFromEUR', type: 'number', required: true, min: 0 },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'suitedFor', type: 'text', localized: true },
    { name: 'inclusions', type: 'array', localized: true, fields: [{ name: 'item', type: 'text', required: true }] },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'visible', type: 'checkbox', defaultValue: true, access: { update: canPublish } },
    { name: 'priceApproved', type: 'checkbox', defaultValue: false, access: { update: canPublish } },
  ],
}
