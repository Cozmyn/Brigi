import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteContent } from '@/lib/cms'
import { getPublicArticle, getPublicArticles, type ArticleLocale } from '@/lib/public-articles'
import { articleIsIndexable, articleMetadata, articleStructuredData } from '@/lib/article-seo'
import { jsonLD, pageMetadata } from '@/lib/seo'

function GuideShell({ locale, children }: { locale: ArticleLocale; children: ReactNode }) {
  const home = locale === 'en' ? '/en' : '/'
  const hub = locale === 'en' ? '/en/ghiduri' : '/ghiduri'
  const booking = locale === 'en' ? '/en/booking' : '/rezervare'
  return <>
    <header className="site-header">
      <Link className="wordmark" href={home}>BRIGITTA<span className="brand-dot" /></Link>
      <nav aria-label={locale === 'en' ? 'Guides navigation' : 'Navigare ghiduri'}>
        <Link href={hub}>{locale === 'en' ? 'Guides' : 'Ghiduri'}</Link>
      </nav>
      <Link className="header-cta" href={booking}>{locale === 'en' ? 'Check availability' : 'Verifică disponibilitatea'}</Link>
    </header>
    <main id="main">{children}</main>
    <footer className="site-footer"><nav aria-label={locale === 'en' ? 'Footer' : 'Subsol'}>
      <Link href={home}>{locale === 'en' ? 'Home' : 'Acasă'}</Link>{' · '}
      <Link href={hub}>{locale === 'en' ? 'Guides' : 'Ghiduri'}</Link>{' · '}
      <Link href="/confidentialitate">{locale === 'en' ? 'Privacy notice (RO)' : 'Confidențialitate'}</Link>
    </nav></footer>
  </>
}

export async function guideHubMetadata(locale: ArticleLocale) {
  const articles = await getPublicArticles(locale)
  return pageMetadata(locale === 'en' ? 'Music and event guides' : 'Ghiduri despre muzică și evenimente',
    locale === 'en' ? 'Published guides for planning the music of your event.' : 'Ghiduri publicate pentru planificarea muzicii evenimentului.',
    locale === 'en' ? '/en/ghiduri' : '/ghiduri', await getSiteContent(locale),
    { noindex: !articles.some((article) => articleIsIndexable(article)) })
}

export async function GuideHubPage({ locale }: { locale: ArticleLocale }) {
  const articles = await getPublicArticles(locale)
  return <GuideShell locale={locale}><section className="inner-hero">
    <p className="eyebrow">Brigitta / {locale === 'en' ? 'Guides' : 'Ghiduri'}</p>
    <h1>{locale === 'en' ? 'Music and event guides' : 'Ghiduri despre muzică și evenimente'}</h1>
    <p>{locale === 'en' ? 'Ideas and practical guidance for planning your event’s music.' : 'Idei și informații practice pentru planificarea muzicii evenimentului.'}</p>
  </section><section className="section editorial-body">
    {!articles.length && <p>{locale === 'en' ? 'No approved guides have been published yet.' : 'Nu există încă ghiduri aprobate și publicate.'}</p>}
    {articles.map((article) => <article className="editorial-section" key={article.id}>
      <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}><Link href={article.path}>{article.title}</Link></h2>
      <p>{article.summary}</p>
    </article>)}
  </section></GuideShell>
}

export async function guideArticleMetadata(locale: ArticleLocale, slug: string) {
  const article = await getPublicArticle(locale, slug)
  if (!article) notFound()
  return articleMetadata(article, await getSiteContent(locale))
}

export async function GuideArticlePage({ locale, slug }: { locale: ArticleLocale; slug: string }) {
  const article = await getPublicArticle(locale, slug)
  if (!article) notFound()
  const hub = locale === 'en' ? '/en/ghiduri' : '/ghiduri'
  return <GuideShell locale={locale}><article className="inner-page">
    <header className="inner-hero">
      <nav className="breadcrumbs" aria-label={locale === 'en' ? 'Breadcrumb' : 'Fir de navigare'}>
        <Link href={locale === 'en' ? '/en' : '/'}>Brigitta</Link><span>/</span>
        <Link href={hub}>{locale === 'en' ? 'Guides' : 'Ghiduri'}</Link><span>/</span><span>{article.title}</span>
      </nav>
      <h1>{article.title}</h1><p className="intro">{article.summary}</p>
      <p>{locale === 'en' ? 'Author' : 'Autor'}: {article.author}. {locale === 'en' ? 'Reviewed by' : 'Revizuit de'}: {article.reviewer}.</p>
      <p>{locale === 'en' ? 'Published' : 'Publicat'}: <time dateTime={article.publishedAt}>{article.publishedAt?.slice(0, 10)}</time>{' · '}
        {locale === 'en' ? 'Reviewed' : 'Revizuit'}: <time dateTime={article.reviewedAt}>{article.reviewedAt?.slice(0, 10)}</time></p>
    </header>
    <div className="section editorial-body">
      {article.sections?.map((section, index) => <section className="editorial-section" key={index}>
        <h2>{section.heading}</h2>{section.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </section>)}
      <section className="editorial-section"><h2>{locale === 'en' ? 'Sources' : 'Surse'}</h2><ul>
        {article.sources?.map((source, index) => <li key={index}><a href={source.url} rel="noreferrer">{source.label}</a></li>)}
      </ul></section>
      <Link className="text-link" href={locale === 'en' ? '/en/booking' : '/rezervare'}>
        {locale === 'en' ? 'Discuss music for your event' : 'Discută despre muzica evenimentului tău'}
      </Link>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(articleStructuredData(article)) }} />
  </article></GuideShell>
}
