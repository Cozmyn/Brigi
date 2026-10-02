import { formatPrice, type SiteContent } from '@/lib/site'
import { TrackedLink } from './TrackedLink'
export function Packages({ content: siteContent }: { content: SiteContent }) {
  if (!siteContent.packages.length) return null
  return (
    <section className="section packages-section" id="pachete">
      <div className="section-heading">
        <p className="eyebrow">04 / Pachete live</p>
        <h2>{siteContent.headings.packages}</h2>
        <p>Alege punctul de pornire. Împreună stabilim detaliile.</p>
      </div>
      <div className="package-grid">
        {siteContent.packages.map((p, i) => (
          <article className={`package-card ${p.featured ? 'featured' : ''}`} key={p.id}>
            <div className="package-top">
              <span>0{i + 1}</span>
              {p.featured && <span className="package-label">Ritmul serii</span>}
            </div>
            <h3>{p.name}</h3>
            <p className="package-duration">
              {p.sets} × {p.duration} minute
            </p>
            <p className="package-description">{p.description}</p>
            <div className="package-price">
              <span>{p.fromPricing ? 'de la' : 'preț'}</span>
              <strong>
                {formatPrice(p.priceFrom)}
                <small> {p.currency === 'EUR' ? '€' : 'lei'}</small>
              </strong>
            </div>
            <p className="package-detail">{p.detail}</p>
            {p.features.length > 0 && (
              <ul className="package-features">
                {p.features.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            <TrackedLink
              className="button button-outline"
              event="package_selected"
              detail={{ package: p.id }}
              href={`/rezervare?pachet=${p.formValue}&selectie=${encodeURIComponent(p.id)}`}
            >
              {siteContent.cta.availability}
              <span aria-hidden="true">↗</span>
            </TrackedLink>
          </article>
        ))}
      </div>
      <p className="pricing-note">{siteContent.pricingNote}</p>
      <TrackedLink className="text-link" href="/rezervare?pachet=custom">
        Ai în minte un alt format? Discutăm despre el <span aria-hidden="true">↗</span>
      </TrackedLink>
    </section>
  )
}
