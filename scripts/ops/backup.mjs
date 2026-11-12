import 'dotenv/config'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, chmod, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join, resolve, isAbsolute } from 'node:path'
import { backupDirectory, privateMySQLConfig } from './mysql-private-config.mjs'
import { encryptBackupStream, verifyBackup } from './backup-crypto.mjs'

/** Run by an approved operator/cron, never by a public HTTP request. */
function waitProcess(child, label) {
  return new Promise((resolve, reject) => {
    child.once('error', () => reject(new Error(label + ' executable is unavailable.')))
    child.once('close', (code) => code === 0 ? resolve() :
      reject(new Error(label + ' exited with status ' + code)))
  })
}
async function capture(command, args, base, filename, secret, kind) {
  const temp = join(base, filename + '.partial')
  const final = join(base, filename)
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'ignore'] })
  try {
    await Promise.all([encryptBackupStream(child.stdout, temp, secret), waitProcess(child, command)])
    await rename(temp, final)
    const verified = await verifyBackup(final, secret)
    const info = await stat(final)
    return { kind, filename, encryptedBytes: info.size,
      verifiedPlaintextBytes: verified.bytes, plaintextSha256: verified.plaintextSha256 }
  } catch (error) {
    child.kill()
    await rm(temp, { force: true })
    await rm(final, { force: true })
    throw error
  }
}
const secret = process.env.BACKUP_ENCRYPTION_KEY
try {
  if (typeof secret !== 'string' || secret.length < 24)
    throw new Error('Set BACKUP_ENCRYPTION_KEY (at least 24 characters), outside source control.')
  const destination = backupDirectory(process.env.BACKUP_DIR)
  await mkdir(destination, { recursive: true, mode: 0o700 })
  await chmod(destination, 0o700)
  const mysql = await privateMySQLConfig()
  try {
    const now = new Date().toISOString().replace(/[:.]/g, '-')
    const prefix = 'brigitta-' + now + '-' + randomUUID()
    const records = []
    records.push(await capture('mysqldump', [
      '--defaults-extra-file=' + mysql.path,
      '--single-transaction', '--quick', '--skip-lock-tables',
      '--default-character-set=utf8mb4', mysql.database,
    ], destination, prefix + '-db.sql.gz.enc', secret, 'mysql'))
    const media = process.env.MEDIA_DIR
    if (media) {
      if (!isAbsolute(media)) throw new Error('MEDIA_DIR must be an absolute path.')
      const mediaPath = resolve(media)
      const information = await stat(mediaPath)
      if (!information.isDirectory()) throw new Error('MEDIA_DIR must be a directory.')
      records.push(await capture('tar', ['-C', mediaPath, '-cf', '-', '.'],
        destination, prefix + '-media.tar.gz.enc', secret, 'media'))
    }
    const manifest = prefix + '.manifest.json'
    await writeFile(join(destination, manifest), JSON.stringify({
      format: 'brigitta-encrypted-backup-v1', createdAt: new Date().toISOString(),
      files: records,
    }, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
    console.log(JSON.stringify({ result: 'encrypted-and-verified', manifest,
      files: records.map(({ kind, filename, encryptedBytes }) => ({ kind, filename, encryptedBytes })) }))
  } finally { await mysql.cleanup() }
} catch (error) {
  // Never log environment variables, dump contents or potentially private SQL.
  console.error(error instanceof Error ? error.message : 'Backup failed')
  process.exitCode = 1
}
