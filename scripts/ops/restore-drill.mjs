import 'dotenv/config'
import { spawn } from 'node:child_process'
import { privateMySQLConfig } from './mysql-private-config.mjs'
import { restoreArguments } from './restore-guard.mjs'
import { decryptBackupTo, verifyBackup } from './backup-crypto.mjs'

function completion(child, name) {
  return new Promise((resolve, reject) => {
    child.once('error', () => reject(new Error(name + ' is not available.')))
    child.once('close', (code) => code === 0 ? resolve() :
      reject(new Error(name + ' exited with status ' + code)))
  })
}
async function countTables(configPath, database) {
  const child = spawn('mysql', [
    '--defaults-extra-file=' + configPath, '--batch', '--skip-column-names',
    '--execute=SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE();',
    '--database=' + database,
  ], { stdio: ['ignore', 'pipe', 'ignore'] })
  let stdout = ''
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => {
    stdout += chunk.slice(0, 100)
    if (stdout.length > 100) child.kill()
  })
  await completion(child, 'mysql')
  return Number(stdout.trim())
}

try {
  const secret = process.env.BACKUP_ENCRYPTION_KEY
  const options = restoreArguments(process.env, process.argv.slice(2))
  const verified = await verifyBackup(options.filepath, secret)
  const mysql = await privateMySQLConfig(options.mysqlEnv)
  try {
    const tables = await countTables(mysql.path, options.targetDB)
    if (tables !== 0) throw new Error('Restore target must exist and contain ZERO tables.')
    const child = spawn('mysql', [
      '--defaults-extra-file=' + mysql.path, '--database=' + options.targetDB,
    ], { stdio: ['pipe', 'ignore', 'ignore'] })
    await Promise.all([
      decryptBackupTo(options.filepath, secret, child.stdin),
      completion(child, 'mysql'),
    ])
    const restored = await countTables(mysql.path, options.targetDB)
    if (!Number.isInteger(restored) || restored < 1)
      throw new Error('Restore completed without expected schema; inspect staging immediately.')
    console.log(JSON.stringify({
      result: 'staging-restore-complete', tableCount: restored,
      backupBytes: verified.bytes, target: options.targetDB,
    }))
  } finally { await mysql.cleanup() }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Restore drill failed')
  process.exitCode = 1
}
