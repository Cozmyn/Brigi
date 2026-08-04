import type { CollectionConfig } from 'payload'
import { isOwner } from '@/access/roles'

export const AuditEvents: CollectionConfig = {
  slug: 'audit-events',
  admin: { group: 'Security', defaultColumns: ['createdAt', 'action', 'entityType', 'entityId', 'actor'] },
  access: { admin: isOwner, create: () => false, delete: isOwner, read: isOwner, update: () => false },
  fields: [
    { name: 'action', type: 'text', required: true },
    { name: 'entityType', type: 'text', required: true },
    { name: 'entityId', type: 'text', required: true },
    { name: 'fromValue', type: 'text' },
    { name: 'toValue', type: 'text' },
    { name: 'actor', type: 'text', required: true },
  ],
}
