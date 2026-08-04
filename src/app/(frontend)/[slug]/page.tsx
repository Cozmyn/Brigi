import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookingForm } from '@/components/site/BookingForm'
import { ContentPage } from '@/components/site/ContentPage'
import { LegalPage } from '@/components/site/LegalPage'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { internalPages, legalCopy, routeMap } from '@/lib/site'

const pageKey = { 'evenimente-private': 'private', 'nunti-si-ceremonii': 'weddings', 'evenimente-corporate': 'corporate', 'video-live': 'video', 'repertoriu': 'repertoire', 'despre': 'about' } as const
const legalKey = { confidentialitate: 'privacy', cookies: 'cookies', termeni: 'terms' } as const

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'rezervare') return { title: 'Verifică disponibilitatea', description: 'Trimite data, orașul și detaliile evenimentului pentru a verifica disponibilitatea Brigitta.', alternates: { canonical: routeMap.ro.booking, languages: { ro: routeMap.ro.booking, en: routeMap.en.booking, 'x-default': routeMap.ro.booking } } }
  const key = pageKey[slug as keyof typeof pageKey]
  if (key) { const item = internalPages[key].ro; const enPath = routeMap.en[key]; return { title: item[0], description: item[2], alternates: { canonical: routeMap.ro[key], languages: { ro: routeMap.ro[key], en: enPath, 'x-default': routeMap.ro[key] } } } }
  const legal = legalKey[slug as keyof typeof legalKey]
  if (legal) { const item = legalCopy[legal].ro; return { title: item[0], description: item[1].slice(0, 160), alternates: { canonical: routeMap.ro[legal], languages: { ro: routeMap.ro[legal], en: routeMap.en[legal], 'x-default': routeMap.ro[legal] } } } }
  return {}
}
export default async function RomanianPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let content: React.ReactNode
  if (slug === 'rezervare') content = <section className="booking-page"><div className="booking-intro"><p className="eyebrow">Verifică disponibilitatea</p><h1>Începem cu data și locul.</h1><p>Formularul durează aproximativ două minute. Nu cerem email și nu trimitem notificări automate.</p></div><BookingForm locale="ro" /></section>
  else if (pageKey[slug as keyof typeof pageKey]) { const key = pageKey[slug as keyof typeof pageKey]; const item = internalPages[key].ro; content = <ContentPage locale="ro" title={item[0]} eyebrow={key === 'video' ? 'Live, fără artificii' : 'Brigitta'} intro={item[2]} variant={key === 'video' ? 'media' : key === 'about' || key === 'repertoire' ? 'simple' : 'service'} /> }
  else if (legalKey[slug as keyof typeof legalKey]) { const key = legalKey[slug as keyof typeof legalKey]; const item = legalCopy[key].ro; content = <LegalPage locale="ro" title={item[0]} text={item[1]} /> }
  else notFound()
  return <><SiteHeader locale="ro" /><main id="main">{content}</main><SiteFooter locale="ro" /></>
}
