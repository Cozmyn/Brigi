'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './index.scss'

type Stats = { newCount: number; overdue: number; active: number; confirmed: number }

export default function BeforeDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => {
    const q = (where: string) => fetch(`/api/inquiries?limit=0&${where}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : { totalDocs: 0 })
    Promise.all([
      q('where[status][equals]=new'),
      q(`where[dueAt][less_than]=${encodeURIComponent(new Date().toISOString())}&where[status][not_in][0]=confirmed&where[status][not_in][1]=lost&where[status][not_in][2]=archived&where[status][not_in][3]=spam`),
      q('where[status][in][0]=read&where[status][in][1]=contacted&where[status][in][2]=offer_prepared'),
      q('where[status][equals]=confirmed'),
    ]).then(([a,b,c,d]) => setStats({ newCount:a.totalDocs, overdue:b.totalDocs, active:c.totalDocs, confirmed:d.totalDocs })).catch(() => setStats({ newCount:0, overdue:0, active:0, confirmed:0 }))
  }, [])
  return <div className="brigitta-dashboard"><div className="dash-heading"><div><span>BRIGITTA</span><h1>Solicitări și activitate</h1></div><Link href="/admin/collections/inquiries">Deschide inboxul →</Link></div><div className="stat-grid"><Stat label="Noi" value={stats?.newCount} accent /><Stat label="Restante" value={stats?.overdue} /><Stat label="În lucru" value={stats?.active} /><Stat label="Confirmate" value={stats?.confirmed} /></div><p className="dash-note">Solicitările sunt păstrate numai în back-office. Nu sunt trimise notificări prin email.</p></div>
}

function Stat({ label, value, accent }: { label: string; value?: number; accent?: boolean }) { return <div className={accent ? 'stat accent' : 'stat'}><span>{label}</span><strong>{value ?? '—'}</strong></div> }
