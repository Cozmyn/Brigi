'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Field } from '@/cms/model'
import type { Data } from '@/cms/validation'
import { ArticlePreviewAction } from './ArticlePreviewAction'
const RichEditor = dynamic(() => import('./RichEditor'), {
  ssr: false,
  loading: () => <p>Se încarcă editorul...</p>,
})
export function Fields({
  fields,
  value,
  onChange,
  prefix = '',
  locale = 'ro',
}: {
  fields: Field[]
  value: Data
  onChange: (v: Data) => void
  prefix?: string
  locale?: 'ro' | 'en'
}) {
  return (
    <>
      {fields.map((f, index) => {
        if (f.admin?.hidden) return null
        if (f.type === 'articlePreview')
          return <ArticlePreviewAction key={index} documentID={value.id} locale={locale} />
        if (!f.name)
          return (
            <Fields
              key={index}
              fields={f.fields || []}
              value={value}
              onChange={onChange}
              prefix={prefix}
              locale={locale}
            />
          )
        const key = f.name
        const id = `${prefix}${key}`
        const v = value[key] ?? f.defaultValue
        const set = (next: unknown) => onChange({ ...value, [key]: next })
        const label =
          f.label ||
          (
            {
              heroTitle: 'Titlu principal',
              heroSubtitle: 'Subtitlu',
              alt: 'Descriere imagine (alt)',
              _status: 'Publicare',
              approvedForPublication: 'Aprobat pentru publicare',
              priceApproved: 'Preț aprobat',
              visible: 'Vizibil',
              title: 'Titlu',
              slug: 'Adresă pagină',
              description: 'Descriere',
              internalNotes: 'Note interne',
              status: 'Status',
              phone: 'Telefon',
              email: 'Email',
              name: 'Nume',
              password: 'Parolă',
              username: 'Utilizator',
              displayName: 'Nume afișat',
            } as Record<string, string>
          )[key] ||
          key.replace(/([A-Z])/g, ' $1')
        if (f.type === 'group')
          return (
            <fieldset key={key}>
              <legend>{label}</legend>
              <Fields
                fields={f.fields || []}
                value={(v as Data) || {}}
                onChange={set}
                prefix={`${id}.`}
                locale={locale}
              />
            </fieldset>
          )
        if (f.type === 'array') {
          const rows = (v as Data[]) || []
          return (
            <fieldset key={key}>
              <legend>{label}</legend>
              {rows.map((row, i) => (
                <div className="array-row" key={i}>
                  <div className="array-tools">
                    <span>{i + 1}</span>
                    <button
                      type="button"
                      title="Mută în sus"
                      disabled={!i}
                      onClick={() => {
                        const copy = [...rows]
                        ;[copy[i - 1], copy[i]] = [copy[i], copy[i - 1]]
                        set(copy)
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Mută în jos"
                      disabled={i === rows.length - 1}
                      onClick={() => {
                        const copy = [...rows]
                        ;[copy[i + 1], copy[i]] = [copy[i], copy[i + 1]]
                        set(copy)
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="Elimină element"
                      onClick={() => set(rows.filter((_, n) => n !== i))}
                    >
                      ×
                    </button>
                  </div>
                  <Fields
                    fields={f.fields || []}
                    value={row}
                    prefix={`${id}.${i}.`}
                    locale={locale}
                    onChange={(next) => set(rows.map((r, n) => (n === i ? next : r)))}
                  />
                </div>
              ))}
              <button type="button" onClick={() => set([...rows, {}])}>
                Adaugă element
              </button>
            </fieldset>
          )
        }
        const common = { id, required: f.required, disabled: f.admin?.readOnly }
        return (
          <div className={`admin-field ${f.type === 'checkbox' ? 'check-field' : ''}`} key={key}>
            <label htmlFor={id}>
              {label}
              {f.required ? ' *' : ''}
            </label>
            {f.type === 'checkbox' ? (
              <input
                {...common}
                required={false}
                type="checkbox"
                checked={Boolean(v)}
                onChange={(e) => set(e.target.checked)}
              />
            ) : f.type === 'richText' ? (
              <RichEditor value={v} onChange={set} />
            ) : f.type === 'relationship' || f.type === 'upload' ? (
              <Relation field={f} value={v} onChange={set} id={id} locale={locale} />
            ) : f.type === 'select' ? (
              <select
                {...common}
                multiple={f.hasMany}
                value={(v ?? (f.hasMany ? [] : '')) as string | string[]}
                onChange={(e) =>
                  set(
                    f.hasMany ? [...e.target.selectedOptions].map((o) => o.value) : e.target.value,
                  )
                }
              >
                <option value="">Selectează</option>
                {f.options?.map((o) => (
                  <option
                    key={typeof o === 'string' ? o : o.value}
                    value={typeof o === 'string' ? o : o.value}
                  >
                    {typeof o === 'string' ? o : o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                {...common}
                rows={4}
                maxLength={f.maxLength}
                value={String(v ?? '')}
                onChange={(e) => set(e.target.value)}
              />
            ) : (
              <input
                {...common}
                type={
                  f.type === 'number'
                    ? 'number'
                    : f.type === 'email'
                      ? 'email'
                      : key === 'password'
                        ? 'password'
                        : 'text'
                }
                min={f.min}
                max={f.max}
                step={f.type === 'number' ? 'any' : undefined}
                maxLength={f.maxLength}
                value={String(v ?? '')}
                onChange={(e) =>
                  set(
                    f.type === 'number'
                      ? e.target.value === ''
                        ? null
                        : Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            )}
            {f.admin?.description && <small>{f.admin.description}</small>}
            {f.maxLength && typeof v === 'string' && (
              <small
                className={
                  id.includes('seo') &&
                  ((key === 'title' && v.length > 60) || (key === 'description' && v.length > 160))
                    ? 'warning'
                    : ''
                }
              >
                {v.length} / {f.maxLength}
              </small>
            )}
          </div>
        )
      })}
    </>
  )
}
function Relation({
  field,
  value,
  onChange,
  id,
  locale,
}: {
  field: Field
  value: unknown
  onChange: (v: unknown) => void
  id: string
  locale: 'ro' | 'en'
}) {
  const [docs, setDocs] = useState<Data[]>([])
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    fetch(`/api/${field.relationTo}?limit=500&locale=${locale}`)
      .then(async (r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((r) => {
        if (active) setDocs(r.docs)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [field.relationTo, locale])
  const selected = docs.find((d) => d.id === value)
  return (
    <>
      <select
        id={id}
        multiple={field.hasMany}
        value={(value ?? (field.hasMany ? [] : '')) as string | number | string[]}
        onChange={(e) =>
          onChange(
            field.hasMany
              ? [...e.target.selectedOptions].map((o) => Number(o.value))
              : e.target.value
                ? Number(e.target.value)
                : null,
          )
        }
      >
        <option value="">Nicio selecție</option>
        {docs.map((d) => (
          <option value={Number(d.id)} key={Number(d.id)}>
            {String(d.title || d.alt || d.name || d.song || d.id)}
          </option>
        ))}
      </select>
      {error && <small role="alert">Lista nu poate fi încărcată.</small>}
      {selected?.url && (
        <img
          className="media-preview"
          src={String(selected.url)}
          alt={String(selected.alt || '')}
        />
      )}
    </>
  )
}
