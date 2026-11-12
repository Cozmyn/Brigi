import { mkdtemp, writeFile, chmod, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, isAbsolute, resolve, sep } from 'node:path'

export function safeDBName(name) {
  return typeof name === 'string' && /^[a-zA-Z][a-zA-Z0-9_]{0,62}$/.test(name)
}
export function backupDirectory(value, project = process.cwd()) {
  if (!value || !isAbsolute(value)) throw new Error('BACKUP_DIR must be an absolute path.')
  const dir = resolve(value)
  const root = resolve(project)
  if (dir === root || dir.startsWith(root + sep) ||
      dir === resolve('/') || /\/public(?:\/|$)/.test(dir))
    throw new Error('BACKUP_DIR must be private, outside the application and web root.')
  return dir
}
function privateValue(value) {
  if (typeof value !== 'string' || /[\r\n\0]/.test(value))
    throw new Error('Invalid database configuration.')
  return '"' + value.replaceAll('\\', '\\\\').replaceAll('"', '\\"') + '"'
}
export async function privateMySQLConfig(env = process.env) {
  const { DB_NAME, DB_HOST, DB_USER, DB_PASSWORD } = env
  const port = Number(env.DB_PORT || '3306')
  if (!safeDBName(DB_NAME) || !DB_HOST || !DB_USER ||
      typeof DB_PASSWORD !== 'string' || !Number.isSafeInteger(port) || port < 1 || port > 65535)
    throw new Error('Set DB_NAME, DB_HOST, DB_PORT, DB_USER and DB_PASSWORD.')
  const temp = await mkdtemp(join(tmpdir(), 'brigitta-db-'))
  await chmod(temp, 0o700)
  const filename = join(temp, 'client.cnf')
  const config = '[client]\nhost=' + privateValue(DB_HOST) +
    '\nport=' + port + '\nuser=' + privateValue(DB_USER) +
    '\npassword=' + privateValue(DB_PASSWORD) + '\ndefault-character-set=utf8mb4\n'
  try { await writeFile(filename, config, { mode: 0o600, flag: 'wx' }) }
  catch (error) { await rm(temp, { recursive: true, force: true }); throw error }
  return { path: filename, database: DB_NAME,
    cleanup: async () => rm(temp, { recursive: true, force: true }) }
}
