import type { MetadataRoute } from 'next'
import { routeMap } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const items: MetadataRoute.Sitemap = []
  for (const key of Object.keys(routeMap.ro) as (keyof typeof routeMap.ro)[]) {
    const ro = routeMap.ro[key]; const en = routeMap.en[key]
    items.push({ url: `${base}${ro}`, lastModified: new Date(), changeFrequency: key === 'home' ? 'weekly' : 'monthly', priority: key === 'home' ? 1 : key === 'booking' ? 0.9 : 0.7, alternates: { languages: { ro: `${base}${ro}`, en: `${base}${en}`, 'x-default': `${base}${ro}` } } })
    items.push({ url: `${base}${en}`, lastModified: new Date(), changeFrequency: key === 'home' ? 'weekly' : 'monthly', priority: key === 'home' ? 0.9 : key === 'booking' ? 0.8 : 0.6, alternates: { languages: { ro: `${base}${ro}`, en: `${base}${en}`, 'x-default': `${base}${ro}` } } })
  }
  return items
}
