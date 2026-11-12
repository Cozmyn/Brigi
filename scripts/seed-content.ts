import 'dotenv/config'
import { contentStore } from '../src/cms/store'
import { siteContent as c } from '../src/lib/site'
import { editorialPages } from '../src/lib/editorial'
import { evergreenGuides } from '../src/lib/evergreen-guides'

/** Idempotent content import. Never replaces an existing page, package, or populated global. */
const cms = contentStore
const created = new Set<string>()
for (const page of editorialPages) {
  const existing = await cms.count({ collection: 'pages', where: { slug: { equals: page.slug } } })
  if (!existing.totalDocs) {
    created.add(page.slug)
    await cms.create({
      collection: 'pages',
      locale: 'ro',
      data: {
        title: page.title,
        slug: page.slug,
        heroTitle: page.h1,
        heroSummary: page.intro,
        excerpt: page.description,
        pageType: page.type,
        sections: page.sections.map((x) => ({ heading: x.heading, body: x.body })),
        faqs: page.faqs,
        showPackages: Boolean(page.showPackages),
        visible: true,
        approvedForPublication: true,
        seo: { title: page.title, description: page.description, noindex: page.type === 'media' },
        _status: 'published',
      },
    })
  }
}
// Link only newly unlinked editorial defaults; never change an editor's selection.
for (const page of editorialPages) {
  const current = await cms.find({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
    limit: 1,
  })
  const doc = current.docs[0]
  if (doc && created.has(page.slug)) {
    const related = await cms.find({
      collection: 'pages',
      where: { slug: { in: page.related.map((x) => x.slug) } },
      limit: 20,
    })
    await cms.update({
      collection: 'pages',
      id: doc.id,
      data: { relatedPages: related.docs.map((x) => x.id) },
    })
  }
}
// Publish evergreen, reference-backed informational guides as a one-time editorial
// bootstrap. Existing drafts and published articles are never replaced by a
// seed re-run. BRIGITTA remains responsible for verifying personal claims
// before any additional biography, testimonial, event proof or pricing.
for (const guide of evergreenGuides) {
  const existing = await cms.count({
    collection: 'articles', locale: 'ro',
    where: { slug: { equals: guide.slug } },
  })
  if (existing.totalDocs) continue
  const related = await cms.find({
    collection: 'pages', locale: 'ro',
    where: { slug: { in: guide.relatedPageSlugs } },
    limit: 30,
  })
  const now = new Date().toISOString()
  await cms.create({
    collection: 'articles', locale: 'ro',
    data: {
      title: guide.title, slug: guide.slug, summary: guide.summary,
      topic: guide.topic, intent: guide.intent,
      author: 'BRIGITTA',
      // Accurate automated editorial disclosure, not a fictional human expert.
      reviewer: 'Redactare și verificare asistată AI; fără recenzie artistică personală',
      originalContribution: guide.originalContribution,
      sections: guide.sections, sources: guide.sources,
      relatedPages: related.docs.map((page) => page.id),
      publishedAt: now, reviewedAt: now,
      editorialStatus: 'approved', visible: true, approvedForPublication: true,
      _status: 'published',
      seo: { title: guide.seoTitle, description: guide.seoDescription, noindex: false },
    },
  })
}
if (!(await cms.count({ collection: 'services' })).totalDocs) {
  for (const [order, p] of c.packages.entries())
    await cms.create({
      collection: 'services',
      locale: 'ro',
      data: {
        name: p.name,
        sets: p.formValue as '1x45' | '2x45' | '3x45',
        setCount: p.sets,
        duration: p.duration,
        priceFromEUR: p.priceFrom,
        currency: 'EUR',
        fromPricing: true,
        description: p.description,
        suitedFor: p.detail,
        featured: p.featured,
        order,
        visible: false,
        priceApproved: false,
        commerciallyVerified: false,
        _status: 'draft',
      },
    })
}
if (!(await cms.count({ collection: 'faq' })).totalDocs) {
  for (const [order, f] of c.faqs.entries())
    await cms.create({ collection: 'faq', locale: 'ro', data: { ...f, order, visible: true } })
}
const home = await cms.findGlobal({ slug: 'home-settings', locale: 'ro' })
if (!home.heroTitle)
  await cms.updateGlobal({
    slug: 'home-settings',
    locale: 'ro',
    data: {
      showreelVisible: true,
      testimonialsVisible: true,
      trustStripVisible: false,
      heroTitle: c.hero.title[0],
      heroAccent: c.hero.title[1],
      heroEyebrow: c.hero.kicker,
      heroSubtitle: c.hero.description,
      experienceTitle: c.experience.title,
      experienceText: c.experience.description,
      experienceMoments: c.experience.moments.map((text) => ({ text })),
      events: c.events.map((x) => ({
        eventType: x.id as 'wedding',
        title: x.title,
        description: x.description,
        href: x.href,
      })),
      repertoireTitle: c.repertoire.title,
      repertoireText: c.repertoire.description,
      repertoireCategories: c.repertoire.categories.map((text) => ({ text })),
      process: c.process,
      bookingTitle: c.booking.title,
      bookingText: c.booking.description,
      seo: {
        title: 'Brigitta · Solistă vocală pentru nunți și evenimente',
        description:
          'Brigitta, solistă vocală pentru nunți, botezuri, corporate și petreceri private. Repertoriu românesc și internațional. Verifică disponibilitatea.',
      },
    },
  })
console.log('Conținut inițializat; textele editoriale existente nu au fost rescrise.')
await cms.destroy()
