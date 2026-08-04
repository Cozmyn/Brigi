import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const productionReady = process.env.PRODUCTION_GATES_CLOSED === 'true'
  return { rules: productionReady ? { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] } : { userAgent: '*', disallow: '/' }, sitemap: `${base}/sitemap.xml` }
}

