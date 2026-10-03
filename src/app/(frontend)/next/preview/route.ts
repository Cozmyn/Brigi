import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { authenticate } from '@/cms/auth'
export async function GET(request: Request) {
  if (!await authenticate(request.headers)) return new Response('Forbidden', { status: 403 })
  const path = new URL(request.url).searchParams.get('path')
  if (!path || !/^\/(?!\/)[a-z0-9/-]*$/.test(path)) return new Response('Invalid path', { status: 400 })
  ;(await draftMode()).enable()
  redirect(path)
}
