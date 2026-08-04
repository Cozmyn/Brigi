export type Locale = 'ro' | 'en'

export const routeMap = {
  ro: {
    home: '/', private: '/evenimente-private', weddings: '/nunti-si-ceremonii',
    corporate: '/evenimente-corporate', video: '/video-live', repertoire: '/repertoriu',
    about: '/despre', booking: '/rezervare', privacy: '/confidentialitate', cookies: '/cookies', terms: '/termeni',
  },
  en: {
    home: '/en', private: '/en/private-events', weddings: '/en/weddings-and-ceremonies',
    corporate: '/en/corporate-events', video: '/en/live-video', repertoire: '/en/repertoire',
    about: '/en/about', booking: '/en/booking', privacy: '/en/privacy', cookies: '/en/cookies', terms: '/en/terms',
  },
} as const

export const packages = {
  ro: [
    { name: 'Moment Live', sets: '1 × 45 min', price: 'de la 650 EUR', fit: 'Ceremonie, cocktail, cină, moment special sau intervenție corporate.', detail: 'Consultare scurtă, repertoriu adaptat, soundcheck și prestație solo cu suport instrumental profesionist.' },
    { name: 'Seară Live', sets: '2 × 45 min', price: 'de la 950 EUR', fit: 'Cocktail + dinner, recepție, aniversare sau două momente în program.', detail: 'Două seturi diferențiate, coordonare cu DJ/MC/organizator și soundcheck.' },
    { name: 'Experiență Live Completă', sets: '3 × 45 min', price: 'de la 1.250 EUR', fit: 'Evenimente în care muzica live însoțește mai multe etape ale serii.', detail: 'Trei seturi, plan muzical pe momente, coordonare de program și repertoriu adaptat.' },
  ],
  en: [
    { name: 'Live Moment', sets: '1 × 45 min', price: 'from EUR 650', fit: 'Ceremony, cocktail, dinner, a special moment or a corporate appearance.', detail: 'A short consultation, tailored repertoire, soundcheck and solo performance with professional backing.' },
    { name: 'Live Evening', sets: '2 × 45 min', price: 'from EUR 950', fit: 'Cocktail + dinner, reception, anniversary or two moments in the programme.', detail: 'Two distinct sets, coordination with your DJ/MC/planner and soundcheck.' },
    { name: 'Full Live Experience', sets: '3 × 45 min', price: 'from EUR 1,250', fit: 'Events where live music accompanies several stages of the evening.', detail: 'Three sets, a moment-by-moment music plan, programme coordination and tailored repertoire.' },
  ],
}

