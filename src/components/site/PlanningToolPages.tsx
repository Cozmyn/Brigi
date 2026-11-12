import Link from 'next/link'
import { pageMetadata, jsonLD, structuredData } from '@/lib/seo'
import { verifiedStaticPair } from '@/lib/hreflang'
import { siteContent } from '@/lib/site'
import { getPlanningCatalog } from '@/lib/public-planning'
import { PlannerTool } from './PlannerTool'
import { ComparisonTool } from './ComparisonTool'
import { EstimateTool } from './EstimateTool'

export type PlanningToolKind = 'hub' | 'planner' | 'comparator' | 'estimator'
type Locale = 'ro' | 'en'
const segments: Record<PlanningToolKind, string> = {
  hub: '', planner: '/planner', comparator: '/comparator', estimator: '/estimator',
}
const copy: Record<Locale, Record<PlanningToolKind, { title: string; description: string; eyebrow: string }>> = {
  ro: {
    hub: { title: 'Instrumente pentru evenimentul tău',
      description: 'Construiește cronologia, compară formate reale și calculează un buget fără surprize inventate.',
      eyebrow: 'PLANIFICARE / FĂRĂ CONT' },
    planner: { title: 'Planner de eveniment, cu export PDF',
      description: 'Organizează momentele serii în ritmul tău. Datele rămân în browser și poți descărca un PDF, fără cont.',
      eyebrow: '01 / PLANNER' },
    comparator: { title: 'Compară formatele muzicale',
      description: 'Citește diferențele dintre formatele și pachetele care au fost aprobate efectiv pentru publicare.',
      eyebrow: '02 / COMPARATOR' },
    estimator: { title: 'Estimator transparent de buget',
      description: 'Adună costuri introduse de tine și, dacă există, un preț de pachet reverificat comercial. Nu este o ofertă.',
      eyebrow: '03 / ESTIMATOR' },
  },
  en: {
    hub: { title: 'Tools for your event',
      description: 'Plan a timeline, compare approved formats and estimate a personal budget without invented prices.',
      eyebrow: 'PLANNING / NO ACCOUNT' },
    planner: { title: 'Event planner and PDF export',
      description: 'Organise every moment, keep your notes in the browser and download a PDF without an account.',
      eyebrow: '01 / PLANNER' },
    comparator: { title: 'Compare musical formats',
      description: 'Compare only formats and packages that have genuinely been approved for publication.',
      eyebrow: '02 / COMPARATOR' },
    estimator: { title: 'Transparent budget estimator',
      description: 'Add your own costs and optionally a commercially verified package. This is not a formal quotation.',
      eyebrow: '03 / ESTIMATOR' },
  },
}
export const planningPath = (locale: Locale, kind: PlanningToolKind) =>
  (locale === 'en' ? '/en' : '') + '/instrumente' + segments[kind]
export function planningMetadata(locale: Locale, kind: PlanningToolKind) {
  const text = copy[locale][kind]
  return pageMetadata(text.title, text.description, planningPath(locale, kind), undefined, {
    languages: verifiedStaticPair(planningPath('ro', kind), planningPath('en', kind)),
  })
}
const categories: PlanningToolKind[] = ['planner', 'comparator', 'estimator']

function ToolShell({ locale, kind, children }: {
  locale: Locale; kind: PlanningToolKind; children: React.ReactNode
}) {
  const en = locale === 'en'
  const path = planningPath(locale, kind)
  return <div className="tools-layout">
    <header className="site-header tools-header">
      <Link className="skip-link" href="#main">{en ? 'Skip to content' : 'Sari la conținut'}</Link>
      <Link className="wordmark" href={en ? '/en' : '/'} aria-label="Brigitta">BRIGITTA<span className="brand-dot" /></Link>
      <nav className="tools-nav" aria-label={en ? 'Planning tools' : 'Instrumente de planificare'}>
        <Link aria-current={kind === 'hub' ? 'page' : undefined} href={planningPath(locale, 'hub')}>
          {en ? 'Tools' : 'Instrumente'}</Link>
        {categories.map((item) => <Link key={item} href={planningPath(locale, item)}
          aria-current={kind === item ? 'page' : undefined}>{copy[locale][item].title.split(',')[0]}</Link>)}
      </nav>
      <Link className="header-cta" href={en ? '/en/booking' : '/rezervare'}>
        {en ? 'Check availability' : 'Verifică disponibilitatea'} ↗
      </Link>
    </header>
    <main id="main">
      <section className="tools-hero">
        <div>
          <p className="eyebrow">{copy[locale][kind].eyebrow}</p>
          <h1>{copy[locale][kind].title}</h1>
          <p>{copy[locale][kind].description}</p>
          {kind !== 'hub' && <Link className="tools-back" href={planningPath(locale, 'hub')}>
            ← {en ? 'All planning tools' : 'Toate instrumentele'}</Link>}
        </div>
      </section>
      <section className="tools-content">
        {children}
      </section>
    </main>
    <footer className="site-footer tools-footer">
      <p>BRIGITTA / {en ? 'Personal planning tools' : 'Instrumente personale de planificare'}</p>
      <nav aria-label={en ? 'Footer links' : 'Linkuri utile'}>
        <Link href={en ? '/en' : '/'}>{en ? 'Home' : 'Acasă'}</Link>
        <Link href={planningPath(locale, 'hub')}>{en ? 'Planning tools' : 'Instrumente'}</Link>
        <Link href={en ? '/en/booking' : '/rezervare'}>{en ? 'Contact' : 'Contact'}</Link>
        <Link href="/confidentialitate" hrefLang="ro">{en ? 'Privacy (RO)' : 'Confidențialitate'}</Link>
      </nav>
    </footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: jsonLD(structuredData(path, copy[locale][kind].title, false, siteContent, false, false)),
    }}/>
  </div>
}
export async function PlanningToolPage({ locale, kind }: { locale: Locale; kind: PlanningToolKind }) {
  const en = locale === 'en'
  const data = kind === 'comparator' || kind === 'estimator'
    ? await getPlanningCatalog(locale) : { formats: [], offers: [] }
  return <ToolShell locale={locale} kind={kind}>
    {kind === 'hub' && <div className="tools-card-grid">
      {categories.map((category, index) =>
        <Link className="tools-hub-card" href={planningPath(locale, category)} key={category}>
          <span className="eyebrow">{String(index + 1).padStart(2, '0')} / {en ? 'TOOL' : 'INSTRUMENT'}</span>
          <h2>{copy[locale][category].title}</h2>
          <p>{copy[locale][category].description}</p>
          <span className="tools-card-arrow" aria-hidden="true">↗</span>
        </Link>)}
    </div>}
    {kind === 'planner' && <PlannerTool locale={locale}/>}
    {kind === 'comparator' && <ComparisonTool items={data.formats} locale={locale}/>}
    {kind === 'estimator' && <EstimateTool offers={data.offers} locale={locale}/>}
    <div className="tools-disclaimer">
      {en ? 'No automatic booking or quotation. For an individual proposal, talk to the artist.' :
        'Niciun instrument nu confirmă automat o rezervare sau o ofertă. Pentru condiții reale, discută direct cu artista.'}
      {' '}<Link href={en ? '/en/booking' : '/rezervare'}>{en ? 'Get in touch' : 'Cere disponibilitatea'} ↗</Link>
    </div>
  </ToolShell>
}
