import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPublicVideos, getPublicVideo, videoIsIndexable, videoMetadata, videoStructuredData,
  videoLanguagePair, type PublicVideo, type VideoLocale,
} from '@/lib/public-videos'
import { verifiedHubPair } from '@/lib/hreflang'
import { pageMetadata, jsonLD } from '@/lib/seo'
import { VideoPlayer } from './VideoPlayer'

export function videoContextLabel(video: PublicVideo, locale: VideoLocale): string {
  const en = locale === 'en'
  return ({
    live: en ? 'Live performance' : 'Înregistrare dintr-un recital live',
    studio: en ? 'Studio recording' : 'Înregistrare de studio',
    rehearsal: en ? 'Rehearsal' : 'Înregistrare de la repetiție',
    other: en ? 'Recording' : 'Înregistrare',
  } as const)[video.recordingContext]
}
function Shell({ locale, children }: { locale: VideoLocale; children: ReactNode }) {
  const en = locale === 'en'
  const home = en ? '/en' : '/'
  const hub = en ? '/en/video' : '/video'
  const book = en ? '/en/booking' : '/rezervare'
  return <>
    <header className="site-header">
      <Link className="skip-link" href="#main">{en ? 'Skip to content' : 'Sari la conținut'}</Link>
      <Link className="wordmark" href={home}>BRIGITTA<span className="brand-dot" /></Link>
      <nav className="desktop-nav" aria-label={en ? 'Page navigation' : 'Navigație pagină'}>
        <Link href={hub}>{en ? 'Recordings' : 'Înregistrări'}</Link>
        <Link href={home}>{en ? 'Home' : 'Acasă'}</Link>
      </nav>
      <Link className="header-cta" href={book}>{en ? 'Check availability' : 'Verifică disponibilitatea'} ↗</Link>
    </header>
    <main id="main">{children}</main>
    <footer className="site-footer video-footer">
      <nav aria-label={en ? 'Footer navigation' : 'Navigație subsol'}>
        <Link href={home}>{en ? 'Home' : 'Acasă'}</Link>
        <Link href={hub}>{en ? 'Recordings' : 'Înregistrări'}</Link>
        <Link href={book}>{en ? 'Contact' : 'Contact'}</Link>
      </nav>
    </footer>
  </>
}
export async function videoHubMetadata(locale: VideoLocale) {
  const [videos, others] = await Promise.all([
    getPublicVideos(locale), getPublicVideos(locale === 'ro' ? 'en' : 'ro'),
  ])
  const ro = locale === 'ro' ? videos : others
  const en = locale === 'en' ? videos : others
  const languages = verifiedHubPair(ro, en, '/video', '/en/video')
  return pageMetadata(
    locale === 'en' ? 'Approved performance recordings' : 'Înregistrări video aprobate',
    locale === 'en'
      ? 'Verified recordings of live performances, rehearsals or studio sessions, with sources and context.'
      : 'Înregistrări verificate din recitaluri, repetiții sau studio, cu sursă și context clar.',
    locale === 'en' ? '/en/video' : '/video',
    undefined,
    { noindex: !videos.some((v) => videoIsIndexable(v)), languages },
  )
}
export async function VideoHubPage({ locale }: { locale: VideoLocale }) {
  const videos = await getPublicVideos(locale)
  const en = locale === 'en'
  return <Shell locale={locale}>
    <section className="inner-hero">
      <p className="eyebrow">Brigitta / {en ? 'Recordings' : 'Înregistrări'}</p>
      <h1>{en ? 'Hear the real performance.' : 'Ascultă interpretarea reală.'}</h1>
      <p className="intro">{en
        ? 'Each recording is labelled with its actual context. No synthetic demonstrations.'
        : 'Fiecare material indică modul real în care a fost înregistrat. Fără demonstrații sintetice.'}</p>
    </section>
    <section className="section video-library">
      {!videos.length && <p>{en
        ? 'No verified recordings have been approved for publication yet.'
        : 'Nu există încă înregistrări verificate și aprobate pentru publicare.'}</p>}
      <div className="video-card-grid">
        {videos.map((item) => <Link className="video-card" href={item.path} key={item.id}>
          <div className="video-card-image">
            <Image src={item.thumbnail.src} alt={item.thumbnail.alt} unoptimized loading="lazy"
              width={item.thumbnail.width} height={item.thumbnail.height}
              sizes="(max-width: 760px) 100vw, 46vw" />
            <span aria-hidden="true" className="video-card-play">▶</span>
          </div>
          <p className="eyebrow">{videoContextLabel(item, locale)}</p>
          <h2>{item.title}</h2><p>{item.description}</p>
          <span className="text-link">{en ? 'View recording' : 'Vezi înregistrarea'} ↗</span>
        </Link>)}
      </div>
    </section>
  </Shell>
}
export async function videoDetailMetadata(locale: VideoLocale, slug: string) {
  const video = await getPublicVideo(locale, slug)
  if (!video) return { robots: { index: false, follow: false } }
  const siblings = await getPublicVideos(locale === 'ro' ? 'en' : 'ro')
  return videoMetadata(video, videoLanguagePair(video, siblings))
}
export async function VideoDetailPage({ locale, slug }: { locale: VideoLocale; slug: string }) {
  const video = await getPublicVideo(locale, slug)
  if (!video) notFound()
  const en = locale === 'en'
  const hub = en ? '/en/video' : '/video'
  const book = en ? '/en/booking' : '/rezervare'
  return <Shell locale={locale}>
    <article className="video-detail">
      <header className="inner-hero">
        <nav className="breadcrumbs" aria-label={en ? 'Breadcrumb' : 'Fir de navigare'}>
          <Link href={en ? '/en' : '/'}>Brigitta</Link><span>/</span>
          <Link href={hub}>{en ? 'Recordings' : 'Înregistrări'}</Link><span>/</span>
          <span>{video.title}</span>
        </nav>
        <p className="eyebrow">{videoContextLabel(video, locale)}</p>
        <h1>{video.title}</h1>
        <p className="intro">{video.description}</p>
        <p>{en ? 'Recording length' : 'Durată'}: {Math.ceil(video.durationSeconds / 60)} {en ? 'minutes (approx.)' : 'minute (aproximativ)'}</p>
      </header>
      <section className="section video-detail-player" aria-label={en ? 'Video player' : 'Player video'}>
        <VideoPlayer video={video} locale={locale} />
        {video.thumbnail.credit && <p className="image-caption">{en ? 'Image credit' : 'Credit imagine'}: {video.thumbnail.credit}</p>}
        <p className="video-external-link"><a href={video.url} rel="noopener noreferrer" target="_blank">
          {en ? 'Watch directly on YouTube' : 'Vezi direct pe YouTube'} ↗</a></p>
      </section>
      {video.transcript && <section className="section video-transcript">
        <h2>{en ? 'Transcript / recording notes' : 'Transcriere și note de înregistrare'}</h2>
        {video.transcript.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </section>}
      <section className="section video-detail-cta">
        <h2>{en ? 'Planning your own event?' : 'Pregătești un eveniment?'}</h2>
        <p>{en ? 'Ask about the actual programme and availability.' : 'Întreabă despre programul disponibil și condițiile reale.'}</p>
        <Link className="button" href={book}>{en ? 'Check availability' : 'Verifică disponibilitatea'} ↗</Link>
      </section>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLD(videoStructuredData(video)) }} />
    </article>
  </Shell>
}
