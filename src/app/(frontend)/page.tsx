import { HomePage } from '@/components/site/HomePage'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { jsonLD, pageMetadata, structuredData } from '@/lib/seo'
export const metadata = pageMetadata(
  'Brigitta · Solistă pentru nunți și evenimente',
  'Brigitta, voce live pentru nunți, botezuri, evenimente corporate și petreceri private. Muzică românească și internațională. Pachete de la 450 €.',
  '/',
)
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <HomePage />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLD(
            structuredData('/', 'Brigitta · Solistă pentru nunți și evenimente', true),
          ),
        }}
      />
    </>
  )
}
