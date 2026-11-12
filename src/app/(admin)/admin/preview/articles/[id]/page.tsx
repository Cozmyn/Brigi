import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getArticlePreview } from '@/lib/article-preview'
import styles from './preview.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Preview privat articol | Brigitta',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ locale?: string | string[] }>
}

export default async function ArticlePreviewPage({ params, searchParams }: Props) {
  const { id } = await params
  const { locale } = await searchParams
  const preview = await getArticlePreview(new Headers(await headers()), id, locale)
  if (!preview) notFound()
  const { article } = preview
  const english = preview.locale === 'en'
  return <main className={styles.preview} lang={preview.locale}>
    <aside className={styles.notice}>
      <p>{english ? 'Private preview of the saved draft. This is not publication.' : 'Previzualizare privată a draftului salvat. Nu reprezintă publicare.'}</p>
      <p>{english ? 'Unsaved changes are not shown.' : 'Modificările nesalvate nu sunt afișate.'}</p>
      <Link href={`/admin/collections/articles/${article.id}`}>
        {english ? 'Back to editor (select EN again)' : 'Înapoi la editor'}
      </Link>
    </aside>
    <article>
      <header>
        <p>{english ? 'Editorial status' : 'Stare editorială'}: {article.editorialStatus || 'draft'} / {article._status || 'draft'}</p>
        <h1>{article.title}</h1>
        {article.summary && <p className={styles.summary}>{article.summary}</p>}
        <p>{english ? 'Author' : 'Autor'}: {article.author || '—'}. {english ? 'Reviewer' : 'Recenzor'}: {article.reviewer || '—'}.</p>
      </header>
      {article.sections?.map((section, index) => <section key={index}>
        <h2>{section.heading}</h2>
        {section.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </section>)}
      {!!article.sources?.length && <section><h2>{english ? 'Sources' : 'Surse'}</h2><ul>
        {article.sources.map((source, index) => <li key={index}>
          <a href={source.url} rel="noreferrer">{source.label}</a>
        </li>)}
      </ul></section>}
    </article>
  </main>
}
