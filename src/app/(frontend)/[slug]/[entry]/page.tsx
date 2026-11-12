import { notFound } from 'next/navigation'
import RomanianPage, { generateMetadata as generatePageMetadata } from '../page'
import { isContentNamespace, isContentSlug } from '@/lib/content-paths'

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string; entry: string }>
  searchParams: Promise<{ pachet?: string; selectie?: string }>
}

async function resolveParams(params: Props['params']) {
  const { slug, entry } = await params
  const combined = `${slug}/${entry}`
  if (!isContentNamespace(slug) || !isContentSlug(combined)) notFound()
  return { slug: combined }
}

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  return generatePageMetadata({ params: Promise.resolve(await resolveParams(params)) })
}

export default async function NamespacedPage({ params, searchParams }: Props) {
  return RomanianPage({
    params: Promise.resolve(await resolveParams(params)),
    searchParams,
  })
}
