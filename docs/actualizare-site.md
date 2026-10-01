# Cum actualizezi noul website Brigitta

Versiunea publică este construită din `src/lib/site.ts`, nu din vechile colecții de conținut din admin. `/admin` este folosit pentru cererile de rezervare. După modificarea conținutului sau a variabilelor publice, reconstruiește și redeployează aplicația.

## Contact și domeniu

În panoul serviciului de hosting, la Environment Variables, completează:

- `PUBLIC_PHONE`: telefonul public, cu prefix internațional, de exemplu formatul `+40…`.
- `PUBLIC_BOOKING_EMAIL`: adresa publică pentru booking.
- `SITE_URL` și `NEXT_PUBLIC_SERVER_URL`: domeniul complet, cu `https://`.
- `PRIVACY_OPERATOR`, `PRIVACY_CONTACT`, `INQUIRY_RETENTION_DAYS`: datele reale pentru informarea de confidențialitate.

La dezvoltare locală, completează aceleași valori în `.env`, care nu se publică în GitHub. Valorile goale pentru telefon/email ascund linkurile de contact. `PUBLIC_WHATSAPP` este o variabilă istorică cerută de validatorul de lansare; noul frontend afișează telefon și email, fără buton WhatsApp separat.

## Texte, pachete și social

Deschide `src/lib/site.ts` în GitHub, apasă creionul (Edit) și modifică obiectul `siteContent`:

- `artist.biography`: biografia; `artist.social`: linkurile oficiale complete; `artist.serviceArea`: zona de deplasare.
- `packages`: `name`, `sets`, `duration`, `priceFrom`, descriere și detalii. Prețul se scrie ca număr în EUR, fără simbol: `450`, `750`, `1050`.
- `hero`, `experience`, `repertoire`, `faqs`, `booking`: textele respective.
- `media`: materiale live reale; `testimonials`: doar citate aprobate.

Păstrează valorile `formValue` ale pachetelor (`1x45`, `2x45`, `3x45`), deoarece acestea sunt folosite în formular și backend. Schimbarea prețurilor actualizează simultan cardurile și datele SEO.

## Fotografiile folosite acum

În GitHub, deschide `public/images/brigitta`, apoi Add file → Upload files. Încarcă fotografiile cu numele de mai jos. După upload, completează `src` în `siteContent.photos`; calea începe cu `/images/brigitta/`, fără `public`.

| Utilizare | Fișier | Rezoluție recomandată | Raport sursă | Țintă de greutate |
| --- | --- | --- | --- | --- |
| Fotografia principală | `hero.webp` | 1600 × 2000 px | 4:5, vertical | 200–400 KB |
| Secțiunea experiență/live | `live.webp` | 1600 × 2000 px | 4:5, vertical | 150–350 KB |
| Portret / despre artistă | `portrait.webp` | 1200 × 1600 px | 3:4, vertical | 120–300 KB |
| Imagine distribuită pe social | `social.jpg` | 1200 × 630 px | aproximativ 1,91:1 | sub 250 KB |

Dimensiunile sunt recomandări de export, nu dimensiunile fixe de afișare. Fotografiile se adaptează cadrului cu `object-fit: cover`, deci marginile pot fi decupate diferit pe desktop și mobil. Alege imagini cu chipul departe de margini, spațiu în jurul capului și fără text imprimat. Hero-ul este mai lat pe mobil; păstrează subiectul în zona centrală. Nu mări artificial fotografii mici.

Exemplu în `siteContent.photos`:

```ts
hero: {
  src: '/images/brigitta/hero.webp',
  alt: 'Brigitta pe scenă, cântând live',
  position: 'center 25%',
},
live: {
  src: '/images/brigitta/live.webp',
  alt: 'Brigitta în timpul unui program live',
  position: 'center 30%',
},
portrait: {
  src: '/images/brigitta/portrait.webp',
  alt: 'Portret Brigitta',
  position: 'center 25%',
},
social: {
  src: '/images/brigitta/social.jpg',
  alt: 'Brigitta — muzică live pentru evenimente',
},
```

`position` reglează punctul de decupare: `center 25%` favorizează partea de sus; `center` centrează imaginea. Verifică desktop și mobil după fiecare înlocuire. Dacă `src` rămâne gol, se afișează compoziția abstractă existentă. Imaginea social goală folosește cardul grafic generat automat.

Sloturile `landscape`, `stage`, `atmosphere`, `editorial` sunt rezervate pentru extinderi și nu sunt afișate în homepage-ul actual. Pentru viitoare imagini late recomandăm 1800 × 1200 px (3:2); nu trebuie încărcate acum.

## Publicarea modificărilor

Salvează modificările în `main` (Commit changes). Dacă hostingul urmărește automat `main`, va începe un deployment; altfel declanșează manual Redeploy în panoul hostingului. Actualizarea repository-ului nu dovedește că deploymentul s-a încheiat.

La prima trecere la noua versiune, aplică migrarea existentă `npm run payload -- migrate`, apoi build/deploy. Formularul folosește PostgreSQL-ul existent; solicitările se verifică în `/admin`, fără notificare automată prin email. Variabilele de bază de date și secretele se configurează exclusiv în hosting sau `.env` local.