export const copy = {
  ro: {
    nav: ['Evenimente', 'Video live', 'Repertoriu', 'Despre', 'FAQ'], cta: 'Verifică data',
    heroKicker: 'Voce live · București și împrejurimi',
    heroTitle: 'Muzică live pentru seri care trebuie să se simtă speciale.',
    heroText: 'Brigitta aduce voce live, repertoriu adaptat și o prezență elegantă la nunți, recepții, evenimente corporate și petreceri private.',
    secondary: 'Descoperă formatele', micro: 'Trimite data și orașul. Brigitta răspunde personal în maximum 10 zile calendaristice.',
    eventsTitle: 'Un format potrivit momentului', eventsIntro: 'De la ceremonia intimă până la o seară în mai multe acte, muzica este construită în jurul ritmului evenimentului tău.',
    events: [
      ['Ceremonie', 'O intrare, un jurământ sau un moment care merită liniște și prezență.'],
      ['Cocktail & dinner', 'Un fundal live cald, atent la conversație și la energia încăperii.'],
      ['Party set', 'Repertoriu cu puls, sincronizat cu DJ-ul și momentele serii.'],
      ['Corporate & gala', 'Prezență elegantă și coordonare clară pentru un program fără surprize.'],
    ],
    whyTitle: 'Vocea este live. Procesul este simplu.',
    why: [['Repertoriu adaptat', 'Piesele și dinamica setului se calibrează după moment, public și atmosferă.'], ['Format clar', 'Alegi 1, 2 sau 3 seturi a câte 45 de minute. Pauzele și soundcheck-ul se planifică separat.'], ['Coordonare directă', 'Brigitta lucrează cu organizatorul, DJ-ul, MC-ul și echipa tehnică înainte de eveniment.']],
    processTitle: 'De la dată la scenă', process: [['01', 'Trimiți detaliile', 'Data, orașul, tipul de eveniment și numărul aproximativ de invitați.'], ['02', 'Verificăm contextul', 'Brigitta verifică disponibilitatea și cerințele tehnice.'], ['03', 'Primești oferta', 'Formatul potrivit, logistica și prețul final sunt clarificate direct.'], ['04', 'Confirmăm seara', 'Programul, repertoriul și soundcheck-ul intră într-un plan comun.']],
    repTitle: 'Repertoriu pentru momente, nu o listă rigidă', repText: 'Ceremonie & first dance · Soul & pop elegant · Cocktail & dinner · Dance & party. Lista completă se adaptează evenimentului și se validează înainte de confirmare.',
    aboutTitle: 'Prezență elegantă, energie calibrată', aboutText: 'Brigitta pregătește fiecare apariție în jurul oamenilor din încăpere și al momentului din program. Biografia și colaborările publice vor fi adăugate numai după aprobarea factsheet-ului oficial.',
    faqTitle: 'Întrebări frecvente',
    faqs: [['Ce include fiecare pachet?', 'Prestația Brigitta solo cu suport instrumental profesionist, consultare, repertoriu adaptat și soundcheck.'], ['Asigurați sonorizarea?', 'Locația trebuie să asigure PA și tehnician potrivite. Dacă lipsesc, soluția tehnică se cotează separat.'], ['Cât durează soundcheck-ul?', 'De regulă 45–60 de minute, programat înaintea accesului invitaților când este posibil.'], ['Cântați în afara Bucureștiului?', 'Da. Până la 60 km este aria implicită; pentru distanțe mai mari se cotează deplasarea și este necesară cazare.'], ['Pot solicita o anumită piesă?', 'Da. Cererile se discută din timp și sunt confirmate în funcție de repertoriu și context.'], ['În cât timp primesc un răspuns?', 'Brigitta răspunde personal în maximum 10 zile calendaristice; ținta internă este de 3 zile lucrătoare.']],
    finalTitle: 'Ai o dată în minte?', finalText: 'Spune-ne unde și când are loc evenimentul. Începem cu detaliile care contează.',
  },
  en: {
    nav: ['Events', 'Live video', 'Repertoire', 'About', 'FAQ'], cta: 'Check availability',
    heroKicker: 'Live vocals · Bucharest and nearby',
    heroTitle: 'Live music for evenings meant to feel special.',
    heroText: 'Brigitta brings live vocals, a tailored repertoire and an elegant stage presence to weddings, receptions, corporate events and private celebrations.',
    secondary: 'Explore the formats', micro: 'Send the date and city. Brigitta replies personally within 10 calendar days.',
    eventsTitle: 'A format shaped around the moment', eventsIntro: 'From an intimate ceremony to an evening in several acts, the music follows the rhythm of your event.',
    events: [['Ceremony', 'An entrance, a vow or a moment that deserves calm and presence.'], ['Cocktail & dinner', 'Warm live music that leaves room for conversation and follows the room.'], ['Party set', 'A repertoire with momentum, coordinated with the DJ and the evening.'], ['Corporate & gala', 'Elegant presence and precise coordination for a seamless programme.']],
    whyTitle: 'The voice is live. The process is simple.',
    why: [['Tailored repertoire', 'Songs and dynamics are calibrated to the moment, audience and atmosphere.'], ['Clear format', 'Choose one, two or three 45-minute sets. Breaks and soundcheck are planned separately.'], ['Direct coordination', 'Brigitta works with your planner, DJ, MC and technical team before the event.']],
    processTitle: 'From date to stage', process: [['01', 'Share the details', 'Date, city, event type and approximate guest count.'], ['02', 'We check the context', 'Brigitta checks availability and technical requirements.'], ['03', 'Receive the proposal', 'The right format, logistics and final price are clarified directly.'], ['04', 'Confirm the evening', 'The programme, repertoire and soundcheck become one shared plan.']],
    repTitle: 'A repertoire for moments, not a rigid list', repText: 'Ceremony & first dance · Elegant soul & pop · Cocktail & dinner · Dance & party. The full selection is adapted to the event and validated before confirmation.',
    aboutTitle: 'Elegant presence, measured energy', aboutText: 'Brigitta prepares each appearance around the people in the room and the moment in the programme. Public biography and collaboration claims will be added only after the official factsheet is approved.',
    faqTitle: 'Frequently asked questions',
    faqs: [['What does each package include?', 'Brigitta’s solo performance with professional backing, consultation, tailored repertoire and soundcheck.'], ['Do you provide the sound system?', 'The venue should provide a suitable PA and technician. If unavailable, the technical solution is quoted separately.'], ['How long is the soundcheck?', 'Usually 45–60 minutes, scheduled before guests arrive whenever possible.'], ['Do you perform outside Bucharest?', 'Yes. The default area is within 60 km; greater distances require a travel quote and one night of accommodation.'], ['Can I request a specific song?', 'Yes. Requests are discussed in advance and confirmed based on repertoire and context.'], ['When will I receive a reply?', 'Brigitta replies personally within 10 calendar days; the internal target is three working days.']],
    finalTitle: 'Do you have a date in mind?', finalText: 'Tell us where and when the event takes place. We will start with the details that matter.',
  },
} as const

