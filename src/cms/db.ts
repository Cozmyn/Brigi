import knex, { type Knex } from 'knex'

let database: Knex | undefined
export function databaseConfigured() {
  return Boolean(process.env.DB_NAME && process.env.DB_USER)
}
export function getDB(): Knex {
  if (!databaseConfigured()) throw new Error('MySQL is not configured. Set DB_NAME and DB_USER.')
  return (database ||= knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4',
      dateStrings: true,
      supportBigNumbers: true,
      bigNumberStrings: false,
    },
    pool: { min: 0, max: Number(process.env.DB_POOL_MAX || 3) },
    acquireConnectionTimeout: 10000,
  }))
}
export async function closeDB() {
  await database?.destroy()
  database = undefined
}
