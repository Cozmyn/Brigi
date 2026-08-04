import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { AutomationAccounts } from './collections/AutomationAccounts'
import { Inquiries } from './collections/Inquiries'
import { Services } from './collections/Services'
import { Videos } from './collections/Videos'
import { Repertoire } from './collections/Repertoire'
import { Testimonials } from './collections/Testimonials'
import { FAQ } from './collections/FAQ'
import { Redirects } from './collections/Redirects'
import { AuditEvents } from './collections/AuditEvents'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { HomeSettings } from './globals/HomeSettings'
import { PrivacySettings } from './globals/PrivacySettings'
import { SiteSettings } from './globals/SiteSettings'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    Users,
    AutomationAccounts,
    Inquiries,
    Pages,
    Services,
    Videos,
    Repertoire,
    Testimonials,
    FAQ,
    Media,
    Redirects,
    AuditEvents,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  csrf: [getServerSideURL()].filter(Boolean),
  globals: [SiteSettings, Header, Footer, HomeSettings, PrivacySettings],
  localization: {
    locales: [
      { code: 'ro', label: 'Română' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'ro',
    fallback: false,
  },
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
