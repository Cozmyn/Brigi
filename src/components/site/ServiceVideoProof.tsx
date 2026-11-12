import Link from 'next/link'
import type { PublicVideo } from '@/lib/public-videos'
import { VideoPlayer } from './VideoPlayer'
import { videoContextLabel } from './VideoPages'

export function ServiceVideoProof({ video }: { video: PublicVideo }) {
  return <section className="section service-video-proof" aria-labelledby="service-video-title">
    <div className="service-video-heading">
      <div>
        <p className="eyebrow">Sursă verificată / {videoContextLabel(video, 'ro')}</p>
        <h2 id="service-video-title">Vezi <em>interpretarea.</em></h2>
      </div>
      <p>Material publicat după verificarea drepturilor și a contextului.
        Nu pornește automat și se poate deschide direct pe sursa originală.</p>
    </div>
    <VideoPlayer video={video} />
    <div className="service-video-details">
      <div><h3>{video.title}</h3><p>{video.description}</p></div>
      <Link href={video.path} className="text-link">Detalii și contextul înregistrării ↗</Link>
    </div>
  </section>
}
