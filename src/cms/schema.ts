import { Pages } from '@/collections/Pages'
import { Articles } from '@/collections/Articles'
import { Services } from '@/collections/Services'
import { Videos } from '@/collections/Videos'
import { Repertoire } from '@/collections/Repertoire'
import { Testimonials } from '@/collections/Testimonials'
import { FAQ } from '@/collections/FAQ'
import { Media } from '@/collections/Media'
import { Redirects } from '@/collections/Redirects'
import { Inquiries } from '@/collections/Inquiries'
import { Users } from '@/collections/Users'
import { HomeSettings } from '@/globals/HomeSettings'
import { SiteSettings } from '@/globals/SiteSettings'
import { Header } from '@/globals/Header'
import { Footer } from '@/globals/Footer'
import { PrivacySettings } from '@/globals/PrivacySettings'
import type { CollectionConfig } from './model'

Users.fields.unshift({ name: 'username', type: 'text', required: true })
Media.fields.push(
  { name: 'focalX', type: 'number', defaultValue: 50, min: 0, max: 100 },
  { name: 'focalY', type: 'number', defaultValue: 50, min: 0, max: 100 },
)
for (const config of [Pages, Services])
  config.fields.push({
    name: '_status',
    label: 'Publicare',
    type: 'select',
    defaultValue: 'draft',
    options: [
      { label: 'Ciornă', value: 'draft' },
      { label: 'Publicat', value: 'published' },
    ],
  })
export const collections: Record<string, CollectionConfig> = Object.fromEntries(
  [Pages, Articles, Services, Videos, Repertoire, Testimonials, FAQ, Media, Redirects, Inquiries, Users].map(
    (c) => [c.slug, c],
  ),
)
export const globals: Record<string, CollectionConfig> = Object.fromEntries(
  [HomeSettings, SiteSettings, Header, Footer, PrivacySettings].map((c) => [c.slug, c]),
)
export const labels: Record<string, string> = {
  pages: 'Pagini & SEO',
  articles: 'Ghiduri & articole',
  services: 'Pachete & prețuri',
  videos: 'Video & muzică',
  repertoire: 'Repertoriu',
  testimonials: 'Testimoniale',
  faq: 'Întrebări frecvente',
  media: 'Fotografii',
  redirects: 'Redirecționări',
  inquiries: 'Solicitări',
  users: 'Utilizatori',
  'home-settings': 'Homepage',
  'site-settings': 'Contact & setări',
  header: 'Navigare',
  footer: 'Subsol',
  'privacy-settings': 'Confidențialitate',
}
