import Link from 'next/link'
export default function NotFound() {
  return (
    <main id="main" className="legal-page">
      <p className="eyebrow">404 / Pagina nu a fost găsită</p>
      <h1>
        Ne întoarcem
        <br />
        <em>la muzică.</em>
      </h1>
      <p className="legal-lede">Linkul nu mai este disponibil sau adresa a fost scrisă greșit.</p>
      <Link className="button" href="/">
        Pagina principală ↗
      </Link>
    </main>
  )
}
