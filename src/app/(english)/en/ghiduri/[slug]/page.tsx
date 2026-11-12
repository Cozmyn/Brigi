import { GuideArticlePage, guideArticleMetadata } from '@/components/site/GuidePages'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) {
  return guideArticleMetadata('en', (await params).slug)
}
export default async function Page({ params }: Props) {
  return <GuideArticlePage locale="en" slug={(await params).slug} />
}
