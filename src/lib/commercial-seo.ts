import type { EditorialPage } from './editorial'

type SEO = { title: string; description: string; searchIntent: string }
export const commercialSEO: Record<string, SEO> = {
  'nunti-si-ceremonii': {
    title: 'Solistă nuntă · Muzică vocală live pentru nuntă',
    description: 'Cauți solistă pentru nuntă? Descoperă cum integrezi un recital vocal live, repertoriul, durata și logistica. Cere disponibilitatea Brigittei.',
    searchIntent: 'solistă nuntă, solist vocal nuntă, muzică live nuntă',
  },
  'solista-botez': {
    title: 'Solistă botez · Recital vocal live pentru petrecere',
    description: 'O solistă la botez poate marca momente speciale. Alege repertoriul, durata și partea tehnică, apoi solicită o ofertă personalizată.',
    searchIntent: 'solistă botez, muzică live botez, solist vocal botez',
  },
  'evenimente-corporate': {
    title: 'Solistă evenimente corporate · Muzică live',
    description: 'Recital vocal live pentru gale, recepții și evenimente corporate. Află cum se stabilesc programul, repertoriul și condițiile tehnice.',
    searchIntent: 'solistă evenimente corporate, muzică live corporate, solistă gală',
  },
  'evenimente-private': {
    title: 'Solistă petreceri private · Recital muzică live',
    description: 'Muzică vocală live pentru aniversări și petreceri private. Vezi cum alegi momentele, repertoriul și ce detalii sunt necesare pentru ofertă.',
    searchIntent: 'solistă petrecere privată, muzică live aniversare, solist evenimente',
  },
  'repertoriu': {
    title: 'Repertoriu solistă vocală · Românesc și internațional',
    description: 'Explorează direcțiile de repertoriu românesc și internațional pentru un recital vocal la nuntă, botez sau eveniment corporate.',
    searchIntent: 'repertoriu solistă nuntă, muzică live românească și internațională',
  },
  'muzica-live-evenimente': {
    title: 'Muzică live la evenimente · Solistă, DJ sau formație?',
    description: 'Cum compari solista vocală, DJ-ul și formația pentru un eveniment? Durata, repertoriul, pauzele și sonorizarea explicate clar.',
    searchIntent: 'muzică live evenimente, solistă sau DJ nuntă, solistă vs formație',
  },
  'despre': {
    title: 'Despre Brigitta · Solistă vocală pentru evenimente',
    description: 'Citește despre direcția muzicală BRIGITTA și tipurile de evenimente pentru care poți solicita un recital vocal live.',
    searchIntent: 'Brigitta solistă vocală, Brigitta muzică live',
  },
}

/** Only replace generic, seed-era meta; never overwrite custom SEO entered by an editor. */
export function suggestedCommercialSEO(page: EditorialPage) {
  const current = page.seo || {}
  const proposed = commercialSEO[page.slug]
  if (!proposed) return current
  return {
    ...current,
    ...(!current.title || current.title.trim() === page.title.trim()
      ? { title: proposed.title } : {}),
    ...(!current.description || current.description.trim() === page.description.trim()
      ? { description: proposed.description } : {}),
  }
}
