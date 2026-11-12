import { serif, sans } from '@/lib/fonts'
import { getSiteContent } from '@/lib/cms'
import { siteURL } from '@/lib/site'
import { Analytics } from '@/components/site/Analytics'
import { AttributionCapture } from '@/components/site/AttributionCapture'
import { EnglishResources } from '@/components/site/EntityPages'
import '../(frontend)/globals.css'
export const dynamic = 'force-dynamic'
export const metadata = { metadataBase: new URL(siteURL) }
export default async function EnglishLayout({ children }: { children: React.ReactNode }) {
  const c = await getSiteContent()
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <EnglishResources />
        <Analytics enabled={c.analyticsEnabled} />
        <AttributionCapture enabled={c.analyticsEnabled} />
      </body>
    </html>
  )
}
