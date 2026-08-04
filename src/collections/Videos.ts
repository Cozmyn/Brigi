import type { CollectionConfig } from 'payload'
import { approvedOrBackOffice, canManageContent, canPublish, isOwnerOrEditor } from '@/access/roles'

export const Videos: CollectionConfig = {
  slug: 'videos',
  access: { create: canManageContent, delete: isOwnerOrEditor, read: approvedOrBackOffice, update: canManageContent },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'eventType', type: 'select', options: ['wedding', 'corporate', 'private', 'other'] },
    { name: 'kind', type: 'select', required: true, options: ['showreel', 'full', 'short'] },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    { name: 'url', type: 'text' },
    { name: 'file', type: 'upload', relationTo: 'media' },
    { name: 'captions', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'approvedForPublication', type: 'checkbox', defaultValue: false, access: { update: canPublish } },
  ],
}
