'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/cms/auth'
import type { CollectionConfig } from '@/cms/model'
import type { Data } from '@/cms/validation'
import { fieldsForLocale } from '@/cms/validation'
import { Fields } from './Fields'
import BeforeDashboard from '@/components/BeforeDashboard'
import SEOWorkspace from './SEOWorkspace'
import { editorialSEOFeedback, editorialSEOSuggestion } from '@/lib/seo-editor'
type Schemas = {
  collections: Record<string, CollectionConfig>
  globals: Record<string, CollectionConfig>
}
async function api(url: string, method = 'GET', data?: unknown) {
  const response = await fetch(url, {
    method,
    headers: {
      'x-brigi-admin': '1',
      ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(data !== undefined ? { body: data instanceof FormData ? data : JSON.stringify(data) } : {}),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Operația nu a reușit.')
  return result
}
export default function Admin({
  user,
  schemas,
  labels,
  segments,
}: {
  user: User | null
  schemas: Schemas
  labels: Record<string, string>
  segments: string[]
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!user)
    return (
      <main className="admin-login">
        <p className="studio-brand">BRIGITTA / STUDIO</p>
        <h1>Autentificare</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError('')
            const form = new FormData(e.currentTarget)
            try {
              await api('/api/auth/login', 'POST', Object.fromEntries(form))
              router.replace('/admin')
              router.refresh()
            } catch (e) {
              setError((e as Error).message)
            } finally {
              setBusy(false)
            }
          }}
        >
          <label htmlFor="username">Utilizator</label>
          <input name="username" id="username" autoComplete="username" required />
          <label htmlFor="password">Parolă</label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            required
          />
          <button disabled={busy}>{busy ? 'Se verifică...' : 'Intră în cont'}</button>
          {error && <p role="alert">{error}</p>}
        </form>
        <Link href="/">Înapoi la website</Link>
      </main>
    )
  const [kind, name, id] = segments
  const schema = kind === 'globals' ? schemas.globals[name] : schemas.collections[name]
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="studio-brand" href="/admin">
          BRIGITTA / STUDIO
        </Link>
        <nav aria-label="Administrare">
          <Link href="/admin">Prezentare generală</Link>
          <Link href="/admin/seo" aria-current={kind === 'seo' ? 'page' : undefined}>SEO & vizibilitate</Link>
          {Object.keys(schemas.collections).map((key) => (
            <Link
              aria-current={name === key ? 'page' : undefined}
              key={key}
              href={`/admin/collections/${key}`}
            >
              {labels[key]}
            </Link>
          ))}
          <hr />
          {Object.keys(schemas.globals).map((key) => (
            <Link
              aria-current={name === key ? 'page' : undefined}
              key={key}
              href={`/admin/globals/${key}`}
            >
              {labels[key]}
            </Link>
          ))}
        </nav>
        <div className="admin-account">
          <span>
            {user.displayName} / {user.role}
          </span>
          <button
            onClick={async () => {
              await api('/api/auth/logout', 'POST')
              router.refresh()
            }}
          >
            Ieșire din cont
          </button>
        </div>
      </aside>
      <main className="admin-content">
        {!kind ? (
          <BeforeDashboard />
        ) : kind === 'seo' ? (
          <SEOWorkspace />
        ) : schema ? (
          <Content
            key={`${kind}/${name}/${id || ''}`}
            schema={schema}
            label={labels[name]}
            global={kind === 'globals'}
            id={id}
          />
        ) : (
          <>
            <h1>Secțiune indisponibilă</h1>
            <p>Verifică adresa și permisiunile contului.</p>
          </>
        )}
      </main>
    </div>
  )
}
function Content({
  schema,
  label,
  global,
  id,
}: {
  schema: CollectionConfig
  label: string
  global: boolean
  id?: string
}) {
  const router = useRouter()
  const [locale, setLocale] = useState<'ro' | 'en'>('ro')
  const [data, setData] = useState<Data>({})
  const [docs, setDocs] = useState<Data[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [sort, setSort] = useState('-createdAt')
  const [loading, setLoading] = useState(id !== 'create')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  const [revisions, setRevisions] = useState<{ id: number; created_at: string; actor: string }[]>(
    [],
  )
  const [editorVersion, setEditorVersion] = useState(0)
  const edit = global || Boolean(id)
  const endpoint = global
    ? `/api/globals/${schema.slug}`
    : `/api/${schema.slug}${id && id !== 'create' ? `/${id}` : ''}`
  const localized = !['users', 'inquiries', 'media', 'redirects'].includes(schema.slug)
  const seoEditable = schema.slug === 'articles' || schema.slug === 'pages'
  const seoFeedback = seoEditable ? editorialSEOFeedback(data) : null
  const seoSuggestion = seoEditable ? editorialSEOSuggestion(data) : null
  useEffect(() => {
    if (id === 'create') {
      return
    }
    let active = true
    const timer = setTimeout(
      () => {
        setLoading(true)
        setError('')
        const query = new URLSearchParams({ locale, search, status, page: String(page), sort })
        api(`${endpoint}?${query}`)
          .then((r) => {
            if (active) {
              if (edit) setData(r)
              else {
                setDocs(r.docs)
                setPages(r.totalPages || 1)
              }
              setDirty(false)
            }
          })
          .catch((e) => {
            if (active) setError(e.message)
          })
          .finally(() => {
            if (active) setLoading(false)
          })
      },
      search ? 250 : 0,
    )
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [endpoint, edit, id, locale, search, status, page, sort])
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await api(
        `${endpoint}?locale=${locale}`,
        global || id === 'create' ? 'POST' : 'PATCH',
        data,
      )
      setData(result.doc)
      setDirty(false)
      setMessage('Modificările au fost salvate.')
      if (id === 'create') router.push(`/admin/collections/${schema.slug}/${result.doc.id}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api(
        `/api/media/${id && id !== 'create' ? `${id}/upload` : 'upload'}`,
        'POST',
        new FormData(e.currentTarget),
      )
      setData(result.doc)
      setMessage('Fotografia a fost încărcată. Verifică aprobarea pentru publicare.')
      router.push(`/admin/collections/media/${result.doc.id}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  let fields = fieldsForLocale(schema.fields, locale)
  if (schema.slug === 'users')
    fields = [
      ...fields,
      {
        name: 'password',
        type: 'text',
        label:
          id === 'create' ? 'Parolă (minimum 14 caractere)' : 'Parolă nouă (gol = neschimbată)',
        required: id === 'create',
      },
    ]
  return (
    <>
      <header className="admin-heading">
        <div>
          <p className="studio-brand">BRIGITTA / CONȚINUT</p>
          <h1>{label}</h1>
        </div>
        <div className="admin-actions">
          {localized && (
            <label>
              Limba{' '}
              <select
                aria-label="Limba conținutului"
                value={locale}
                onChange={(e) => {
                  if (!dirty || confirm('Renunți la modificările nesalvate?')) {
                    setLocale(e.target.value === 'en' ? 'en' : 'ro')
                    setDirty(false)
                  }
                }}
              >
                <option value="ro">Română</option>
                <option value="en">English</option>
              </select>
            </label>
          )}
          {!edit && schema.slug !== 'inquiries' && (
            <Link className="admin-button" href={`/admin/collections/${schema.slug}/create`}>
              Adaugă
            </Link>
          )}
          <Link href="/" target="_blank">
            Website ↗
          </Link>
        </div>
      </header>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="admin-success">
          {message}
        </p>
      )}
      {loading ? (
        <p role="status">Se încarcă...</p>
      ) : !edit ? (
        <>
          <div className="admin-filters">
            <input
              aria-label="Caută"
              placeholder="Caută"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <select aria-label="Sortare" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="-createdAt">Cele mai recente</option>
              <option value="createdAt">Cele mai vechi</option>
              <option value="-updatedAt">Ultimele modificări</option>
            </select>
            {schema.slug === 'inquiries' && (
              <select
                aria-label="Filtru status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">Toate statusurile</option>
                {schema.fields
                  .find((f) => f.name === 'status')
                  ?.options?.map((o) => (
                    <option
                      value={typeof o === 'string' ? o : o.value}
                      key={typeof o === 'string' ? o : o.value}
                    >
                      {typeof o === 'string' ? o : o.label}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Conținut</th>
                  <th>Stare</th>
                  <th>Actualizat</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={Number(doc.id)}>
                    <td>
                      <Link href={`/admin/collections/${schema.slug}/${doc.id}`}>
                        {Boolean(doc.url) && schema.slug === 'media' && (
                          <img className="media-thumb" src={String(doc.url)} alt="" />
                        )}
                        {String(
                          doc[schema.admin?.useAsTitle || ''] ||
                            doc.title ||
                            doc.name ||
                            doc.alt ||
                            doc.question ||
                            doc.song ||
                            doc.from ||
                            doc.displayName ||
                            `#${doc.id}`,
                        )}
                      </Link>
                      {schema.slug === 'inquiries' && (
                        <small>
                          {String(doc.city)} · {String(doc.eventDate)}
                        </small>
                      )}
                    </td>
                    <td>
                      {String(
                        doc.status ||
                          doc._status ||
                          (doc.approvedForPublication === false ? 'Neaprobat' : ''),
                      )}
                    </td>
                    <td>
                      {doc.updatedAt
                        ? new Date(String(doc.updatedAt)).toLocaleDateString('ro')
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!docs.length && <p>Nu există înregistrări.</p>}
          <div className="admin-pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Înapoi
            </button>
            <span>
              {page} / {pages}
            </span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
              Înainte
            </button>
          </div>
        </>
      ) : (
        <>
          {!global && <Link href={`/admin/collections/${schema.slug}`}>← Înapoi la listă</Link>}
          {schema.slug === 'media' && (
            <form className="upload-form" onSubmit={upload}>
              <h2>{id === 'create' ? 'Încarcă fotografie' : 'Înlocuiește fotografia'}</h2>
              {Boolean(data.url) && (
                <img
                  className="media-preview"
                  src={String(data.url)}
                  alt={String(data.alt || '')}
                />
              )}
              <label>
                Fotografie
                <input
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  required
                />
              </label>
              <label>
                Descriere alt
                <input name="alt" defaultValue={String(data.alt || '')} required />
              </label>
              <p>
                Maximum 12 MB. Portret: 1600 × 2000 px. Editorial: 1800 × 1200 px. Social: 1200 ×
                630 px.
              </p>
              <button disabled={busy}>Încarcă</button>
            </form>
          )}
          {!(schema.slug === 'media' && id === 'create') && (
            <form className="admin-edit" onSubmit={save}>
              {seoEditable && seoFeedback && seoSuggestion && (
                <section className="admin-seo-editor" aria-label="Asistent SEO pentru conținut">
                  <p className="studio-brand">BRIGITTA / SEO EDITOR</p>
                  <h2>Previzualizare text în căutare</h2>
                  <p className="admin-seo-preview-title">{seoFeedback.title || 'Titlu SEO de completat'}</p>
                  <p className="admin-seo-preview-description">
                    {seoFeedback.description || 'Rezumatul articolului sau al paginii va deveni meta descrierea.'}
                  </p>
                  {!!seoFeedback.issues.length && <ul className="admin-seo-warnings">
                    {seoFeedback.issues.map((item) => <li key={item}>{item}</li>)}
                  </ul>}
                  <button type="button" disabled={!seoSuggestion.title} onClick={() => {
                    const existing = data.seo && typeof data.seo === 'object' && !Array.isArray(data.seo)
                      ? data.seo as Data : {}
                    setData({
                      ...data,
                      ...(data.slug || !seoSuggestion.slug ? {} : { slug: seoSuggestion.slug }),
                      seo: {
                        ...existing,
                        ...(!existing.title && seoSuggestion.title ? { title: seoSuggestion.title } : {}),
                        ...(!existing.description && seoSuggestion.description
                          ? { description: seoSuggestion.description } : {}),
                      },
                    })
                    setEditorVersion((value) => value + 1)
                    setDirty(true)
                  }}>Completează slug și meta din textul existent</button>
                  <p className="dash-note">Nu suprascrie titlul SEO sau descrierea personalizate.
                    Nu generează recenzii, fapte sau experiențe. Google poate afișa un fragment diferit.</p>
                </section>
              )}
              <Fields
                key={`${id}:${locale}:${editorVersion}`}
                locale={locale}
                fields={fields}
                value={data}
                onChange={(v) => {
                  setData(v)
                  setDirty(true)
                }}
              />
              <div className="admin-save">
                <button disabled={busy}>{busy ? 'Se salvează...' : 'Salvează modificările'}</button>
                {dirty && <span>Modificări nesalvate</span>}
                {Boolean(data.slug) && (
                  <a
                    href={`/next/preview?path=${encodeURIComponent(`${locale === 'en' ? '/en' : ''}/${data.slug}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Previzualizare ↗
                  </a>
                )}
              </div>
            </form>
          )}
          {!global && id !== 'create' && (
            <div className="admin-danger">
              {schema.versions && (
                <>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      try {
                        await api(`${endpoint}/unpublish?locale=${locale}`, 'POST', {})
                        setData({ ...data, _status: 'draft' })
                        setMessage('Pagina nu mai este publică.')
                      } catch (e) {
                        setError((e as Error).message)
                      }
                    }}
                  >
                    Retrage publicarea
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setRevisions((await api(`${endpoint}/revisions?locale=${locale}`)).docs)
                      } catch (e) {
                        setError((e as Error).message)
                      }
                    }}
                  >
                    Istoric versiuni
                  </button>
                </>
              )}
              <button
                onClick={async () => {
                  if (!confirm('Ștergi definitiv înregistrarea și toate traducerile?')) return
                  try {
                    await api(endpoint, 'DELETE')
                    router.push(`/admin/collections/${schema.slug}`)
                  } catch (e) {
                    setError((e as Error).message)
                  }
                }}
              >
                Șterge înregistrarea
              </button>
            </div>
          )}
          {revisions.length > 0 && (
            <section>
              <h2>Versiuni anterioare</h2>
              {revisions.map((r) => (
                <div className="revision" key={r.id}>
                  <span>
                    {r.created_at} / {r.actor}
                  </span>
                  <button
                    onClick={async () => {
                      if (!confirm('Restabilești această versiune ca ciornă?')) return
                      try {
                        const result = await api(`${endpoint}/restore?locale=${locale}`, 'POST', {
                          revision: r.id,
                        })
                        setData(result.doc)
                        setEditorVersion((value) => value + 1)
                        setMessage('Versiunea a fost restaurată ca ciornă.')
                        router.refresh()
                      } catch (e) {
                        setError((e as Error).message)
                      }
                    }}
                  >
                    Restabilește
                  </button>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </>
  )
}
