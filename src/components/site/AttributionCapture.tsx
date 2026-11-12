'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureAttribution, clearAttribution } from '@/lib/attribution'

/** Mounted on every public page, not just the contact form. */
export function AttributionCapture({ enabled }: { enabled: boolean }) {
  const pathname = usePathname()
  useEffect(() => {
    if (!enabled) { clearAttribution(); return }
    captureAttribution()
    window.addEventListener('brigitta:consent', captureAttribution)
    return () => window.removeEventListener('brigitta:consent', captureAttribution)
  }, [enabled, pathname])
  return null
}
