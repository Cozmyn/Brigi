import Link from 'next/link'
import type { PublicArticle } from '@/lib/public-articles'
import type { PublicEntity } from '@/lib/public-entities'

/** Only actual CMS snapshots are offered; never show invented case-study cards. */
export function HomepageResources({ guides, cases }: {
  guides: PublicArticle[]
  cases: PublicEntity[]
}) {
  const selectedGuides = guides.slice(0, 3)
  const selectedCases = cases.slice(0, 2)
  if (!selectedGuides.length && !selectedCases.length) return null
  return <section className="section homepage-resources" id="resurse" aria-labelledby="resources-title">
    <div className="section-heading">
      <p className="eyebrow">Documentat / Aprobat pentru publicare</p>
      <h2 id="resources-title">Informații care <em>ajută.</em></h2>
      <p>Ghiduri și experiențe publicate după verificare editorială; fiecare material are propriul context.</p>
    </div>
    <div className="resource-card-grid">
      {selectedGuides.map((article) => <article className="resource-card" key={'guide-' + article.id}>
        <p className="eyebrow">Ghid / {article.topic || 'Evenimente'}</p>
        <h3><Link href={article.path}>{article.title}</Link></h3>
        {article.summary && <p>{article.summary}</p>}
        <Link className="text-link" href={article.path}>Citește ghidul ↗</Link>
      </article>)}
      {selectedCases.map((study) => <article className="resource-card" key={'case-' + study.document.id}>
        <p className="eyebrow">Studiu de caz / Verificat</p>
        <h3><Link href={study.path}>{study.document.title}</Link></h3>
        {study.document.summary && <p>{study.document.summary}</p>}
        <Link className="text-link" href={study.path}>Vezi contextul și dovezile ↗</Link>
      </article>)}
    </div>
    {selectedGuides.length > 0 && <Link className="text-link" href="/ghiduri">Toate ghidurile ↗</Link>}
  </section>
}
