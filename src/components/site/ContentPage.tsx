import { siteContent } from '@/lib/site'
import { Packages } from './Packages'
import { MediaSection } from './MediaSection'
import { TrackedLink } from './TrackedLink'
/** One shared structure; add unique editorial content before creating a new SEO route. */
export function ContentPage({
  title,
  intro,
  text,
  variant,
}: {
  title: string
  intro: string
  text: string
  variant: string
}) {
  return (
    <article className="inner-page">
      <section className="inner-hero">
        <p className="eyebrow">Brigitta / Voce live</p>
        <h1>{title}</h1>
        <p className="intro">{intro}</p>
        <p>{text}</p>
      </section>
      {variant === 'service' && <Packages />}
      {variant === 'repertoire' && (
        <section className="section">
          <ul className="repertoire-list">
            {siteContent.repertoire.categories.map((item, i) => (
              <li key={item}>
                <span>0{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
      {variant === 'media' && <MediaSection />}
      <section className="final-cta">
        <h2>
          Ai o dată <em>în minte?</em>
        </h2>
        <p>Spune-ne când și unde are loc evenimentul.</p>
        <TrackedLink className="button" href="/rezervare">
          {siteContent.cta.availability}
          <span aria-hidden="true">↗</span>
        </TrackedLink>
      </section>
    </article>
  )
}
