import path from 'node:path'
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { contentStore } from './store'
import { authenticate, type User } from './auth'
import { CMSValidationError } from './validation'
import { readBody } from './http'
import { getDB } from './db'

export const mediaDirectory = () => path.resolve(process.env.MEDIA_DIR || './storage/media')
export async function uploadMedia(request: Request, user: User, id?: number) {
  // Read the stream with a hard cap before parsing multipart data.
  const raw = await readBody(request, 12 * 1024 * 1024)
  const form = await new Response(new Uint8Array(raw), {
    headers: { 'content-type': request.headers.get('content-type') || '' },
  }).formData()
  const file = form.get('file')
  if (
    !(file instanceof File) ||
    !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)
  )
    throw new CMSValidationError('Alege o fotografie JPG, PNG, WebP sau AVIF.')
  const alt = String(form.get('alt') || '').trim()
  if (!alt) throw new CMSValidationError('Descrierea alt este obligatorie.')
  const buffer = Buffer.from(await file.arrayBuffer())
  const input = sharp(buffer, { limitInputPixels: 40000000, animated: false }).rotate()
  const metadata = await input.metadata()
  if (!['jpeg', 'png', 'webp', 'avif', 'heif'].includes(metadata.format || ''))
    throw new CMSValidationError('Format imagine invalid.')
  const directory = mediaDirectory()
  await mkdir(directory, { recursive: true, mode: 0o750 })
  const stem = randomUUID()
  const created: string[] = []
  const variants = [
    { name: 'original', width: 2400 },
    { name: 'thumbnail', width: 300 },
    { name: 'small', width: 600 },
    { name: 'medium', width: 900 },
    { name: 'large', width: 1400 },
  ]
  const sizes: Record<string, { url: string; width: number; height: number }> = {}
  try {
    for (const v of variants) {
      const filename = `${stem}-${v.name}.webp`
      const { data, info } = await input
        .clone()
        .resize({ width: v.width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true })
      await writeFile(path.join(directory, filename), data, { mode: 0o640, flag: 'wx' })
      created.push(filename)
      sizes[v.name] = { url: `/media/${filename}`, width: info.width, height: info.height }
    }
    const data = {
      alt,
      filename: created[0],
      url: sizes.original.url,
      width: sizes.original.width,
      height: sizes.original.height,
      mimeType: 'image/webp',
      sizes,
    }
    const old = id ? await contentStore.byID('media', id, { depth: 0 }) : null
    const doc = id
      ? await contentStore.update({ collection: 'media', id, data, user })
      : await contentStore.create({
          collection: 'media',
          data: { ...data, approvedForPublication: false },
          user,
        })
    if (old?.sizes) for (const size of Object.values(old.sizes)) await removeMediaFile(size.url)
    return doc
  } catch (error) {
    for (const file of created) await unlink(path.join(directory, file)).catch(() => {})
    throw error
  }
}
export async function removeMediaFile(url: string) {
  const filename = url.split('/').pop() || ''
  if (/^[a-f0-9-]+-[a-z]+\.webp$/.test(filename))
    await unlink(path.join(mediaDirectory(), filename)).catch(() => {})
}
export async function serveMedia(request: Request, filename: string) {
  if (!/^[a-f0-9-]+-[a-z]+\.webp$/.test(filename)) return new Response(null, { status: 404 })
  const original = filename.replace(/-[a-z]+\.webp$/, '-original.webp')
  const row = await getDB()('cms_locales')
    .where({ collection: 'media', locale: 'ro' })
    .whereRaw('JSON_UNQUOTE(JSON_EXTRACT(data, ?)) = ?', ['$.filename', original])
    .first()
  if (!row) return new Response(null, { status: 404 })
  const data = JSON.parse(row.data)
  if (!data.approvedForPublication && !(await authenticate(request.headers)))
    return new Response(null, { status: 404 })
  try {
    const file = await readFile(path.join(mediaDirectory(), filename))
    return new Response(file, {
      headers: {
        'Content-Type': 'image/webp',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}
