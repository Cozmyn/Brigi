import type { GlobalConfig } from 'payload'
import { seoFields } from '@/fields/editorial'
import { siteContent as c } from '@/lib/site'
import { isOwnerOrEditor } from '@/access/roles'

export const HomeSettings: GlobalConfig = {
  slug: 'home-settings',
  access: { read: () => true, update: isOwnerOrEditor },
  fields: [
    { name: 'seo', type: 'group', fields: seoFields },
    { name: 'heroAccent', type: 'text', defaultValue: c.hero.title[1] },
    { name: 'availabilityLabel', type: 'text', defaultValue: c.cta.availability },
    { name: 'quoteLabel', type: 'text', defaultValue: c.cta.quote },
    { name: 'experienceTitle', type: 'text', defaultValue: c.experience.title },
    { name: 'experienceText', type: 'textarea', defaultValue: c.experience.description },
    {
      name: 'experienceMoments',
      type: 'array',
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    { name: 'eventsTitle', type: 'text', defaultValue: 'Pentru fiecare ocazie, un alt ritm.' },
    {
      name: 'events',
      type: 'array',
      fields: [
        {
          name: 'eventType',
          type: 'select',
          required: true,
          options: [
            'wedding',
            'ceremony',
            'corporate',
            'anniversary',
            'cocktail',
            'public',
            'other',
          ],
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        {
          name: 'href',
          type: 'text',
          required: true,
          validate: (v: unknown) =>
            (typeof v === 'string' && /^\/(?!\/)[a-z0-9/-]*$/.test(v)) ||
            'Cale internă, de exemplu /solista-botez',
        },
      ],
    },
    { name: 'repertoireTitle', type: 'text', defaultValue: c.repertoire.title },
    { name: 'repertoireText', type: 'textarea', defaultValue: c.repertoire.description },
    {
      name: 'repertoireCategories',
      type: 'array',
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    { name: 'packagesTitle', type: 'text', defaultValue: 'Alege ritmul serii.' },
    { name: 'pricingNote', type: 'textarea', defaultValue: c.pricingNote },
    { name: 'processTitle', type: 'text', defaultValue: 'De la prima discuție, la primul refren.' },
    {
      name: 'process',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    { name: 'aboutTitle', type: 'text', defaultValue: 'Vocea, în prim-plan.' },
    { name: 'faqTitle', type: 'text', defaultValue: 'Detaliile unui program bine pregătit.' },
    { name: 'bookingTitle', type: 'text', defaultValue: c.booking.title },
    { name: 'bookingText', type: 'textarea', defaultValue: c.booking.description },
    {
      name: 'photos',
      type: 'group',
      fields: ['hero', 'live', 'portrait', 'social'].map((name) => ({
        name,
        type: 'upload' as const,
        relationTo: 'media' as const,
        admin: {
          description:
            name === 'social'
              ? '1200 × 630 px'
              : 'Portret 1600 × 2000 px; WebP, ideal sub 400 KB. Setează punctul focal în Media.',
        },
      })),
    },

    { name: 'heroEyebrow', type: 'text', localized: true },
    { name: 'heroTitle', type: 'text', localized: true },
    { name: 'heroSubtitle', type: 'textarea', localized: true },
    {
      name: 'showreelVisible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Afișează materialele pe homepage',
    },
    {
      name: 'testimonialsVisible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Afișează testimonialele aprobate pe homepage',
    },
    {
      name: 'trustStripVisible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Afișează parcursul artistic',
    },
    {
      name: 'sectionOrder',
      admin: { hidden: true },
      type: 'select',
      hasMany: true,
      defaultValue: [
        'events',
        'packages',
        'benefits',
        'process',
        'repertoire',
        'about',
        'faq',
        'finalCta',
      ],
      options: [
        'events',
        'packages',
        'benefits',
        'process',
        'repertoire',
        'about',
        'faq',
        'finalCta',
      ],
    },
  ],
}
