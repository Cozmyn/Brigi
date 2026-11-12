import { englishContent } from './english'
import { cache } from 'react'
import { draftMode, headers } from 'next/headers'
import { authenticate } from '@/cms/auth'
import { contentStore } from '@/cms/store'
import { databaseConfigured } from '@/cms/db'
import { siteContent, type SiteContent, isPublicURL } from './site'
import { editorialPages, type EditorialPage } from './editorial'
import type { Media, Page } from '@/cms/types'

export const getCMS = cache(async () => (databaseConfigured() ? contentStore : null))
export function publicPhoto(value: number | Media | null | undefined) {
  if (!value || typeof value !== 'object' || !value.approvedForPublication || !value.url)
    return undefined
  return {
    src: value.url,
    alt: value.alt,
    caption: value.caption || undefined,
    position: `${value.focalX ?? 50}% ${value.focalY ?? 50}%`,
  }
}
const nonempty = (value: string | null | undefined, fallback: string) => value?.trim() || fallback
export const getSiteContent = cache(async (locale: 'ro' | 'en' = 'ro'): Promise<SiteContent> => {
  const cms = await getCMS()
  if (!cms) {
    const fallback = structuredClone(locale === 'en' ? englishContent : siteContent)
    // Content bundled for editorial reference is not a verified commercial offer.
    fallback.packages = []
    fallback.visibility.credentials = false
    fallback.verifiedCredentials = []
    return fallback
  }
  const [settings, home, services, faqs, videos, songs, testimonials] = await Promise.all([
    cms.findGlobal({ slug: 'site-settings', locale, overrideAccess: false }),
    cms.findGlobal({ slug: 'home-settings', locale, depth: 1, overrideAccess: false }),
    cms.find({
      collection: 'services',
      locale,
      sort: 'order',
      limit: 50,
      overrideAccess: false,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { visible: { equals: true } },
          { priceApproved: { equals: true } },
        ],
      },
    }),
    cms.find({
      collection: 'faq',
      locale,
      sort: 'order',
      limit: 100,
      overrideAccess: false,
      where: { visible: { equals: true } },
    }),
    cms.find({
      collection: 'videos',
      locale,
      limit: 50,
      overrideAccess: false,
      where: { approvedForPublication: { equals: true } },
    }),
    cms.find({
      collection: 'repertoire',
      locale,
      sort: 'category',
      limit: 500,
      overrideAccess: false,
      where: { active: { equals: true } },
    }),
    cms.find({
      collection: 'testimonials',
      locale,
      limit: 30,
      overrideAccess: false,
      where: { and: [{ visible: { equals: true } }, { publicationConsent: { equals: true } }] },
    }),
  ])
  const [header, footer] = await Promise.all([
    cms.findGlobal({ slug: 'header', locale, overrideAccess: false }),
    cms.findGlobal({ slug: 'footer', locale, overrideAccess: false }),
  ])
  const c: SiteContent = structuredClone(locale === 'en' ? englishContent : siteContent)
  if (header.navigation?.length)
    c.navigation = header.navigation
      .filter((x) => /^\/(?!\/)/.test(x.url))
      .map((x) => ({ label: x.label, href: x.url }))
  c.headerCTA = {
    label: header.ctaLabel || '',
    href: header.ctaUrl && /^\/(?!\/)/.test(header.ctaUrl) ? header.ctaUrl : '/rezervare',
  }
  c.footerText = footer.description || c.footerText
  const shared =
    locale === 'en'
      ? await cms.findGlobal({ slug: 'site-settings', locale: 'ro', overrideAccess: false })
      : settings
  c.artist.phone = settings.phone || shared.phone || c.artist.phone
  c.artist.email = settings.email || shared.email || c.artist.email
  c.artist.biography = nonempty(settings.biography, c.artist.biography)
  c.artist.serviceArea = settings.geographicArea || ''
  if (settings.socialLinks)
    c.artist.social = Object.fromEntries(
      settings.socialLinks.filter((x) => isPublicURL(x.url)).map((x) => [x.label, x.url]),
    )
  c.verifiedCredentials = (home.verifiedCredentials || []).filter((item) => {
    if (!item?.label?.trim() || !item?.sourceURL?.trim()) return false
    try {
      const url = new URL(item.sourceURL)
      return url.protocol === 'https:' && !url.username && !url.password && !!url.hostname
    } catch { return false }
  }).map((item) => ({ label: item.label.trim(), sourceURL: item.sourceURL }))
  c.visibility = {
    media: home.showreelVisible !== false,
    testimonials: home.testimonialsVisible !== false,
    credentials: home.trustStripVisible === true && c.verifiedCredentials.length > 0,
  }
  c.analyticsEnabled = Boolean(settings.analyticsEnabled)
  c.verification = {
    google: settings.googleVerification || '',
    bing: settings.bingVerification || '',
  }
  c.hero.kicker = nonempty(home.heroEyebrow, c.hero.kicker)
  c.hero.title = [
    nonempty(home.heroTitle, c.hero.title[0]),
    nonempty(home.heroAccent, c.hero.title[1]),
  ]
  c.hero.description = nonempty(home.heroSubtitle, c.hero.description)
  c.cta.availability = nonempty(home.availabilityLabel, c.cta.availability)
  c.cta.quote = nonempty(home.quoteLabel, c.cta.quote)
  c.experience.title = nonempty(home.experienceTitle, c.experience.title)
  c.experience.description = nonempty(home.experienceText, c.experience.description)
  if (home.experienceMoments?.length)
    c.experience.moments = home.experienceMoments.map((x) => x.text)
  if (home.events?.length)
    c.events = home.events.map((x) => ({
      id: x.eventType,
      title: x.title,
      description: x.description,
      href: x.href,
    }))
  c.repertoire.title = nonempty(home.repertoireTitle, c.repertoire.title)
  c.repertoire.description = nonempty(home.repertoireText, c.repertoire.description)
  if (home.repertoireCategories?.length)
    c.repertoire.categories = home.repertoireCategories.map((x) => x.text)
  if (home.process?.length) c.process = home.process.map((x) => ({ title: x.title, text: x.text }))
  c.booking.title = nonempty(home.bookingTitle, c.booking.title)
  c.booking.description = nonempty(home.bookingText, c.booking.description)
  c.pricingNote = nonempty(home.pricingNote, c.pricingNote)
  c.headings = {
    events: nonempty(home.eventsTitle, c.headings.events),
    packages: nonempty(home.packagesTitle, c.headings.packages),
    process: nonempty(home.processTitle, c.headings.process),
    about: nonempty(home.aboutTitle, c.headings.about),
    faq: nonempty(home.faqTitle, c.headings.faq),
  }
  for (const slot of ['hero', 'live', 'portrait', 'social'] as const) {
    const photo = publicPhoto(home.photos?.[slot])
    if (photo) c.photos[slot] = photo
  }
  // Once the CMS is configured, hiding all packages/FAQs must really hide them.
  // Never expose built-in price examples when no approved service exists.
  c.packages = services.docs.map((p) => ({
      id: String(p.id),
      formValue: p.sets,
      name: p.name,
      sets: p.setCount || Number(p.sets[0]),
      duration: p.duration || 45,
      priceFrom: p.priceFromEUR,
      currency: p.currency || 'EUR',
      fromPricing: p.fromPricing !== false,
      description: p.description || '',
      detail: p.suitedFor || '',
      featured: Boolean(p.featured),
      features: (p.inclusions || []).map((x) => x.item),
    }))
  const faqCount = await cms.count({ collection: 'faq', locale, overrideAccess: true })
  if (faqCount.totalDocs)
    c.faqs = faqs.docs.map((x) => ({ question: x.question, answer: x.answer }))
  // Historic video records also need explicit visibility and recording rights.
  c.media = videos.docs
    .filter((x) => x.rightsConfirmed === true && x.visible === true &&
      x.approvedForPublication === true && isPublicURL(x.url || ''))
    .map((x) => ({
      title: x.title,
      url: x.url!,
      kind: /youtu(?:be|\.be)/.test(x.url!)
        ? 'youtube'
        : x.url!.includes('spotify.com')
          ? 'spotify'
          : 'link',
      recordingContext: x.recordingContext,
    }))
  c.songs = songs.docs.map((x) => ({
    song: x.song,
    originalArtist: x.originalArtist,
    category: x.category,
  }))
  c.testimonials = testimonials.docs.map((x) => ({
    quote: x.quote,
    author: x.author,
    context: [x.eventType, x.city, x.year].filter(Boolean).join(' · '),
  }))
  return c
})
export function cmsPage(doc: Page): EditorialPage {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    h1: doc.heroTitle,
    intro: doc.heroSummary || '',
    description: doc.seo?.description || doc.excerpt || doc.heroSummary || '',
    type: doc.pageType || 'editorial',
    sections: (doc.sections || []).map((x) => ({
      heading: x.heading,
      body: x.body,
      image: publicPhoto(x.image),
    })),
    faqs: (doc.faqs || []).map((x) => ({ question: x.question, answer: x.answer })),
    related: (doc.relatedPages || [])
      .filter(
        (p): p is Page =>
          typeof p === 'object' &&
          p._status === 'published' &&
          p.visible !== false &&
          p.approvedForPublication === true,
      )
      .map((p) => ({ slug: p.slug, title: p.title })),
    showPackages: Boolean(doc.showPackages),
    ctaLabel: doc.ctaLabel || undefined,
    serviceArea: doc.serviceArea || undefined,
    updatedAt: doc.updatedAt,
    seo: {
      title: doc.seo?.title || undefined,
      description: doc.seo?.description || undefined,
      canonical: doc.seo?.canonical || undefined,
      noindex: Boolean(doc.seo?.noindex),
      ogTitle: doc.seo?.ogTitle || undefined,
      ogDescription: doc.seo?.ogDescription || undefined,
      image: publicPhoto(doc.seo?.image),
    },
    richText: doc.content,
  }
}
export const getPublicPages = cache(
  async (locale: 'ro' | 'en' = 'ro', allowPreview = false): Promise<EditorialPage[]> => {
    const cms = await getCMS()
    if (!cms) return locale === 'ro' ? editorialPages : []
    const preview =
      allowPreview && (await draftMode()).isEnabled && Boolean(await authenticate(await headers()))
    const count = await cms.count({ collection: 'pages', locale, overrideAccess: true })
    const all = await cms.find({
      collection: 'pages',
      locale,
      pagination: false,
      depth: 1,
      overrideAccess: preview,
      draft: preview,
    })
    return [
      ...(count.totalDocs || locale === 'en' ? [] : editorialPages),
      ...all.docs
        .map(cmsPage)
        .map((p) => (preview ? { ...p, seo: { ...p.seo, noindex: true } } : p)),
    ]
  },
)
export const getHomeSEO = cache(async (locale: 'ro' | 'en' = 'ro') => {
  const cms = await getCMS()
  if (!cms) return undefined
  const home = await cms.findGlobal({
    slug: 'home-settings',
    locale,
    depth: 1,
    overrideAccess: false,
  })
  return { ...home.seo, image: publicPhoto(home.seo?.image) }
})
