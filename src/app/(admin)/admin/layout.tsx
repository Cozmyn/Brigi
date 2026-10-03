import type { Metadata } from 'next'
import { siteURL } from '@/lib/site'
import '@/components/admin/admin.css'
export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: 'Brigitta / Studio',
  robots: { index: false, follow: false },
}
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
