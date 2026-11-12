'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { PublicVideo, VideoLocale } from '@/lib/public-videos'
import { track } from './TrackedLink'

export function VideoPlayer({ video, locale = 'ro' }: { video: PublicVideo; locale?: VideoLocale }) {
  const [playing, setPlaying] = useState(false)
  const en = locale === 'en'
  return <div className="video-player">
    {playing ? (
      <>
        <iframe src={video.embedURL} title={video.title}
          loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen />
        <button type="button" className="video-stop" onClick={() => setPlaying(false)}>
          {en ? 'Close player' : 'Închide playerul'}
        </button>
      </>
    ) : (
      <button type="button" className="video-start"
        aria-label={en ? 'Play verified video: ' + video.title : 'Redă înregistrarea: ' + video.title}
        onClick={() => {
          setPlaying(true)
          track('media_played', { title: video.title })
        }}>
        <Image src={video.thumbnail.src} alt="" width={video.thumbnail.width}
          height={video.thumbnail.height} unoptimized loading="lazy"
          sizes="(max-width: 760px) 100vw, 900px" />
        <span className="video-play-icon" aria-hidden="true">▶</span>
        <span className="video-play-label">{en ? 'Play recording' : 'Redă înregistrarea'}</span>
        <small>{en ? 'YouTube loads only after you click.' : 'YouTube se încarcă doar după apăsare.'}</small>
      </button>
    )}
  </div>
}
