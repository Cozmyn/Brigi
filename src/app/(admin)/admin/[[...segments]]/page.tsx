import { headers } from 'next/headers'
import { authenticate, canManage } from '@/cms/auth'
import { collections, globals, labels } from '@/cms/schema'
import { databaseConfigured } from '@/cms/db'
import Admin from '@/components/admin/Admin'
export const dynamic = 'force-dynamic'
export default async function AdminPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  if (!databaseConfigured())
    return (
      <main className="admin-login">
        <h1>Brigitta Studio</h1>
        <p>Configurează baza MySQL, rulează migrațiile și creează administratorul din terminal.</p>
      </main>
    )
  let user
  try {
    user = await authenticate(await headers())
  } catch {
    return (
      <main className="admin-login">
        <h1>Brigitta Studio</h1>
        <p role="alert">Baza de date nu este disponibilă. Verifică configurarea și migrațiile.</p>
      </main>
    )
  }
  const schemas = user
    ? {
        collections: Object.fromEntries(
          Object.entries(collections).filter(([key]) => canManage(user, key)),
        ),
        globals: Object.fromEntries(
          Object.entries(globals).filter(([key]) => canManage(user, key)),
        ),
      }
    : { collections: {}, globals: {} }
  // Validation functions stay on the server; the client receives field presentation only.
  return (
    <Admin
      key={(await params).segments?.join('/') || 'dashboard'}
      user={user}
      schemas={JSON.parse(JSON.stringify(schemas))}
      labels={labels}
      segments={(await params).segments || []}
    />
  )
}
