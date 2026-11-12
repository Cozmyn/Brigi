import Link from 'next/link'
import { getSiteContent } from '@/lib/cms'
import { getPublicArticles } from '@/lib/public-articles'
import { getPublicVideos } from '@/lib/public-videos'
import { entityNavigation } from '@/lib/public-entities'
import { type Locale } from '@/lib/site'
import { TrackedLink } from './TrackedLink'

export async function SiteHeader({ locale: _locale }: { locale?: Locale }) {
  const [siteContent, guides, videos, resources] = await Promise.all([
    getSiteContent(), getPublicArticles('ro'), getPublicVideos('ro'), entityNavigation('ro'),
  ])
  const navigation = siteContent.navigation.filter((item) =>
    siteContent.packages.length > 0 || !/^\/?#pachete$/.test(item.href))
  if (!navigation.some((item) => item.href.replace(/\/$/, '') === '/instrumente'))
    navigation.push({ label: 'Instrumente', href: '/instrumente' })
  if (guides.length && !navigation.some((item) => item.href.replace(/\/$/, '') === '/ghiduri'))
    navigation.push({ label: 'Ghiduri', href: '/ghiduri' })
  const available = [
    ...(videos.length ? [{ label: 'Video', href: '/video' }] : []),
    ...resources,
  ]
  const extra = available.filter((item) =>
    !navigation.some((nav) => nav.href.replace(/\/$/, '') === item.href))
  return <header className="site-header">
    <Link className="skip-link" href="#main">Sari la conținut</Link>
    <Link className="wordmark" href="/" aria-label="Brigitta, pagina principală">BRIGITTA<span className="brand-dot" /></Link>
    <nav className="desktop-nav" aria-label="Navigație principală">
      {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      {!!extra.length && <details className="resource-menu">
        <summary>Explorează</summary>
        <div className="resource-menu-panel">
          {extra.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </div>
      </details>}
    </nav>
    <TrackedLink className="header-cta" href={siteContent.headerCTA.href}>
      {siteContent.headerCTA.label || siteContent.cta.quote}<span aria-hidden="true">↗</span>
    </TrackedLink>
    <details className="mobile-menu">
      <summary aria-label="Deschide meniul"><span /><span /><span className="sr-only">Meniu</span></summary>
      <nav aria-label="Navigație mobilă">
        {[...navigation, ...extra].map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        <Link href="/despre">Despre Brigitta</Link>
        <Link href="/rezervare">{siteContent.cta.availability}</Link>
      </nav>
    </details>
  </header>
}
