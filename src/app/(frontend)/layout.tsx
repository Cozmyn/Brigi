import type { Metadata } from 'next'
import { Instrument_Serif, Manrope } from 'next/font/google'
import './globals.css'

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', variable: '--font-serif' })
const sans = Manrope({ subsets: ['latin'], variable: '--font-sans' })

const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: 'Brigitta | Solistă pentru evenimente private', template: '%s | Brigitta' },
  description: 'Voce live pentru nunți, ceremonii, recepții și evenimente corporate.',
  robots: process.env.NODE_ENV === 'production' ? { index: true, follow: true } : { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html className={`${serif.variable} ${sans.variable}`} lang="ro"><body>{children}</body></html>
}
