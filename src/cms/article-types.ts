import type { Media, Page, Service } from './types'

export interface Article {
  id: number
  createdAt: string
  updatedAt: string
  title: string
  slug: string
  summary?: string
  topic?: 'music' | 'parties' | 'events'
  intent?: string
  author?: string
  reviewer?: string
  originalContribution?: string
  sections?: { heading: string; body: string; image?: number | Media }[]
  sources?: { label: string; url: string }[]
  relatedPages?: (number | Page)[]
  relatedServices?: (number | Service)[]
  publishedAt?: string
  reviewedAt?: string
  editorialStatus?: 'draft' | 'review' | 'approved'
  visible?: boolean
  approvedForPublication?: boolean
  _status?: 'draft' | 'published'
  seo?: Page['seo']
}

// Extend the application model map without replacing existing generated interfaces.
declare module './types' {
  interface ModelMap {
    articles: Article
  }
}
