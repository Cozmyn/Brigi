import Link from 'next/link'
import { RichText } from './RichText'
import type { EditorialPage } from '@/lib/editorial'
import type { SiteContent } from '@/lib/site'
import { Packages } from './Packages'
import { MediaSection } from './MediaSection'
import { ArtistVisual } from './ArtistVisual'
import { TrackedLink } from './TrackedLink'
import type { PublicVideo } from '@/lib/public-videos'
import { ServiceVideoProof } from './ServiceVideoProof'

export function ContentPage({ page, content: c, video }: { page: EditorialPage; content: SiteContent; video?: PublicVideo }) {
  return (
    <article className="inner-page">
      <section className="inner-hero">
        <nav className="breadcrumbs" aria-label="Fir de navigare">
          <Link href="/">Brigitta</Link>
          <span aria-hidden="true">/</span>
          <span>{page.title}</span>
        </nav>
        <p className="eyebrow">Brigitta / Solistă vocală</p>
        <h1>{page.h1}</h1>
        <p className="intro">{page.intro}</p>
        <TrackedLink className="text-link" href="/rezervare">
          {page.ctaLabel || c.cta.availability} ↗
        </TrackedLink>
      </section>
      {page.type === 'service' && video && <ServiceVideoProof video={video} />}
      <div className="editorial-layout section">
        <aside className="page-index">
          <p className="eyebrow">În această pagină</p>
          <nav aria-label="Cuprins">
            {page.sections.map((s, i) => (
              <a key={s.heading} href={`#detaliu-${i + 1}`}>
                <span>0{i + 1}</span>
                {s.heading}
              </a>
            ))}
          </nav>
          <span className="index-mark" aria-hidden="true">
            B.
          </span>
        </aside>
        <div className="editorial-body">
          {page.type === 'about' && c.photos.portrait.src && (
            <ArtistVisual photo={c.photos.portrait} variant="portrait" />
          )}
          {page.sections.map((s, i) => (
            <section id={`detaliu-${i + 1}`} className="editorial-section" key={s.heading}>
              <span className="eyebrow">0{i + 1} /</span>
              <h2>{s.heading}</h2>
              {s.body.split('\n\n').map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.image && <ArtistVisual photo={s.image} variant="editorial" />}
            </section>
          ))}
          {!!page.richText && (
            <div className="rich-text">
              <RichText data={page.richText} />
            </div>
          )}
          {page.serviceArea && (
            <p className="service-area">
              Arie de disponibilitate: {page.serviceArea}. Data și deplasarea se confirmă
              individual.
            </p>
          )}
          {page.type === 'repertoire' && (
            <>
              <ul className="repertoire-list">
                {c.repertoire.categories.map((x, i) => (
                  <li key={x}>
                    <span>0{i + 1}</span>
                    {x}
                  </li>
                ))}
              </ul>
              {c.songs.length > 0 && (
                <div className="song-list">
                  <h2>Selecție din repertoriu</h2>
                  <ul>
                    {c.songs.map((x) => (
                      <li key={x.song + x.originalArtist}>
                        <strong>{x.song}</strong>
                        <span>
                          {x.originalArtist} · {x.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {(page.type === 'media' || page.type === 'about') && <MediaSection items={c.media} />}
      {page.showPackages && <Packages content={c} />}
      {page.faqs.length > 0 && (
        <section className="section faq-section">
          <div>
            <p className="eyebrow">Întrebări utile</p>
            <h2>
              Înainte de
              <br />
              <em>confirmare.</em>
            </h2>
          </div>
          <div className="faq-list">
            {page.faqs.map((f) => (
              <details key={f.question}>
                <summary>
                  {f.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      {page.related.length > 0 && (
        <section className="section related-section">
          <p className="eyebrow">Continuă să explorezi</p>
          <div className="related-grid">
            {page.related.map((x) => (
              <Link href={`/${x.slug}`} key={x.slug}>
                {x.title}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="final-cta">
        <p className="eyebrow">Booking / Brigitta</p>
        <h2>
          Ai o dată <em>în minte?</em>
        </h2>
        <p>Trimite data, localitatea și câteva detalii despre eveniment.</p>
        <TrackedLink className="button" href="/rezervare">
          {page.ctaLabel || c.cta.availability}
          <span aria-hidden="true">↗</span>
        </TrackedLink>
      </section>
    </article>
  )
}
