import { GuideArticlePage, guideArticleMetadata } from '@/components/site/GuidePages'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  return guideArticleMetadata('ro', (await params).slug)
}
export default async function Page({ params }: Props) {
  return <GuideArticlePage locale="ro" slug={(await params).slug} />
}
