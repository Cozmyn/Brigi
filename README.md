# Brigitta — muzică live pentru evenimente

Site în română, cu Next.js 16, React 19, TypeScript și Payload 3 / PostgreSQL.
Identitate editorială: cerneală, crem, vermilion, serif expresiv și compoziții abstracte
inspirate de scenă. Aceste compoziții nu reprezintă fotografii ale artistei.

## Pornire

```sh
npm ci
cp .env.example .env
# Completează DATABASE_URL și un PAYLOAD_SECRET lung, aleator.
npm run dev
```

Tipurile Payload se generează local înainte de typecheck/build și nu sunt versionate.
Snapshot-urile JSON noi ale migrărilor rămân locale; migrarea TypeScript este suficientă
pentru aplicarea câmpurilor de rezervare. Pentru o migrare viitoare, generați un
snapshot local de referință din configurația curentă înainte de schimbarea colecțiilor.

Node >=24, npm >=11. PostgreSQL este necesar pentru rezervări și administrare.
Frontendul poate fi construit fără acces la baza de date; formularul nu simulează salvarea.
API-ul returnează eroare dacă cererea nu poate fi salvată.

## Editarea conținutului

**`src/lib/site.ts` → `siteContent`** este sursa pentru nume, biografie, CTA, prețuri,
pachete, evenimente, repertoriu, FAQ, testimoniale, media, social și fotografii.
Prețurile orientative: Essential 450 €, Signature 750 €, Full Experience 1.050 €.
Nu există presupuneri despre sonorizare inclusă, rază de deplasare sau timp de răspuns.

- Contact: `PUBLIC_PHONE`, `PUBLIC_BOOKING_EMAIL`. Valorile goale ascund acțiunile.
- Imagini aprobate: `public/images/brigitta/`, apoi setează `siteContent.photos`.
- Media: `siteContent.media` cu `title`, URL HTTPS și `kind`: `youtube`, `spotify`, `link`.
- Testimoniale: `quote`, `author`, `context`. Secțiunea apare numai cu date reale.
- Social: URL-uri oficiale HTTPS; aceleași valori alimentează JSON-LD `sameAs`.
- Aria de servicii: `siteContent.artist.serviceArea`, numai după confirmare.

Payload păstrează administrarea cererilor, utilizatorii, rolurile și auditul.
Colecțiile CMS istorice nu suprascriu această configurație editorială.

## Rezervări reale

`POST /api/inquiries` validează datele cu Zod și salvează în colecția `inquiries`.
Date: nume, telefon, email, tip/data/ora evenimentului, oraș, județ, locație,
invitați, pachet, preferințe muzicale, buget opțional, mesaj, consimțământ,
UTM, landing page și referrer. Telefonul se normalizează.

Există honeypot, verificare Origin, limită de dimensiune, limitare pe IP și cheie de
idempotency. Rate limit-ul din memorie este per proces; la scalare, configurați și
limitarea centralizată în proxy/WAF. Nu se instalează trackere. Nu se trimit emailuri
sau notificări automate: solicitările se verifică în `/admin`.

În producție, aplicați migrarea aditivă înainte de servirea versiunii noi:

```sh
npm run payload -- migrate
npm run build
npm run start
```

Câmpurile noi sunt nullable în DB pentru compatibilitate cu cererile istorice;
API-ul cere email și județ pentru noile solicitări. `down` elimină datele din
coloanele adăugate și păstrează valorile enum aditive. Nu rulați rollback fără backup.

## SEO și pagini viitoare

HTML important este randat pe server. Canonicale, Open Graph, Twitter, icon,
sitemap și robots sunt incluse. JSON-LD: Person, WebSite, WebPage, Service,
OfferCatalog/Offer, FAQPage, BreadcrumbList; fără evaluări sau recenzii inventate.

Setați domeniul real în **`SITE_URL` înainte de build**. `PRODUCTION_GATES_CLOSED=false`
ține previzualizarea neindexabilă. Pentru lansare completați și validările existente
în `scripts/validate-production-config.mjs`, inclusiv datele de confidențialitate.
Nu există garanții de clasare în Google sau răspunsuri AI.

`ContentPage` și `internalPages` permit pagini cu introduceri și conținut distinct.
Paginile existente sunt păstrate cu conținut românesc nou. `/contact` redirecționează
la `/rezervare`; vechile adrese `/en` redirecționează la echivalentele românești.
Extindeți cu conținut unic înainte de a adăuga pagini pentru botezuri sau orașe.
Pagina media rămâne noindex și în afara sitemap-ului până la adăugarea materialelor.

## Analytics și performanță

Evenimentele `brigitta:analytics` sunt `CustomEvent` pe `window`: `click_phone`,
`click_contact_cta`, `package_selected`, `contact_form_started`,
`contact_form_submitted`, `media_played`. Payload-ul nu include date personale.
Un adaptor de analytics poate fi adăugat separat, cu consimțământul potrivit.

Fonturile sunt găzduite local de Next, `display: swap`; fotografiile folosesc
`next/image`, dimensiuni responsive și prioritate doar la hero. Clipurile YouTube
folosesc domeniul nocookie și se încarcă numai la apăsare; Spotify rămâne link extern.
Mișcarea respectă `prefers-reduced-motion`. Nu sunt adăugate biblioteci de animație.

## Verificări

```sh
npm run lint
npm run typecheck
npm run test:int
npm run build
npx playwright install chromium
npm run test:e2e
```

Testele e2e cer PostgreSQL de test, `PAYLOAD_SECRET` și un `SITE_URL` care corespunde
originii serverului. CI folosește o bază de date dedicată. Testele scriu o cerere QA;
nu le rulați împotriva bazei de producție. Testele includ prețuri, validare, selecția
pachetului, lățimi mobile, 404, salvare reală și idempotency.

## Pentru lansare

Telefon, email de booking, domeniu final, identitatea operatorului/contactul de
confidențialitate și perioada de păstrare; 5–10 fotografii reale, 1–3 clipuri live,
linkuri sociale/streaming, prețuri confirmate, arii de deplasare și detalii tehnice.
Repertoriul detaliat și testimonialele se adaugă doar după confirmare.
