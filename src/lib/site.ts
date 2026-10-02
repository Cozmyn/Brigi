export type Locale = 'ro' | 'en'
export const routeMap = {
  ro: {
    home: '/',
    private: '/evenimente-private',
    weddings: '/nunti-si-ceremonii',
    corporate: '/evenimente-corporate',
    video: '/video-live',
    repertoire: '/repertoriu',
    about: '/despre',
    booking: '/rezervare',
    privacy: '/confidentialitate',
    cookies: '/cookies',
    terms: '/termeni',
  },
  en: {
    home: '/en',
    private: '/en/private-events',
    weddings: '/en/weddings-and-ceremonies',
    corporate: '/en/corporate-events',
    video: '/en/live-video',
    repertoire: '/en/repertoire',
    about: '/en/about',
    booking: '/en/booking',
    privacy: '/en/privacy',
    cookies: '/en/cookies',
    terms: '/en/terms',
  },
} as const

type Photo = { src: string; alt: string; position?: string }
type Media = { title: string; url: string; kind: 'youtube' | 'spotify' | 'link' }
type Testimonial = { quote: string; author: string; context: string }

/** Business content lives here. Empty asset URLs are intentional: never invent artist imagery. */
export const siteContent = {
  artist: {
    name: 'Brigitta',
    profession: 'Solistă vocală · Live vocalist',
    phone: process.env.PUBLIC_PHONE || '',
    email: process.env.PUBLIC_BOOKING_EMAIL || '',
    social: { instagram: '', facebook: '', tiktok: '', youtube: '', spotify: '' } as Record<
      string,
      string
    >,
    serviceArea: '',
    biography:
      'Brigitta este solistă vocală, fostă concurentă la Vocea României și fostă solistă SISTEM, cu lansări muzicale proprii. Astăzi, aduce muzică românească și internațională la nunți, botezuri, evenimente corporate și petreceri private.',
    credentials: ['Vocea României · fostă concurentă', 'SISTEM · fostă solistă', 'Lansări proprii'],
  },
  hero: {
    kicker: 'Solistă vocală · Nunți & evenimente',
    title: ['Brigitta.', 'Vocea unei seri.'],
    description:
      'Voce live și prezență scenică. Repertoriu românesc și internațional pentru nunți, petreceri private și evenimente corporate.',
  },
  cta: { availability: 'Verifică disponibilitatea', phone: 'Sună acum', quote: 'Cere ofertă' },
  headerCTA: { label: '', href: '/rezervare' },
  footerText: 'Voce live. Muzică românească și internațională. Evenimentul tău.',
  navigation: [
    { label: 'Experiența', href: '/#experienta' },
    { label: 'Evenimente', href: '/#evenimente' },
    { label: 'Repertoriu', href: '/#repertoriu' },
    { label: 'Pachete', href: '/#pachete' },
  ],
  experience: {
    eyebrow: 'Voce. Prezență. Energie.',
    title: 'Muzica se simte.\nSeara se schimbă.',
    description:
      'Un început cald. Un refren cântat împreună. Energia care ridică sala. Un program live își găsește locul între momentele evenimentului, cu un repertoriu ales pentru oamenii din fața scenei.',
    moments: ['Aproape de oameni', 'În ritmul serii', 'Live, de la primul refren'],
  },
  events: [
    {
      id: 'wedding',
      title: 'Nunți',
      description:
        'De la un moment intim la energia petrecerii. O voce care își găsește locul în povestea voastră.',
      href: '/nunti-si-ceremonii',
    },
    {
      id: 'corporate',
      title: 'Corporate',
      description:
        'Muzică live pentru recepții, lansări și întâlniri de companie, în acord cu identitatea evenimentului.',
      href: '/evenimente-corporate',
    },
    {
      id: 'ceremony',
      title: 'Botezuri',
      description: 'Un program vocal atent la ritmul unei sărbători în familie.',
      href: '/solista-botez',
    },
    {
      id: 'other',
      title: 'Petreceri private',
      description: 'O seară cu oamenii tăi și muzica voastră.',
      href: '/evenimente-private',
    },
    {
      id: 'anniversary',
      title: 'Aniversări',
      description: 'Un motiv de sărbătoare. Un program cu personalitate.',
      href: '/evenimente-private',
    },
    {
      id: 'public',
      title: 'Gale & ocazii speciale',
      description: 'Prezență scenică și momente live potrivite programului.',
      href: '/evenimente-corporate',
    },
  ],
  repertoire: {
    eyebrow: 'Românesc & internațional',
    title: 'De la emoție\nla energie.',
    description:
      'Pop, dance, evergreen și refrene care aduc oamenii împreună. Alegem direcția muzicală în funcție de eveniment, de public și de atmosfera pe care o dorești.',
    categories: [
      'Pop internațional',
      'Muzică românească',
      'Dance & party',
      'Evergreen',
      'Balade',
      'Cereri speciale',
    ],
  },
  packages: [
    {
      id: 'essential',
      formValue: '1x45',
      name: 'Essential',
      sets: 1,
      duration: 45,
      priceFrom: 450,
      description: 'Un moment live care dă tonul.',
      detail: 'Pentru un moment special, o recepție sau o intervenție în program.',
      featured: false,
      currency: 'EUR',
      fromPricing: true,
      features: [] as string[],
    },
    {
      id: 'signature',
      formValue: '2x45',
      name: 'Signature',
      sets: 2,
      duration: 45,
      priceFrom: 750,
      description: 'Două seturi. Mai multă energie.',
      detail: 'Pentru două momente distincte, cu o dinamică adaptată serii.',
      featured: true,
      currency: 'EUR',
      fromPricing: true,
      features: [] as string[],
    },
    {
      id: 'full-experience',
      formValue: '3x45',
      name: 'Full Experience',
      sets: 3,
      duration: 45,
      priceFrom: 1050,
      description: 'Muzică live în mai multe acte.',
      detail: 'Pentru evenimente cu mai multe etape și un program live extins.',
      featured: false,
      currency: 'EUR',
      fromPricing: true,
      features: [] as string[],
    },
  ],
  analyticsEnabled: false,
  verification: { google: '', bing: '' },
  headings: {
    events: 'Fiecare ocazie, un alt ritm.',
    packages: 'Alege ritmul serii.',
    process: 'De la prima discuție, la primul refren.',
    about: 'Vocea, în prim-plan.',
    faq: 'Detaliile unui program bine pregătit.',
  },
  songs: [] as { song: string; originalArtist: string; category: string }[],
  pricingNote:
    'Prețuri de pornire orientative. Oferta finală ține cont de dată, oraș, locație, deplasare, numărul de seturi, cerințele tehnice, cererile muzicale și formatul evenimentului.',
  process: [
    { title: 'Ne spui detaliile', text: 'Data, locul și cum îți imaginezi evenimentul.' },
    { title: 'Verificăm disponibilitatea', text: 'Punem în acord data și formatul dorit.' },
    { title: 'Primești oferta', text: 'Un pachet și un preț pentru contextul tău.' },
    { title: 'Pregătim programul', text: 'Stabilim repertoriul și ultimele detalii.' },
  ],
  faqs: [
    {
      question: 'Cât durează un program live?',
      answer:
        'Pachetele de pornire includ unul, două sau trei seturi a câte 45 de minute. Pentru un alt format, poți cere o ofertă personalizată.',
    },
    {
      question: 'Cânți muzică românească și internațională?',
      answer:
        'Da. Repertoriul combină muzică românească și internațională, de la pop și balade la dance și evergreen.',
    },
    {
      question: 'Pot alege repertoriul?',
      answer:
        'Spune-ne ce direcție muzicală preferi și dacă ai cereri speciale. Piesele și programul se discută înainte de confirmare.',
    },
    {
      question: 'Ce este inclus în preț?',
      answer:
        'Prețurile afișate sunt puncte de pornire pentru numărul de seturi indicat. Oferta personalizată precizează prestația, logistica și cerințele tehnice pentru evenimentul tău.',
    },
    {
      question: 'Te deplasezi în alte orașe?',
      answer:
        'Include orașul și locația în cerere. Disponibilitatea pentru deplasare și costurile aferente se confirmă în ofertă.',
    },
    {
      question: 'Este necesară sonorizare?',
      answer:
        'Soluția de sonorizare se stabilește în funcție de locație și format. Trimite detaliile tehnice disponibile pentru a le clarifica împreună.',
    },
    {
      question: 'Poți adapta programul pentru nunți și corporate?',
      answer:
        'Da. Direcția muzicală și repartizarea seturilor se discută în funcție de momentele și publicul evenimentului.',
    },
    {
      question: 'Cum verific disponibilitatea?',
      answer:
        'Completează formularul cu data și detaliile evenimentului. Cererea este verificată înainte de confirmarea disponibilității și a ofertei.',
    },
  ],
  media: [] as Media[],
  testimonials: [] as Testimonial[],
  // Foto: public/images/brigitta; căi /images/brigitta/...
  // Hero/live: 1600×2000; portret: 1200×1600; social: 1200×630.
  // Instrucțiuni și exemple: docs/actualizare-site.md.
  photos: {
    hero: {
      src: '',
      alt: 'Brigitta pe scenă, în timpul unui program live',
      position: 'center 25%',
    },
    landscape: { src: '', alt: 'Brigitta în concert' },
    live: { src: '', alt: 'Brigitta în timpul unui moment live' },
    portrait: { src: '', alt: 'Portret editorial Brigitta' },
    stage: { src: '', alt: 'Brigitta pe scenă' },
    atmosphere: { src: '', alt: 'Atmosfera unui eveniment cu muzică live' },
    editorial: { src: '', alt: 'Brigitta, portret' },
    social: { src: '', alt: 'Brigitta · Muzică live pentru evenimente' },
  } satisfies Record<string, Photo>,
  booking: {
    title: 'Seara ta începe\ncu o conversație.',
    description:
      'Spune-ne când, unde și ce pregătești. Verificăm disponibilitatea și găsim formatul potrivit.',
    submit: 'Trimite cererea',
    successTitle: 'Cererea ta a fost înregistrată.',
    successText:
      'Vom verifica data și detaliile evenimentului și vom reveni folosind datele de contact pe care le-ai trimis. Trimiterea formularului nu confirmă rezervarea.',
  },
}

