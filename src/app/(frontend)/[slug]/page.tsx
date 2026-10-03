import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { BookingForm } from '@/components/site/BookingForm'
import { ContentPage } from '@/components/site/ContentPage'
import { LegalPage } from '@/components/site/LegalPage'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { legalCopy } from '@/lib/site'
import { getCMS, getPublicPages, getSiteContent } from '@/lib/cms'
import { routeAliases } from '@/lib/editorial'
import { jsonLD, pageMetadata, structuredData } from '@/lib/seo'
export const revalidate = 60
const legalKey = { confidentialitate: 'privacy', cookies: 'cookies', termeni: 'terms' } as const
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = await getSiteContent()
  if (slug === 'rezervare')
    return pageMetadata(
      'Contact și disponibilitate · Brigitta',
      'Verifică disponibilitatea Brigittei pentru eveniment. Trimite data, localitatea și preferințele pentru un program vocal live și o ofertă personalizată.',
      '/rezervare',
      c,
    )
  const page = (await getPublicPages('ro', true)).find((p) => p.slug === slug)
  if (page)
    return pageMetadata(page.title, page.description, `/${slug}`, c, {
      ...page.seo,
      noindex: page.seo?.noindex || (page.type === 'media' && !c.media.length),
    })
  const legal = legalKey[slug as keyof typeof legalKey]
  if (legal)
    return pageMetadata(
      legalCopy[legal].title,
      legalCopy[legal].text.slice(0, 155),
      `/${slug}`,
      c,
      { noindex: true },
    )
  return { robots: { index: false, follow: false } }
}
export default async function RomanianPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ pachet?: string; selectie?: string }>
}) {
  const { slug } = await params
  if (routeAliases[slug]) permanentRedirect(routeAliases[slug])
  const c = await getSiteContent()
  const pages = await getPublicPages('ro', true)
  const page = pages.find((p) => p.slug === slug)
  const { pachet, selectie } = await searchParams
  const selected = c.packages.find((p) => p.id === selectie)
  const initialPackage =
    selected?.formValue ||
    (c.packages.some((p) => p.formValue === pachet) || pachet === 'custom' ? pachet! : 'unsure')
  let content: React.ReactNode
  let title = 'Verifică disponibilitatea'
  if (slug === 'rezervare')
    content = (
      <section className="booking-page">
        <div className="booking-intro">
          <p className="eyebrow">Contact / Booking</p>
          <h1>{c.booking.title}</h1>
          <p>{c.booking.description}</p>
          {c.artist.phone && (
            <a className="text-link" href={`tel:${c.artist.phone.replace(/[^+\d]/g, '')}`}>
              Sună acum: {c.artist.phone} ↗
            </a>
          )}
          {c.artist.email && (
            <p>
              <a href={`mailto:${c.artist.email}`}>{c.artist.email}</a>
            </p>
          )}
        </div>
        <BookingForm
          key={initialPackage}
          content={{ booking: c.booking, packages: c.packages, events: c.events }}
          initialPackage={initialPackage}
          selectedPackageName={selected?.name}
        />
      </section>
    )
  else if (page) {
    title = page.title
    const available = new Set(pages.map((p) => p.slug))
    content = (
      <ContentPage
        page={{ ...page, related: page.related.filter((p) => available.has(p.slug)) }}
        content={c}
      />
    )
  } else if (legalKey[slug as keyof typeof legalKey]) {
    const item = legalCopy[legalKey[slug as keyof typeof legalKey]]
    title = item.title
    const cms = await getCMS()
    const privacy = cms
      ? await cms.findGlobal({ slug: 'privacy-settings', overrideAccess: true })
      : null
    const pending =
      privacy?.completed && (slug === 'confidentialitate' || slug === 'termeni')
        ? `Operator: ${privacy.operatorName}. Contact: ${privacy.privacyContact}. ${privacy.retentionRule}`
        : item.pending
    content = <LegalPage {...item} pending={pending} />
  } else {
    const cms = await getCMS()
    if (cms) {
      const redirects = await cms.find({
        collection: 'redirects',
        limit: 1,
        overrideAccess: false,
        where: { and: [{ from: { equals: `/${slug}` } }, { active: { equals: true } }] },
      })
      const destination = redirects.docs[0]?.to
      if (destination && /^\/(?!\/)[a-z0-9/-]+$/.test(destination) && destination !== `/${slug}`) {
        if (['302', '307'].includes(redirects.docs[0].code || '')) redirect(destination)
        permanentRedirect(destination)
      }
    }
    notFound()
  }
  return (
    <>
      <SiteHeader />
      <main id="main">{content}</main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLD(
            structuredData(`/${slug}`, title, page?.faqs || false, c, Boolean(page?.showPackages)),
          ),
        }}
      />
    </>
  )
}
