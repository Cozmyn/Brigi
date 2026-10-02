import Link from 'next/link'
import { getSiteContent } from '@/lib/cms'
import { type Locale } from '@/lib/site'
import { TrackedLink } from './TrackedLink'
export async function SiteHeader({ locale: _locale }: { locale?: Locale }) {
  const siteContent = await getSiteContent()
  return (
    <header className="site-header">
      <Link className="skip-link" href="#main">
        Sari la conținut
      </Link>
      <Link className="wordmark" href="/" aria-label="Brigitta, pagina principală">
        BRIGITTA
        <span className="brand-dot" />
      </Link>
      <nav className="desktop-nav" aria-label="Navigație principală">
        {siteContent.navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <TrackedLink className="header-cta" href={siteContent.headerCTA.href}>
        {siteContent.headerCTA.label || siteContent.cta.quote}
        <span aria-hidden="true">↗</span>
      </TrackedLink>
      <details className="mobile-menu">
        <summary aria-label="Deschide navigația">
          <span />
          <span />
        </summary>
        <nav aria-label="Navigație mobilă">
          {siteContent.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/despre">Despre Brigitta</Link>
          <Link href="/rezervare">{siteContent.cta.availability}</Link>
        </nav>
      </details>
    </header>
  )
}
