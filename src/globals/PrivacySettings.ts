import type { GlobalConfig } from 'payload'
import { isOwner } from '@/access/roles'

export const PrivacySettings: GlobalConfig = {
  slug: 'privacy-settings',
  access: { read: isOwner, update: isOwner },
  fields: [
    { name: 'operatorName', type: 'text' },
    { name: 'privacyContact', type: 'text' },
    { name: 'retentionRule', type: 'textarea' },
    { name: 'policyVersion', type: 'text' },
    { name: 'completed', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [({ data }) => ({
      ...data,
      completed: Boolean(data.operatorName && data.privacyContact && data.retentionRule && data.policyVersion),
    })],
  },
}
