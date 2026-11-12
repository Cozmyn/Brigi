import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable, Writable } from 'node:stream'
import { mkdtemp, rm, readFile, writeFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { encryptBackupStream, decryptBackupTo, verifyBackup, MAGIC } from '../../scripts/ops/backup-crypto.mjs'
import { backupDirectory, safeDBName } from '../../scripts/ops/mysql-private-config.mjs'
import { restoreArguments } from '../../scripts/ops/restore-guard.mjs'

const dir = await mkdtemp(join(tmpdir(), 'brigitta-ops-test-'))
after(async () => rm(dir, { recursive: true, force: true }))
const secret = 'QA-only-safe-passphrase-never-use-in-production-123'
const sql = 'CREATE TABLE evenimente (nume varchar(100));\nINSERT INTO evenimente VALUES ("Ștefan");\n'

test('authenticated encrypted backup is private and restores diacritics intact', async () => {
  const target = join(dir, 'test.sql.gz.enc')
  await encryptBackupStream(Readable.from([Buffer.from(sql)]), target, secret)
  const details = await stat(target)
  assert.equal(details.mode & 0o777, 0o600)
  assert.ok((await readFile(target)).subarray(0, MAGIC.length).equals(MAGIC))
  const verified = await verifyBackup(target, secret)
  assert.equal(verified.valid, true)
  assert.equal(verified.bytes, Buffer.byteLength(sql))
  assert.equal(verified.plaintextSha256.length, 64)
  const restored = []
  await decryptBackupTo(target, secret, new Writable({
    write(chunk, _enc, done) { restored.push(Buffer.from(chunk)); done() },
  }))
  assert.equal(Buffer.concat(restored).toString(), sql)
  await assert.rejects(verifyBackup(target, 'incorrect-long-passphrase-never-use-xyz'))
  const changed = await readFile(target)
  changed[changed.length - 20] ^= 42
  await writeFile(target, changed)
  await assert.rejects(verifyBackup(target, secret))
})
test('backup directory is outside public/app tree and staging restores are guarded', () => {
  assert.equal(backupDirectory(dir), dir)
  assert.throws(() => backupDirectory('./backups'))
  assert.throws(() => backupDirectory(process.cwd() + '/public/backups'))
  assert.equal(safeDBName('brigitta_restore_test01'), true)
  assert.equal(safeDBName('name;DROP TABLE'), false)
  const env = {
    RESTORE_ENVIRONMENT: 'staging',
    RESTORE_DB_NAME: 'brigitta_restore_ci01',
    RESTORE_DB_HOST: 'staging-db.test',
    RESTORE_DB_USER: 'restore_ci',
    RESTORE_DB_PASSWORD: 'not-a-secret',
    DB_NAME: 'brigitta_live', DB_HOST: 'live-db.test',
    BACKUP_DIR: dir, BACKUP_FILE: 'brigitta-2026-11-12-db.sql.gz.enc',
  }
  assert.equal(restoreArguments(env, ['--apply-to-empty-staging-db']).targetDB, env.RESTORE_DB_NAME)
  assert.throws(() => restoreArguments(env, []))
  assert.throws(() => restoreArguments({ ...env, RESTORE_ENVIRONMENT: 'production' }, ['--apply-to-empty-staging-db']))
  assert.throws(() => restoreArguments({ ...env, RESTORE_DB_NAME: 'brigitta_live' }, ['--apply-to-empty-staging-db']))
  assert.throws(() => restoreArguments({ ...env, BACKUP_FILE: '../private.sql.gz.enc' }, ['--apply-to-empty-staging-db']))
})
