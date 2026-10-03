import { handleAdminAPI } from '@/cms/api'
export const runtime = 'nodejs'
type Context = { params: Promise<{ cms: string[] }> }
async function handler(request: Request, { params }: Context) {
  return handleAdminAPI(request, (await params).cms)
}
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE }
