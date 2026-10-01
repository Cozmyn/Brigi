import { permanentRedirect } from 'next/navigation'
const destinations: Record<string, string> = {
  'private-events': '/evenimente-private',
  'weddings-and-ceremonies': '/nunti-si-ceremonii',
  'corporate-events': '/evenimente-corporate',
  'live-video': '/video-live',
  repertoire: '/repertoriu',
  about: '/despre',
  booking: '/rezervare',
  privacy: '/confidentialitate',
  cookies: '/cookies',
  terms: '/termeni',
}
export default async function FormerEnglishRoute({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  permanentRedirect(destinations[slug?.join('/') || ''] || '/')
}
