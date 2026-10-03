import { CMSValidationError } from './validation'
export function sameOrigin(request: Request) {
  const expected = new URL(process.env.SITE_URL || 'http://localhost:3000').origin
  return request.headers.get('origin') === expected && request.headers.get('x-brigi-admin') === '1'
}
export async function readBody(request: Request, max = 512000) {
  if (Number(request.headers.get('content-length') || 0) > max)
    throw new CMSValidationError('Cerere prea mare.')
  const reader = request.body?.getReader()
  if (!reader) throw new CMSValidationError('Cerere goală.')
  const chunks: Uint8Array[] = []
  let length = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    length += value.length
    if (length > max) {
      await reader.cancel()
      throw new CMSValidationError('Cerere prea mare.')
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}
export const json = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' },
  })
