import { formatPrice, siteContent } from '@/lib/site'
import { TrackedLink } from './TrackedLink'
export function Packages() {
  return (
    <section className="section packages-section" id="pachete">
      <div className="section-heading">
        <p className="eyebrow">04 / Pachete live</p>
        <h2>
          Un moment.
          <br />
          <em>Sau o seară întreagă.</em>
        </h2>
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
              <span>de la</span>
              <strong>
                {formatPrice(p.priceFrom)}
                <small> €</small>
              </strong>
            </div>
            <p className="package-detail">{p.detail}</p>
            <TrackedLink
              className="button button-outline"
              event="package_selected"
              detail={{ package: p.id }}
              href={`/rezervare?pachet=${p.formValue}`}
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
