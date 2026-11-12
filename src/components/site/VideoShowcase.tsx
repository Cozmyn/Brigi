import Link from 'next/link'
import type { PublicVideo } from '@/lib/public-videos'
import { videoContextLabel } from './VideoPages'
import { VideoPlayer } from './VideoPlayer'

/** A proof section exists only after actual footage has been approved. */
export function VideoShowcase({ videos }: { videos: PublicVideo[] }) {
  if (!videos.length) return null
  const [featured, ...others] = videos.slice(0, 3)
  return <section className="section video-proof" id="live" aria-labelledby="video-proof-title">
    <div className="video-proof-heading">
      <div>
        <p className="eyebrow">Dovezi / Interpretare</p>
        <h2 id="video-proof-title">Ascultă. <em>Verifică.</em></h2>
      </div>
      <p>Înregistrări reale, cu context declarat, durată și sursă verificabilă.
        Playerul extern se încarcă numai la alegerea ta.</p>
    </div>
    <div className="video-proof-grid">
      <div className="video-proof-feature">
        <VideoPlayer video={featured} />
        <p className="video-proof-label">{videoContextLabel(featured, 'ro')}</p>
        <h3><Link href={featured.path}>{featured.title}</Link></h3>
        <p>{featured.description}</p>
        <Link className="text-link" href={featured.path}>
          Detalii și transcriere, dacă există ↗
        </Link>
      </div>
      {!!others.length && <div className="video-proof-related">
        {others.map((video) => <article key={video.id} className="video-proof-tile">
          <p className="eyebrow">{videoContextLabel(video, 'ro')}</p>
          <h3><Link href={video.path}>{video.title}</Link></h3>
          <p>{video.description}</p>
          <Link href={video.path} className="text-link">Vezi materialul ↗</Link>
        </article>)}
      </div>}
    </div>
    <Link href="/video" className="text-link">Toate înregistrările verificate ↗</Link>
  </section>
}
