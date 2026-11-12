export type ContentReference = {
  collection: 'pages' | 'articles'
  slug: string
  locale: 'ro' | 'en'
}

export type PublicContentReference = ContentReference & {
  _status?: 'draft' | 'published'
  visible?: boolean
  approvedForPublication?: boolean
}

const reservedSegments = new Set(['admin', 'api', 'next', 'en'])
const reservedPageSlugs = new Set([
  'home', 'rezervare', 'booking', 'contact', 'confidentialitate', 'cookies', 'termeni',
  'solista-nunta', 'solista-evenimente-corporate',
  'ghiduri', 'formate', 'artisti', 'evenimente-reale', 'instrumente',
])

// Computes paths only; it does not fetch documents, register routes or authorize previews.
export function contentPath(reference: ContentReference): string | null {
  const { collection, slug, locale } = reference
  if (locale !== 'ro' && locale !== 'en') return null
  if (collection !== 'pages' && collection !== 'articles') return null
  if (typeof slug !== 'string' || slug.length > 180 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || reservedSegments.has(slug)) return null
  if (collection === 'pages' && reservedPageSlugs.has(slug)) return null
  const prefix = locale === 'en' ? '/en' : ''
  return `${prefix}${collection === 'articles' ? '/ghiduri' : ''}/${slug}`
}

// Use a published snapshot from the store, never an admin draft with overrideAccess.
// This is publication visibility, not indexability: noindex pages can still be public.
export function publicContentPath(reference: PublicContentReference): string | null {
  if (reference._status !== 'published' || reference.visible !== true ||
      reference.approvedForPublication !== true) return null
  return contentPath(reference)
}
