import type { CollectionConfig } from 'payload'
import { isOwner, isBackOffice } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    loginWithUsername: { allowEmailLogin: false, requireEmail: false, requireUsername: true },
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['username', 'displayName', 'role', 'active'],
  },
  access: { admin: isBackOffice, create: isOwner, delete: isOwner, read: isOwner, update: isOwner },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (
          operation === 'create' &&
          !(await req.payload.count({ collection: 'users', overrideAccess: true, req })).totalDocs
        ) {
          return { ...data, role: 'owner', active: true }
        }
        return data
      },
    ],
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
      admin: { condition: (_, siblingData) => siblingData?.role === 'editor' },
    },
  ],
}
