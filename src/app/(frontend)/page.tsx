import type { Metadata } from 'next'
import { HomePage } from '@/components/site/HomePage'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'

export const metadata: Metadata = {
  title: 'Brigitta | Solistă pentru evenimente private',
  description: 'Voce live pentru nunți, ceremonii, recepții și evenimente corporate. Vezi formatele disponibile și verifică data.',
  alternates: { canonical: '/', languages: { ro: '/', en: '/en', 'x-default': '/' } },
  openGraph: { title: 'Brigitta | Solistă pentru evenimente private', description: 'Voce live pentru seri care trebuie să se simtă speciale.', locale: 'ro_RO', type: 'website' },
}
export default function Page() {
  const person = { '@context': 'https://schema.org', '@type': 'Person', name: 'Brigitta', jobTitle: 'Solistă pentru evenimente private', areaServed: 'București și împrejurimi' }
  return <><SiteHeader locale="ro" /><main id="main"><HomePage locale="ro" /></main><SiteFooter locale="ro" /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} /></>
}
