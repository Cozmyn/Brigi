/**
 * Helpful, source-linked editorial starting set. No invented bookings, personal
 * credentials, clients, availability, ratings, service areas or artist prices.
 * Seeds only missing CMS articles; owners can edit/unpublish them in /admin.
 */
export type EvergreenGuide = {
  slug: string
  title: string
  summary: string
  intent: string
  topic: 'music' | 'parties' | 'events'
  originalContribution: string
  seoTitle: string
  seoDescription: string
  relatedPageSlugs: string[]
  sources: { label: string; url: string }[]
  sections: { heading: string; body: string }[]
}
export const evergreenGuides: EvergreenGuide[] = [
  {
    slug: 'solista-dj-sau-formatie-la-nunta',
    title: 'Solistă, DJ sau formație la nuntă? Alege formatul muzical potrivit',
    seoTitle: 'Solistă, DJ sau formație la nuntă? Ghid de alegere',
    seoDescription: 'Compară solista vocală, DJ-ul și formația la nuntă: atmosferă, repertoriu, durată, logistică și ce întrebi înainte să ceri oferta.',
    summary: 'Ce primești în fiecare format muzical, cum pot fi combinate și ce întrebări te ajută să alegi înainte de rezervare.',
    intent: 'Caută soluția pentru muzică de nuntă: solistă, DJ, formație sau combinație.',
    topic: 'music',
    originalContribution: 'Comparație practică organizată după durata momentelor live, responsabilitățile tehnice, muzica dintre seturi și datele necesare într-o cerere de ofertă. Nu presupune că BRIGITTA oferă automat servicii DJ sau formație.',
    relatedPageSlugs: ['nunti-si-ceremonii', 'repertoriu', 'muzica-live-evenimente'],
    sources: [
      { label: 'The Knot – cum alegi între formație și DJ', url: 'https://www.theknot.com/content/wedding-reception-music-bands-vs-djs' },
      { label: 'The Knot – puncte importante în contractul muzical', url: 'https://www.theknot.com/content/wedding-reception-music-contract-points' },
    ],
    sections: [
      {
        heading: 'Solista vocală: impactul unei voci live în momente alese',
        body: 'O solistă vocală poate aduce interpretare live în anumite momente: primirea invitaților, un recital după cină sau un moment cu semnificație pentru familie. Aici contează timbrul, stilul, repertoriul disponibil și relația dintre muzică și programul serii. Un recital nu înseamnă automat muzică neîntreruptă pe toată durata nunții.\n\nCând compari oferte, cere explicit numărul de seturi, minutele fiecărui set, necesarul tehnic și ce se întâmplă între momentele live. Verifică o înregistrare autentică, preferabil dintr-un context apropiat de evenimentul tău, nu doar fotografii promoționale.',
      },
      {
        heading: 'DJ-ul: continuitate și flexibilitate a selecției',
        body: 'Un DJ gestionează muzica înregistrată între momentele programului, adaptând selecția la public și la ritmul petrecerii. Întreabă dacă oferta include aparatura, microfoanele, luminile, montajul, transportul și orele suplimentare. Nu presupune că toate echipamentele sunt incluse în orice pachet.\n\nPentru cuplurile care își doresc atât dans continuu, cât și un moment live, combinația DJ + solistă poate fi o soluție. Este important ca responsabilitățile celor doi furnizori să fie scrise clar: cine operează sunetul, cine anunță intrările și când se face proba de microfon.',
      },
      {
        heading: 'Formația live: energie de ansamblu, dar altă logistică',
        body: 'O formație reunește mai mulți instrumentiști și, uneori, mai multe voci. Prestația poate avea o energie diferită, iar cerințele de scenă, spațiu, cablare, sunet și program pot fi mai complexe. Cere componența exactă a echipei care va fi prezentă, nu doar numele proiectului.\n\nClarifică pauzele, durata totală, repertoriul și cine asigură muzica atunci când trupa nu cântă. Costul depinde de componență și de condițiile concrete; evită comparația dintre două prețuri fără să compari și ceea ce este inclus.',
      },
      {
        heading: 'Mini-checklist de comparație înaintea ofertei',
        body: 'Notează: data și localitatea, intervalul artistic dorit, numărul aproximativ de invitați, spațiul pentru scenă, preferințele muzicale și necesarul de sonorizare. Pentru fiecare furnizor, cere durata, numărul de persoane, transportul, politica de anulare, condițiile de rezervare și piesele ce necesită pregătire.\n\nAscultă fragmente din prestații reale și decide ce rol vrei să aibă muzica live în seara ta. O cerere de disponibilitate nu ține loc de contract și nu blochează automat data. Pentru un recital vocal BRIGITTA, poți porni de la pagina de servicii pentru nuntă și solicita o propunere personalizată.',
      },
    ],
  },
  {
    slug: 'pret-solista-nunta-ce-influenteaza-oferta',
    title: 'Preț solistă la nuntă: ce influențează oferta și cum compari corect',
    seoTitle: 'Preț solistă nuntă: costuri, seturi live și ofertă',
    seoDescription: 'Află de ce diferă prețul unei soliste la nuntă: număr de recitaluri, durată, transport, sonorizare și ce trebuie să apară în ofertă.',
    summary: 'Nu există un tarif universal pentru o solistă la nuntă. Iată cum ceri o ofertă comparabilă și eviți costurile neclare.',
    intent: 'Care este prețul unei soliste la nuntă și ce este inclus?',
    topic: 'events',
    originalContribution: 'Checklist original de comparație pentru solicitări de ofertă, fără publicarea unor tarife BRIGITTA neconfirmate. Distinge costul unui recital vocal de un pachet DJ + sonorizare.',
    relatedPageSlugs: ['nunti-si-ceremonii', 'repertoriu', 'evenimente-private'],
    sources: [
      { label: 'Eventist – exemplu public de pachete cu solist vocal', url: 'https://www.eventist.ro/s/mares-pana-solist-nunta-solist-nunta-bucuresti-solist-evenimente-solist-si-dj-evenimente-muzica-nunta/' },
      { label: 'The Knot – verificări contractuale pentru muzica de nuntă', url: 'https://www.theknot.com/content/wedding-reception-music-contract-points' },
    ],
    sections: [
      {
        heading: 'De ce diferă prețurile de la un eveniment la altul',
        body: 'Când cauți „preț solistă nuntă”, vei găsi oferte pentru recitaluri scurte, mai multe seturi vocal-live, pachete DJ + solist și formule cu instrumentiști. Nu sunt servicii echivalente. Tariful poate depinde de durata programului, numărul momentelor, pregătirea repertoriului, logistică, ora începerii, distanță și disponibilitatea pentru data cerută.\n\nPrețurile văzute pe directoare sau la alți artiști sunt doar exemple ale pieței, nu tarifele BRIGITTA. Pentru o comparație corectă, folosește aceeași descriere a evenimentului când contactezi mai mulți furnizori.',
      },
      {
        heading: 'Ce trebuie să scrie într-o ofertă muzicală',
        body: 'Verifică numărul de seturi și durata în minute, programul aproximativ, componența artistică, ce include transportul și dacă sonorizarea este pusă la dispoziție de artist, DJ sau locație. Întreabă dacă repetițiile pentru o piesă personalizată, accesul tehnic, microfonul și mesele echipei sunt incluse sau se discută separat.\n\nCere prețul final în moneda convenită, condițiile de avans, termenul de răspuns, condițiile de anulare și momentul în care data devine rezervată. O valoare „de la” este un punct de pornire, nu obligația artistului de a accepta orice eveniment la acea sumă.',
      },
      {
        heading: 'Cum compari două pachete cu durate diferite',
        body: 'Un program de 45 de minute și trei intervenții live în timpul aceleiași petreceri nu au aceeași logistică. Într-un tabel simplu, trece pentru fiecare ofertă: minutele de prestație, timpul petrecut la locație, pauzele, echipamentul inclus, transportul și responsabilitățile pentru muzica dintre recitaluri.\n\nNu folosi doar „preț pe minut”: pregătirea, repertoriul, performanța scenică și deplasarea nu se reduc la durata înregistrată. Folosește estimatorul site-ului doar pentru calcule personale, fără să îl confunzi cu o cotație contractuală.',
      },
      {
        heading: 'Cum ceri o ofertă BRIGITTA fără să cunoști toate detaliile',
        body: 'Pentru primul mesaj sunt suficiente tipul evenimentului, localitatea, numele și un canal de contact. Dacă știi data sau luna, menționeaz-o. Ulterior poți completa locația exactă, numărul invitaților, intervalul și direcția repertoriului.\n\nFormularul de disponibilitate funcționează și când data nu este stabilită. Condițiile, durata și prețul prestației se confirmă individual, în scris. Site-ul nu afișează un preț al artistei până când acesta nu este verificat și aprobat comercial în CMS.',
      },
    ],
  },
  {
    slug: 'program-muzical-nunta-cronologie-checklist',
    title: 'Program muzical la nuntă: cronologie practică și checklist',
    seoTitle: 'Program muzical nuntă: cronologie, pauze și checklist',
    seoDescription: 'Organizează muzica de la primirea invitaților la petrecere. Checklist pentru DJ, solistă, sunet și momente live, cu planner PDF gratuit.',
    summary: 'O cronologie adaptabilă pentru muzica nunții: primirea invitaților, momentele live, dansul, pauzele și verificările tehnice.',
    intent: 'Cum organizez programul muzical al unei nunți și unde introduc recitalurile?',
    topic: 'parties',
    originalContribution: 'Succesiune orientativă de verificări, integrată cu plannerul PDF fără cont al site-ului; nu impune un orar universal sau recitalul BRIGITTA ca obligatoriu.',
    relatedPageSlugs: ['nunti-si-ceremonii', 'muzica-live-evenimente', 'repertoriu'],
    sources: [
      { label: 'The Knot – model de cronologie a recepției', url: 'https://www.theknot.com/content/a-traditional-wedding-reception-timeline' },
      { label: 'The Knot – listă cronologică de organizare a nunții', url: 'https://www.theknot.com/content/12-month-wedding-planning-countdown' },
    ],
    sections: [
      {
        heading: 'Începe cu programul evenimentului, nu cu o listă de piese',
        body: 'Mai întâi adună orele aproximative pentru sosirea invitaților, ceremonie, fotografii, intrarea mirilor, servirea mesei și momentele de familie. Muzica trebuie să susțină aceste tranziții, nu să le întrerupă. Discută cu organizatorul și cu locația dacă momentele sunt fixe sau pot fi deplasate.\n\nÎnainte să alegi un recital, află când poate fi făcută proba de sunet, cine are acces la scenă și dacă spațiul impune restricții de volum. Dacă orele nu sunt cunoscute, plannerul poate porni cu data „de stabilit”.',
      },
      {
        heading: 'Primirea invitaților și începutul recepției',
        body: 'La primirea invitaților poate funcționa o atmosferă discretă, cu playlist, DJ sau muzică live, în funcție de locație și de buget. Dacă alegi o solistă, precizează dacă dorești un moment scurt de întâmpinare sau o intervenție mai târziu.\n\nPentru a evita suprapuneri, stabilește cine anunță intrarea mirilor și cine are controlul sonor în acel interval. Lasă loc pentru întârzieri naturale: fotografia, traficul sau servirea mesei pot schimba programul.',
      },
      {
        heading: 'Unde așezi un recital vocal live',
        body: 'Un recital poate marca începutul unei secvențe festive sau un moment de tranziție între masă și dans. Alege un interval în care invitații pot asculta, iar personalul locației nu trebuie să traverseze continuu scena. Pentru un moment personalizat, verifică din timp melodia, tonalitatea și timpul de pregătire.\n\nDacă alegi două sau mai multe seturi, planifică și pauzele: DJ-ul ori echipa locației ar trebui să știe cine acoperă sunetul între intervenții. Nu presupune că un recital înlocuiește întreaga coloană sonoră a nunții.',
      },
      {
        heading: 'Checklist de transmis tuturor furnizorilor',
        body: 'Trimite o singură versiune actualizată a cronologiei. Include contactul coordonatorului, ora accesului tehnic, sursa de curent, microfoanele, timpii de montaj, probele, intervalele rezervate pentru discursuri și eventualele surprize care necesită discreție.\n\nÎnainte de eveniment, confirmă cine poate ajusta ordinea momentelor dacă apar întârzieri. Folosește plannerul PDF BRIGITTA pentru o variantă imprimabilă; notițele rămân pe dispozitiv și nu sunt trimise automat către artistă.',
      },
    ],
  },
  {
    slug: 'muzica-live-cununie-civila-si-primire-invitati',
    title: 'Muzică live la cununia civilă și primirea invitaților: idei și logistică',
    seoTitle: 'Muzică live cununie civilă: repertoriu și organizare',
    seoDescription: 'Când se potrivește o solistă la cununia civilă sau la primirea invitaților? Momente, repertoriu, spațiu, sunet și întrebări înainte de ofertă.',
    summary: 'Cum alegi un moment vocal pentru ceremonie sau cocktail, fără să omiți permisiunile locației și coordonarea tehnică.',
    intent: 'Pot avea solistă sau muzică live la cununia civilă și la primirea invitaților?',
    topic: 'events',
    originalContribution: 'Listă de decizii practice pentru muzică la ceremonie sau recepție, cu separarea clară a interpretării vocale de serviciile de sonorizare și protocol.',
    relatedPageSlugs: ['nunti-si-ceremonii', 'repertoriu', 'muzica-live-evenimente'],
    sources: [
      { label: 'The Knot – când se planifică furnizorii de muzică', url: 'https://www.theknot.com/content/12-month-wedding-planning-countdown' },
      { label: 'The Knot – ce trebuie clarificat în contractul artistic', url: 'https://www.theknot.com/content/wedding-reception-music-contract-points' },
    ],
    sections: [
      {
        heading: 'Definește rolul muzicii în ceremonie',
        body: 'La cununia civilă, o intervenție vocală poate marca sosirea cuplului, un moment solemn sau încheierea ceremoniei. Începe prin a discuta cu instituția sau locația: muzica live este permisă, există restricții de durată și volum, iar montajul echipamentului se poate face înaintea invitaților?\n\nDacă ceremonia este scurtă, un singur moment muzical bine încadrat poate fi mai potrivit decât un program amplu. Piesele propuse trebuie confirmate cu artista; nu considera o melodie disponibilă până când repertoriul nu a fost agreat.',
      },
      {
        heading: 'Ce schimbă o ceremonie în aer liber',
        body: 'În exterior contează accesul la electricitate, condițiile meteo, protecția echipamentului, zgomotul de fond și distanța față de public. Verifică din timp dacă microfonul și boxele sunt incluse sau trebuie asigurate separat.\n\nPentru un plan de rezervă, întreabă unde poate fi mutat momentul în caz de ploaie. Nu promite artiștilor sau invitaților un spațiu care nu a fost confirmat de locație.',
      },
      {
        heading: 'Muzică live la cocktail și primirea invitaților',
        body: 'La recepție, stilul muzical poate fi diferit de cel al petrecerii. Decide dacă dorești un fond discret, un recital care atrage atenția sau un moment de trecere între ceremonie și masă. Ține cont de conversațiile invitaților, de amplasarea barului și de intervalele de servire.\n\nDacă locația are DJ sau muzică ambientală, stabilește exact când preia sau cedează sonorizarea. Pentru o ofertă vocal-live, menționează ora aproximativă, localitatea, spațiul și numărul de intervenții dorite.',
      },
      {
        heading: 'Ce să scrii în cererea de disponibilitate',
        body: 'Precizează tipul ceremoniei, data sau luna orientativă, localitatea și durata disponibilă pentru muzică. Adaugă preferințele de repertoriu și orice regulă a locației. Dacă data nu este încă stabilită, poți solicita doar informații preliminare.\n\nBRIGITTA oferă discuția despre un posibil recital vocal, nu promite automat închiriere de sunet, DJ, instrumentiști sau acces la orice locație. Aceste detalii se confirmă individual înainte de o rezervare.',
      },
    ],
  },
  {
    slug: 'solista-botez-muzica-live-si-momente',
    title: 'Solistă la botez: muzică live, repertoriu și momente potrivite',
    seoTitle: 'Solistă botez: cum alegi un recital muzical live',
    seoDescription: 'Organizezi un botez? Vezi cum alegi muzica live, unde se potrivește un recital vocal și ce verifici despre program, sunet și ofertă.',
    summary: 'Un ghid pentru alegerea momentelor vocale la botez, cu atenție la ritmul mesei, invitați și logistică.',
    intent: 'Cum aleg solistă sau recital live pentru petrecerea de botez?',
    topic: 'parties',
    originalContribution: 'Ghid practic pentru planificarea unui moment vocal la botez fără a afirma prestări sau rezultate concrete ale artistei.',
    relatedPageSlugs: ['solista-botez', 'evenimente-private', 'repertoriu'],
    sources: [
      { label: 'The Knot – criterii pentru alegerea muzicii live la un eveniment', url: 'https://www.theknot.com/content/wedding-reception-music-bands-vs-djs' },
      { label: 'The Knot – detalii contractuale de verificat', url: 'https://www.theknot.com/content/wedding-reception-music-contract-points' },
    ],
    sections: [
      {
        heading: 'Un botez nu are neapărat programul unei nunți',
        body: 'O petrecere de botez poate fi un prânz relaxat, o seară cu dans sau o întâlnire cu invitați de vârste diferite. Alege muzica după structura reală a evenimentului, nu după un pachet standard. Un recital vocal poate fi un moment distinct, fără a ocupa tot timpul petrecerii.\n\nStabilește ce vrei să se întâmple în timp ce invitații servesc masa și când există spațiu pentru un moment de ascultat sau de dans. Dacă sunt copii mici sau persoane sensibile la volum, discută nivelul sonor cu locația.',
      },
      {
        heading: 'Repertoriul potrivit publicului și atmosferei',
        body: 'Repertoriul poate combina piese românești și internaționale, balade și melodii energice, în funcție de preferințe. Nu este necesar să alegi fiecare piesă de la început: pregătește câteva repere, o listă scurtă de melodii dorite și una cu piese de evitat.\n\nPentru dedicații sau melodii speciale, solicită confirmarea că pot fi interpretate. Dacă există și DJ, definește rolul acestuia între seturile live pentru ca trecerile să nu oprească atmosfera.',
      },
      {
        heading: 'Ce verifici la locație',
        body: 'Asigură-te că există spațiu pentru interpretare și că persoana responsabilă de sunet știe când începe recitalul. Clarifică microfonul, sonorizarea, accesul la curent și proba de sunet. În funcție de dimensiunea sălii, echipamentele necesare pot fi diferite.\n\nÎntreabă și despre accesul pentru montaj, orele evenimentului și eventualele restricții. Un program de calitate începe cu o logistică realistă și responsabilități bine stabilite.',
      },
      {
        heading: 'Cererea de ofertă pentru o solistă de botez',
        body: 'Trimite data sau luna, localitatea, tipul locației, numărul aproximativ de invitați și intervalul în care dorești muzică live. Dacă nu ai decis programul, cere mai întâi variante posibile de durată și clarifică ulterior detaliile.\n\nPe site-ul BRIGITTA poți solicita disponibilitatea fără să cunoști ziua exactă; oferta și serviciile incluse vor fi confirmate separat. Formularul nu rezervă automat data.',
      },
    ],
  },
  {
    slug: 'muzica-live-eveniment-corporate-brief-organizare',
    title: 'Muzică live pentru eveniment corporate: brief și checklist',
    seoTitle: 'Muzică live eveniment corporate: brief și checklist',
    seoDescription: 'Organizezi o gală, recepție sau petrecere de firmă? Checklist pentru recital vocal: public, timpi, scenă, sunet și cerere de ofertă.',
    summary: 'Cum pregătești o cerere clară pentru un moment vocal live la gală, recepție, lansare sau petrecere corporate.',
    intent: 'Cum aleg muzica live pentru eveniment corporate și ce date trimit solistei?',
    topic: 'events',
    originalContribution: 'Model original de brief pentru agenții și organizatori: timpi, obiective, public, scenă, rider și circuitul decizional.',
    relatedPageSlugs: ['evenimente-corporate', 'repertoriu', 'despre'],
    sources: [
      { label: 'The Knot – planificarea serviciilor și echipamentului muzical', url: 'https://www.theknot.com/content/wedding-reception-music-contract-points' },
      { label: 'The Knot – întrebări pentru alegerea muzicienilor', url: 'https://www.theknot.com/content/wedding-band-hire' },
    ],
    sections: [
      {
        heading: 'Obiectivul evenimentului decide rolul muzicii',
        body: 'O recepție după o conferință, o gală cu premii, o lansare și o petrecere de sfârșit de an au ritmuri diferite. Înainte de a alege un recital, formulează rolul momentului muzical: fundal elegant, tranziție între segmente, deschidere festivă sau intervenție energică.\n\nInclude în brief profilul invitaților și limbile folosite la eveniment. Un program vocal live poate fi adaptat unei direcții muzicale convenite, însă piesele și durata se stabilesc explicit, nu se presupun.',
      },
      {
        heading: 'Brief tehnic pentru agenție și locație',
        body: 'Trimite intervalul exact disponibil, locul scenei, accesul pentru montaj și probe, responsabilul tehnic, aparatura instalată și politica de volum. Dacă evenimentul are discursuri, moderator sau transmisie, spune cine controlează microfoanele și tranzițiile.\n\nConfirmă din timp dacă artistul vine cu echipament propriu ori lucrează cu tehnica existentă. Un brief incomplet poate produce oferte greu de comparat și surprize operaționale.',
      },
      {
        heading: 'Repertoriu, imagine și coordonare artistică',
        body: 'Direcția de repertoriu trebuie să susțină obiectivul evenimentului: muzică românească și internațională, atmosferă discretă sau momente cu energie ridicată. Dacă există un concept de brand, un dress code sau o succesiune strictă a segmentelor, include-le în brief.\n\nSolicită o înregistrare reală, iar dacă ai nevoie de o piesă specială sau de o introducere personalizată, discută posibilitatea și timpul de pregătire. Nu promite clientului o anumită piesă înainte să primești confirmarea artistei.',
      },
      {
        heading: 'Cum soliciți oferta și disponibilitatea',
        body: 'O cerere eficientă include data, orașul, intervalul artistic, tipul de eveniment, numărul aproximativ de participanți și persoana care ia decizia. Dacă încă nu ai data finală, poți cere orientativ informații despre format, apoi revii cu detaliile confirmate.\n\nPentru BRIGITTA, formularul permite alegerea tipului de eveniment corporate și trimiterea unei solicitări chiar cu luna aproximativă. Prestația, sunetul, deplasarea și costul se confirmă individual; niciun text al site-ului nu înlocuiește oferta contractuală.',
      },
    ],
  },
]
