type AppUser = { active?: boolean; collection?: string; role?: string } | null | undefined

const userFrom = (req: { user?: unknown }) => req.user as AppUser

export const isOwner = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  return Boolean(user?.active !== false && user?.role === 'owner')
}

export const isOwnerOrEditor = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  return Boolean(user?.active !== false && ['owner', 'editor'].includes(user?.role || ''))
}

export const isBackOffice = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  return Boolean(user?.active !== false && ['owner', 'editor'].includes(user?.role || ''))
}

export const canManageContent = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  return Boolean(
    user?.active !== false && ['owner', 'editor', 'automation'].includes(user?.role || ''),
  )
}

export const approvedOrBackOffice = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  if (user?.active !== false && ['owner', 'editor', 'automation'].includes(user?.role || '')) return true
  return { approvedForPublication: { equals: true } }
}

export const activeOrBackOffice = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  if (user?.active !== false && ['owner', 'editor', 'automation'].includes(user?.role || '')) return true
  return { active: { equals: true } }
}

export const visibleOrBackOffice = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  if (user?.active !== false && ['owner', 'editor', 'automation'].includes(user?.role || '')) return true
  return { visible: { equals: true } }
}

export const canPublish = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  return Boolean(user?.active !== false && ['owner', 'editor'].includes(user?.role || ''))
}

export const publishedOrBackOffice = ({ req }: { req: { user?: unknown } }) => {
  const user = userFrom(req)
  if (user?.active !== false && ['owner', 'editor', 'automation'].includes(user?.role || '')) {
    return true
  }
  return { _status: { equals: 'published' } }
}
