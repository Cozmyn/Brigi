// Generates application types from public field definitions, never from a database.
import { writeFileSync } from 'node:fs'
import { collections, globals } from '../src/cms/schema'
import type { Field } from '../src/cms/model'
const names: Record<string, string> = {
  pages: 'Page',
  media: 'Media',
  services: 'Service',
  faq: 'FAQ',
}
const name = (slug: string) =>
  names[slug] ||
  slug
    .split('-')
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('')
function fields(list: Field[]): string {
  return list
    .map((f) => {
      if (!f.name) return fields(f.fields || [])
      let type = 'string'
      if (f.type === 'number') type = 'number'
      if (f.type === 'checkbox') type = 'boolean'
      if (f.type === 'richText') type = 'unknown'
      if (f.type === 'group' || f.type === 'array')
        type = `{ ${fields(f.fields || [])} }${f.type === 'array' ? '[]' : ''}`
      if (f.type === 'select')
        type = (f.options || [])
          .map((o) => JSON.stringify(typeof o === 'string' ? o : o.value))
          .join(' | ')
      if (f.type === 'upload' || f.type === 'relationship') type = `number | ${name(f.relationTo!)}`
      if (f.hasMany) type = `(${type})[]`
      return `${JSON.stringify(f.name)}${f.required ? '' : '?'}: ${type};\n`
    })
    .join('')
}
let output =
  '// Application-only types generated from src/collections and src/globals. No database metadata.\n'
for (const c of Object.values({ ...collections, ...globals })) {
  output += `export interface ${name(c.slug)} { id: number; createdAt: string; updatedAt: string; ${fields(c.fields)}`
  if (c.slug === 'media')
    output +=
      'url?: string; filename?: string; width?: number; height?: number; mimeType?: string; sizes?: Record<string, {url: string; width: number; height: number}>;'
  output += '}\n'
}
output +=
  'export interface ModelMap {\n' +
  Object.keys(collections)
    .map((s) => `${JSON.stringify(s)}: ${name(s)}`)
    .join(';\n') +
  '\n}\n'
output +=
  'export interface GlobalMap {\n' +
  Object.keys(globals)
    .map((s) => `${JSON.stringify(s)}: ${name(s)}`)
    .join(';\n') +
  '\n}\n'
writeFileSync('src/cms/types.ts', output)
