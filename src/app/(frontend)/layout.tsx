import type { Metadata } from 'next'
import { Bodoni_Moda, Manrope } from 'next/font/google'
import { isProductionReady, siteURL } from '@/lib/site'
import './globals.css'
import { Analytics } from '@/components/site/Analytics'
import { AttributionCapture } from '@/components/site/AttributionCapture'
import { getSiteContent } from '@/lib/cms'
export const dynamic = 'force-dynamic'
const serif = Bodoni_Moda({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})
const sans = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' })
const baseMetadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: { default: 'Brigitta | Muzică live pentru evenimente', template: '%s | Brigitta' },
  description:
    'Solistă pentru nunți, botezuri și evenimente corporate. Repertoriu românesc și internațional, pachete live și cereri de disponibilitate.',
  robots: { index: isProductionReady, follow: isProductionReady },
  icons: { icon: '/favicon.svg', apple: '/apple-icon' },
}
export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContent()
  return {
    ...baseMetadata,
    verification: {
      ...(c.verification.google ? { google: c.verification.google } : {}),
      ...(c.verification.bing ? { other: { 'msvalidate.01': c.verification.bing } } : {}),
    },
  }
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await getSiteContent()
  return (
    <html className={`${serif.variable} ${sans.variable}`} lang="ro">
      <body>
        {children}
        <Analytics enabled={c.analyticsEnabled} />
        <AttributionCapture enabled={c.analyticsEnabled} />
      </body>
    </html>
  )
}
