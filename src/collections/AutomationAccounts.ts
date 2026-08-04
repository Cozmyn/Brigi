import type { CollectionConfig } from 'payload'
import { isOwner } from '@/access/roles'

export const AutomationAccounts: CollectionConfig = {
  slug: 'automation-accounts',
  auth: {
    useAPIKey: true,
    disableLocalStrategy: { enableFields: true, optionalPassword: true },
    loginWithUsername: { allowEmailLogin: false, requireEmail: false, requireUsername: true },
  },
  admin: { useAsTitle: 'displayName', group: 'Security' },
  access: { admin: isOwner, create: isOwner, delete: isOwner, read: isOwner, update: isOwner },
  fields: [
    { name: 'displayName', type: 'text', required: true },
    { name: 'role', type: 'text', defaultValue: 'automation', admin: { readOnly: true } },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}
