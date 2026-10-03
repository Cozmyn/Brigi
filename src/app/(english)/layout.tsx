import { Bodoni_Moda, Manrope } from 'next/font/google'
import { getSiteContent } from '@/lib/cms'
import { siteURL } from '@/lib/site'
import { Analytics } from '@/components/site/Analytics'
import '../(frontend)/globals.css'
const serif = Bodoni_Moda({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})
const sans = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' })
export const metadata = { metadataBase: new URL(siteURL) }
export default async function EnglishLayout({ children }: { children: React.ReactNode }) {
  const c = await getSiteContent()
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <Analytics enabled={c.analyticsEnabled} />
      </body>
    </html>
  )
}
