import type { Metadata } from 'next'
import { isProductionReady, isPublicURL, siteContent, type SiteContent, siteURL } from './site'
export type SEOOverrides = {
  title?: string | null
  description?: string | null
  canonical?: string | null
  noindex?: boolean | null
  ogTitle?: string | null
  ogDescription?: string | null
  image?: { src: string; alt: string }
}
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  c: SiteContent = siteContent,
  seo?: SEOOverrides,
): Metadata {
  title = seo?.title || title
  description = seo?.description || description
  const canonical = seo?.canonical || path
  const social = seo?.image || c.photos.social
  const images = social.src
    ? [{ url: social.src, alt: social.alt, width: 1200, height: 630 }]
    : [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'Brigitta · Muzică live pentru evenimente',
        },
      ]
  return {
    metadataBase: new URL(siteURL),
    title: { absolute: title.includes('Brigitta') ? title : `${title} | Brigitta` },
    description,
    alternates: { canonical },
    robots: { index: isProductionReady && !seo?.noindex, follow: true },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: canonical,
      siteName: c.artist.name,
      locale: path.startsWith('/en') ? 'en_GB' : 'ro_RO',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((image) => image.url),
    },
  }
}
export function structuredData(
  path = '/',
  title = 'Brigitta · Muzică live pentru evenimente',
  includeFAQ: boolean | SiteContent['faqs'] = false,
  c: SiteContent = siteContent,
  includeOffers = true,
) {
  const personID = `${siteURL}/#brigitta`
  const siteID = `${siteURL}/#website`
  const serviceID = `${siteURL}/#live-performance`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Person',
      '@id': personID,
      name: c.artist.name,
      url: siteURL,
      jobTitle: 'Solistă / vocalistă live',
      description: c.artist.biography,
      ...(c.artist.phone ? { telephone: c.artist.phone } : {}),
      ...(c.artist.email ? { email: c.artist.email } : {}),
      ...(Object.values(c.artist.social).some(isPublicURL)
        ? { sameAs: Object.values(c.artist.social).filter(isPublicURL) }
        : {}),
    },
    {
      '@type': 'WebSite',
      '@id': siteID,
      name: c.artist.name,
      url: siteURL,
      inLanguage: ['ro-RO', 'en-GB'],
      publisher: { '@id': personID },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteURL}${path}#webpage`,
      url: `${siteURL}${path}`,
      name: title,
      inLanguage: path.startsWith('/en') ? 'en-GB' : 'ro-RO',
      isPartOf: { '@id': siteID },
      about: { '@id': personID },
    },
    {
      '@type': 'Service',
      '@id': serviceID,
      name: 'Muzică live pentru evenimente',
      serviceType: 'Prestație vocală live cu repertoriu românesc și internațional',
      provider: { '@id': personID },
      ...(c.artist.serviceArea ? { areaServed: c.artist.serviceArea } : {}),
      ...(includeOffers
        ? {
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Pachete live Brigitta',
              itemListElement: c.packages.map((p) => ({
                '@type': 'Offer',
                name: p.name,
                url: `${siteURL}/rezervare?pachet=${p.formValue}`,
                priceSpecification: {
                  '@type': 'PriceSpecification',
                  ...(p.fromPricing ? { minPrice: p.priceFrom } : { price: p.priceFrom }),
                  priceCurrency: p.currency,
                },
                description: `${p.sets} × ${p.duration} minute. ${p.description} ${p.fromPricing ? 'Preț de pornire; oferta finală este personalizată.' : ''}`,
                itemOffered: {
                  '@type': 'Service',
                  name: `${p.name} · ${p.sets} × ${p.duration} minute`,
                  provider: { '@id': personID },
                },
              })),
            },
          }
        : {}),
    },
  ]
  if (includeFAQ && (Array.isArray(includeFAQ) ? includeFAQ.length : c.faqs.length))
    graph.push({
      '@type': 'FAQPage',
      '@id': `${siteURL}${path}#faq`,
      mainEntity: (Array.isArray(includeFAQ) ? includeFAQ : c.faqs).map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  if (path !== '/')
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Brigitta', item: siteURL },
        { '@type': 'ListItem', position: 2, name: title, item: `${siteURL}${path}` },
      ],
    })
  return { '@context': 'https://schema.org', '@graph': graph }
}
export function jsonLD(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
