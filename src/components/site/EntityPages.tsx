import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ArticleImage } from '@/lib/article-references'
import { readApprovedArticleImage } from '@/lib/article-references'
import { getPublicArticles } from '@/lib/public-articles'
import { entityHubPath, entityLabels, entityMetadata, entityIsIndexable, entityNavigation, entityReferences, entityStructuredData,
  getPublicEntities, getPublicEntity, type EntityKind, type EntityLocale } from '@/lib/public-entities'
import { pageMetadata, jsonLD } from '@/lib/seo'
function Figure({ image }: { image: ArticleImage }) {
  return <figure><Image src={image.src} alt={image.alt} width={image.width} height={image.height} unoptimized
    sizes="(max-width: 760px) 100vw, 900px" style={{ width: '100%', maxWidth: 900, height: 'auto' }} />
    {(image.caption || image.credit) && <figcaption>{[image.caption, image.credit].filter(Boolean).join(' · ')}</figcaption>}</figure>
}
async function Shell({ locale, children }: { locale: EntityLocale; children: ReactNode }) {
  const links = await entityNavigation(locale)
  return <><header className="site-header"><Link className="wordmark" href={locale === 'en' ? '/en' : '/'}>BRIGITTA</Link>
    <Link className="header-cta" href={locale === 'en' ? '/en/booking' : '/rezervare'}>{locale === 'en' ? 'Check availability' : 'Verifică disponibilitatea'}</Link></header>
    <main id="main">{children}</main><footer className="section"><nav aria-label={locale === 'en' ? 'Resources' : 'Resurse'}>
      {links.map((link) => <Link key={link.href} href={link.href} style={{ marginRight: 20 }}>{link.label}</Link>)}
    </nav></footer></>
}
export async function EnglishResources() {
  const [links, guides] = await Promise.all([entityNavigation('en'), getPublicArticles('en')])
  if (guides.length) links.push({ label: 'Guides', href: '/en/ghiduri' })
  if (!links.length) return null
  return <footer className="section"><nav aria-label="Explore resources">
    {links.map((link) => <Link key={link.href} href={link.href} style={{ marginRight: 20 }}>{link.label}</Link>)}
  </nav></footer>
}
async function requiredEntity(kind: EntityKind, locale: EntityLocale, slug: string) {
  const entity = await getPublicEntity(kind, slug, locale)
  if (!entity) notFound()
  return entity
}
type DetailProps = { params: Promise<{ slug: string }> }
export function entityDetailRoute(kind: EntityKind, locale: EntityLocale) {
  return {
    generateMetadata: async ({ params }: DetailProps) => {
      const entity = await requiredEntity(kind, locale, (await params).slug)
      const image = await readApprovedArticleImage(entity.document.seo?.image)
      return entityMetadata(entity, image || undefined)
    },
    Page: async ({ params }: DetailProps) => {
      const entity = await requiredEntity(kind, locale, (await params).slug)
      const doc = entity.document
      const refs = await entityReferences(entity)
      const data = doc as unknown as Record<string, unknown>
      const detailFields = kind === 'musical-formats' ? ['lineup', 'suitableFor', 'technicalRequirements'] :
        kind === 'partners' ? ['relationshipDescription'] : ['context', 'approach', 'outcome', 'evidenceSummary']
      const labels: Record<string, string> = locale === 'en' ? { lineup: 'Line-up', suitableFor: 'Suitable occasions', technicalRequirements: 'Technical requirements',
        relationshipDescription: 'Our collaboration', context: 'Context', approach: 'Approach', outcome: 'Outcome', evidenceSummary: 'Evidence' } :
        { lineup: 'Componență', suitableFor: 'Contexte potrivite', technicalRequirements: 'Cerințe tehnice', relationshipDescription: 'Colaborarea noastră',
          context: 'Context', approach: 'Abordare', outcome: 'Rezultat', evidenceSummary: 'Dovezi' }
      return <Shell locale={locale}><article><header className="inner-hero">
        <nav aria-label={locale === 'en' ? 'Breadcrumb' : 'Fir de navigare'}><Link href={entityHubPath(kind, locale)}>{entityLabels[kind][locale]}</Link></nav>
        <h1>{doc.title}</h1><p>{doc.summary}</p>
        <p>{locale === 'en' ? 'Reviewed by' : 'Verificat de'}: {doc.reviewer} · <time dateTime={doc.reviewedAt}>{doc.reviewedAt?.slice(0, 10)}</time></p>
      </header><div className="section editorial-body">
        {refs.socialImage && <Figure image={refs.socialImage} />}
        {refs.logo && refs.logo.src !== refs.socialImage?.src && <Figure image={refs.logo} />}
        {typeof data.eventYear === 'number' && <p>{locale === 'en' ? 'Event year' : 'Anul evenimentului'}: {data.eventYear}</p>}
        {detailFields.map((key) => typeof data[key] === 'string' && <section className="editorial-section" key={key}><h2>{labels[key]}</h2>
          {String(data[key]).split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>)}
        {kind === 'partners' && typeof data.website === 'string' && <p><a href={data.website} rel="noreferrer">{locale === 'en' ? 'Partner website' : 'Website partener'}</a></p>}
        {doc.sections?.map((section, index) => <section className="editorial-section" key={index}><h2>{section.heading}</h2>
          {refs.sectionImages[index] && <Figure image={refs.sectionImages[index]} />}
          {section.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>)}
        {!!refs.links.length && <section className="editorial-section"><h2>{locale === 'en' ? 'Related resources' : 'Resurse asociate'}</h2>
          <ul>{refs.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></section>}
      </div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD(entityStructuredData(entity, refs.socialImage || undefined)) }} /></article></Shell>
    },
  }
}
export function entityHubRoute(kind: EntityKind, locale: EntityLocale) {
  return {
    generateMetadata: async () => {
      const docs = await getPublicEntities(kind, locale)
      return pageMetadata(entityLabels[kind][locale], locale === 'en' ? 'Approved and published resources.' : 'Resurse aprobate și publicate.',
        entityHubPath(kind, locale), undefined, { noindex: !docs.some((entity) => entityIsIndexable(entity)) })
    },
    Page: async () => {
      const docs = await getPublicEntities(kind, locale)
      return <Shell locale={locale}><section className="inner-hero"><h1>{entityLabels[kind][locale]}</h1></section><section className="section editorial-body">
        {!docs.length && <p>{locale === 'en' ? 'No approved resources have been published yet.' : 'Nu există încă resurse aprobate și publicate.'}</p>}
        {docs.map((entity) => <article className="editorial-section" key={entity.document.id}><h2><Link href={entity.path}>{entity.document.title}</Link></h2><p>{entity.document.summary}</p></article>)}
      </section></Shell>
    },
  }
}
