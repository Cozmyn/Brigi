import { revalidatePath } from 'next/cache'
import {
  authenticate,
  canManage,
  cookie,
  createSession,
  digest,
  hashPassword,
  rateLimit,
  safeUser,
  sessionToken,
  verifyPassword,
  type User,
} from './auth'
import { getDB } from './db'
import { contentStore, AccessError, type Where } from './store'
import { collections, globals } from './schema'
import { CMSValidationError, object, type Data } from './validation'
import { json, readBody, sameOrigin } from './http'
import { removeMediaFile, uploadMedia } from './media'
import type { ModelMap, GlobalMap } from './types'

export async function handleAdminAPI(request: Request, segments: string[]) {
  try {
    const [section, key, action] = segments
    const write = !['GET', 'HEAD'].includes(request.method)
    if (write && !sameOrigin(request)) return json({ error: 'Origine invalidă.' }, 403)
    if (section === 'auth' && key === 'login' && request.method === 'POST') {
      const data = object(JSON.parse((await readBody(request, 4096)).toString()))
      const username = String(data.username || '')
        .trim()
        .toLowerCase()
      // A global cap protects password hashing even if forwarded IP headers are spoofed.
      if (
        !(await rateLimit('login:global', 100, 600000)) ||
        !(await rateLimit(`login:${username}`, 5, 600000))
      )
        return json({ error: 'Prea multe încercări. Reîncearcă în 10 minute.' }, 429)
      const row = await getDB()('cms_users').where({ username }).first()
      const encoded = row?.password_hash || `scrypt$${'0'.repeat(32)}$${'0'.repeat(128)}`
      const valid = await verifyPassword(String(data.password || ''), encoded)
      if (!row || !row.active || !valid)
        return json({ error: 'Date de autentificare incorecte.' }, 401)
      const user = safeUser(row)
      const token = await createSession(user)
      return Response.json(
        { user },
        { headers: { 'Set-Cookie': cookie(token), 'Cache-Control': 'no-store' } },
      )
    }
    const user = await authenticate(request.headers)
    if (!user) return json({ error: 'Autentificare necesară.' }, 403)
    if (section === 'auth' && key === 'me') return json({ user })
    if (section === 'auth' && key === 'logout' && request.method === 'POST') {
      await getDB()('cms_sessions')
        .where({ token_hash: digest(sessionToken(request.headers)) })
        .delete()
      return Response.json(
        { ok: true },
        { headers: { 'Set-Cookie': cookie('', true), 'Cache-Control': 'no-store' } },
      )
    }
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'ro'
    const name = section === 'globals' ? key : section
    if (!canManage(user, name)) return json({ error: 'Nu ai acces la această secțiune.' }, 403)
    if (section === 'users') return await usersAPI(request, user, key)
    if (
      section === 'media' &&
      (key === 'upload' || action === 'upload') &&
      request.method === 'POST'
    ) {
      const doc = await uploadMedia(request, user, action ? Number(key) : undefined)
      revalidatePath('/', 'layout')
      return json({ doc }, 201)
    }
    if (section === 'globals' && globals[key]) {
      const slug = key as keyof GlobalMap
      if (!write) return json(await contentStore.findGlobal({ slug, locale, depth: 0 }))
      if (request.method !== 'POST') return json({ error: 'Metodă invalidă.' }, 405)
      const data = object(JSON.parse((await readBody(request)).toString()))
      const doc = await contentStore.updateGlobal({
        slug,
        locale,
        data,
        user,
        overrideAccess: false,
        depth: 0,
      })
      revalidatePath('/', 'layout')
      return json({ doc })
    }
    if (!collections[section]) return json({ error: 'Secțiune inexistentă.' }, 404)
    const collection = section as keyof ModelMap
    const opts = { locale, user, overrideAccess: false, depth: 0 } as const
    const id = key ? Number(key) : undefined
    if (key && (!Number.isSafeInteger(id) || id! < 1)) return json({ error: 'ID invalid.' }, 400)
    if (
      (action === 'revisions' || action === 'restore') &&
      !(await contentStore.byID(collection, id!, opts))
    )
      return json({ error: 'Înregistrare inexistentă.' }, 404)
    if (action === 'revisions' && request.method === 'GET') {
      return json({
        docs: await getDB()('cms_revisions')
          .where({ document_id: id, locale })
          .orderBy('id', 'desc')
          .limit(30)
          .select('id', 'created_at', 'actor'),
      })
    }
    if (action === 'restore' && request.method === 'POST') {
      const data = object(JSON.parse((await readBody(request)).toString()))
      const revision = await getDB()('cms_revisions')
        .where({ id: Number(data.revision), document_id: id, locale })
        .first()
      if (!revision) return json({ error: 'Versiune inexistentă.' }, 404)
      const restored = JSON.parse(revision.data)
      if (collections[collection].versions) restored._status = 'draft'
      const doc = await contentStore.update({ collection, id: id!, data: restored, ...opts })
      revalidatePath('/', 'layout')
      return json({ doc })
    }
    if (action === 'unpublish' && request.method === 'POST') {
      await contentStore.update({ collection, id: id!, data: { _status: 'draft' }, ...opts })
      await contentStore.unpublish(collection, id!, opts)
      revalidatePath('/', 'layout')
      return json({ ok: true })
    }
    if (request.method === 'GET') {
      if (id) {
        let doc = await contentStore.byID(collection, id, opts)
        if (!doc) return json({ error: 'Înregistrare inexistentă.' }, 404)
        if (collection === 'inquiries' && 'status' in doc && doc.status === 'new')
          doc = await contentStore.update({
            collection,
            id,
            data: { status: 'read', isUnread: false },
            ...opts,
          })
        return json(doc)
      }
      const where: Where = {}
      for (const [k, v] of url.searchParams) {
        const match = k.match(/^where\[(\w+)\]\[(equals|less_than|in|not_in)\](?:\[(\d+)\])?$/)
        if (!match) continue
        const [, field, op, index] = match
        const target = (where[field] ||= {}) as Record<string, unknown>
        if (index !== undefined) {
          const list = (target[op] ||= []) as string[]
          list.push(v)
        } else target[op] = v
      }
      if (url.searchParams.get('status')) where.status = { equals: url.searchParams.get('status') }
      return json(
        await contentStore.find({
          collection,
          ...opts,
          limit: Number(url.searchParams.get('limit') ?? 30),
          page: Number(url.searchParams.get('page') || 1),
          sort: url.searchParams.get('sort') || '-createdAt',
          search: (url.searchParams.get('search') || '').slice(0, 120),
          where,
        }),
      )
    }
    if (request.method === 'DELETE' && id) {
      const media =
        collection === 'media' ? await contentStore.byID('media', id, { depth: 0 }) : null
      if (media) {
        // Detect actual relationship fields, not arbitrary equal numeric values.
        const { mediaInUse } = await import('./references')
        if (await mediaInUse(id))
          return json(
            {
              error: 'Imaginea este folosită în conținut. Elimină referințele înainte de ștergere.',
            },
            409,
          )
      }
      await contentStore.delete(collection, id, opts)
      if (media?.sizes)
        for (const size of Object.values(media.sizes)) await removeMediaFile(size.url)
      revalidatePath('/', 'layout')
      return json({ ok: true })
    }
    if ((request.method === 'POST' && !id) || (request.method === 'PATCH' && id)) {
      if (collection === 'inquiries' && !id)
        return json({ error: 'Folosește formularul public.' }, 405)
      const data = object(JSON.parse((await readBody(request)).toString()))
      // File paths can only be supplied by the image processor.
      if (collection === 'media')
        for (const k of ['filename', 'url', 'sizes', 'width', 'height', 'mimeType']) delete data[k]
      const doc = id
        ? await contentStore.update({ collection, id, data, ...opts })
        : await contentStore.create({ collection, data, ...opts })
      revalidatePath('/', 'layout')
      return json({ doc }, id ? 200 : 201)
    }
    return json({ error: 'Metodă invalidă.' }, 405)
  } catch (error) {
    if (error instanceof AccessError) return json({ error: error.message }, 403)
    if (error instanceof CMSValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 422)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY')
      return json({ error: 'Există deja o înregistrare cu acest slug sau identificator.' }, 409)
    console.error('CMS operation failed', error instanceof Error ? error.name : 'UnknownError')
    return json({ error: 'Operația nu a reușit. Verifică baza de date și încearcă din nou.' }, 503)
  }
}
async function usersAPI(request: Request, user: User, key?: string) {
  if (user.role !== 'owner') return json({ error: 'Acces interzis.' }, 403)
  const db = getDB()
  const id = key ? Number(key) : undefined
  if (key && (!Number.isSafeInteger(id) || id! < 1)) return json({ error: 'ID invalid.' }, 400)
  if (request.method === 'GET') {
    if (id) {
      const row = await db('cms_users').where({ id }).first()
      return row ? json(safeUser(row)) : json({ error: 'Inexistent.' }, 404)
    }
    return json({ docs: (await db('cms_users').select('*')).map(safeUser) })
  }
  if (!['POST', 'PATCH', 'DELETE'].includes(request.method))
    return json({ error: 'Metodă invalidă.' }, 405)
  if (request.method === 'DELETE' && id === user.id)
    return json({ error: 'Nu poți șterge propriul cont.' }, 422)
  const input: Data =
    request.method === 'DELETE'
      ? {}
      : object(JSON.parse((await readBody(request, 4096)).toString()))
  const password = input.password ? await hashPassword(String(input.password)) : undefined
  let savedID = id
  await db.transaction(async (trx) => {
    // Lock all owners to prevent simultaneous requests from removing the last one.
    const owners = await trx('cms_users')
      .where({ role: 'owner', active: true })
      .forUpdate()
      .select('id')
    const current = id ? await trx('cms_users').where({ id }).first() : undefined
    if (id && !current) throw new CMSValidationError('Utilizator inexistent.')
    const username = String(input.username ?? current?.username ?? '')
      .trim()
      .toLowerCase()
    const role = input.role ?? current?.role ?? 'editor'
    const active = input.active ?? Boolean(current?.active ?? true)
    if (
      current?.role === 'owner' &&
      current.active &&
      owners.length <= 1 &&
      (request.method === 'DELETE' || role !== 'owner' || active === false)
    )
      throw new CMSValidationError('Trebuie să rămână cel puțin un owner activ.')
    if (request.method === 'DELETE') {
      await trx('cms_users').where({ id }).delete()
      return
    }
    if (
      !/^[a-z0-9._-]{3,80}$/.test(username) ||
      !['owner', 'editor'].includes(String(role)) ||
      typeof active !== 'boolean'
    )
      throw new CMSValidationError('Utilizator, rol sau stare invalidă.')
    if (!id && !password) throw new CMSValidationError('Parola este obligatorie.')
    const row = {
      username,
      display_name: String(input.displayName ?? current?.display_name ?? username).slice(0, 120),
      role,
      active,
      can_access_inquiries: input.canAccessInquiries === true,
      ...(password ? { password_hash: password } : {}),
    }
    if (id) {
      await trx('cms_users').where({ id }).update(row)
      await trx('cms_sessions').where({ user_id: id }).delete()
    } else {
      const [created] = await trx('cms_users').insert(row)
      savedID = Number(created)
    }
  })
  return json(
    {
      doc:
        savedID && request.method !== 'DELETE'
          ? safeUser(await db('cms_users').where({ id: savedID }).first())
          : null,
    },
    id ? 200 : 201,
  )
}
