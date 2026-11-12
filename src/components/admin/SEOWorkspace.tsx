import Link from 'next/link'
import { commercialSEO } from '@/lib/commercial-seo'

const steps = [
  { title: 'Conținut comercial publicat', href: '/admin/collections/pages',
    detail: 'Nunți, botezuri, corporate, petreceri private. Verifică H1, descrierile, CTA-ul și relevanța fiecărei pagini.' },
  { title: 'Articole și ghiduri', href: '/admin/collections/articles',
    detail: 'Publică ghiduri utile și verificabile. Administrează sursele, autorul, revizia, slugul și legăturile către serviciile reale.' },
  { title: 'Fotografii și dovezi reale', href: '/admin/collections/media',
    detail: 'Încarcă fotografii originale cu descriere alt și drepturi, apoi aprobă-le pentru publicare. Materialele neaprobate nu devin dovezi publice.' },
  { title: 'Video autentic', href: '/admin/collections/videos',
    detail: 'Publică doar înregistrări cu drepturi, poster aprobat și metadate reale. Clipurile verificabile ajută la decizia de contact.' },
  { title: 'Contact, zonă și Google', href: '/admin/globals/site-settings',
    detail: 'Configurează telefonul, emailul, aria reală de servicii, linkurile sociale și tokenul Google Search Console.' },
  { title: 'Prețuri aprobate', href: '/admin/collections/services',
    detail: 'Prețurile apar doar după verificare comercială; nu completa exemple speculative pentru a obține trafic.' },
  { title: 'Homepage și imagine socială', href: '/admin/globals/home-settings',
    detail: 'Alege fotografia reală de prim-plan și OG 1200×630 px, cu drepturi verificate. Personalizează conținutul și metadatele.' },
  { title: 'Leaduri și rate de conversie', href: '/admin/collections/inquiries',
    detail: 'Urmărește cererile calificate, ofertele, confirmările și răspunsul rapid, nu doar numărul de vizitatori.' },
]
export default function SEOWorkspace() {
  return <section className="admin-seo-workspace">
    <header className="admin-heading">
      <div><p className="studio-brand">BRIGITTA / VIZIBILITATE</p>
        <h1>SEO, conținut și creșterea cererilor.</h1></div>
      <Link href="/" target="_blank" rel="noreferrer">Vezi site-ul ↗</Link>
    </header>
    <p>Site-ul are deja metadate, sitemap, canonical, hreflang RO/EN și formulare conectate la CRM.
      Aici poți administra ce influențează rezultatele: textele publicate, materialele reale, contactul și ofertele.</p>
    <div className="admin-seo-section">
      <h2>Ce caută un posibil client</h2>
      <p className="dash-note">Clusterizare editorială pe baza rezultatelor publice din noiembrie 2026,
        <strong> nu</strong> volume din Google Analytics-ul concurenților. Pozițiile și cererea reală se verifică în Search Console.</p>
      <div className="admin-seo-keywords">
        {Object.entries(commercialSEO).map(([slug, item]) =>
          <div key={slug}>
            <h3>{item.title}</h3>
            <p>Intenții: {item.searchIntent}</p>
            <p>{item.description}</p>
            <div><Link href={'/' + slug} target="_blank">Pagina publică ↗</Link>{' '}
              <Link href="/admin/collections/pages">Editează în CMS ↗</Link></div>
          </div>)}
      </div>
    </div>
    <div className="admin-seo-section">
      <h2>Publicare fără cod — pașii de administrare</h2>
      <div className="admin-seo-keywords">
        {steps.map((step, i) => <Link href={step.href} key={step.href}>
          <span className="studio-brand">{String(i + 1).padStart(2, '0')}</span>
          <h3>{step.title}</h3>
          <p>{step.detail}</p>
        </Link>)}
      </div>
    </div>
    <div className="admin-seo-section">
      <h2>Google: configurare și măsurare</h2>
      <p>După aprobarea deploymentului și indexării: verifică domeniul HTTPS în
        Google Search Console, completează codul în <Link href="/admin/globals/site-settings">Contact & setări</Link>,
        trimite <code>/sitemap.xml</code> și inspectează URL-urile comerciale.</p>
      <p>Urmărește impresii, clicuri, CTR și interogări în Search Console, plus leaduri calificate și
        rezervări în CRM. Google Analytics-ul altor site-uri nu este public și nu poate fi dedus din rezultate.</p>
      <p>Nu publica sute de pagini aproape identice pe orașe și nu inventa recenzii,
        experiențe, tarife, parteneri, filmări sau o adresă comercială.</p>
      <p><a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
        Deschide Search Console ↗</a> ·{' '}
        <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer">
          Verifică viteza în PageSpeed Insights ↗</a></p>
    </div>
  </section>
}
