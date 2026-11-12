import Link from 'next/link'
import { getSiteContent } from '@/lib/cms'
import { getPublicArticles } from '@/lib/public-articles'
import { entityNavigation } from '@/lib/public-entities'
import { type Locale } from '@/lib/site'
import { TrackedLink } from './TrackedLink'
export async function SiteHeader({ locale: _locale }: { locale?: Locale }) {
  const [siteContent, guides, resources] = await Promise.all([getSiteContent(), getPublicArticles('ro'), entityNavigation('ro')])
  const navigation = [...siteContent.navigation]
  if (guides.length && !navigation.some((item) => item.href.replace(/\/$/, '') === '/ghiduri')) navigation.push({ label: 'Ghiduri', href: '/ghiduri' })
  const extra = resources.filter((link) => !navigation.some((item) => item.href.replace(/\/$/, '') === link.href))
  return <header className="site-header">
    <Link className="skip-link" href="#main">Sari la conținut</Link>
    <Link className="wordmark" href="/" aria-label="Brigitta, pagina principală">BRIGITTA<span className="brand-dot" /></Link>
    <nav className="desktop-nav" aria-label="Navigație principală">
      {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      {!!extra.length && <details style={{ position: 'relative' }}><summary style={{ cursor: 'pointer' }}>Explorează</summary>
        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, background: '#fff', color: '#222', padding: 16, minWidth: 220 }}>
          {extra.map((link) => <Link key={link.href} href={link.href} style={{ display: 'block', padding: '8px 0' }}>{link.label}</Link>)}
        </div></details>}
    </nav>
    <TrackedLink className="header-cta" href={siteContent.headerCTA.href}>{siteContent.headerCTA.label || siteContent.cta.quote}<span aria-hidden="true">↗</span></TrackedLink>
    <details className="mobile-menu"><summary aria-label="Deschide navigația"><span /><span /></summary><nav aria-label="Navigație mobilă">
      {[...navigation, ...extra].map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      <Link href="/despre">Despre Brigitta</Link><Link href="/rezervare">{siteContent.cta.availability}</Link>
    </nav></details>
  </header>
}
