'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import './index.scss'
type Rank = { name: string; count: number }[]
type Overview = {
  enabled: boolean
  visits: { today: number; week: number; month: number }
  views: number
  conversions: { calls: number; cta: number; starts: number; completed: number; packages: number }
  pages: Rank
  referrers: Rank
  campaigns: Rank
  recent: { id: number; name: string; city: string; eventDate: string; status: string }[]
}
type Stats = { newCount: number; overdue: number; active: number; confirmed: number }
export default function BeforeDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const query = async (where: string) => {
      const response = await fetch(`/api/inquiries?limit=0&${where}`, { credentials: 'include' })
      if (!response.ok)
        throw new Error('Accesul la solicitări nu este disponibil pentru acest cont.')
      return response.json()
    }
    void Promise.all([
      query('where[status][equals]=new'),
      query(
        `where[dueAt][less_than]=${encodeURIComponent(new Date().toISOString())}&where[status][not_in][0]=confirmed&where[status][not_in][1]=lost&where[status][not_in][2]=archived&where[status][not_in][3]=spam`,
      ),
      query(
        'where[status][in][0]=read&where[status][in][1]=contacted&where[status][in][2]=offer_prepared',
      ),
      query('where[status][equals]=confirmed'),
    ])
      .then(([a, b, c, d]) => {
        if (active)
          setStats({
            newCount: a.totalDocs,
            overdue: b.totalDocs,
            active: c.totalDocs,
            confirmed: d.totalDocs,
          })
      })
      .catch(() => {})
    void fetch('/api/dashboard', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            'Statisticile nu pot fi încărcate. Verifică accesul și migrațiile bazei de date.',
          )
        return response.json()
      })
      .then((value) => {
        if (active) setOverview(value)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [])
  return (
    <div className="brigitta-dashboard">
      <div className="dash-heading">
        <div>
          <span>BRIGITTA / STUDIO</span>
          <h1>Site, public și solicitări.</h1>
        </div>
        <Link href="/" target="_blank">
          Vezi website-ul ↗
        </Link>
      </div>
      <nav className="dash-shortcuts" aria-label="Administrare rapidă">
        <Link href="/admin/globals/home-settings">Homepage & fotografii</Link>
        <Link href="/admin/globals/site-settings">Contact & setări</Link>
        <Link href="/admin/collections/services">Pachete & prețuri</Link>
        <Link href="/admin/collections/pages">Pagini & SEO</Link>
        <Link href="/admin/collections/media">Bibliotecă media</Link>
        <Link href="/admin/collections/inquiries">Solicitări</Link>
      </nav>
      <h2>Solicitări</h2>
      <div className="stat-grid">
        <Stat label="Noi" value={stats?.newCount} accent />
        <Stat label="Restante" value={stats?.overdue} />
        <Stat label="În lucru" value={stats?.active} />
        <Stat label="Confirmate" value={stats?.confirmed} />
      </div>
      <p className="dash-note">
        Datele de contact sunt vizibile doar conturilor autorizate. Cererile sunt salvate în inbox;
        notificările prin email nu sunt activate.
      </p>
      {error && <p role="alert">{error}</p>}
      {overview && (
        <>
          <h2>Vizite și interes</h2>
          {!overview.enabled && (
            <p className="dash-note">
              Colectarea statisticilor este oprită. Se activează în Contact & setări → Analytics.
              Datele existente, dacă sunt disponibile, sunt afișate mai jos.
            </p>
          )}
          <div className="stat-grid">
            <Stat label="Vizite astăzi" value={overview.visits.today} />
            <Stat label="Ultimele 7 zile" value={overview.visits.week} />
            <Stat label="Ultimele 30 zile" value={overview.visits.month} />
            <Stat label="Pagini văzute / 30 zile" value={overview.views} />
          </div>
          <p className="dash-note">
            Numai vizite cu acord, pe fusul Europe/Bucharest. O vizită = o sesiune de filă în
            browser; nu reprezintă persoane unice. Nu se păstrează IP-uri, identități sau trasee
            individuale. Perioadele de 7/30 zile includ ziua curentă.
          </p>
          <h2>Interacțiuni / ultimele 30 zile</h2>
          <div className="stat-grid">
            <Stat label="Click Sună" value={overview.conversions.calls} />
            <Stat label="Click contact" value={overview.conversions.cta} />
            <Stat label="Formulare începute" value={overview.conversions.starts} />
            <Stat label="Formulare finalizate" value={overview.conversions.completed} />
            <Stat label="Interacțiuni pachete" value={overview.conversions.packages} />
          </div>
          <p className="dash-note">
            Un click pe telefon nu confirmă un apel. Formularele finalizate aici sunt cele măsurate
            cu acord; inboxul conține toate cererile salvate.
          </p>
          <div className="dash-tables">
            <Ranking title="Pagini populare" data={overview.pages} />
            <Ranking title="Surse / domenii" data={overview.referrers} />
            <Ranking title="Campanii UTM" data={overview.campaigns} />
          </div>
          <h2>Cereri recente</h2>
          {overview.recent.length ? (
            <div className="dash-recent">
              {overview.recent.map((x) => (
                <Link href={`/admin/collections/inquiries/${x.id}`} key={x.id}>
                  <strong>{x.name}</strong>
                  <span>
                    {x.city} · {x.eventDate}
                  </span>
                  <span>{x.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="dash-note">Nu sunt cereri disponibile pentru acest cont.</p>
          )}
        </>
      )}
    </div>
  )
}
function Stat({ label, value, accent }: { label: string; value?: number; accent?: boolean }) {
  return (
    <div className={accent ? 'stat accent' : 'stat'}>
      <span>{label}</span>
      <strong>{value ?? '—'}</strong>
    </div>
  )
}
function Ranking({ title, data }: { title: string; data: Rank }) {
  return (
    <section>
      <h3>{title}</h3>
      {data.length ? (
        <table>
          <thead>
            <tr>
              <th scope="col">Sursă / pagină</th>
              <th scope="col">Număr</th>
            </tr>
          </thead>
          <tbody>
            {data.map((x) => (
              <tr key={x.name}>
                <td>{x.name}</td>
                <td>{x.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="dash-note">Nu există date măsurate.</p>
      )}
    </section>
  )
}
