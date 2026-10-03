import { getDB } from './db'
import { collections, globals } from './schema'
import type { Field } from './model'
import type { Data } from './validation'
function contains(fields: Field[], data: Data, id: number): boolean {
  return fields.some((f) => {
    if (!f.name) return contains(f.fields || [], data, id)
    const value = data[f.name]
    if (f.relationTo === 'media')
      return value === id || (Array.isArray(value) && value.includes(id))
    if (f.type === 'group' && value && typeof value === 'object')
      return contains(f.fields || [], value as Data, id)
    if (f.type === 'array' && Array.isArray(value))
      return value.some((v) => contains(f.fields || [], v, id))
    return false
  })
}
export async function mediaInUse(id: number) {
  const db = getDB()
  const documents = await db('cms_locales')
    .whereNot('collection', 'media')
    .select('collection', 'data', 'published_data')
  for (const row of documents)
    for (const data of [row.data, row.published_data])
      if (data && contains(collections[row.collection]?.fields || [], JSON.parse(data), id))
        return true
  for (const row of await db('cms_globals').select('slug', 'data'))
    if (contains(globals[row.slug]?.fields || [], JSON.parse(row.data), id)) return true
  return false
}
