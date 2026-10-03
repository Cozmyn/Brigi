import 'dotenv/config'
import { readFile, realpath, mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { ContentStore } from '../src/cms/store'
import { getDB, closeDB } from '../src/cms/db'
import { collections, globals } from '../src/cms/schema'
import { defaults, validateFields, type Data } from '../src/cms/validation'
import type { Field } from '../src/cms/model'
import type { ModelMap, GlobalMap } from '../src/cms/types'
import { mediaDirectory } from '../src/cms/media'
type Locale = 'ro' | 'en'
type Export = {
  format: string
  collections: Record<string, Partial<Record<Locale, Data[]>>>
  globals: Record<string, Partial<Record<Locale, Data>>>
}
const input = process.argv[2]
const dryRun = process.argv.includes('--dry-run')
const written: string[] = []
function rich(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(rich)
  const node = value as Data
  if (
    node.type &&
    ![
      'root',
      'text',
      'paragraph',
      'heading',
      'quote',
      'list',
      'listitem',
      'link',
      'autolink',
      'linebreak',
    ].includes(String(node.type))
  )
    throw new Error(
      `Unsupported rich-text node: ${node.type}. Convert it explicitly before importing.`,
    )
  const result = { ...node }
  if (node.type === 'link' && node.fields) {
    const fields = node.fields as Data
    if (fields.linkType === 'internal')
      throw new Error('Internal rich-text links require explicit URL conversion before import.')
    result.url = fields.url
    result.rel = 'noopener noreferrer'
    delete result.fields
  }
  if (node.children) result.children = rich(node.children)
  if (node.root) result.root = rich(node.root)
  return result
}
function relations(fields: Field[], data: Data, map: Map<string, number>, clear = false): Data {
  const out = { ...data }
  for (const f of fields) {
    if (!f.name) {
      Object.assign(out, relations(f.fields || [], data, map, clear))
      continue
    }
    const value = out[f.name]
    if (f.type === 'richText' && value) out[f.name] = rich(value)
    if (f.relationTo && value) {
      const resolve = (v: unknown) => {
        const key = `${f.relationTo}:${typeof v === 'object' && v ? (v as Data).id : v}`
        if (!map.has(key)) throw new Error(`Missing relationship ${key}`)
        return map.get(key)!
      }
      out[f.name] = clear
        ? f.hasMany
          ? []
          : null
        : f.hasMany
          ? (value as unknown[]).map(resolve)
          : resolve(value)
    }
    if (f.type === 'group' && value)
      out[f.name] = relations(f.fields || [], value as Data, map, clear)
    if (f.type === 'array' && Array.isArray(value))
      out[f.name] = value.map((v) => relations(f.fields || [], v, map, clear))
  }
  return out
}
try {
  if (!input)
    throw new Error('Usage: npm run content:import -- /private/export/content.json [--dry-run]')
  const file = await realpath(input)
  const root = path.dirname(file)
  const document: Export = JSON.parse(await readFile(file, 'utf8'))
  if (document.format !== 'brigi-content-v1') throw new Error('Unsupported export format.')
  const keys = new Map<string, number>()
  let count = 0
  for (const [collection, locales] of Object.entries(document.collections)) {
    if (!collections[collection] || collection === 'users')
      throw new Error(`Unsupported collection: ${collection}`)
    for (const [locale, docs] of Object.entries(locales)) {
      if (!['ro', 'en'].includes(locale) || !Array.isArray(docs))
        throw new Error('Invalid locale or documents.')
      for (const doc of docs) {
        keys.set(`${collection}:${doc.id}`, ++count)
        validateFields(collections[collection].fields, {
          ...defaults(collections[collection].fields),
          ...relations(collections[collection].fields, doc, keys, true),
        })
      }
    }
  }
  // Preflight every relationship and file before any database mutation.
  for (const [collection, locales] of Object.entries(document.collections))
    for (const docs of Object.values(locales))
      for (const doc of docs || []) {
        relations(collections[collection].fields, doc, keys)
        if (doc.importPublished)
          relations(collections[collection].fields, doc.importPublished as Data, keys)
        if (collection === 'media') {
          const media = await realpath(path.resolve(root, String(doc.importFile || '')))
          if (!media.startsWith(root + path.sep))
            throw new Error('Media path escapes the export directory.')
          const buffer = await readFile(media)
          if (buffer.length > 20 * 1024 * 1024) throw new Error('Image exceeds import size limit.')
          await sharp(buffer, { limitInputPixels: 40000000 }).metadata()
        }
      }
  for (const [slug, locales] of Object.entries(document.globals)) {
    if (!globals[slug]) throw new Error(`Unsupported global: ${slug}`)
    for (const doc of Object.values(locales))
      validateFields(globals[slug].fields, {
        ...defaults(globals[slug].fields),
        ...relations(globals[slug].fields, doc!, keys),
      })
  }
  if (dryRun) console.log(`Preflight passed for ${count} localized documents. No data written.`)
  else {
    const db = getDB()
    if (
      Number((await db('cms_documents').count({ total: '*' }).first())?.total) ||
      Number((await db('cms_globals').count({ total: '*' }).first())?.total)
    )
      throw new Error(
        'Import requires an empty content database. Import BEFORE seed; never overwrite a populated site.',
      )
    await mkdir(mediaDirectory(), { recursive: true, mode: 0o750 })
    keys.clear()
    await db.transaction(async (trx) => {
      const store = new ContentStore(trx)
      for (const [collectionName, locales] of Object.entries(document.collections)) {
        const collection = collectionName as keyof ModelMap
        for (const [language, docs] of Object.entries(locales))
          for (const source of docs) {
            const locale = language as Locale
            const sourceKey = `${collection}:${source.id}`
            const data = relations(collections[collection].fields, source, keys, true)
            if (collection === 'media') {
              const buffer = await readFile(path.resolve(root, String(source.importFile)))
              const { data: converted, info } = await sharp(buffer, { limitInputPixels: 40000000 })
                .rotate()
                .resize({ width: 2400, withoutEnlargement: true })
                .webp({ quality: 85 })
                .toBuffer({ resolveWithObject: true })
              const filename = `${randomUUID()}-original.webp`
              const target = path.join(mediaDirectory(), filename)
              await writeFile(target, converted, { flag: 'wx', mode: 0o640 })
              written.push(target)
              Object.assign(data, {
                filename,
                url: `/media/${filename}`,
                mimeType: 'image/webp',
                width: info.width,
                height: info.height,
                sizes: {
                  original: { url: `/media/${filename}`, width: info.width, height: info.height },
                },
              })
            }
            const previous = keys.get(sourceKey)
            const doc = previous
              ? await store.update({ collection, id: previous, locale, data })
              : await store.create({ collection, locale, data })
            keys.set(sourceKey, doc.id)
          }
      }
      for (const [name, locales] of Object.entries(document.collections))
        for (const [language, docs] of Object.entries(locales))
          for (const source of docs) {
            const collection = name as keyof ModelMap
            const data = relations(collections[collection].fields, source, keys)
            if (source.importPublished)
              await store.update({
                collection,
                locale: language as Locale,
                id: keys.get(`${collection}:${source.id}`)!,
                data: relations(
                  collections[collection].fields,
                  source.importPublished as Data,
                  keys,
                ),
              })
            // Media bytes and paths were normalized above; do not restore legacy URLs.
            if (collection === 'media')
              for (const key of ['url', 'filename', 'sizes', 'width', 'height', 'mimeType'])
                delete data[key]
            await store.update({
              collection,
              locale: language as Locale,
              id: keys.get(`${collection}:${source.id}`)!,
              data,
            })
            const dates: Record<string, Date> = {}
            for (const [field, column] of [
              ['createdAt', 'created_at'],
              ['updatedAt', 'updated_at'],
            ]) {
              if (source[field]) {
                const date = new Date(String(source[field]))
                if (!Number.isFinite(date.getTime()))
                  throw new Error(`Invalid ${field} for ${collection}:${source.id}`)
                dates[column] = date
              }
            }
            if (Object.keys(dates).length)
              await trx('cms_documents')
                .where({ id: keys.get(`${collection}:${source.id}`)! })
                .update(dates)
          }
      for (const [slug, locales] of Object.entries(document.globals))
        for (const [language, source] of Object.entries(locales))
          await store.updateGlobal({
            slug: slug as keyof GlobalMap,
            locale: language as Locale,
            data: relations(globals[slug].fields, source, keys),
          })
    })
    console.log(
      `Imported ${count} localized documents. Recreate users with admin:create; passwords and sessions are never imported.`,
    )
  }
} catch (error) {
  for (const file of written) await unlink(file).catch(() => {})
  console.error(
    error && typeof error === 'object' && 'sql' in error
      ? 'Database import failed; transaction rolled back. No SQL or private content was logged.'
      : error instanceof Error
        ? error.message
        : 'Import failed.',
  )
  process.exitCode = 1
} finally {
  await closeDB()
}
