import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookingForm } from '@/components/site/BookingForm'
import { ContentPage } from '@/components/site/ContentPage'
import { HomePage } from '@/components/site/HomePage'
import { LegalPage } from '@/components/site/LegalPage'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { internalPages, legalCopy, routeMap } from '@/lib/site'

const pageKey = { 'private-events': 'private', 'weddings-and-ceremonies': 'weddings', 'corporate-events': 'corporate', 'live-video': 'video', repertoire: 'repertoire', about: 'about' } as const
const legalKey = { privacy: 'privacy', cookies: 'cookies', terms: 'terms' } as const

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params; const path = slug?.[0]
  if (!path) return { title: 'Brigitta | Live Singer for Private Events', description: 'Live vocals for weddings, receptions and corporate events. Explore the formats and check availability.', alternates: { canonical: '/en', languages: { ro: '/', en: '/en', 'x-default': '/' } } }
  if (path === 'booking') return { title: 'Check availability', description: 'Share the date, city and event details to check Brigitta’s availability.', alternates: { canonical: routeMap.en.booking, languages: { ro: routeMap.ro.booking, en: routeMap.en.booking, 'x-default': routeMap.ro.booking } } }
  const key = pageKey[path as keyof typeof pageKey]
  if (key) { const item = internalPages[key].en; return { title: item[0], description: item[2], alternates: { canonical: routeMap.en[key], languages: { ro: routeMap.ro[key], en: routeMap.en[key], 'x-default': routeMap.ro[key] } } } }
  const legal = legalKey[path as keyof typeof legalKey]
  if (legal) { const item = legalCopy[legal].en; return { title: item[0], description: item[1].slice(0, 160), alternates: { canonical: routeMap.en[legal], languages: { ro: routeMap.ro[legal], en: routeMap.en[legal], 'x-default': routeMap.ro[legal] } } } }
  return {}
}

export default async function EnglishPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params; const path = slug?.[0]
  let content: React.ReactNode
  if (!path) content = <HomePage locale="en" />
  else if (path === 'booking') content = <section className="booking-page"><div className="booking-intro"><p className="eyebrow">Check availability</p><h1>Start with the date and place.</h1><p>The form takes around two minutes. We do not request email or send automated notifications.</p></div><BookingForm locale="en" /></section>
  else if (pageKey[path as keyof typeof pageKey]) { const key = pageKey[path as keyof typeof pageKey]; const item = internalPages[key].en; content = <ContentPage locale="en" title={item[0]} eyebrow={key === 'video' ? 'Live, without artifice' : 'Brigitta'} intro={item[2]} variant={key === 'video' ? 'media' : key === 'about' || key === 'repertoire' ? 'simple' : 'service'} /> }
  else if (legalKey[path as keyof typeof legalKey]) { const key = legalKey[path as keyof typeof legalKey]; const item = legalCopy[key].en; content = <LegalPage locale="en" title={item[0]} text={item[1]} /> }
  else notFound()
  return <><SiteHeader locale="en" /><main id="main">{content}</main><SiteFooter locale="en" /></>
}