export const internalPages = {
  private: {
    ro: ['Evenimente private', 'Muzică live construită în jurul oamenilor tăi.', 'Recepții, aniversări, cocktailuri și seri private primesc un repertoriu adaptat ritmului real al evenimentului.'],
    en: ['Private events', 'Live music shaped around your people.', 'Receptions, anniversaries, cocktails and private evenings receive a repertoire tailored to the real rhythm of the event.'],
  },
  weddings: {
    ro: ['Nunți și ceremonii', 'O voce live pentru momentele care rămân.', 'Ceremonie, cocktail, cină sau primul dans: fiecare intervenție se coordonează cu programul și atmosfera dorită.'],
    en: ['Weddings and ceremonies', 'A live voice for moments that stay with you.', 'Ceremony, cocktail, dinner or first dance: every appearance is coordinated with the programme and desired atmosphere.'],
  },
  corporate: {
    ro: ['Evenimente corporate', 'Prezență elegantă. Program precis.', 'Pentru gale, recepții, lansări și întâlniri de companie, Brigitta lucrează direct cu producția și echipa tehnică.'],
    en: ['Corporate events', 'Elegant presence. Precise programme.', 'For galas, receptions, launches and company gatherings, Brigitta works directly with production and the technical team.'],
  },
  video: {
    ro: ['Video live', 'Dovada trebuie să fie reală.', 'Showreel-ul și clipul live complet vor apărea aici imediat ce materialele și drepturile sunt aprobate.'],
    en: ['Live video', 'The proof should be real.', 'The showreel and full live clip will appear here as soon as the material and rights are approved.'],
  },
  repertoire: {
    ro: ['Repertoriu', 'Piese alese pentru momente.', 'Repertoriul se organizează pe ceremonie, cocktail & dinner, soul & pop elegant și party. Lista finală se adaptează evenimentului.'],
    en: ['Repertoire', 'Songs selected for moments.', 'The repertoire is organised for ceremony, cocktail & dinner, elegant soul & pop and party. The final selection is tailored to the event.'],
  },
  about: {
    ro: ['Despre Brigitta', 'O prezență construită pentru scenă și pentru oameni.', 'În această versiune publicăm doar poziționarea actuală. Biografia, aparițiile și colaborările rămân nepublicate până la aprobarea textului oficial.'],
    en: ['About Brigitta', 'A presence made for the stage and for people.', 'This version publishes only the current positioning. Biography, appearances and collaborations remain unpublished until the official text is approved.'],
  },
} as const

export const legalCopy = {
  privacy: {
    ro: ['Confidențialitate', 'Operatorul și perioada de retenție trebuie completate și validate juridic înainte de producție. Formularul colectează doar datele necesare pentru a răspunde solicitării: nume, telefon și detalii despre eveniment. Datele nu sunt folosite pentru marketing și nu sunt trimise prin email.'],
    en: ['Privacy', 'The data controller and retention period must be completed and legally validated before production. The form collects only what is needed to answer the enquiry: name, phone number and event details. Data is not used for marketing and is not sent by email.'],
  },
  cookies: {
    ro: ['Cookies', 'Site-ul nu instalează la lansare cookies de analytics, advertising sau remarketing. Sunt folosite doar tehnologii strict necesare pentru funcționarea și securitatea aplicației.'],
    en: ['Cookies', 'At launch, the site does not install analytics, advertising or remarketing cookies. Only technologies strictly necessary for the application to function securely are used.'],
  },
  terms: {
    ro: ['Termeni', 'Informațiile despre servicii și prețurile „de la” au caracter orientativ. Prețul final depinde de dată, locație, program și cerințele tehnice și este confirmat prin ofertă directă. Datele juridice vor fi completate înainte de producție.'],
    en: ['Terms', 'Service information and “from” prices are indicative. The final price depends on date, location, programme and technical requirements and is confirmed through a direct proposal. Legal entity details will be completed before production.'],
  },
} as const
