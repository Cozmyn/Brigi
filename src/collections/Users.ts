import type { CollectionConfig } from 'payload'
import { isOwner } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    loginWithUsername: { allowEmailLogin: false, requireEmail: false, requireUsername: true },
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  admin: { useAsTitle: 'displayName', defaultColumns: ['username', 'displayName', 'role', 'active'] },
  access: { admin: isOwner, create: isOwner, delete: isOwner, read: isOwner, update: isOwner },
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
      admin: { condition: (_, siblingData) => siblingData?.role === 'editor' },
    },
  ],
}

