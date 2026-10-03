// Run against the OLD running installation. Exports content, never passwords or schema.
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
const [source, destination] = process.argv.slice(2)
if (!source || !destination || !source.startsWith('https://'))
  throw new Error(
    'Usage: node scripts/export-legacy.mjs https://old-site.example /absolute/private/export-directory',
  )
const origin = new URL(source).origin
if (!path.isAbsolute(destination))
  throw new Error('Use an absolute private directory outside the repository.')
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
let token
try {
  const username = await terminal.question('Old admin username: ')
  process.stdout.write('Old admin password (hidden): ')
  mute = true
  const password = await terminal.question('')
  mute = false
  process.stdout.write('\n')
  const login = await fetch(`${origin}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    redirect: 'error',
  })
  if (!login.ok) throw new Error('Old CMS login failed.')
  token = (await login.json()).token
} finally {
  terminal.close()
}
async function get(route) {
  const response = await fetch(`${origin}${route}`, {
    headers: { Authorization: `JWT ${token}` },
    redirect: 'error',
  })
  if (!response.ok) throw new Error(`Export failed for ${route.split('?')[0]}: ${response.status}`)
  return response.json()
}
await mkdir(path.join(destination, 'media'), { recursive: true, mode: 0o700 })
const collections = [
  'media',
  'pages',
  'services',
  'videos',
  'repertoire',
  'testimonials',
  'faq',
  'redirects',
  'inquiries',
]
const globals = ['home-settings', 'site-settings', 'header', 'footer', 'privacy-settings']
const result = { format: 'brigi-content-v1', collections: {}, globals: {} }
for (const collection of collections) {
  result.collections[collection] = {}
  for (const locale of ['ro', 'en']) {
    if (locale === 'en' && ['media', 'redirects', 'inquiries'].includes(collection)) continue
    const docs = []
    let page = 1
    while (true) {
      const response = await get(
        `/api/${collection}?locale=${locale}&fallback-locale=none&depth=0&draft=true&limit=100&page=${page}`,
      )
      const translatedKey = {
        pages: 'title',
        services: 'name',
        videos: 'title',
        repertoire: 'category',
        testimonials: 'quote',
        faq: 'question',
      }[collection]
      docs.push(
        ...response.docs.filter((doc) => locale !== 'en' || !translatedKey || doc[translatedKey]),
      )
      if (!response.hasNextPage) break
      page++
    }
    result.collections[collection][locale] = docs
    if (['pages', 'services'].includes(collection)) {
      let publishedPage = 1
      while (true) {
        const published = await get(
          `/api/${collection}?locale=${locale}&fallback-locale=none&depth=0&draft=false&limit=100&page=${publishedPage}`,
        )
        for (const doc of published.docs) {
          const draft = docs.find((item) => item.id === doc.id)
          if (draft && doc._status === 'published') draft.importPublished = doc
        }
        if (!published.hasNextPage) break
        publishedPage++
      }
    }
    if (collection === 'media')
      for (const doc of docs) {
        const url = new URL(doc.url, origin)
        if (url.origin !== origin)
          throw new Error('External media must be downloaded and reviewed manually before import.')
        const response = await fetch(url, {
          headers: { Authorization: `JWT ${token}` },
          redirect: 'error',
        })
        if (!response.ok) throw new Error(`Media export failed for ID ${doc.id}.`)
        const data = Buffer.from(await response.arrayBuffer())
        if (data.length > 20 * 1024 * 1024) throw new Error(`Media ID ${doc.id} exceeds 20 MB.`)
        doc.importFile = `media/${String(doc.id).replace(/[^a-zA-Z0-9-]/g, '')}.image`
        await writeFile(path.join(destination, doc.importFile), data, { mode: 0o600, flag: 'wx' })
      }
  }
}
for (const global of globals) {
  result.globals[global] = {}
  for (const locale of ['ro', 'en'])
    result.globals[global][locale] = await get(
      `/api/globals/${global}?locale=${locale}&fallback-locale=none&depth=0`,
    )
}
await writeFile(path.join(destination, 'content.json'), JSON.stringify(result, null, 2), {
  mode: 0o600,
  flag: 'wx',
})
console.log(
  'Content exported privately. Keep this directory out of Git and public_html. User passwords and sessions were not exported.',
)
