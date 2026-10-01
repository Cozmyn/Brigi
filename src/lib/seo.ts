import type { Metadata } from 'next'
import { isProductionReady, isPublicURL, siteContent as c, siteURL } from './site'
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const images = c.photos.social.src
    ? [{ url: c.photos.social.src, alt: c.photos.social.alt, width: 1200, height: 630 }]
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
    title,
    description,
    alternates: { canonical: path },
    robots: { index: isProductionReady, follow: isProductionReady },
    openGraph: {
      title,
      description,
      url: path,
      siteName: c.artist.name,
      locale: 'ro_RO',
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
  includeFAQ = false,
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
      inLanguage: 'ro-RO',
      publisher: { '@id': personID },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteURL}${path}#webpage`,
      url: `${siteURL}${path}`,
      name: title,
      inLanguage: 'ro-RO',
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
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Pachete live Brigitta',
        itemListElement: c.packages.map((p) => ({
          '@type': 'Offer',
          name: p.name,
          url: `${siteURL}/rezervare?pachet=${p.formValue}`,
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: p.priceFrom,
            priceCurrency: 'EUR',
          },
          description: `${p.sets} × ${p.duration} minute. ${p.description} Preț de pornire; oferta finală este personalizată.`,
          itemOffered: {
            '@type': 'Service',
            name: `${p.name} · ${p.sets} × ${p.duration} minute`,
            provider: { '@id': personID },
          },
        })),
      },
    },
  ]
  if (includeFAQ)
    graph.push({
      '@type': 'FAQPage',
      '@id': `${siteURL}/#faq`,
      mainEntity: c.faqs.map((faq) => ({
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
