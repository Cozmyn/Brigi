import { basename, join } from 'node:path'
import { backupDirectory, safeDBName } from './mysql-private-config.mjs'

export function restoreArguments(env, flags = []) {
  if (env.RESTORE_ENVIRONMENT !== 'staging' || !flags.includes('--apply-to-empty-staging-db'))
    throw new Error('Restore requires RESTORE_ENVIRONMENT=staging and --apply-to-empty-staging-db.')
  const db = env.RESTORE_DB_NAME
  if (!safeDBName(db) || !/^brigitta_restore_[a-zA-Z0-9_]+$/.test(db) || db === env.DB_NAME)
    throw new Error('Restore destination must be a separate brigitta_restore_* database.')
  if (!env.RESTORE_DB_HOST || !env.RESTORE_DB_USER ||
      typeof env.RESTORE_DB_PASSWORD !== 'string')
    throw new Error('Separate RESTORE_DB_* credentials are required.')
  if (env.RESTORE_DB_HOST === env.DB_HOST && env.ALLOW_SHARED_DB_HOST_FOR_RESTORE !== 'true')
    throw new Error('Shared DB host requires explicit ALLOW_SHARED_DB_HOST_FOR_RESTORE=true.')
  const filename = env.BACKUP_FILE
  if (!filename || basename(filename) !== filename ||
      !/^brigitta-[a-zA-Z0-9_.-]+-db\.sql\.gz\.enc$/.test(filename))
    throw new Error('BACKUP_FILE must be one encrypted database backup filename.')
  const directory = backupDirectory(env.BACKUP_DIR)
  return {
    filepath: join(directory, filename),
    targetDB: db,
    mysqlEnv: {
      DB_NAME: db, DB_HOST: env.RESTORE_DB_HOST,
      DB_USER: env.RESTORE_DB_USER, DB_PASSWORD: env.RESTORE_DB_PASSWORD,
      DB_PORT: env.RESTORE_DB_PORT || '3306',
    },
  }
}