export const siteURL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')
export const isProductionReady = process.env.PRODUCTION_GATES_CLOSED === 'true'
export const formatPrice = (price: number) => new Intl.NumberFormat('ro-RO').format(price)
export const isPublicURL = (url: string) => {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

export const internalPages = {
  weddings: {
    title: 'Solistă pentru nuntă',
    intro: 'O voce live în povestea voastră.',
    text: 'Ceremonie, recepție sau petrecere: muzica românească și internațională poate însoți momente diferite ale nunții. Discutăm direcția muzicală și repartizarea seturilor în funcție de programul vostru.',
    variant: 'service',
  },
  corporate: {
    title: 'Muzică live pentru evenimente corporate',
    intro: 'Prezență. Energie. Un program în acord cu evenimentul.',
    text: 'Recepții, lansări și gale au fiecare propriul ritm. Brigitta aduce voce live și repertoriu românesc și internațional; formatul și cerințele tehnice se clarifică împreună cu echipa de organizare.',
    variant: 'service',
  },
  private: {
    title: 'Muzică live pentru evenimente private',
    intro: 'O seară cu oamenii tăi.',
    text: 'Botezuri, aniversări și petreceri private: alegem un program care urmărește atmosfera sărbătorii. De la pop și evergreen la dance, direcția muzicală începe cu preferințele tale.',
    variant: 'service',
  },
  about: {
    title: 'Despre Brigitta',
    intro: 'Vocea, în prim-plan.',
    text: siteContent.artist.biography,
    variant: 'simple',
  },
  repertoire: {
    title: 'Repertoriu românesc și internațional',
    intro: 'Un program construit pentru atmosfera ta.',
    text: siteContent.repertoire.description,
    variant: 'repertoire',
  },
  video: {
    title: 'Brigitta live',
    intro: 'Voce live. Prezență scenică.',
    text: 'Descoperă direcția muzicală și discută cu Brigitta despre programul evenimentului tău.',
    variant: 'media',
  },
} as const

export const legalCopy = {
  privacy: {
    title: 'Confidențialitate',
    text: 'Formularul colectează numele, telefonul, emailul, detaliile evenimentului și, dacă sunt disponibile, sursa vizitei. Aceste informații sunt folosite pentru gestionarea solicitării și pregătirea unei oferte. Cererile sunt salvate în administrarea site-ului, cu acces restricționat. Formularul nu te înscrie la comunicări de marketing.',
    pending:
      process.env.PRIVACY_OPERATOR &&
      process.env.PRIVACY_CONTACT &&
      process.env.INQUIRY_RETENTION_DAYS
        ? `Operator: ${process.env.PRIVACY_OPERATOR}. Contact pentru solicitări privind datele: ${process.env.PRIVACY_CONTACT}. Perioadă de păstrare a cererilor: ${process.env.INQUIRY_RETENTION_DAYS} zile.`
        : 'Identitatea operatorului, contactul pentru drepturile privind datele și perioada de păstrare vor fi completate înainte de lansarea publică.',
  },
  cookies: {
    title: 'Cookies',
    text: 'Statisticile opționale se activează numai cu acordul tău și folosesc contoare agregate pentru pagini, surse și interacțiuni, fără IP-uri sau profiluri individuale. Preferința este salvată local în browser; o poți modifica din subsol. Datele agregate sunt păstrate 90 de zile. Autentificarea în administrare folosește cookie-uri necesare. Materialele externe se încarcă doar după o acțiune explicită.',
    pending: '',
  },
  terms: {
    title: 'Termeni',
    text: 'Prețurile afișate sunt orientative și reprezintă puncte de pornire. Prețul final și condițiile prestației sunt confirmate prin oferta personalizată. Trimiterea unei cereri nu rezervă data evenimentului.',
    pending:
      'Datele operatorului și condițiile contractuale vor fi completate înainte de lansarea publică.',
  },
} as const

export type SiteContent = typeof siteContent
