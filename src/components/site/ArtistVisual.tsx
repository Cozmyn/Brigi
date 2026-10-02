import Image from 'next/image'
export function ArtistVisual({
  photo,
  variant = 'hero',
  priority = false,
}: {
  photo: { src: string; alt: string; position?: string; caption?: string }
  variant?: string
  priority?: boolean
}) {
  return (
    <div className={`artist-visual visual-${variant}`}>
      {photo.src ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority={priority}
          sizes={
            variant === 'hero' ? '(max-width: 760px) 100vw, 55vw' : '(max-width: 760px) 100vw, 50vw'
          }
          style={{ objectFit: 'cover', objectPosition: photo.position || 'center' }}
        />
      ) : (
        <div className="stage-art" aria-hidden="true">
          <div className="stage-disc" />
          <div className="stage-beam beam-one" />
          <div className="stage-beam beam-two" />
          <div className="stage-lines" />
          <span className="art-word">LIVE</span>
          <span className="art-note">VOCE · PREZENȚĂ · ENERGIE</span>
        </div>
      )}
      {photo.src && photo.caption && <p className="visual-caption">{photo.caption}</p>}
    </div>
  )
}
