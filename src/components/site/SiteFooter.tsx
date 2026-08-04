import Link from 'next/link'
import { routeMap, type Locale } from '@/lib/site'

export function SiteFooter({ locale }: { locale: Locale }) {
  const r = routeMap[locale]
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><div className="wordmark footer-mark">BRIGITTA</div><p>{locale === 'ro' ? 'Voce live pentru evenimente private, nunți și seri corporate.' : 'Live vocals for private events, weddings and corporate evenings.'}</p></div>
        <nav aria-label="Footer"><Link href={r.privacy}>{locale === 'ro' ? 'Confidențialitate' : 'Privacy'}</Link><Link href={r.cookies}>Cookies</Link><Link href={r.terms}>{locale === 'ro' ? 'Termeni' : 'Terms'}</Link></nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Brigitta</span><span>{locale === 'ro' ? 'București și împrejurimi' : 'Bucharest and nearby'}</span></div>
    </footer>
  )
}

