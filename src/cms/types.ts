// Application-only types generated from src/collections and src/globals. No database metadata.
export interface Page {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  slug: string
  pageType?: 'service' | 'editorial' | 'location' | 'about' | 'repertoire' | 'media'
  excerpt?: string
  serviceArea?: string
  sections?: { heading: string; body: string; image?: number | Media }[]
  faqs?: { question: string; answer: string }[]
  relatedPages?: (number | Page)[]
  showPackages?: boolean
  ctaLabel?: string
  heroEyebrow?: string
  heroTitle: string
  heroSummary?: string
  content?: unknown
  visible?: boolean
  seo?: {
    title?: string
    description?: string
    canonical?: string
    noindex?: boolean
    ogTitle?: string
    ogDescription?: string
    image?: number | Media
  }
  approvedForPublication?: boolean
  _status?: 'draft' | 'published'
}
export interface Service {
  id: number
  createdAt: string
  updatedAt: string
  name: string
  sets: '1x45' | '2x45' | '3x45'
  setCount?: number
  duration?: number
  currency?: 'EUR' | 'RON'
  fromPricing?: boolean
  featured?: boolean
  priceFromEUR: number
  description?: string
  suitedFor?: string
  inclusions?: { item: string }[]
  order?: number
  visible?: boolean
  priceApproved?: boolean
  _status?: 'draft' | 'published'
}
export interface Videos {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  eventType?: 'wedding' | 'corporate' | 'private' | 'other'
  kind: 'showreel' | 'full' | 'short'
  poster?: number | Media
  url?: string
  file?: number | Media
  captions?: number | Media
  featured?: boolean
  approvedForPublication?: boolean
}
export interface Repertoire {
  id: number
  createdAt: string
  updatedAt: string
  song: string
  originalArtist: string
  category: string
  language?: 'ro' | 'en' | 'fr' | 'it' | 'other'
  momentType?: 'ceremony' | 'cocktail' | 'dinner' | 'party' | 'corporate'
  active?: boolean
  sample?: number | Videos
}
export interface Testimonials {
  id: number
  createdAt: string
  updatedAt: string
  quote: string
  author: string
  eventType?: string
  city?: string
  year?: number
  publicationConsent?: boolean
  visible?: boolean
}
export interface FAQ {
  id: number
  createdAt: string
  updatedAt: string
  question: string
  answer: string
  category?: string
  order?: number
  visible?: boolean
}
export interface Media {
  id: number
  createdAt: string
  updatedAt: string
  alt: string
  caption?: string
  credit?: string
  rightsNotes?: string
  approvedForPublication?: boolean
  focalX?: number
  focalY?: number
  url?: string
  filename?: string
  width?: number
  height?: number
  mimeType?: string
  sizes?: Record<string, { url: string; width: number; height: number }>
}
export interface Redirects {
  id: number
  createdAt: string
  updatedAt: string
  from: string
  to: string
  code?: '301' | '302' | '307' | '308'
  active?: boolean
}
export interface Inquiries {
  id: number
  createdAt: string
  updatedAt: string
  locale: 'ro' | 'en'
  status:
    'new' | 'read' | 'contacted' | 'qualified' | 'offer_prepared' | 'negotiation' | 'confirmed' | 'lost' | 'archived' | 'spam'
  inquiryMode?: 'quick' | 'detailed'
  datePrecision?: 'exact' | 'month' | 'unknown'
  eventDate: string
  eventMonth?: string
  city: string
  county?: string
  approximateTime?: string
  venue?: string
  eventType: 'wedding' | 'ceremony' | 'corporate' | 'anniversary' | 'cocktail' | 'public' | 'other'
  guestCount?: number
  packageInterest: '1x45' | '2x45' | '3x45' | 'unsure' | 'custom'
  name: string
  phone: string
  email?: string
  selectedPackageName?: string
  musicPreferences?: string
  approximateBudget?: string
  preferredContact: 'phone' | 'whatsapp' | 'email'
  message?: string
  privacyAcknowledged: boolean
  assignedTo?: string
  qualification?: 'pending' | 'qualified' | 'not_fit'
  nextActionAt?: string
  quoteAmount?: number
  confirmedValue?: number
  currency?: 'EUR' | 'RON'
  attributionConsent?: boolean
  submissionFingerprint?: string
  firstTouchUtmSource?: string
  firstTouchUtmMedium?: string
  firstTouchUtmCampaign?: string
  firstTouchReferrer?: string
  firstTouchLandingPath?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  referrer?: string
  landingPath?: string
  dueAt?: string
  lastContactedAt?: string
  internalNotes?: string
  isUnread?: boolean
  idempotencyKey?: string
}
export interface Users {
  id: number
  createdAt: string
  updatedAt: string
  username: string
  displayName: string
  role: 'owner' | 'editor'
  active?: boolean
  canAccessInquiries?: boolean
}
export interface HomeSettings {
  id: number
  createdAt: string
  updatedAt: string
  seo?: {
    title?: string
    description?: string
    canonical?: string
    noindex?: boolean
    ogTitle?: string
    ogDescription?: string
    image?: number | Media
  }
  heroAccent?: string
  availabilityLabel?: string
  quoteLabel?: string
  experienceTitle?: string
  experienceText?: string
  experienceMoments?: { text: string }[]
  eventsTitle?: string
  events?: {
    eventType:
      'wedding' | 'ceremony' | 'corporate' | 'anniversary' | 'cocktail' | 'public' | 'other'
    title: string
    description: string
    href: string
  }[]
  repertoireTitle?: string
  repertoireText?: string
  repertoireCategories?: { text: string }[]
  packagesTitle?: string
  pricingNote?: string
  processTitle?: string
  process?: { title: string; text: string }[]
  aboutTitle?: string
  faqTitle?: string
  bookingTitle?: string
  bookingText?: string
  photos?: {
    hero?: number | Media
    live?: number | Media
    portrait?: number | Media
    social?: number | Media
  }
  heroEyebrow?: string
  heroTitle?: string
  heroSubtitle?: string
  showreelVisible?: boolean
  testimonialsVisible?: boolean
  trustStripVisible?: boolean
  sectionOrder?: (
    'events' | 'packages' | 'benefits' | 'process' | 'repertoire' | 'about' | 'faq' | 'finalCta'
  )[]
}
export interface SiteSettings {
  id: number
  createdAt: string
  updatedAt: string
  brandName: string
  phone?: string
  email?: string
  biography?: string
  analyticsEnabled?: boolean
  googleVerification?: string
  bingVerification?: string
  whatsapp?: string
  defaultLocale?: 'ro' | 'en'
  publicSlaDays?: number
  geographicArea?: string
  socialLinks?: { label: string; url: string }[]
}
export interface Header {
  id: number
  createdAt: string
  updatedAt: string
  navigation?: { label: string; url: string }[]
  ctaLabel?: string
  ctaUrl?: string
}
export interface Footer {
  id: number
  createdAt: string
  updatedAt: string
  description?: string
  legalNavigation?: { label: string; url: string }[]
  copyright?: string
}
export interface PrivacySettings {
  id: number
  createdAt: string
  updatedAt: string
  operatorName?: string
  privacyContact?: string
  retentionRule?: string
  policyVersion?: string
  completed?: boolean
}
export interface ModelMap {
  pages: Page
  services: Service
  videos: Videos
  repertoire: Repertoire
  testimonials: Testimonials
  faq: FAQ
  media: Media
  redirects: Redirects
  inquiries: Inquiries
  users: Users
}
export interface GlobalMap {
  'home-settings': HomeSettings
  'site-settings': SiteSettings
  header: Header
  footer: Footer
  'privacy-settings': PrivacySettings
}
