import type { MetadataRoute } from 'next'
import { isProductionReady, siteURL } from '@/lib/site'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: isProductionReady
      ? { userAgent: '*', allow: ['/', '/api/media/file/'], disallow: ['/admin', '/api', '/next'] }
      : { userAgent: '*', disallow: ['/', '/api/media/file/'] },
    sitemap: `${siteURL}/sitemap.xml`,
  }
}
