import { VideoDetailPage, videoDetailMetadata } from '@/components/site/VideoPages'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  return videoDetailMetadata('ro', (await params).slug)
}
export default async function Page({ params }: Props) {
  return <VideoDetailPage locale="ro" slug={(await params).slug} />
}
