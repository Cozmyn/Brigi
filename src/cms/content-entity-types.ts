import type { Media, Page, Service } from './types'

interface ContentEntity {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  slug: string
  summary?: string
  sections?: { heading: string; body: string; image?: number | Media }[]
  reviewer?: string
  reviewedAt?: string
  visible?: boolean
  approvedForPublication?: boolean
  _status?: 'draft' | 'published'
  seo?: Page['seo']
}
export interface MusicalFormat extends ContentEntity {
  lineup?: string
  suitableFor?: string
  technicalRequirements?: string
  relatedServices?: (number | Service)[]
}
export interface Partner extends ContentEntity {
  relationshipDescription?: string
  website?: string
  logo?: number | Media
  publicationConsent?: boolean
}
export interface CaseStudy extends ContentEntity {
  eventYear?: number
  context?: string
  approach?: string
  outcome?: string
  evidenceSummary?: string
  evidenceVerified?: boolean
  publicationConsent?: boolean
  relatedFormats?: (number | MusicalFormat)[]
  relatedPartners?: (number | Partner)[]
  relatedServices?: (number | Service)[]
}
declare module './types' {
  interface ModelMap {
    'musical-formats': MusicalFormat
    partners: Partner
    'case-studies': CaseStudy
  }
}
