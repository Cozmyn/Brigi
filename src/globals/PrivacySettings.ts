import type { GlobalConfig } from '@/cms/model'
export const PrivacySettings: GlobalConfig = {
  slug: 'privacy-settings',
  fields: [
    { name: 'operatorName', type: 'text' },
    { name: 'privacyContact', type: 'text' },
    { name: 'retentionRule', type: 'textarea' },
    { name: 'policyVersion', type: 'text' },
    { name: 'completed', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
  ],
}
