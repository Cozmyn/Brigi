'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const consentKey = 'brigitta:analytics-consent'
let memoryChoice: string | null = null
const snapshot = () => {
  try {
    return localStorage.getItem(consentKey) ?? memoryChoice
  } catch {
    return memoryChoice ?? 'no'
  }
}
const serverSnapshot = () => 'loading'
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback)
  window.addEventListener('brigitta:consent', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('brigitta:consent', callback)
  }
}
const respectsPrivacy = () =>
  navigator.doNotTrack === '1' ||
  Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl)
export function Analytics({ enabled }: { enabled: boolean }) {
  const pathname = usePathname()
  const choice = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener('brigitta:privacy', show)
    return () => window.removeEventListener('brigitta:privacy', show)
  }, [])
  useEffect(() => {
    if (!enabled || choice !== 'yes' || respectsPrivacy()) return
    const send = (event: string) => {
      let referrer = ''
      let campaign = ''
      try {
        const currentCampaign = new URLSearchParams(location.search).get('utm_campaign') || ''
        if (/^[a-zA-Z0-9_-]{1,80}$/.test(currentCampaign))
          sessionStorage.setItem('brigitta:campaign', currentCampaign)
        campaign = sessionStorage.getItem('brigitta:campaign') || ''
        if (document.referrer) {
          const host = new URL(document.referrer).hostname
          if (host !== location.hostname) referrer = host
        }
      } catch {
        /* Optional statistics never block navigation. */
      }
      void fetch('/api/analytics', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true, event, path: pathname, referrer, campaign }),
      }).catch(() => {})
    }
    let visited = false
    try {
      visited = sessionStorage.getItem('brigitta:visit') === 'yes'
      sessionStorage.setItem('brigitta:visit', 'yes')
    } catch {
      visited = true
    }
    if (!visited) send('visit')
    send('page_view')
    const listener = (event: Event) => send((event as CustomEvent<{ event: string }>).detail.event)
    window.addEventListener('brigitta:analytics', listener)
    return () => window.removeEventListener('brigitta:analytics', listener)
  }, [enabled, choice, pathname])
  if (!enabled || (choice !== null && !open)) return null
  const choose = (value: string) => {
    try {
      localStorage.setItem(consentKey, value)
      if (value === 'no')
        for (const key of ['brigitta:visit', 'brigitta:campaign', 'brigitta:attribution'])
          sessionStorage.removeItem(key)
    } catch {
      /* Consent is still honored for this page. */
    }
    memoryChoice = value
    window.dispatchEvent(new Event('brigitta:consent'))
    setOpen(false)
  }
  return (
    <aside className="privacy-choice" aria-label="Preferințe de confidențialitate">
      <p>
        <strong>Ne ajuți să înțelegem ce este util?</strong>
        <br />
        Cu acordul tău, numărăm vizite și interacțiuni. Fără profiluri personale.{' '}
        <Link href="/cookies">Detalii</Link>
      </p>
      <div>
        <button type="button" onClick={() => choose('no')}>
          Refuz
        </button>
        <button type="button" onClick={() => choose('yes')}>
          Accept statistici
        </button>
      </div>
    </aside>
  )
}
export function PrivacyPreferences() {
  return (
    <button
      className="privacy-link"
      onClick={() => window.dispatchEvent(new Event('brigitta:privacy'))}
    >
      Preferințe statistici
    </button>
  )
}
