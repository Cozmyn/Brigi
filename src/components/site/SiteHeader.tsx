import Link from 'next/link'
import { getSiteContent } from '@/lib/cms'
import { getPublicArticles } from '@/lib/public-articles'
import { type Locale } from '@/lib/site'
import { TrackedLink } from './TrackedLink'
export async function SiteHeader({ locale: _locale }: { locale?: Locale }) {
  const [siteContent, guides] = await Promise.all([getSiteContent(), getPublicArticles('ro')])
  const navigation = [...siteContent.navigation]
  if (guides.length && !navigation.some((item) => item.href.replace(/\/$/, '') === '/ghiduri'))
    navigation.push({ label: 'Ghiduri', href: '/ghiduri' })
  return (
    <header className="site-header">
      <Link className="skip-link" href="#main">Sari la conținut</Link>
      <Link className="wordmark" href="/" aria-label="Brigitta, pagina principală">
        BRIGITTA<span className="brand-dot" />
      </Link>
      <nav className="desktop-nav" aria-label="Navigație principală">
        {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </nav>
      <TrackedLink className="header-cta" href={siteContent.headerCTA.href}>
        {siteContent.headerCTA.label || siteContent.cta.quote}<span aria-hidden="true">↗</span>
      </TrackedLink>
      <details className="mobile-menu">
        <summary aria-label="Deschide navigația"><span /><span /></summary>
        <nav aria-label="Navigație mobilă">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link href="/despre">Despre Brigitta</Link>
          <Link href="/rezervare">{siteContent.cta.availability}</Link>
        </nav>
      </details>
    </header>
  )
}
