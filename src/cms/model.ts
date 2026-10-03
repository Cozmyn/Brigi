export type Field = {
  name?: string
  label?: string
  type: string
  required?: boolean
  localized?: boolean
  unique?: boolean
  index?: boolean
  hasMany?: boolean
  relationTo?: string
  min?: number
  max?: number
  maxLength?: number
  defaultValue?: unknown
  options?: (string | { label: string; value: string })[]
  fields?: Field[]
  admin?: { description?: string; hidden?: boolean; readOnly?: boolean }
  validate?: (value: unknown, context: { previousValue?: unknown }) => string | boolean
}
export type CollectionConfig = {
  slug: string
  fields: Field[]
  versions?: { drafts: boolean | { autosave: boolean }; maxPerDoc?: number }
  admin?: {
    description?: string
    group?: string
    useAsTitle?: string
    listSearchableFields?: string[]
    defaultColumns?: string[]
  }
}
export type GlobalConfig = CollectionConfig
