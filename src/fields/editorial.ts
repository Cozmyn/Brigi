import type { Field } from '@/cms/model'
export const faqFields: Field[] = [
  { name: 'question', type: 'text', required: true },
  { name: 'answer', type: 'textarea', required: true },
]
export const sectionFields: Field[] = [
  { name: 'heading', type: 'text', required: true },
  { name: 'body', type: 'textarea', required: true },
  { name: 'image', type: 'upload', relationTo: 'media' },
]
export const seoFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    localized: true,
    maxLength: 90,
    admin: {
      description: 'Recomandat: 35–60 caractere. Titlu unic și descriptiv; nu este un scor SEO.',
    },
  },
  {
    name: 'description',
    type: 'textarea',
    localized: true,
    maxLength: 200,
    admin: { description: 'Recomandat: 120–160 caractere. Google poate alege alt fragment.' },
  },
  {
    name: 'canonical',
    type: 'text',
    admin: { description: 'Cale internă, de exemplu /repertoriu. Gol = adresa paginii.' },
    validate: (v: unknown) =>
      !v ||
      (typeof v === 'string' && /^\/(?!\/)[a-z0-9/-]*$/.test(v)) ||
      'Folosește o cale internă fără parametri.',
  },
  { name: 'noindex', type: 'checkbox', defaultValue: false },
  { name: 'ogTitle', type: 'text', localized: true, maxLength: 100 },
  { name: 'ogDescription', type: 'textarea', localized: true, maxLength: 200 },
  {
    name: 'image',
    type: 'upload',
    relationTo: 'media',
    admin: { description: '1200 × 630 px, imagine aprobată pentru publicare.' },
  },
]
