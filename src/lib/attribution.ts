import { isPublicAnalyticsPath } from './analytics'

const consentKey = 'brigitta:analytics-consent'
const firstKey = 'brigitta:attribution:first'
const lastKey = 'brigitta:attribution:last'
type Touch = {
  landingPath: string
  referrer: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}
const campaigns: [string, keyof Touch, number][] = [
  ['utm_source', 'utmSource', 120],
  ['utm_medium', 'utmMedium', 120],
  ['utm_campaign', 'utmCampaign', 160],
  ['utm_content', 'utmContent', 160],
  ['utm_term', 'utmTerm', 160],
]
function consentGiven() {
  try {
    const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
    return localStorage.getItem(consentKey) === 'yes' && !gpc && navigator.doNotTrack !== '1'
  } catch { return false }
}
function read(key: string): Touch | null {
  try {
    const value = sessionStorage.getItem(key)
    if (!value) return null
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') return null
    const touch = parsed as Touch
    return touch.landingPath && isPublicAnalyticsPath(touch.landingPath) ? touch : null
  } catch { return null }
}
function currentTouch(): Touch | null {
  const path = location.pathname
  if (!isPublicAnalyticsPath(path)) return null
  let referrer = ''
  try {
    if (document.referrer) {
      const url = new URL(document.referrer)
      if (url.hostname !== location.hostname && /^[a-z0-9.-]{1,100}$/i.test(url.hostname))
        referrer = url.hostname
    }
  } catch { /* Ignore malformed referrer. */ }
  const value: Touch = { landingPath: path, referrer }
  const params = new URLSearchParams(location.search)
  for (const [parameter, field, max] of campaigns) {
    const raw = params.get(parameter)
    if (raw && raw.length <= max && /^[a-zA-Z0-9._-]+$/.test(raw))
      (value as Record<string, string>)[field] = raw
  }
  return value
}
export function clearAttribution() {
  try { for (const key of [firstKey, lastKey, 'brigitta:attribution']) sessionStorage.removeItem(key) }
  catch { /* Storage may be disabled. */ }
}
/** First/last qualified touch within this session, captured only AFTER consent. */
export function captureAttribution() {
  if (!consentGiven()) { clearAttribution(); return }
  const touch = currentTouch()
  if (!touch) return
  try {
    if (!read(firstKey)) sessionStorage.setItem(firstKey, JSON.stringify(touch))
    const previous = read(lastKey)
    const newCampaign = campaigns.some(([, field]) => Boolean(touch[field]))
    const newReferrer = Boolean(touch.referrer && touch.referrer !== previous?.referrer)
    if (!previous || newCampaign || newReferrer) sessionStorage.setItem(lastKey, JSON.stringify(touch))
  } catch { /* No silent pre-consent fallback. */ }
}
export function getInquiryAttribution(enabled = true) {
  if (!enabled || !consentGiven()) return { attributionConsent: false as const }
  captureAttribution()
  const first = read(firstKey), last = read(lastKey)
  return {
    attributionConsent: true as const,
    ...(last || {}),
    firstTouchLandingPath: first?.landingPath,
    firstTouchReferrer: first?.referrer,
    firstTouchUtmSource: first?.utmSource,
    firstTouchUtmMedium: first?.utmMedium,
    firstTouchUtmCampaign: first?.utmCampaign,
  }
}
