const bases = { pages: '', articles: '/ghiduri', 'musical-formats': '/formate', partners: '/parteneri', 'case-studies': '/studii-de-caz' } as const
export type ContentCollection = keyof typeof bases
export type ContentReference = { collection: ContentCollection; slug: string; locale: 'ro' | 'en' }
export type PublicContentReference = ContentReference & { _status?: 'draft' | 'published'; visible?: boolean; approvedForPublication?: boolean }
const reservedSegments = new Set(['admin', 'api', 'next', 'en'])
const reservedPageSlugs = new Set([
  'home', 'rezervare', 'booking', 'contact', 'confidentialitate', 'cookies', 'termeni',
  'solista-nunta', 'solista-evenimente-corporate', 'ghiduri', 'formate', 'parteneri', 'studii-de-caz',
  'artisti', 'evenimente-reale', 'instrumente',
])
export function contentHubPath(collection: Exclude<ContentCollection, 'pages'>, locale: 'ro' | 'en'): string | null {
  if (!Object.hasOwn(bases, collection) || !bases[collection] || (locale !== 'ro' && locale !== 'en')) return null
  return `${locale === 'en' ? '/en' : ''}${bases[collection]}`
}
export function contentPath({ collection, slug, locale }: ContentReference): string | null {
  if ((locale !== 'ro' && locale !== 'en') || !Object.hasOwn(bases, collection)) return null
  if (typeof slug !== 'string' || slug.length > 180 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || reservedSegments.has(slug)) return null
  if (collection === 'pages' && reservedPageSlugs.has(slug)) return null
  return `${locale === 'en' ? '/en' : ''}${bases[collection]}/${slug}`
}
export function publicContentPath(reference: PublicContentReference): string | null {
  if (reference._status !== 'published' || reference.visible !== true || reference.approvedForPublication !== true) return null
  return contentPath(reference)
}
