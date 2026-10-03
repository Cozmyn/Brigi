import { createHash, randomBytes, scrypt as derive, timingSafeEqual } from 'node:crypto'
import { getDB } from './db'
const scrypt = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) =>
    derive(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  )
export const sessionCookie = 'brigi_session'
export type User = {
  id: number
  username: string
  displayName: string
  role: 'owner' | 'editor'
  active: boolean
  canAccessInquiries: boolean
}
export const digest = (value: string) => createHash('sha256').update(value).digest('hex')
export async function hashPassword(password: string) {
  if (password.length < 14 || password.length > 200)
    throw new Error('Parola trebuie să aibă între 14 și 200 de caractere.')
  const salt = randomBytes(16).toString('hex')
  const key = await scrypt(password, salt)
  return `scrypt$${salt}$${key.toString('hex')}`
}
export async function verifyPassword(password: string, encoded: string) {
  const [scheme, salt, hash] = encoded.split('$')
  if (scheme !== 'scrypt' || !salt || hash?.length !== 128 || password.length > 200) return false
  const key = await scrypt(password, salt)
  return timingSafeEqual(key, Buffer.from(hash, 'hex'))
}
type UserRow = {
  id: number
  username: string
  display_name: string
  role: 'owner' | 'editor'
  active: number
  can_access_inquiries: number
}
export function safeUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    active: Boolean(row.active),
    canAccessInquiries: Boolean(row.can_access_inquiries),
  }
}
export function sessionToken(headers: Headers) {
  return (
    headers
      .get('cookie')
      ?.split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${sessionCookie}=`))
      ?.slice(sessionCookie.length + 1) || ''
  )
}
export async function authenticate(headers: Headers): Promise<User | null> {
  const token = sessionToken(headers)
  if (!/^[a-f0-9]{64}$/.test(token)) return null
  const row = await getDB()('cms_sessions as s')
    .join('cms_users as u', 'u.id', 's.user_id')
    .where('s.token_hash', digest(token))
    .where('s.expires_at', '>', Date.now())
    .where('u.active', true)
    .select('u.*')
    .first()
  return row ? safeUser(row) : null
}
export async function createSession(user: User) {
  const token = randomBytes(32).toString('hex')
  const db = getDB()
  await db('cms_sessions').where('expires_at', '<', Date.now()).delete()
  await db('cms_sessions').insert({
    token_hash: digest(token),
    user_id: user.id,
    expires_at: Date.now() + 8 * 3600000,
  })
  return token
}
export function cookie(token: string, clear = false) {
  const secure = (process.env.SITE_URL || '').startsWith('https:')
  return `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : 28800}${secure ? '; Secure' : ''}`
}
export function canManage(user: User | null | undefined, collection: string) {
  if (!user?.active) return false
  if (user.role === 'owner') return true
  if (['users', 'privacy-settings', 'audit-events'].includes(collection)) return false
  if (collection === 'inquiries') return user.canAccessInquiries
  return user.role === 'editor'
}
// Store only opaque keys, with fixed windows shared by every Passenger process.
export async function rateLimit(key: string, maximum: number, duration: number) {
  const db = getDB()
  const now = Date.now()
  const hashed = digest(key)
  await db('cms_rate_limits').where('expires_at', '<', now).delete()
  await db('cms_rate_limits')
    .insert({ key: hashed, attempts: 1, expires_at: now + duration })
    .onConflict('key')
    .merge({ attempts: db.raw('attempts + 1') })
  const row = await db('cms_rate_limits').where({ key: hashed }).first()
  return row.attempts <= maximum
}
