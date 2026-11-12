export const contentNamespaces = {
  ghiduri: 'Ghiduri',
  formate: 'Formate muzicale',
  parteneri: 'Parteneri',
  'evenimente-reale': 'Evenimente reale',
} as const

export type ContentNamespace = keyof typeof contentNamespaces

const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const reservedSegments = new Set([
  'home', 'admin', 'api', 'next', 'en', 'rezervare', 'contact',
  'confidentialitate', 'cookies', 'termeni',
  'solista-nunta', 'solista-evenimente-corporate',
])

export function isContentNamespace(value: string): value is ContentNamespace {
  return Object.prototype.hasOwnProperty.call(contentNamespaces, value)
}

/** CMS slugs are relative: legacy slug or one approved namespace plus a slug. */
export function isContentSlug(value: unknown): value is string {
  if (typeof value !== 'string' || !value || value.length > 140) return false
  const parts = value.split('/')
  if (parts.some((part) => !segmentPattern.test(part) || reservedSegments.has(part)))
    return false
  if (parts.length === 1) return !isContentNamespace(parts[0])
  return parts.length === 2 && isContentNamespace(parts[0])
}

export function contentPath(slug: string): string {
  if (!isContentSlug(slug)) throw new Error('Invalid public content slug.')
  return `/${slug}`
}
