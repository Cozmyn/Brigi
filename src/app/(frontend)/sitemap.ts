import type { MetadataRoute } from 'next'
import { routeMap, siteContent, siteURL } from '@/lib/site'
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(routeMap.ro)
    .filter(([key]) => key !== 'video' || siteContent.media.length > 0)
    .map(([key, path]) => ({
      url: `${siteURL}${path}`,
      changeFrequency: key === 'home' ? 'monthly' : 'yearly',
      priority: key === 'home' ? 1 : key === 'booking' ? 0.9 : 0.6,
    }))
}
