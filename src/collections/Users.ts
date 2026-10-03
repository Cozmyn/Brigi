import type { CollectionConfig } from '@/cms/model'
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['username', 'displayName', 'role', 'active'],
  },
  fields: [
    { name: 'displayName', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Editor', value: 'editor' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    {
      name: 'canAccessInquiries',
      type: 'checkbox',
      defaultValue: false,
      admin: {},
    },
  ],
}
