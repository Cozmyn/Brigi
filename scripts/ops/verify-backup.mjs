import 'dotenv/config'
import { basename, join } from 'node:path'
import { backupDirectory } from './mysql-private-config.mjs'
import { verifyBackup } from './backup-crypto.mjs'

try {
  const filename = process.env.BACKUP_FILE
  if (!filename || basename(filename) !== filename || !filename.endsWith('.enc'))
    throw new Error('Set BACKUP_FILE to a single .enc filename, not a path.')
  const path = join(backupDirectory(process.env.BACKUP_DIR), filename)
  const outcome = await verifyBackup(path, process.env.BACKUP_ENCRYPTION_KEY)
  console.log(JSON.stringify({ filename, verified: outcome.valid, bytes: outcome.bytes,
    plaintextSha256: outcome.plaintextSha256 }))
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Backup verification failed')
  process.exitCode = 1
}
