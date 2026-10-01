import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  PayloadRequest,
} from 'payload'

const ownerOrAuthorizedEditor = ({ req }: { req: PayloadRequest }) => {
  const user = req.user as
    { active?: boolean; role?: string; canAccessInquiries?: boolean } | undefined
  return Boolean(
    user?.active !== false &&
    (user?.role === 'owner' || (user?.role === 'editor' && user?.canAccessInquiries)),
  )
}

const setDefaults: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create') {
    const created = new Date()
    data.status = 'new'
    data.isUnread = true
    data.dueAt = new Date(created.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
  }
  return data
}

const auditStatus: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation === 'update' && previousDoc?.status !== doc.status && req.user) {
    await req.payload.create({
      collection: 'audit-events',
      data: {
        action: 'inquiry_status_changed',
        entityType: 'inquiry',
        entityId: String(doc.id),
        fromValue: previousDoc?.status,
        toValue: doc.status,
        actor: (req.user as { id?: string | number }).id
          ? String((req.user as { id?: string | number }).id)
          : 'system',
      },
      req,
      overrideAccess: true,
    })
  }
  return doc
}

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    group: 'Solicitări',
    useAsTitle: 'name',
    defaultColumns: [
      'createdAt',
      'name',
      'eventDate',
      'city',
      'packageInterest',
      'status',
      'dueAt',
    ],
  },
  access: {
    admin: ownerOrAuthorizedEditor,
    create: () => false,
    delete: ownerOrAuthorizedEditor,
    read: ownerOrAuthorizedEditor,
    update: ownerOrAuthorizedEditor,
  },
  hooks: {
    beforeChange: [setDefaults],
    afterChange: [auditStatus],
    afterRead: [
      async ({ doc, req }) => {
        const openedDirectly = Boolean(req.routeParams?.id)
        if (openedDirectly && doc.status === 'new' && doc.isUnread && req.user) {
          await req.payload.update({
            collection: 'inquiries',
            id: doc.id,
            data: { status: 'read', isUnread: false },
            req,
            overrideAccess: true,
          })
          return { ...doc, status: 'read', isUnread: false }
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'locale', type: 'select', required: true, options: ['ro', 'en'] },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        'new',
        'read',
        'contacted',
        'offer_prepared',
        'confirmed',
        'lost',
        'archived',
        'spam',
      ],
    },
    { name: 'eventDate', type: 'text', required: true },
    { name: 'city', type: 'text', required: true },
    { name: 'county', type: 'text' },
    { name: 'approximateTime', type: 'text' },
    { name: 'venue', type: 'text' },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: ['wedding', 'ceremony', 'corporate', 'anniversary', 'cocktail', 'public', 'other'],
    },
    { name: 'guestCount', type: 'number', required: true, min: 1, max: 100000 },
    {
      name: 'packageInterest',
      type: 'select',
      required: true,
      options: ['1x45', '2x45', '3x45', 'unsure', 'custom'],
    },
    { name: 'name', type: 'text', required: true, maxLength: 120 },
    { name: 'phone', type: 'text', required: true, maxLength: 24 },
    { name: 'email', type: 'email' },
    { name: 'musicPreferences', type: 'textarea', maxLength: 1000 },
    { name: 'approximateBudget', type: 'text', maxLength: 120 },
    {
      name: 'preferredContact',
      type: 'select',
      required: true,
      options: ['phone', 'whatsapp', 'email'],
    },
    { name: 'message', type: 'textarea', maxLength: 2000 },
    { name: 'privacyAcknowledged', type: 'checkbox', required: true },
    {
      type: 'row',
      fields: [
        { name: 'utmSource', type: 'text' },
        { name: 'utmMedium', type: 'text' },
        { name: 'utmCampaign', type: 'text' },
        { name: 'utmContent', type: 'text' },
        { name: 'utmTerm', type: 'text' },
      ],
    },
    { name: 'referrer', type: 'text' },
    { name: 'landingPath', type: 'text' },
    { name: 'dueAt', type: 'date', admin: { readOnly: true } },
    { name: 'lastContactedAt', type: 'date' },
    { name: 'internalNotes', type: 'textarea' },
    { name: 'isUnread', type: 'checkbox', defaultValue: true },
    { name: 'idempotencyKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
  ],
}
