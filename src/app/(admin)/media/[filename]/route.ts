import { serveMedia } from '@/cms/media'
export const runtime = 'nodejs'
export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  return serveMedia(request, (await params).filename)
}
