import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { siteContent as c } from '../src/lib/site'
import { editorialPages } from '../src/lib/editorial'

/** Idempotent content import. Never replaces an existing page, package, or populated global. */
const cms = await getPayload({ config })
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
        visible: true,
        priceApproved: true,
        _status: 'published',
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
console.log('Conținut inițializat. Datele existente au fost păstrate.')
await cms.destroy()
