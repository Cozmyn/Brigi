import { isProductionReady, siteURL } from './site'

export type Locale = 'ro' | 'en'
export type CanonicalSettings = {
  canonical?: string | null
  noindex?: boolean | null
}
export type LocalizedDocument = {
  id: number
  locale: Locale
  path: string
  seo?: CanonicalSettings | null
}
export type LanguageAlternates = { 'ro-RO': string; 'en-GB': string }

/** Normalize same-origin relative/absolute canonical without query or fragment. */
export function normalizedInternalURL(path: string, canonical: string = path): string | null {
  try {
    if (!path.startsWith('/') || path.startsWith('//') || /[\\\r\n]/.test(path)) return null
    if (!canonical.trim() || /[\\\r\n]/.test(canonical)) return null
    const origin = new URL(siteURL)
    const expected = new URL(path, origin)
    const actual = new URL(canonical, origin)
    if (expected.origin !== origin.origin || actual.origin !== origin.origin ||
        actual.search || actual.hash || actual.username || actual.password ||
        expected.search || expected.hash) return null
    return actual.href
  } catch { return null }
}
export function isSelfCanonical(path: string, seo?: CanonicalSettings | null) {
  if (seo?.noindex) return false
  const url = normalizedInternalURL(path, seo?.canonical || path)
  return url !== null && url === new URL(path, siteURL).href
}

/** Never connect two different documents merely because their slugs happen to match. */
export function verifiedLanguagePair(
  current: LocalizedDocument, sibling: LocalizedDocument | null | undefined,
  ready = isProductionReady,
): LanguageAlternates | undefined {
  if (!ready || !sibling || current.id !== sibling.id ||
      !Number.isSafeInteger(current.id) || current.id < 1 ||
      current.locale === sibling.locale ||
      !(['ro', 'en'] as string[]).includes(current.locale) ||
      !(['ro', 'en'] as string[]).includes(sibling.locale) ||
      !isSelfCanonical(current.path, current.seo) ||
      !isSelfCanonical(sibling.path, sibling.seo)) return undefined
  const ro = current.locale === 'ro' ? current : sibling
  const en = current.locale === 'en' ? current : sibling
  return { 'ro-RO': new URL(ro.path, siteURL).href, 'en-GB': new URL(en.path, siteURL).href }
}

/** For known translated static routes, requiring both routes to be indexable. */
export function verifiedStaticPair(
  roPath: string, enPath: string,
  roSEO?: CanonicalSettings | null, enSEO?: CanonicalSettings | null,
  ready = isProductionReady,
): LanguageAlternates | undefined {
  if (!ready || !isSelfCanonical(roPath, roSEO) || !isSelfCanonical(enPath, enSEO)) return undefined
  return { 'ro-RO': new URL(roPath, siteURL).href, 'en-GB': new URL(enPath, siteURL).href }
}

/** Hubs are paired only when both have at least one genuinely translated, published document. */
export function verifiedHubPair(
  ro: LocalizedDocument[], en: LocalizedDocument[], roHub: string, enHub: string,
  ready = isProductionReady,
): LanguageAlternates | undefined {
  if (!ready || !ro.some((item) =>
    en.some((sibling) => verifiedLanguagePair(item, sibling, ready)))) return undefined
  return verifiedStaticPair(roHub, enHub, undefined, undefined, ready)
}
