import 'dotenv/config'
import { getDB, closeDB } from '../src/cms/db'
const days = Number(process.env.INQUIRY_RETENTION_DAYS)
try {
  if (!Number.isInteger(days) || days < 30 || days > 3650)
    throw new Error('Set INQUIRY_RETENTION_DAYS to an integer between 30 and 3650.')
  const db = getDB()
  const cutoff = new Date(Date.now() - days * 86400000)
  const candidates = await db('cms_documents as d')
    .join('cms_locales as l', 'l.document_id', 'd.id')
    .where('d.collection', 'inquiries')
    .where('d.updated_at', '<', cutoff)
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(l.data, '$.status')) IN ('lost','archived','spam')")
    .select('d.id')
  if (process.argv.includes('--apply') && candidates.length)
    await db('cms_documents')
      .whereIn(
        'id',
        candidates.map((row) => row.id),
      )
      .delete()
  await db('cms_sessions').where('expires_at', '<', Date.now()).delete()
  await db('cms_rate_limits').where('expires_at', '<', Date.now()).delete()
  await db('analytics_daily')
    .where('day', '<', new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10))
    .delete()
  console.log(
    `${candidates.length} closed/archived/spam inquiries ${process.argv.includes('--apply') ? 'deleted' : 'eligible for deletion; use --apply after reviewing your retention policy'}.`,
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Maintenance failed')
  process.exitCode = 1
} finally {
  await closeDB()
}
