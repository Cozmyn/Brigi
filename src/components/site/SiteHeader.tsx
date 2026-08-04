'use client'

import Link from 'next/link'
import { useState } from 'react'
import { copy, routeMap, type Locale } from '@/lib/site'

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)
  const c = copy[locale]
  const r = routeMap[locale]
  const links = [r.private, r.video, r.repertoire, r.about, `${r.home}#faq`]
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">{locale === 'ro' ? 'Sari la conținut' : 'Skip to content'}</a>
      <div className="header-inner">
        <Link className="wordmark" href={r.home} aria-label="Brigitta — home">BRIGITTA</Link>
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          <span aria-hidden="true">{open ? '×' : '☰'}</span><span className="sr-only">Menu</span>
        </button>
        <nav id="main-nav" className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Primary">
          {c.nav.map((label, index) => <Link key={label} href={links[index]} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="lang" href={locale === 'ro' ? '/en' : '/'} lang={locale === 'ro' ? 'en' : 'ro'}>{locale === 'ro' ? 'EN' : 'RO'}</Link>
          <Link className="button button-small" href={r.booking}>{c.cta}</Link>
        </div>
      </div>
    </header>
  )
}

