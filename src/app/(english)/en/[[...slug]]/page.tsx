import Link from 'next/link'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCMS, getHomeSEO, getPublicPages, getSiteContent } from '@/lib/cms'
import { pageMetadata, jsonLD, structuredData } from '@/lib/seo'
import { ArtistVisual } from '@/components/site/ArtistVisual'
import { BookingForm } from '@/components/site/BookingForm'
import { RichText } from '@/components/site/RichText'
import { Packages } from '@/components/site/Packages'
type Props = {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{ pachet?: string; selectie?: string }>
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug?.join('/') || ''
  const c = await getSiteContent('en')
  const page = (await getPublicPages('en', true)).find((p) => p.slug === slug)
  if (slug && slug !== 'booking' && !page) return { robots: { index: false, follow: false } }
  const seo = !slug ? await getHomeSEO('en') : page?.seo
  const result = pageMetadata(
    page?.title ||
      (slug ? 'Contact Brigitta / Check availability' : 'Brigitta / Professional live vocalist'),
    page?.description || c.hero.description,
    `/en${slug ? `/${slug}` : ''}`,
    c,
    seo,
  )
  return { ...result, openGraph: { ...result.openGraph, locale: 'en_GB' } }
}
export default async function EnglishPage({ params, searchParams }: Props) {
  const slug = (await params).slug?.join('/') || ''
  const c = await getSiteContent('en')
  const ro = await getSiteContent()
  const pages = await getPublicPages('en', true)
  const page = pages.find((p) => p.slug === slug)
  if (slug && slug !== 'booking' && !page) {
    const cms = await getCMS()
    const routes = cms
      ? await cms.find({
          collection: 'redirects',
          overrideAccess: false,
          where: { from: { equals: `/en/${slug}` } },
          limit: 1,
        })
      : null
    const rule = routes?.docs[0]
    if (rule && /^\/(?!\/)[a-z0-9/-]*$/.test(rule.to) && rule.to !== `/en/${slug}`) {
      if (rule.code === '302' || rule.code === '307') redirect(rule.to)
      permanentRedirect(rule.to)
    }
    notFound()
  }
  const { pachet, selectie } = await searchParams
  const selected = c.packages.find((p) => p.id === selectie)
  const graph = structuredData(
    `/en${slug ? `/${slug}` : ''}`,
    page?.title || 'Brigitta / Live vocalist',
    page?.faqs || false,
    c,
    Boolean(page?.showPackages) || !slug,
  )
  for (const entity of graph['@graph'])
    if (entity['@type'] === 'WebPage') entity.inLanguage = 'en-GB'
  return (
    <>
      <header className="site-header">
        <Link className="wordmark" href="/en">
          BRIGITTA
          <span className="brand-dot" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/en">Home</Link>
          <Link href="/en#pachete">Packages</Link>
          <Link href="/">Română</Link>
        </nav>
        <Link className="header-cta" href="/en/booking">
          Check availability ↗
        </Link>
      </header>
      <main id="main">
        {!slug ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <p className="eyebrow">{c.hero.kicker}</p>
                <h1 className="hero-title">
                  <span className="hero-name">{c.hero.title[0]}</span>
                  <br />
                  <em>{c.hero.title[1]}</em>
                </h1>
                <p className="hero-description">{c.hero.description}</p>
                <div className="hero-actions">
                  <Link className="button" href="/en/booking">
                    Check availability ↗
                  </Link>
                  {c.artist.phone && (
                    <a className="text-link" href={`tel:${c.artist.phone.replace(/[^+\d]/g, '')}`}>
                      Call now ↗
                    </a>
                  )}
                </div>
              </div>
              <ArtistVisual priority photo={c.photos.hero.src ? c.photos.hero : ro.photos.hero} />
            </section>
            <section className="section">
              <p className="eyebrow">Brigitta / Live vocals</p>
              <h2>Romanian and international music.</h2>
              <p>{c.artist.biography}</p>
              {pages.length > 0 && (
                <div className="event-list">
                  {pages.map((p) => (
                    <Link className="event-row" key={p.slug} href={`/en/${p.slug}`}>
                      <h3>{p.title}</h3>
                      <p>{p.intro}</p>
                      <span>↗</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            <Packages content={c} locale="en" />
          </>
        ) : page ? (
          <article className="inner-page">
            <section className="inner-hero">
              <nav className="breadcrumbs">
                <Link href="/en">Brigitta</Link>
                <span>/</span>
                <span>{page.title}</span>
              </nav>
              <p className="eyebrow">Brigitta / Live vocalist</p>
              <h1>{page.h1}</h1>
              <p className="intro">{page.intro}</p>
              <Link className="text-link" href="/en/booking">
                {page.ctaLabel || 'Check availability'} ↗
              </Link>
            </section>
            <div className="section editorial-body">
              {page.sections.map((s, i) => (
                <section className="editorial-section" key={i}>
                  <h2>{s.heading}</h2>
                  {s.body.split('\n\n').map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {s.image && <ArtistVisual photo={s.image} variant="editorial" />}
                </section>
              ))}
              {!!page.richText && <RichText data={page.richText} />}
              {page.faqs.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
            {page.showPackages && <Packages content={c} locale="en" />}
            <section className="section related-section">
              <div className="related-grid">
                {page.related
                  .filter((p) => pages.some((x) => x.slug === p.slug))
                  .map((p) => (
                    <Link key={p.slug} href={`/en/${p.slug}`}>
                      {p.title} ↗
                    </Link>
                  ))}
              </div>
            </section>
          </article>
        ) : null}
        <section className="section booking-section">
          <div className="booking-intro">
            {slug === 'booking' ? <h1>{c.booking.title}</h1> : <h2>{c.booking.title}</h2>}
            <p>{c.booking.description}</p>
            {c.artist.phone && (
              <a className="contact-phone" href={`tel:${c.artist.phone.replace(/[^+\d]/g, '')}`}>
                {c.artist.phone}
              </a>
            )}
          </div>
          <BookingForm
            locale="en"
            content={c}
            initialPackage={selected?.formValue || pachet || 'unsure'}
            selectedPackageName={selected?.name}
          />
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <Link className="wordmark" href="/en">
            BRIGITTA
          </Link>
          <p>{c.footerText}</p>
          <div className="footer-contact">
            {c.artist.email && <a href={`mailto:${c.artist.email}`}>{c.artist.email}</a>}
            <Link href="/">Română</Link>
            <Link href="/confidentialitate" hrefLang="ro">
              Privacy notice (RO)
            </Link>
          </div>
        </div>
      </footer>
      <div className="mobile-contact">
        {c.artist.phone && <a href={`tel:${c.artist.phone.replace(/[^+\d]/g, '')}`}>Call now ↗</a>}
        <Link href="/en/booking">Request a quote ↗</Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(graph) }} />
    </>
  )
}
