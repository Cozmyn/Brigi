import 'dotenv/config'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { getDB, closeDB } from '../src/cms/db'
import { hashPassword } from '../src/cms/auth'
let mute = false
const output = new Writable({
  write(chunk, _encoding, done) {
    if (!mute) process.stdout.write(chunk)
    done()
  },
})
const terminal = createInterface({
  input: process.stdin,
  output,
  terminal: Boolean(process.stdin.isTTY),
})
try {
  const username = (await terminal.question('Utilizator: ')).trim().toLowerCase()
  if (!/^[a-z0-9._-]{3,80}$/.test(username)) throw new Error('Utilizator invalid.')
  process.stdout.write('Parolă nouă (minimum 14 caractere, ascunsă): ')
  mute = true
  const password = await terminal.question('')
  mute = false
  process.stdout.write('\n')
  const password_hash = await hashPassword(password)
  const db = getDB()
  const existing = await db('cms_users').where({ username }).first()
  if (process.argv.includes('--reset')) {
    if (!existing) throw new Error('Utilizator inexistent.')
    await db.transaction(async (trx) => {
      await trx('cms_users').where({ id: existing.id }).update({ password_hash })
      await trx('cms_sessions').where({ user_id: existing.id }).delete()
    })
    console.log('Parolă resetată; sesiunile vechi au fost revocate.')
  } else {
    if (existing) throw new Error('Utilizator existent. Pentru resetare: npm run admin:reset')
    await db('cms_users').insert({
      username,
      display_name: username,
      password_hash,
      role: 'owner',
      active: true,
      can_access_inquiries: true,
    })
    console.log('Administrator creat. Autentificare la /admin.')
  }
} catch (error) {
  console.error((error as Error).message)
  process.exitCode = 1
} finally {
  terminal.close()
  await closeDB()
}
