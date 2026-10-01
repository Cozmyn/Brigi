import type { Metadata } from 'next'
import { Instrument_Serif, Manrope } from 'next/font/google'
import { isProductionReady, siteURL } from '@/lib/site'
import './globals.css'
const serif = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})
const sans = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' })
export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: { default: 'Brigitta | Muzică live pentru evenimente', template: '%s | Brigitta' },
  description:
    'Solistă pentru nunți, botezuri și evenimente corporate. Repertoriu românesc și internațional, pachete live și cereri de disponibilitate.',
  robots: { index: isProductionReady, follow: isProductionReady },
  icons: { icon: '/favicon.svg', apple: '/apple-icon' },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${serif.variable} ${sans.variable}`} lang="ro">
      <body>{children}</body>
    </html>
  )
}
