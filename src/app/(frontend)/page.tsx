import { HomePage } from '@/components/site/HomePage'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { getHomeSEO, getSiteContent } from '@/lib/cms'
import { verifiedStaticPair } from '@/lib/hreflang'
import { jsonLD, pageMetadata, structuredData } from '@/lib/seo'
export const revalidate = 60
export async function generateMetadata() {
  const [c, roSEO, enSEO] = await Promise.all([
    getSiteContent(), getHomeSEO('ro'), getHomeSEO('en'),
  ])
  return pageMetadata(
    'Brigitta · Solistă vocală pentru nunți și evenimente',
    'Brigitta, solistă vocală pentru nunți, botezuri, corporate și petreceri private. Repertoriu românesc și internațional. Verifică disponibilitatea.',
    '/',
    c,
    { ...roSEO, languages: verifiedStaticPair('/', '/en', roSEO, enSEO) },
  )
}
export default async function Page() {
  const c = await getSiteContent()
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
            structuredData('/', 'Brigitta · Solistă vocală pentru evenimente', true, c),
          ),
        }}
      />
    </>
  )
}
