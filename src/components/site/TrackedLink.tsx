'use client'
import Link from 'next/link'
import type { ComponentProps } from 'react'
export function track(event: string, detail: Record<string, string | number> = {}) {
  window.dispatchEvent(new CustomEvent('brigitta:analytics', { detail: { event, ...detail } }))
}
export function TrackedLink({
  event = 'click_contact_cta',
  detail,
  children,
  ...props
}: ComponentProps<typeof Link> & { event?: string; detail?: Record<string, string | number> }) {
  return (
    <Link {...props} onClick={() => track(event, detail)}>
      {children}
    </Link>
  )
}
