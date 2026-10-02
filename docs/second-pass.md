# A doua etapă: design, publicare și descoperire

Păstrat: Next.js / Payload / PostgreSQL, roluri, colecții, formularul validat, persistența cererilor, protecțiile anti-spam, idempotency, linkurile istorice și optimizarea imaginilor.

Îmbunătățit: sistem tipografic Bodoni Moda + Manrope, paletă petrol/mineral/citric, compoziția hero, ritmul secțiunilor, pachete și lectură pe mobil. Mișcarea folosește CSS și respectă prefers-reduced-motion. Nu există autoplay sau bibliotecă de animații nouă.

Înlocuit: citirea exclusivă din configurația statică pentru conținutul public; paginile de servicii cu o singură introducere. Configurația este păstrată ca bază pentru import/preview, CMS devine sursa publicată.

## Cercetare și decizii

Referințe consultate la 1 octombrie 2026:
- https://amoklab.com/work/oda-haliti — grilă editorială, fotografie documentară, tipografie puternică; principii adaptate, fără copiere.
- https://www.awwwards.com/sites/jacob-how-portfolio — identitate coerentă pentru un portofoliu audiovizual; nu am preluat 3D/WebGL.
- https://www.ioana-balan.ro/oferte/ și https://formatia-divertis.ro/repertoriu/ — rezultatele românești pun accent pe format, repertoriu, durată și logistică. Aceasta este o observație de intenție, nu o estimare de volum de căutare.
- https://developers.google.com/search/docs/appearance/ai-features — accesibilitate, conținut util și SEO tehnic; fără presupunerea unui marcaj special care garantează apariția în răspunsuri AI.
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies — marcaj în acord cu informația vizibilă.
- https://payloadcms.com/docs/local-api/overview și https://payloadcms.com/docs/database/migrations — conectarea colecțiilor existente și migrare incrementală.

## Arhitectură SEO

- Nunți: program, dansul mirilor, coordonare DJ/locație și pregătirea ofertei.
- Corporate: agendă, briefing, invitați internaționali și logistică scenică.
- Private: spațiu, aniversări și apariții surpriză.
- Nou `/solista-botez`: program de zi, familii și generații, volum și intervale.
- Nou `/muzica-live-evenimente`: ghid comparativ solistă/DJ/formație, ce se compară într-o ofertă.
- Repertoriu și despre: entity clarity, repertoriu real, parcurs confirmat de proprietar.

URL-urile existente sunt păstrate. Aliasurile nu devin duplicate indexabile. Metadata, canonical, indexare, OG, schema și sitemap citesc aceeași sursă publicată. Paginile locale se editează structurat, fără generare automată. Slugurile schimbate creează redirecturi.

`robots.txt` permite publicul și imaginile publice la lansare; admin/API/preview sunt excluse. Agenții de căutare AI folosesc aceeași politică publică wildcard. Nu există o presupunere că roboții de antrenare sunt echivalenți cu cei de căutare: această versiune nu introduce o restricție separată de antrenare. Regulile robots nu înlocuiesc autentificarea. Preview-ul este noindex și are sitemap gol.

JSON-LD folosește o singură identitate Person, plus WebSite, WebPage, Service, oferte configurate și breadcrumbs. FAQ corespunde răspunsurilor vizibile, fără promisiuni de rich results. llms.txt este doar un index experimental al informației publicate.

## Performanță și limite de măsurare

Fonturile sunt găzduite de Next, imaginile au dimensiuni responsive și prioritate numai în hero. Media externă se încarcă la acțiune. Analytics este intern, agregat și opțional. SSR păstrează conținutul important în HTML. Revalidarea la salvare păstrează pachetele, schema și textele sincronizate.

Core Web Vitals reale necesită trafic pe domeniul de producție; nu sunt inventate scoruri. Rate-limit-ul formularului și analytics este per proces; pentru mai multe instanțe, limitele la proxy/hosting completează protecția existentă. Nu a fost introdus un nou serviciu extern sau backend paralel.
