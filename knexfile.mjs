import 'dotenv/config'
const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4',
  },
  pool: { min: 0, max: 2 },
  migrations: {
    directory: './migrations/mysql',
    extension: 'mjs',
    loadExtensions: ['.mjs'],
    tableName: 'brigi_migrations',
    disableTransactions: true,
  },
}
export default config
