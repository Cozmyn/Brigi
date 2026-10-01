import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BookingForm } from '@/components/site/BookingForm'
import { ContentPage } from '@/components/site/ContentPage'
import { LegalPage } from '@/components/site/LegalPage'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { internalPages, legalCopy, siteContent } from '@/lib/site'
import { jsonLD, pageMetadata, structuredData } from '@/lib/seo'
const pageKey = {
  'evenimente-private': 'private',
  'nunti-si-ceremonii': 'weddings',
  'evenimente-corporate': 'corporate',
  'video-live': 'video',
  repertoriu: 'repertoire',
  despre: 'about',
} as const
const legalKey = { confidentialitate: 'privacy', cookies: 'cookies', termeni: 'terms' } as const
const redirects: Record<string, string> = {
  contact: '/rezervare',
  'solista-nunta': '/nunti-si-ceremonii',
  'solista-evenimente-corporate': '/evenimente-corporate',
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'rezervare')
    return pageMetadata('Verifică disponibilitatea', siteContent.booking.description, '/rezervare')
  const key = pageKey[slug as keyof typeof pageKey]
  if (key) {
    const metadata = pageMetadata(internalPages[key].title, internalPages[key].text, `/${slug}`)
    if (key === 'video' && !siteContent.media.length)
      metadata.robots = { index: false, follow: true }
    return metadata
  }
  const legal = legalKey[slug as keyof typeof legalKey]
  if (legal)
    return pageMetadata(legalCopy[legal].title, legalCopy[legal].text.slice(0, 155), `/${slug}`)
  return { robots: { index: false, follow: false } }
}
export default async function RomanianPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ pachet?: string }>
}) {
  const { slug } = await params
  if (redirects[slug]) permanentRedirect(redirects[slug])
  const { pachet } = await searchParams
  const initialPackage = ['1x45', '2x45', '3x45', 'custom'].includes(pachet || '')
    ? pachet!
    : 'unsure'
  let content: React.ReactNode
  let title = 'Verifică disponibilitatea'
  if (slug === 'rezervare')
    content = (
      <section className="booking-page">
        <div className="booking-intro">
          <p className="eyebrow">Verifică disponibilitatea</p>
          <h1>
            Seara ta începe
            <br />
            <em>cu o conversație.</em>
          </h1>
          <p>{siteContent.booking.description}</p>
        </div>
        <BookingForm key={initialPackage} initialPackage={initialPackage} />
      </section>
    )
  else if (pageKey[slug as keyof typeof pageKey]) {
    const item = internalPages[pageKey[slug as keyof typeof pageKey]]
    title = item.title
    content = <ContentPage {...item} />
  } else if (legalKey[slug as keyof typeof legalKey]) {
    const item = legalCopy[legalKey[slug as keyof typeof legalKey]]
    title = item.title
    content = <LegalPage {...item} />
  } else notFound()
  return (
    <>
      <SiteHeader />
      <main id="main">{content}</main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(structuredData(`/${slug}`, title)) }}
      />
    </>
  )
}
