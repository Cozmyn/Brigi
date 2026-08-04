import Link from 'next/link'
import { copy, packages, routeMap, type Locale } from '@/lib/site'

export function HomePage({ locale }: { locale: Locale }) {
  const c = copy[locale]
  const r = routeMap[locale]
  return <>
    <section className="hero section-dark">
      <div className="hero-orbit orbit-one" aria-hidden="true" /><div className="hero-orbit orbit-two" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow">{c.heroKicker}</p><h1>{c.heroTitle}</h1><p className="hero-lede">{c.heroText}</p>
        <div className="button-row"><Link className="button" href={r.booking}>{c.cta}</Link><a className="text-link" href="#formats">{c.secondary} <span aria-hidden="true">↘</span></a></div>
        <p className="microcopy">{c.micro}</p>
      </div>
      <div className="hero-note" aria-label={locale === 'ro' ? 'Format disponibil' : 'Available format'}><span>LIVE</span><strong>01—03</strong><small>× 45 MIN</small></div>
    </section>

    <section className="marquee" aria-label={locale === 'ro' ? 'Tipuri de eveniment' : 'Event types'}><div>{locale === 'ro' ? 'CEREMONIE · COCKTAIL · DINNER · PARTY · CORPORATE · GALA' : 'CEREMONY · COCKTAIL · DINNER · PARTY · CORPORATE · GALA'}</div></section>

    <section className="section events-section"><div className="section-intro"><p className="eyebrow">01 · {locale === 'ro' ? 'Evenimente' : 'Events'}</p><h2>{c.eventsTitle}</h2><p>{c.eventsIntro}</p></div><div className="event-grid">{c.events.map(([title, text], i) => <article className="event-card" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="section packages-section section-stone" id="formats"><div className="section-intro split"><div><p className="eyebrow">02 · {locale === 'ro' ? 'Formate live' : 'Live formats'}</p><h2>{locale === 'ro' ? 'Alege ritmul serii' : 'Choose the rhythm of the evening'}</h2></div><p>{locale === 'ro' ? 'Prețul final depinde de dată, locație, program și cerințele tehnice. Trimite detaliile pentru oferta potrivită.' : 'The final price depends on date, location, programme and technical requirements. Share the details for the right proposal.'}</p></div><div className="package-grid">{packages[locale].map((item, i) => <article className="package-card" key={item.sets}><div className="package-top"><span>0{i + 1}</span><strong>{item.sets}</strong></div><h3>{item.name}</h3><p className="package-price">{item.price}</p><p>{item.fit}</p><hr /><p className="package-detail">{item.detail}</p><Link className="text-link" href={`${r.booking}?package=${encodeURIComponent(item.sets.replaceAll(' ', ''))}`}>{c.cta} <span aria-hidden="true">→</span></Link></article>)}</div></section>

    <section className="section why-section section-dark"><div className="section-intro"><p className="eyebrow">03 · Brigitta</p><h2>{c.whyTitle}</h2></div><div className="why-list">{c.why.map(([title, text], i) => <article key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>

    <section className="section process-section"><div className="section-intro"><p className="eyebrow">04 · {locale === 'ro' ? 'Proces' : 'Process'}</p><h2>{c.processTitle}</h2></div><div className="process-grid">{c.process.map(([num, title, text]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="section repertoire-teaser"><div className="repertoire-visual" aria-hidden="true"><span>SOUL</span><span>POP</span><span>LIVE</span></div><div><p className="eyebrow">05 · {locale === 'ro' ? 'Repertoriu' : 'Repertoire'}</p><h2>{c.repTitle}</h2><p>{c.repText}</p><Link className="text-link" href={r.repertoire}>{locale === 'ro' ? 'Descoperă categoriile' : 'Explore the categories'} <span aria-hidden="true">→</span></Link></div></section>

    <section className="section about-teaser section-burgundy"><div><p className="eyebrow">06 · {locale === 'ro' ? 'Despre' : 'About'}</p><h2>{c.aboutTitle}</h2></div><div><p className="large-copy">{c.aboutText}</p><Link className="text-link light" href={r.about}>{locale === 'ro' ? 'Despre Brigitta' : 'About Brigitta'} <span aria-hidden="true">→</span></Link></div></section>

    <section className="section faq-section" id="faq"><div className="section-intro"><p className="eyebrow">07 · FAQ</p><h2>{c.faqTitle}</h2></div><div className="faq-list">{c.faqs.map(([q, a], i) => <details key={q}><summary><span>0{i + 1}</span>{q}<b aria-hidden="true">+</b></summary><p>{a}</p></details>)}</div></section>

    <section className="final-cta section-dark"><p className="eyebrow">{locale === 'ro' ? 'Disponibilitate' : 'Availability'}</p><h2>{c.finalTitle}</h2><p>{c.finalText}</p><Link className="button" href={r.booking}>{c.cta}</Link></section>
  </>
}

