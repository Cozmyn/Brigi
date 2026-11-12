import type { Knex } from 'knex'
import { getDB, closeDB } from './db'
import { collections, globals } from './schema'
import { authenticate, canManage, type User } from './auth'
import { syncArticleRedirects } from './article-redirects'
import {
  defaults,
  validateFields,
  fieldsForLocale,
  type Data,
  CMSValidationError,
} from './validation'
import type { Field } from './model'
import type { ModelMap, GlobalMap } from './types'

type Collection = keyof ModelMap
type Locale = 'ro' | 'en'
export type Where = { and?: Where[]; or?: Where[]; [key: string]: unknown }
type Options = {
  locale?: Locale
  overrideAccess?: boolean
  user?: User | null
  depth?: number
  draft?: boolean
}
type Find<C extends Collection> = Options & {
  collection: C
  where?: Where
  limit?: number
  page?: number
  sort?: string
  pagination?: boolean
  select?: Record<string, boolean>
  search?: string
}
const parse = (value: string | Data): Data =>
  typeof value === 'string' ? JSON.parse(value) : value
const localized = (collection: string, locale: Locale = 'ro') =>
  ['inquiries', 'media', 'redirects'].includes(collection) ? 'ro' : locale
export class AccessError extends Error {}

function conditions(query: Knex.QueryBuilder, where: Where | undefined, column: string) {
  for (const [key, value] of Object.entries(where || {})) {
    if ((key === 'and' || key === 'or') && Array.isArray(value)) {
      query.where(function () {
        for (const part of value)
          this[key === 'or' ? 'orWhere' : 'andWhere'](function () {
            conditions(this, part, column)
          })
      })
      continue
    }
    if (!/^[a-zA-Z_][\w.]*$/.test(key) || !value || typeof value !== 'object')
      throw new CMSValidationError('Filtru invalid.')
    for (const [op, target] of Object.entries(value)) {
      const expr = 'JSON_UNQUOTE(JSON_EXTRACT(??, ?))'
      const bindings = [column, `$.${key}`]
      if (op === 'in' || op === 'not_in') {
        if (!Array.isArray(target)) throw new CMSValidationError('Filtru invalid.')
        if (!target.length) {
          if (op === 'in') query.whereRaw('1=0')
          continue
        }
        query.whereRaw(
          `${expr} ${op === 'in' ? 'IN' : 'NOT IN'} (${target.map(() => '?').join(',')})`,
          [...bindings, ...target.map(String)],
        )
      } else {
        const operator = { equals: '=', not_equals: '<>', less_than: '<', greater_than: '>' }[op]
        if (!operator) throw new CMSValidationError('Operator invalid.')
        query.whereRaw(`${expr} ${operator} ?`, [...bindings, String(target)])
      }
    }
  }
}
function publicWhere(collection: string): Where {
  switch (collection) {
    case 'pages':
      return {
        _status: { equals: 'published' },
        visible: { equals: true },
        approvedForPublication: { equals: true },
      }
    case 'services':
      return {
        _status: { equals: 'published' },
        visible: { equals: true },
        priceApproved: { equals: true },
      }
    case 'media':
    case 'videos':
      return { approvedForPublication: { equals: true } }
    case 'testimonials':
      return { visible: { equals: true }, publicationConsent: { equals: true } }
    case 'repertoire':
    case 'redirects':
      return { active: { equals: true } }
    case 'faq':
      return { visible: { equals: true } }
    default:
      throw new AccessError('Acces interzis.')
  }
}
export class ContentStore {
  constructor(private connection?: Knex) {}
  private database() {
    return this.connection || getDB()
  }
  auth = async ({ headers }: { headers: Headers }) => ({ user: await authenticate(headers) })
  destroy = closeDB
  private allowed(collection: string, opts: Options) {
    return opts.overrideAccess !== false || canManage(opts.user, collection)
  }
  async find<C extends Collection>(
    opts: Find<C>,
  ): Promise<{ docs: ModelMap[C][]; totalDocs: number; page: number; totalPages: number }> {
    const schema = collections[opts.collection]
    if (!schema || opts.collection === 'users') throw new AccessError('Colecție indisponibilă.')
    const admin = this.allowed(opts.collection, opts)
    const column =
      schema.versions && (!admin || opts.draft === false) ? 'l.published_data' : 'l.data'
    const query = this.database()('cms_documents as d')
      .join('cms_locales as l', 'l.document_id', 'd.id')
      .where('d.collection', opts.collection)
      .where('l.locale', localized(opts.collection, opts.locale))
      .whereNotNull(column)
    if (!admin) conditions(query, publicWhere(opts.collection), column)
    conditions(query, opts.where, column)
    if (opts.search)
      query.whereRaw('LOWER(??) LIKE ?', [
        column,
        `%${opts.search.toLowerCase().replace(/[\\%_]/g, '\\$&')}%`,
      ])
    const counted = await query.clone().count({ total: 'd.id' }).first()
    const totalDocs = Number(counted?.total || 0)
    const page = Math.max(1, Math.floor(opts.page || 1))
    const limit =
      opts.pagination === false ? 10000 : Math.min(500, Math.max(0, Math.floor(opts.limit ?? 50)))
    const sort = opts.sort || '-createdAt'
    const key = sort.replace(/^-/, '')
    const direction = sort.startsWith('-') ? 'desc' : 'asc'
    if (key === 'createdAt' || key === 'updatedAt')
      query.orderBy(`d.${key === 'createdAt' ? 'created_at' : 'updated_at'}`, direction)
    else if (/^[\w]+$/.test(key))
      query.orderByRaw(`JSON_EXTRACT(??, ?) ${direction}`, [column, `$.${key}`])
    const rows = limit
      ? await query
          .select('d.id', 'd.created_at', 'd.updated_at', { content: column })
          .limit(limit)
          .offset((page - 1) * limit)
      : []
    const docs = await Promise.all(
      rows.map(async (row) => {
        let data: Data = {
          ...parse(row.content),
          id: row.id,
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString(),
        }
        if ((opts.depth ?? 1) > 0)
          data = await this.populate(schema.fields, data, {
            ...opts,
            overrideAccess: admin,
            depth: (opts.depth ?? 1) - 1,
          })
        if (opts.select)
          data = Object.fromEntries(
            Object.entries(data).filter(([k]) => k === 'id' || opts.select?.[k]),
          )
        return data as unknown as ModelMap[C]
      }),
    )
    return { docs, totalDocs, page, totalPages: Math.ceil(totalDocs / Math.max(limit, 1)) }
  }
  async byID<C extends Collection>(
    collection: C,
    id: number,
    opts: Options = {},
  ): Promise<ModelMap[C] | null> {
    const schema = collections[collection]
    if (!schema || collection === 'users') throw new AccessError('Colecție indisponibilă.')
    const admin = this.allowed(collection, opts)
    const column =
      schema.versions && (!admin || opts.draft === false) ? 'l.published_data' : 'l.data'
    const query = this.database()('cms_documents as d')
      .join('cms_locales as l', 'l.document_id', 'd.id')
      .where('d.collection', collection)
      .where('d.id', id)
      .where('l.locale', localized(collection, opts.locale))
      .whereNotNull(column)
    if (!admin) conditions(query, publicWhere(collection), column)
    const row = await query
      .select('d.id', 'd.created_at', 'd.updated_at', { content: column })
      .first()
    if (!row) return null
    let data: Data = {
      ...parse(row.content),
      id: row.id,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }
    if ((opts.depth ?? 1) > 0)
      data = await this.populate(schema.fields, data, { ...opts, depth: (opts.depth ?? 1) - 1 })
    return data as unknown as ModelMap[C]
  }
  async count<C extends Collection>(opts: Find<C>) {
    const result = await this.find({ ...opts, limit: 0, pagination: true })
    return { totalDocs: result.totalDocs }
  }
  private async populate(fields: Field[], data: Data, opts: Options): Promise<Data> {
    const result = { ...data }
    for (const f of fields) {
      if (!f.name) {
        Object.assign(result, await this.populate(f.fields || [], data, opts))
        continue
      }
      const value = result[f.name]
      if (!value) continue
      if (f.type === 'group')
        result[f.name] = await this.populate(f.fields || [], value as Data, opts)
      if (f.type === 'array' && Array.isArray(value))
        result[f.name] = await Promise.all(value.map((v) => this.populate(f.fields || [], v, opts)))
      if (f.relationTo && (f.type === 'upload' || f.type === 'relationship')) {
        const resolve = (id: unknown) =>
          typeof id === 'number'
            ? this.byID(f.relationTo as Collection, id, opts)
            : Promise.resolve(null)
        result[f.name] =
          f.hasMany && Array.isArray(value)
            ? (await Promise.all(value.map(resolve))).filter(Boolean)
            : await resolve(value)
      }
    }
    return result
  }
  async create<C extends Collection>(opts: Options & { collection: C; data: Data }) {
    return this.save(opts)
  }
  async update<C extends Collection>(opts: Options & { collection: C; id: number; data: Data }) {
    return this.save(opts)
  }
  private async save<C extends Collection>(
    opts: Options & { collection: C; id?: number; data: Data },
  ): Promise<ModelMap[C]> {
    if (!this.allowed(opts.collection, opts) || opts.collection === 'users')
      throw new AccessError('Acces interzis.')
    const schema = collections[opts.collection]
    if (!schema) throw new CMSValidationError('Colecție invalidă.')
    const locale = localized(opts.collection, opts.locale)
    const id = await this.database().transaction(async (trx) => {
      let id = opts.id
      if (id) {
        const parent = await trx('cms_documents')
          .where({ id, collection: opts.collection })
          .forUpdate()
          .first()
        if (!parent) throw new CMSValidationError('Înregistrare inexistentă.')
      } else {
        const ids = await trx('cms_documents').insert({ collection: opts.collection })
        id = Number(ids[0])
      }
      const old = await trx('cms_locales').where({ document_id: id, locale }).first()
      const oldData = old ? parse(old.data) : {}
      const input = {
        ...defaults(fieldsForLocale(schema.fields, locale)),
        ...oldData,
        ...opts.data,
      }
      if (opts.collection === 'inquiries' && !old)
        Object.assign(input, {
          status: 'new',
          isUnread: true,
          dueAt: new Date(Date.now() + 10 * 86400000).toISOString(),
        })
      const data = validateFields(fieldsForLocale(schema.fields, locale), input)
      if (opts.collection === 'media')
        for (const key of ['url', 'filename', 'width', 'height', 'mimeType', 'sizes'])
          if (input[key] !== undefined) data[key] = input[key]
      if (opts.collection === 'redirects') {
        if (
          !/^\/(?!\/)[a-z0-9/-]*$/.test(String(data.from)) ||
          !/^\/(?!\/)[a-z0-9/-]*$/.test(String(data.to)) ||
          data.from === data.to
        )
          throw new CMSValidationError('Redirecționare internă invalidă.')
      }
      const json = JSON.stringify(data)
      const publication =
        !schema.versions || data._status === 'published' ? json : old?.published_data || null
      const unique = data.idempotencyKey || (opts.collection === 'redirects' ? data.from : null)
      const row = {
        document_id: id,
        locale,
        collection: opts.collection,
        slug: data.slug || null,
        unique_key: unique,
        data: json,
        published_data: publication,
      }
      if (old) await trx('cms_locales').where({ document_id: id, locale }).update(row)
      else await trx('cms_locales').insert(row)
      // Pasul 2: a committed lead must always have a durable notification job.
      if (opts.collection === 'inquiries' && !old)
        await trx('inquiry_outbox').insert({ inquiry_id: id, status: 'pending' })
      await trx('cms_documents').where({ id }).update({ updated_at: trx.fn.now() })
      if (old) {
        await trx('cms_revisions').insert({
          document_id: id,
          locale,
          data: old.data,
          actor: opts.user?.username || 'system',
        })
        const obsolete = await trx('cms_revisions')
          .where({ document_id: id, locale })
          .orderBy('id', 'desc')
          .offset(30)
          .select('id')
        if (obsolete.length)
          await trx('cms_revisions')
            .whereIn(
              'id',
              obsolete.map((r) => r.id),
            )
            .delete()
      }
      if (opts.collection === 'articles' && data._status === 'published')
        await syncArticleRedirects(trx, id!, locale, old?.published_data, data)
      if (opts.collection === 'pages' && data._status === 'published' && old?.published_data) {
        const previous = parse(old.published_data)
        if (previous.slug && previous.slug !== data.slug) {
          const prefix = locale === 'en' ? '/en/' : '/'
          const from = `${prefix}${previous.slug}`
          const to = `${prefix}${data.slug}`
          const existing = await trx('cms_locales')
            .where({ collection: 'redirects', locale: 'ro', unique_key: from })
            .first()
          const redirect = JSON.stringify({ from, to, code: '308', active: true })
          if (existing)
            await trx('cms_locales')
              .where({ document_id: existing.document_id, locale: 'ro' })
              .update({ data: redirect, published_data: redirect })
          else {
            const [redirectID] = await trx('cms_documents').insert({ collection: 'redirects' })
            await trx('cms_locales').insert({
              document_id: redirectID,
              locale: 'ro',
              collection: 'redirects',
              unique_key: from,
              data: redirect,
              published_data: redirect,
            })
          }
        }
      }
      await trx('cms_audit').insert({
        actor: opts.user?.username || 'system',
        action:
          opts.collection === 'inquiries'
            ? `inquiry:${String(data.status)}`
            : old
              ? 'update'
              : 'create',
        entity: `${opts.collection}:${id}:${locale}`,
      })
      return id
    })
    return (await this.byID(opts.collection, id!, { ...opts, depth: 0 }))!
  }
  async delete(collection: Collection, id: number, opts: Options = {}) {
    if (!this.allowed(collection, opts)) throw new AccessError('Acces interzis.')
    await this.database().transaction(async (trx) => {
      await trx('cms_documents').where({ id, collection }).delete()
      await trx('cms_audit').insert({
        actor: opts.user?.username || 'system',
        action: 'delete',
        entity: `${collection}:${id}` ,
      })
    })
  }
  async unpublish(collection: Collection, id: number, opts: Options = {}) {
    if (!this.allowed(collection, opts)) throw new AccessError('Acces interzis.')
    await this.database()('cms_locales')
      .where({ document_id: id, collection, locale: localized(collection, opts.locale) })
      .update({ published_data: null })
  }
  async findGlobal<S extends keyof GlobalMap>(opts: Options & { slug: S }): Promise<GlobalMap[S]> {
    const schema = globals[opts.slug]
    if (!schema) throw new CMSValidationError('Setări inexistente.')
    if (opts.slug === 'privacy-settings' && !this.allowed(opts.slug, opts))
      throw new AccessError('Acces interzis.')
    const row = await this.database()('cms_globals')
      .where({ slug: opts.slug, locale: opts.locale || 'ro' })
      .first()
    let data = {
      ...defaults(fieldsForLocale(schema.fields, opts.locale)),
      ...(row ? parse(row.data) : {}),
    }
    if ((opts.depth ?? 1) > 0)
      data = await this.populate(schema.fields, data, { ...opts, depth: (opts.depth ?? 1) - 1 })
    return data as unknown as GlobalMap[S]
  }
  async updateGlobal<S extends keyof GlobalMap>(opts: Options & { slug: S; data: Data }) {
    if (!this.allowed(opts.slug, opts)) throw new AccessError('Acces interzis.')
    const current = await this.findGlobal({ ...opts, depth: 0 })
    const data = validateFields(fieldsForLocale(globals[opts.slug].fields, opts.locale), {
      ...current,
      ...opts.data,
    })
    if (opts.slug === 'privacy-settings')
      data.completed = Boolean(
        data.operatorName && data.privacyContact && data.retentionRule && data.policyVersion,
      )
    await this.database()('cms_globals')
      .insert({ slug: opts.slug, locale: opts.locale || 'ro', data: JSON.stringify(data) })
      .onConflict(['slug', 'locale'])
      .merge({ data: JSON.stringify(data), updated_at: this.database().fn.now() })
    return this.findGlobal(opts)
  }
}
export const contentStore = new ContentStore()
