import type { Field } from './model'

export type Data = Record<string, unknown>
export function fieldsForLocale(fields: Field[], locale?: string): Field[] {
  if (locale !== 'en') return fields
  return fields.map((f) => ({
    ...f,
    ...(['text', 'textarea'].includes(f.type) ? { defaultValue: undefined } : {}),
    ...(f.fields ? { fields: fieldsForLocale(f.fields, locale) } : {}),
  }))
}
export class CMSValidationError extends Error {}
export function validateFields(fields: Field[], input: Data, prefix = ''): Data {
  const output: Data = {}
  for (const f of fields) {
    if (!f.name) {
      const validated = validateFields(f.fields || [], input, prefix)
      if (f.validate) {
        const result = f.validate(validated, {})
        if (result !== true)
          throw new CMSValidationError(typeof result === 'string' ? result : 'Grup de câmpuri invalid.')
      }
      Object.assign(output, validated)
      continue
    }
    const key = f.name
    let value = input[key] ?? f.defaultValue
    const path = `${prefix}${key}`
    if (value === undefined || value === null || value === '') {
      if (f.required) throw new CMSValidationError(`${path}: câmp obligatoriu.`)
      if (value !== undefined) output[key] = value
      continue
    }
    if (f.type === 'group') value = validateFields(f.fields || [], object(value), `${path}.`)
    else if (f.type === 'array') {
      if (!Array.isArray(value) || value.length > 500)
        throw new CMSValidationError(`${path}: listă invalidă.`)
      value = value.map((v) => validateFields(f.fields || [], object(v), `${path}.`))
    } else if (f.type === 'checkbox') {
      if (typeof value !== 'boolean')
        throw new CMSValidationError(`${path}: valoare booleană necesară.`)
    } else if (f.type === 'number') {
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        (f.min !== undefined && value < f.min) ||
        (f.max !== undefined && value > f.max)
      )
        throw new CMSValidationError(`${path}: număr în afara limitelor.`)
    } else if (f.type === 'upload' || f.type === 'relationship') {
      const ids = f.hasMany ? value : [value]
      if (!Array.isArray(ids) || ids.some((v) => !Number.isSafeInteger(v) || Number(v) < 1))
        throw new CMSValidationError(`${path}: referință invalidă.`)
    } else if (f.type === 'richText') {
      if (typeof value !== 'object' || Array.isArray(value) || !('root' in value))
        throw new CMSValidationError(`${path}: conținut invalid.`)
      if (JSON.stringify(value).length > 150000)
        throw new CMSValidationError(`${path}: conținut prea mare.`)
    } else if (f.type === 'select') {
      const allowed = f.options?.map((o) => (typeof o === 'string' ? o : o.value)) || []
      const values = f.hasMany ? value : [value]
      if (!Array.isArray(values) || values.some((v) => !allowed.includes(String(v))))
        throw new CMSValidationError(`${path}: opțiune invalidă.`)
    } else {
      if (typeof value !== 'string' || value.length > (f.maxLength || 20000))
        throw new CMSValidationError(`${path}: text invalid sau prea lung.`)
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        throw new CMSValidationError(`${path}: email invalid.`)
      if (f.type === 'date' && !Number.isFinite(Date.parse(value)))
        throw new CMSValidationError(`${path}: dată invalidă.`)
    }
    if (f.validate) {
      const result = f.validate(value, {})
      if (result !== true)
        throw new CMSValidationError(typeof result === 'string' ? result : `${path}: invalid.`)
    }
    if (
      typeof value === 'string' &&
      ['url', 'href', 'ctaUrl', 'from', 'to', 'canonical'].includes(key)
    ) {
      if (
        !/^(\/([a-zA-Z0-9/#?&=._%-]|$)|https:\/\/)/.test(value) ||
        value.startsWith('//') ||
        /[\\\r\n]/.test(value)
      )
        throw new CMSValidationError(`${path}: adresă invalidă.`)
    }
    output[key] = value
  }
  return output
}
export function object(value: unknown): Data {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new CMSValidationError('Obiect JSON necesar.')
  return value as Data
}
export function defaults(fields: Field[]): Data {
  const result: Data = {}
  for (const f of fields) {
    if (!f.name) Object.assign(result, defaults(f.fields || []))
    else if (f.defaultValue !== undefined) result[f.name] = f.defaultValue
    else if (f.type === 'group') result[f.name] = defaults(f.fields || [])
  }
  return result
}
