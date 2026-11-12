
const configuredURL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const serverURL = new URL(configuredURL)
const scriptPolicy = process.env.NODE_ENV === 'production' ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

const nextConfig = {
  experimental: { cpus: 2 },
  serverExternalPackages: ['knex', 'mysql2'],
  async headers() {
    return [{ source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] }, { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }, {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: `default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; ${scriptPolicy}; connect-src 'self'; frame-src https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      ],
    }, {
      source: '/admin/preview/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
        { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
      ],
    }]
  },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/images/brigitta/**' }, { pathname: '/media/**' }],
    qualities: [78, 100],
    remotePatterns: [{ hostname: serverURL.hostname, protocol: serverURL.protocol.replace(':', '') }],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'], '.js': ['.ts', '.tsx', '.js', '.jsx'], '.mjs': ['.mts', '.mjs'],
    }
    return config
  },
  reactStrictMode: true,
}

export default nextConfig
