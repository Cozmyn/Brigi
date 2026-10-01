import type { MetadataRoute } from 'next'
import { isProductionReady, siteURL } from '@/lib/site'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: isProductionReady
      ? { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/next'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${siteURL}/sitemap.xml`,
  }
}
