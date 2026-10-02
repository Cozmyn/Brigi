export type EditorialPage = {
  slug: string
  title: string
  h1: string
  intro: string
  description: string
  type: 'service' | 'editorial' | 'location' | 'about' | 'repertoire' | 'media'
  sections: {
    heading: string
    body: string
    image?: { src: string; alt: string; position?: string }
  }[]
  faqs: { question: string; answer: string }[]
  related: { slug: string; title: string }[]
  showPackages?: boolean
  ctaLabel?: string
  serviceArea?: string
  updatedAt?: string
  seo?: {
    title?: string
    description?: string
    canonical?: string
    noindex?: boolean
    ogTitle?: string
    ogDescription?: string
    image?: { src: string; alt: string }
  }
  richText?: unknown
}
const links = {
  wedding: { slug: 'nunti-si-ceremonii', title: 'Program live pentru nuntă' },
  corporate: { slug: 'evenimente-corporate', title: 'Muzică pentru evenimente corporate' },
  private: { slug: 'evenimente-private', title: 'Petreceri private și aniversări' },
  baptism: { slug: 'solista-botez', title: 'Solistă vocală pentru botez' },
  repertoire: { slug: 'repertoriu', title: 'Repertoriul românesc și internațional' },
  guide: { slug: 'muzica-live-evenimente', title: 'Cum alegi formatul muzicii live' },
  about: { slug: 'despre', title: 'Parcursul artistic al Brigittei' },
}
export const editorialPages: EditorialPage[] = [
  {
    slug: 'nunti-si-ceremonii',
    title: 'Solistă pentru nuntă · Program vocal live',
    h1: 'O voce live în programul nunții voastre.',
    intro:
      'Brigitta cântă la nunți și ceremonii, cu un repertoriu românesc și internațional ales pentru momentele voastre.',
    description:
      'Solistă vocală pentru nuntă: Brigitta. Repertoriu românesc și internațional, seturi live și program stabilit împreună. Verifică data nunții.',
    type: 'service',
    showPackages: true,
    sections: [
      {
        heading: 'Unde își găsește locul vocea live',
        body: 'Un recital poate deschide petrecerea, poate însoți un moment important sau poate aduce energie între etapele serii. Începem cu programul nunții: primirea invitaților, servirea mesei, dansul și momentele deja stabilite. Așezăm seturile astfel încât muzica să aibă locul ei, fără să suprapunem intervenții.',
      },
      {
        heading: 'Repertoriul începe cu voi',
        body: 'Piesele românești și internaționale se aleg în funcție de preferințe și de public. Trimiteți câteva repere muzicale și piesele pe care doriți să le evitați. Pentru dansul mirilor sau o dedicație, interpretarea unei anumite piese se confirmă separat, înainte de rezervare.',
      },
      {
        heading: 'Coordonarea cu DJ-ul și locația',
        body: 'Prestația vocală reprezintă un program live delimitat în timp. Muzica dintre seturi, sonorizarea, proba de sunet și accesul tehnic se clarifică împreună cu organizatorul. Oferta precizează responsabilitățile fiecărei părți; nu presupune automat servicii de DJ sau formație completă.',
      },
      {
        heading: 'Ce ajută la pregătirea ofertei',
        body: 'Data, orașul, locația și numărul aproximativ de invitați sunt punctul de plecare. Adăugați intervalul dorit și numărul de seturi, dacă îl cunoașteți. Deplasarea și cerințele tehnice pot influența oferta finală. Data este rezervată numai după confirmarea condițiilor convenite.',
      },
    ],
    faqs: [
      {
        question: 'Poate Brigitta cânta la dansul mirilor?',
        answer:
          'Puteți propune piesa dorită. Posibilitatea interpretării și pregătirea muzicală se confirmă înainte de rezervare.',
      },
      {
        question: 'Programul live acoperă întreaga nuntă?',
        answer:
          'Programul include seturile din oferta confirmată. Pentru muzica dintre seturi și restul serii, coordonarea cu DJ-ul sau echipa muzicală se stabilește separat.',
      },
      {
        question: 'Când ar trebui verificată disponibilitatea?',
        answer:
          'Imediat ce aveți data și localitatea evenimentului. O cerere trimisă prin formular nu blochează automat data.',
      },
    ],
    related: [links.repertoire, links.guide, links.baptism],
  },
  {
    slug: 'evenimente-corporate',
    title: 'Solistă evenimente corporate, gale și recepții',
    h1: 'Prezență scenică. În acord cu evenimentul.',
    intro:
      'Muzică vocală live pentru evenimente corporate, recepții, lansări, gale și petreceri de companie.',
    description:
      'Brigitta, solistă vocală pentru corporate, gale și recepții. Program românesc și internațional, coordonare cu organizatorul și ofertă personalizată.',
    type: 'service',
    showPackages: true,
    sections: [
      {
        heading: 'Un recital în agenda evenimentului',
        body: 'La o gală, muzica poate marca tranziția dintre ceremonie și recepție. La o petrecere de companie, accentul poate fi pus pe un program dinamic. Pornim de la obiectivul evenimentului și de la profilul invitaților pentru a stabili direcția și momentul intervenției.',
      },
      {
        heading: 'Un briefing clar, o pregătire atentă',
        body: 'Echipa de organizare poate trimite agenda, intervalele disponibile, numărul de participanți și reperele muzicale. Sunt utile și informațiile despre limbile vorbite de invitați, formatul scenei și regulile locației. Repertoriul internațional poate completa natural selecția românească.',
      },
      {
        heading: 'Detaliile tehnice se stabilesc din timp',
        body: 'Accesul pentru montaj și probe, persoana de contact tehnic, sonorizarea și eventualele restricții de volum trebuie confirmate înaintea evenimentului. Dacă programul include discursuri sau prezentări, seturile live se coordonează cu regia evenimentului.',
      },
    ],
    faqs: [
      {
        question: 'Se poate pregăti un program pentru invitați internaționali?',
        answer:
          'Da, repertoriul include muzică internațională. Direcția muzicală și piesele se discută pornind de la public și format.',
      },
      {
        question: 'Poate recitalul fi integrat între discursuri sau premii?',
        answer:
          'Intervalele și durata intervențiilor se stabilesc cu organizatorul, în funcție de agenda evenimentului și de formatul convenit.',
      },
      {
        question: 'Ce trebuie să conțină cererea unei agenții?',
        answer:
          'Data, locația, tipul evenimentului, numărul de invitați, intervalul artistic și datele persoanei care coordonează programul.',
      },
    ],
    related: [links.about, links.repertoire, links.guide],
  },
  {
    slug: 'evenimente-private',
    title: 'Solistă petreceri private și aniversări',
    h1: 'Muzica voastră. Cântată live.',
    intro:
      'Recitaluri vocale pentru aniversări, petreceri private și ocazii sărbătorite alături de oamenii apropiați.',
    description:
      'Brigitta cântă live la petreceri private și aniversări. Alege direcția muzicală, discută programul și cere o ofertă pentru data evenimentului.',
    type: 'service',
    showPackages: true,
    sections: [
      {
        heading: 'Un program potrivit spațiului și invitaților',
        body: 'O aniversare într-un cadru restrâns are alt ritm decât o petrecere cu ring de dans. Spune-ne cum este amenajat spațiul și ce atmosferă dorești: un recital de ascultat, un moment surpriză sau seturi care încurajează dansul. Formatul se stabilește înainte de confirmare.',
      },
      {
        heading: 'Repere muzicale, fără un program rigid',
        body: 'Câteva melodii preferate și genurile pe care le asociați sărbătorii ajută la conturarea selecției. Brigitta interpretează repertoriu românesc și internațional. Cererile speciale se discută din timp, inclusiv dacă există un moment dedicat persoanei sărbătorite.',
      },
      {
        heading: 'O surpriză bine coordonată',
        body: 'Pentru un moment surpriză, desemnați o persoană de contact care cunoaște programul. Stabilim accesul artistei, proba de sunet și ora intervenției fără să perturbăm desfășurarea petrecerii. Spațiul, sonorizarea și eventualele limite de zgomot trebuie verificate cu locația.',
      },
    ],
    faqs: [
      {
        question: 'Este potrivit un recital pentru o petrecere restrânsă?',
        answer:
          'Formatul se poate discuta pornind de la spațiu, numărul de invitați și atmosfera dorită. Detaliile tehnice se verifică pentru fiecare locație.',
      },
      {
        question: 'Pot organiza o apariție surpriză?',
        answer:
          'Menționează acest lucru în cerere și lasă datele persoanei care va coordona accesul și momentul artistic.',
      },
    ],
    related: [links.baptism, links.repertoire, links.wedding],
  },
  {
    slug: 'solista-botez',
    title: 'Solistă pentru botez · Brigitta live',
    h1: 'O sărbătoare în familie. Un program cu voce.',
    intro:
      'Muzică românească și internațională pentru petrecerea de botez, cu momente live integrate atent în program.',
    description:
      'Solistă vocală pentru botez: Brigitta. Repertoriu pentru invitați din mai multe generații, seturi live și detalii stabilite înainte de eveniment.',
    type: 'service',
    showPackages: true,
    sections: [
      {
        heading: 'Ritmul unei petreceri de familie',
        body: 'Petrecerea de botez reunește adesea mai multe generații și poate începe mai devreme decât o nuntă. Programul live se construiește în jurul orei de sosire, meselor și momentelor familiei. Discutăm atât energia dorită, cât și pauzele potrivite.',
      },
      {
        heading: 'Selecția muzicală și volumul',
        body: 'Pop, evergreen și piese românești pot lega gusturi diferite. Un program reușit ține cont și de spațiu: mesele, ringul de dans și zonele unde invitații se retrag. Nivelul sonor și poziționarea echipamentelor se discută cu echipa tehnică și locația.',
      },
      {
        heading: 'Ce stabilim înainte de ziua evenimentului',
        body: 'Numărul și durata seturilor, intervalul aproximativ, preferințele muzicale și logistica se clarifică înainte de confirmare. Include în cerere dacă petrecerea are loc la prânz, după-amiaza sau seara și dacă sunt planificate alte momente artistice.',
      },
    ],
    faqs: [
      {
        question: 'Se poate cânta la un botez organizat ziua?',
        answer:
          'Trimite data și intervalul orar. Disponibilitatea se verifică pentru programul concret, indiferent dacă petrecerea are loc ziua sau seara.',
      },
      {
        question: 'Cum aleg numărul de seturi?',
        answer:
          'Pornește de la durata petrecerii și de la celelalte momente planificate. Putem discuta un recital sau mai multe intervenții, fără să încărcăm programul.',
      },
    ],
    related: [links.private, links.repertoire, links.guide],
  },
  {
    slug: 'muzica-live-evenimente',
    title: 'Muzică live la evenimente: solistă, DJ sau formație?',
    h1: 'Alege muzica după felul în care vrei să decurgă seara.',
    intro:
      'Un ghid practic pentru alegerea formatului muzical: ce aduce o solistă vocală, cum se completează cu un DJ și ce merită clarificat în ofertă.',
    description:
      'Solistă vocală, DJ sau formație? Compară rolurile, durata programului, repertoriul și logistica înainte să alegi muzica live pentru eveniment.',
    type: 'editorial',
    sections: [
      {
        heading: 'Solistă vocală: voce și contact direct cu publicul',
        body: 'O solistă aduce interpretare vocală live într-un program cu durată stabilită. Poate fi un recital concentrat sau o serie de seturi. Formula de acompaniament, echipamentele și echipa tehnică trebuie precizate în ofertă: termenul „live” nu spune singur câți muzicieni participă.',
      },
      {
        heading: 'DJ: continuitate și flexibilitate între momente',
        body: 'DJ-ul poate asigura muzica între seturile live și pe parcursul celorlalte etape ale petrecerii. Colaborarea funcționează când orele, tranzițiile și responsabilitățile tehnice sunt clare. Serviciul de DJ nu este inclus automat într-o ofertă de recital vocal.',
      },
      {
        heading: 'Formație: mai mulți muzicieni, altă logistică',
        body: 'O formație aduce instrumentiști și o formulă scenică mai amplă. Compară ofertele după componență, repertoriu, durata efectivă a prestației și cerințele de spațiu. Nu există o alegere universală: contează ce vrei să auzi, cum arată locația și bugetul total disponibil.',
      },
      {
        heading: 'Cum compari corect două oferte',
        body: 'Verifică numărul de seturi și durata fiecăruia, pauzele, sonorizarea, transportul, cazarea dacă este necesară și condițiile de confirmare. Întreabă cine coordonează muzica dintre seturi. Un preț de pornire și o ofertă completă pentru locația ta nu sunt același lucru.',
      },
      {
        heading: 'Ce trimiți pentru o recomandare relevantă',
        body: 'Data, localitatea, locația, numărul de invitați și câteva preferințe muzicale sunt suficiente pentru prima discuție. Dacă nu ai ales formatul, selectează „Doresc o recomandare” în formular. Pachetele Brigitta sunt puncte de plecare pentru un program vocal, care se confirmă individual.',
      },
    ],
    faqs: [
      {
        question: 'O solistă poate înlocui muzica pentru toată seara?',
        answer:
          'Doar dacă oferta confirmată acoperă explicit acest lucru. Seturile vocale au durată determinată; continuitatea muzicii între ele trebuie planificată.',
      },
      {
        question: 'Ce înseamnă un set live?',
        answer:
          'Un interval de interpretare stabilit prin ofertă. Numărul de seturi, durata și pauzele se aleg în raport cu programul evenimentului.',
      },
    ],
    related: [links.wedding, links.corporate, links.repertoire],
  },
  {
    slug: 'despre',
    title: 'Despre Brigitta · Solistă vocală',
    h1: 'Brigitta. Vocea, în prim-plan.',
    intro:
      'Solistă vocală, fostă concurentă la Vocea României și fostă solistă SISTEM, cu lansări muzicale proprii.',
    description:
      'Cunoaște parcursul Brigittei: Vocea României, SISTEM și muzică originală. Astăzi, solistă vocală pentru nunți, evenimente corporate și private.',
    type: 'about',
    sections: [
      {
        heading: 'De la scenă la o întâlnire cu publicul',
        body: 'Parcursul artistic al Brigittei include participarea la Vocea României, activitatea ca solistă SISTEM și lansarea de muzică originală. Aceste etape fac parte din identitatea ei de vocalistă și din felul în care abordează un program live.',
      },
      {
        heading: 'Ce cântă Brigitta astăzi',
        body: 'Repertoriul pentru evenimente include muzică românească și internațională: pop, dance, evergreen și balade. Direcția se discută în funcție de context și de public, păstrând vocea și interpretarea în centrul programului.',
      },
      {
        heading: 'O colaborare care începe cu detaliile',
        body: 'Brigitta cântă la nunți, botezuri, aniversări, petreceri private, evenimente corporate și gale. Pentru o ofertă, trimite data și localitatea, apoi discutăm programul, repertoriul și cerințele tehnice. Deplasarea se confirmă pentru fiecare solicitare.',
      },
    ],
    faqs: [],
    related: [links.repertoire, links.wedding, links.corporate],
  },
  {
    slug: 'repertoriu',
    title: 'Repertoriu românesc și internațional · Brigitta',
    h1: 'De la o baladă, la energia ringului.',
    intro:
      'Muzică românească și internațională, interpretată vocal live. O selecție construită în jurul publicului și al momentelor serii.',
    description:
      'Repertoriul Brigittei: pop, dance, evergreen, balade și muzică românească. Discută preferințele și cererile speciale pentru evenimentul tău.',
    type: 'repertoire',
    sections: [
      {
        heading: 'Românesc și internațional, în același program',
        body: 'Selecția poate reuni refrene românești și piese internaționale, de la pop și evergreen la dance și balade. Proporția dintre ele se discută în funcție de gusturile voastre și de invitați. Nu este necesar să alcătuiești singur un playlist complet.',
      },
      {
        heading: 'Muzică pentru fiecare etapă',
        body: 'Recepția, cina și petrecerea cer niveluri diferite de energie. Un set poate începe cu piese de ascultat și poate trece spre o selecție dinamică. Repartizarea seturilor și direcția muzicală se stabilesc împreună înaintea evenimentului.',
      },
      {
        heading: 'Cereri speciale, discutate din timp',
        body: 'Trimite titlul și interpretul piesei dorite, mai ales pentru dansul mirilor sau o dedicație. O cerere nu garantează automat includerea în program: disponibilitatea piesei și pregătirea necesară se confirmă separat. Spune-ne și dacă există genuri sau piese de evitat.',
      },
    ],
    faqs: [
      {
        question: 'Pot solicita o listă de piese?',
        answer:
          'Da. Cere repere din repertoriul disponibil pentru formatul tău. Lista și eventualele cereri speciale se discută înainte de confirmare.',
      },
    ],
    related: [links.wedding, links.private, links.corporate],
  },
  {
    slug: 'video-live',
    title: 'Brigitta live · Video și muzică',
    h1: 'Vocea se ascultă.',
    intro: 'Interpretări live și lansări muzicale Brigitta.',
    description:
      'Ascultă interpretări și muzică originală Brigitta. Descoperă vocea și direcția artistică înainte să discuți programul evenimentului.',
    type: 'media',
    sections: [],
    faqs: [],
    related: [links.about, links.repertoire],
  },
]
export const routeAliases: Record<string, string> = {
  contact: '/rezervare',
  'solista-nunta': '/nunti-si-ceremonii',
  'solista-evenimente-corporate': '/evenimente-corporate',
}
