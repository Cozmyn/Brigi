'use client'
import { useState } from 'react'
import { isPublicURL, type SiteContent } from '@/lib/site'
import { track } from './TrackedLink'
function youtubeID(value: string) {
  try {
    const u = new URL(value)
    const id =
      u.hostname === 'youtu.be'
        ? u.pathname.slice(1)
        : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(u.hostname)
          ? u.searchParams.get('v') || u.pathname.split('/').filter(Boolean)[1]
          : ''
    return /^[\w-]{11}$/.test(id || '') ? id : null
  } catch {
    return null
  }
}
export function MediaSection({ items: media }: { items: SiteContent['media'] }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const items = media.filter(
    (item) => isPublicURL(item.url) && (item.kind !== 'youtube' || youtubeID(item.url)),
  )
  if (!items.length) return null
  return (
    <section id="live" className="section media-section">
      <p className="eyebrow">Live & muzică originală</p>
      <h2>
        Ascultă. <em>Simte.</em>
      </h2>
      <div className="media-grid">
        {items.map((item) => (
          <article key={item.url}>
            <h3>{item.title}</h3>
            {item.kind === 'youtube' ? (
              playing === item.url ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeID(item.url)}?autoplay=1`}
                  title={item.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <button
                  className="media-play"
                  onClick={() => {
                    setPlaying(item.url)
                    track('media_played', { title: item.title })
                  }}
                >
                  Redă videoclipul <span aria-hidden="true">▶</span>
                  <small>Se încarcă de pe YouTube după apăsare.</small>
                </button>
              )
            ) : (
              <a
                className="text-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('media_played', { title: item.title })}
              >
                Ascultă {item.kind === 'spotify' ? 'pe Spotify' : 'materialul'} ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
