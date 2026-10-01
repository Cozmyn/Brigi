import Link from 'next/link'
import { siteContent as c, type Locale } from '@/lib/site'
import { ArtistVisual } from './ArtistVisual'
import { BookingForm } from './BookingForm'
import { MediaSection } from './MediaSection'
import { Packages } from './Packages'
import { TrackedLink } from './TrackedLink'
export function HomePage({ locale: _locale }: { locale?: Locale }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" />
            {c.hero.kicker}
          </p>
          <h1>
            {c.hero.title[0]}
            <br />
            <em>{c.hero.title[1]}</em>
          </h1>
          <p className="hero-description">{c.hero.description}</p>
          <div className="hero-actions">
            <TrackedLink className="button" href="/rezervare">
              {c.cta.availability}
              <span aria-hidden="true">↗</span>
            </TrackedLink>
            {c.artist.phone ? (
              <TrackedLink
                event="click_phone"
                className="text-link"
                href={`tel:${c.artist.phone.replace(/[^+\d]/g, '')}`}
              >
                {c.cta.phone} ↗
              </TrackedLink>
            ) : (
              <Link className="text-link" href="#pachete">
                Vezi pachetele <span aria-hidden="true">↓</span>
              </Link>
            )}
          </div>
          <div className="hero-bottom">
            <span>Românesc & internațional</span>
            <Link href="#experienta">
              Descoperă <span aria-hidden="true">↓</span>
            </Link>
          </div>
        </div>
        <ArtistVisual photo={c.photos.hero} priority />
        <div className="hero-side-note" aria-hidden="true">
          BRIGITTA / MUZICĂ LIVE
        </div>
      </section>
      <div className="credibility-strip">
        <span>O voce, mai multe scene.</span>
        <ul>
          {c.artist.credentials.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link href="/despre">Cunoaște-o pe Brigitta ↗</Link>
      </div>
      <section className="section experience-section" id="experienta">
        <div className="experience-copy">
          <p className="eyebrow">01 / Experiența live</p>
          <h2>
            Muzica se simte.
            <br />
            <em>Seara se schimbă.</em>
          </h2>
          <p>{c.experience.description}</p>
          <ol className="moment-list">
            {c.experience.moments.map((item, i) => (
              <li key={item}>
                <span>0{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
        <div className="experience-image">
          <ArtistVisual photo={c.photos.live} variant="live" />
          <p className="image-caption">O voce în prim-plan. O sală în același ritm.</p>
        </div>
      </section>
      <section className="section events-section" id="evenimente">
        <div className="section-heading">
          <p className="eyebrow">02 / Evenimentul tău</p>
          <h2>
            Fiecare seară
            <br />
            <em>are propriul ritm.</em>
          </h2>
        </div>
        <div className="event-list">
          {c.events.map((event, i) => (
            <Link className="event-row" key={event.title} href={event.href}>
              <span className="event-number">0{i + 1}</span>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <span className="event-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="repertoire-section" id="repertoriu">
        <div className="section repertoire-inner">
          <div>
            <p className="eyebrow">03 / {c.repertoire.eyebrow}</p>
            <h2>
              De la emoție
              <br />
              <em>la energie.</em>
            </h2>
            <p>{c.repertoire.description}</p>
            <Link className="text-link" href="/repertoriu">
              Descoperă repertoriul ↗
            </Link>
          </div>
          <ul className="repertoire-list">
            {c.repertoire.categories.map((category, i) => (
              <li key={category}>
                <span>0{i + 1}</span>
                {category}
                <span aria-hidden="true">✦</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <MediaSection />
      <Packages />
      <section className="section artist-section">
        <div className="artist-frame">
          <ArtistVisual photo={c.photos.portrait} variant="portrait" />
        </div>
        <div>
          <p className="eyebrow">Brigitta / Dincolo de scenă</p>
          <h2>
            Vocea,
            <br />
            <em>în prim-plan.</em>
          </h2>
          <p>{c.artist.biography}</p>
          <Link href="/despre" className="text-link">
            Despre Brigitta ↗
          </Link>
        </div>
      </section>
      <section className="section process-section">
        <p className="eyebrow">05 / De la idee la scenă</p>
        <h2>
          Patru pași.
          <br />
          <em>Un program al tău.</em>
        </h2>
        <ol className="process-grid">
          {c.process.map((step, i) => (
            <li key={step.title}>
              <span className="process-number">0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      {c.testimonials.length > 0 && (
        <section className="section testimonials">
          <p className="eyebrow">După ultimul refren</p>
          <h2>
            Vocile <em>celorlalți.</em>
          </h2>
          {c.testimonials.map((item) => (
            <figure key={item.author}>
              <blockquote>{item.quote}</blockquote>
              <figcaption>
                {item.author} · {item.context}
              </figcaption>
            </figure>
          ))}
        </section>
      )}
      <section className="section faq-section" id="intrebari">
        <div>
          <p className="eyebrow">06 / Detalii care contează</p>
          <h2>
            Înainte
            <br />
            <em>de primul refren.</em>
          </h2>
        </div>
        <div className="faq-list">
          {c.faqs.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="section booking-section" id="contact">
        <div className="booking-intro">
          <p className="eyebrow">07 / Hai să vorbim</p>
          <h2>
            Seara ta începe
            <br />
            <em>cu o conversație.</em>
          </h2>
          <p>{c.booking.description}</p>
          {c.artist.phone && (
            <TrackedLink
              event="click_phone"
              className="contact-phone"
              href={`tel:${c.artist.phone.replace(/[^+\d]/g, '')}`}
            >
              {c.cta.phone}
              <br />
              {c.artist.phone} ↗
            </TrackedLink>
          )}
        </div>
        <BookingForm locale="ro" />
      </section>
    </>
  )
}
