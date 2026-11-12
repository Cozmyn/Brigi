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
  const defaultTitle = 'Brigitta · Solistă vocală pentru nunți și evenimente'
  const title = 'Solistă nuntă și evenimente · Muzică live | Brigitta'
  const description = 'Brigitta, solistă vocală live pentru nunți, botezuri și evenimente corporate. Repertoriu românesc și internațional. Cere disponibilitatea și oferta.'
  const keepCustom = Boolean(roSEO?.title && roSEO.title !== defaultTitle)
  return pageMetadata(title, description, '/', c, {
    ...roSEO,
    title: keepCustom ? roSEO?.title : title,
    description: roSEO?.description && !roSEO.description.startsWith('Brigitta, solistă vocală pentru nunți')
      ? roSEO.description : description,
    languages: verifiedStaticPair('/', '/en', roSEO, enSEO),
  })
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
