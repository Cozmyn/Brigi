'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import './index.css'
type Rank = { name: string; count: number }[]
type Overview = {
  enabled: boolean
  mediaReadiness?: { verifiedVideoCount: number; pendingVideoReview: number;
    heroPhotoApproved: boolean; approvedOfferCount: number; credentialSourceCount: number }
  visits: { today: number; week: number; month: number }
  views: number
  conversions: { calls: number; cta: number; starts: number; completed: number; packages: number;
    plannerExports: number; comparisons: number; budgetChecks: number }
  pages: Rank
  referrers: Rank
  campaigns: Rank
  recent: { id: number; name: string; city: string; eventDate: string; eventMonth?: string; status: string }[]
  notifications?: { pending: number; processing: number; failed: number; delivered: number }
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
        'where[status][in][0]=read&where[status][in][1]=contacted&where[status][in][2]=qualified&where[status][in][3]=offer_prepared&where[status][in][4]=negotiation',
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
        <Link href="/admin/collections/videos">Înregistrări verificate</Link>
        <Link href="/admin/collections/articles">Ghiduri editoriale</Link>
        <Link href="/admin/collections/articles/create">Articol nou fără cod</Link>
        <Link href="/admin/seo">Plan SEO și Google</Link>
        <Link href="/admin/collections/inquiries">Solicitări</Link>
      </nav>
      {overview?.mediaReadiness && (
        <section className="dash-media-readiness" aria-labelledby="media-readiness-title">
          <h2 id="media-readiness-title">Dovezi și conținut pentru website</h2>
          <div className="stat-grid">
            <Stat label="Înregistrări verificate" value={overview.mediaReadiness.verifiedVideoCount} />
            <Stat label="Materiale de revizuit" value={overview.mediaReadiness.pendingVideoReview} />
            <Stat label="Oferte aprobate" value={overview.mediaReadiness.approvedOfferCount} />
            <Stat label="Acreditări cu surse" value={overview.mediaReadiness.credentialSourceCount} />
          </div>
          {!overview.mediaReadiness.verifiedVideoCount && (
            <p className="dash-note" role="status">
              Nu există video publicabil verificat în RO. Modulul demonstrativ nu este afișat pe homepage.
              <Link href="/admin/collections/videos"> Verifică înregistrările →</Link>
            </p>
          )}
          {!overview.mediaReadiness.heroPhotoApproved && (
            <p className="dash-note" role="status">
              Fotografia hero nu a fost aprobată în Media/Homepage. Se folosește grafica tipografică, nu o fotografie inventată.
              <Link href="/admin/globals/home-settings"> Revizuiește homepage →</Link>
            </p>
          )}
          {!overview.mediaReadiness.approvedOfferCount && (
            <p className="dash-note" role="status">
              Nu există oferte cu preț aprobat. Exemplele din seed rămân în draft;
              vizitatorii pot solicita evaluare individuală.
            </p>
          )}
        </section>
      )}
      <h2>Solicitări</h2>
      <div className="stat-grid">
        <Stat label="Noi" value={stats?.newCount} accent />
        <Stat label="Restante" value={stats?.overdue} />
        <Stat label="În lucru" value={stats?.active} />
        <Stat label="Confirmate" value={stats?.confirmed} />
      </div>
      <p className="dash-note">
        Datele de contact sunt vizibile doar conturilor autorizate. Cererile sunt salvate în inbox;
        notificările externe funcționează doar după configurarea webhookului și a workerului cron.
      </p>
      {error && <p role="alert">{error}</p>}
      {overview && (
        <>
          {overview.notifications && (
            <>
              <h2>Notificări solicitări</h2>
              <div className="stat-grid">
                <Stat label="În așteptare" value={overview.notifications.pending} />
                <Stat label="În curs" value={overview.notifications.processing} />
                <Stat label="Eșuate (necesită intervenție)" value={overview.notifications.failed} />
                <Stat label="Livrate" value={overview.notifications.delivered} />
              </div>
            </>
          )}
          <h2>Utilizarea instrumentelor (cu acord)</h2>
          <div className="stat-grid">
            <Stat label="Planner PDF descărcate" value={overview.conversions.plannerExports} />
            <Stat label="Comparații selectate" value={overview.conversions.comparisons} />
            <Stat label="Estimări calculate" value={overview.conversions.budgetChecks} />
          </div>
          <p className="dash-note">
            Sunt numărate doar evenimente anonime cu acord pentru statistici. Nu se trimit datele sau sumele introduse.
          </p>
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
                    {x.city} · {x.eventDate || x.eventMonth || 'Dată de stabilit'}
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
