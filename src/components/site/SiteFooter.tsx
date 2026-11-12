import Link from 'next/link'
import { PrivacyPreferences } from './Analytics'
import { getSiteContent } from '@/lib/cms'
import { getPublicVideos } from '@/lib/public-videos'
import { isPublicURL, type Locale } from '@/lib/site'
import { TrackedLink } from './TrackedLink'
export async function SiteFooter({ locale: _locale }: { locale?: Locale }) {
  const [siteContent, videos] = await Promise.all([getSiteContent(), getPublicVideos('ro')])
  const { artist, cta } = siteContent
  return (
    <>
      <footer className="site-footer">
        <div className="footer-top">
          <Link className="wordmark" href="/">
            BRIGITTA
            <span className="brand-dot" />
          </Link>
          <p>{siteContent.footerText}</p>
          <div className="footer-contact">
            {artist.phone && (
              <TrackedLink event="click_phone" href={`tel:${artist.phone.replace(/[^+\d]/g, '')}`}>
                {artist.phone}
              </TrackedLink>
            )}
            {artist.email && <Link href={`mailto:${artist.email}`}>{artist.email}</Link>}
            {artist.whatsapp && <TrackedLink event="click_whatsapp"
              href={`https://wa.me/${artist.whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp pentru oferte ↗
            </TrackedLink>}
            {Object.entries(artist.social)
              .filter(([, url]) => isPublicURL(url))
              .map(([name, url]) => (
                <Link key={name} href={url} target="_blank" rel="noopener noreferrer">
                  {name}
                </Link>
              ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Brigitta</span>
          <nav aria-label="Informații și pagini">
            <Link href="/despre">Despre</Link>
            <Link href="/instrumente">Instrumente</Link>
            <Link href="/nunti-si-ceremonii">Nunți</Link>
            <Link href="/solista-botez">Botezuri</Link>
            <Link href="/evenimente-corporate">Corporate</Link>
            <Link href="/muzica-live-evenimente">Ghid muzică live</Link>
            {!!videos.length && <Link href="/video">Video</Link>}
            <Link href="/confidentialitate">Confidențialitate</Link>
            <Link href="/cookies">Cookies</Link>
            {siteContent.analyticsEnabled && <PrivacyPreferences />}
            <Link href="/termeni">Termeni</Link>
          </nav>
          <Link href="#main">Sus ↑</Link>
        </div>
      </footer>
      <div className="mobile-contact" aria-label="Contact rapid">
        {artist.phone && (
          <TrackedLink event="click_phone" href={`tel:${artist.phone.replace(/[^+\d]/g, '')}`}>
            Sună <span aria-hidden="true">↗</span>
          </TrackedLink>
        )}
        <TrackedLink href="/rezervare">
          {cta.quote}
          <span aria-hidden="true">↗</span>
        </TrackedLink>
      </div>
    </>
  )
}
