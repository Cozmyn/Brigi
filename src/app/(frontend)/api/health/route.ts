import { databaseConfigured, getDB } from '@/cms/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Health check exposes no PII, schema details or credentials. */
export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
  try {
    if (!databaseConfigured()) throw new Error('db')
    await getDB().raw('SELECT 1')
    return Response.json({ status: 'ok' }, { status: 200, headers })
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503, headers })
  }
}
