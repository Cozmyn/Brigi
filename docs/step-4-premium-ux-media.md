# Pasul 4 — website premium, experiență mobilă și media autentică

**Sursă de produs:** Raportul strategic BRIGITTA (12.11.2026), secțiunea 10, p. 11; planul editorial, secțiunea 08, p. 9. PR #10 este o modificare de cod stacked peste #9 → #8 → #7. Nu publică direct date și nu efectuează deployment.

## Experiență și principii UX
- Structura comercială păstrează CTA principal către disponibilitate, ofertă și contact valid, cu secundarul «Ascultă live» **doar dacă** există o înregistrare verificată ca recital live; alt context poartă denumirea «înregistrare». În lipsa media, se oferă repertoriul, nu un showreel fals.
- Primul modul după hero este dovada video, numai dacă există material publicabil; apoi selecția existentă de nevoi/evenimente, formate/pachete aprobate, parcursul și procesul, resurse publicate, FAQ și cererea rapidă din Pasul 2.
- Cardurile de ghiduri și studii de caz apar doar pentru snapshoturi editoriale publicate și aprobate. Recenziile rămân condiționate de consimțământ și vizibilitate.
- Navigarea are structură de HTML semantic, skip link, focus vizibil, meniu desktop cu contrast ridicat și meniu mobil, cu ținte de cel puțin 44px. CTA-ul mobil respectă safe-area; layoutul este verificat la 360/390/768/1440px. Animațiile respectă prefers-reduced-motion.
- Fonturile Bodoni Moda și Manrope au fost copiate ca fișiere originale verificate din PR #6, cu licențe OFL, în proiect. Buildul nu mai descarcă fonturi din Google. Testele verifică glifele ĂăÂâÎîȘșȚț.

## Dovezi vizuale și acreditări
1. Încărcați **numai fotografii reale** în Media, cu alt descriptiv, autor/credit și drepturi documentate, data și contextul dacă sunt disponibile, rezoluție suficientă și aprobare explicită. Nu folosiți imagini stock prezentate drept evenimente proprii.
2. În Homepage > Photos, alegeți separat hero, live, portrait și social numai din Media aprobate. Imaginea absentă produce grafica tipografică abstractă deja existentă, fără fotografii generate.
3. Acreditările de tip «Vocea României», «SISTEM» sau lansări sunt **neverificate în această implementare** și au fost scoase din biografiile fallback. Pentru afișare, editorul trebuie să completeze lista verifiedCredentials (afirmație și URL HTTPS spre sursă) și să activeze explicit trustStripVisible. Niciun badge nu apare doar din textul hardcodat.
4. Pachetele inițiale și prețurile 450/750/1050 din cod rămân **exemple de configurare**, nu oferte vizibile. Seedul creează înregistrări draft fără priceApproved. Numai un pachet publicat, visible=true, priceApproved=true ȘI commerciallyVerified=true este afișat. A doua bifă este o confirmare manuală nouă, necesară inclusiv pentru prețurile aprobate automat în seeduri istorice; fără ea, înregistrările vechi rămân private. Ofertele JSON-LD coincid cu CMS. Până atunci, cererea de ofertă funcționează cu pachet «nu știu».
5. Testimonialele necesită declarație reală și publicationConsent. Studiile de caz necesită dovezi, acord, revizuire și lipsa datelor private.

## Flux video: condiții obligatorii
Editorul completează în colecția Videos: titlu real, slug, descriere contextuală (minim 30 caractere pentru expunere), URL YouTube HTTPS verificat, imagine poster Media cu fișier procesat, alt, dimensiuni și rightsNotes, data reală de publicare în format ISO UTC, durata reală în secunde, tipul înregistrării (live / studio / rehearsal / other), iar transcrierea/subtitrările sunt adăugate unde sunt disponibile și necesare. Sunt necesare rightsConfirmed=true, visible=true, approvedForPublication=true.

Modulul public folosește allowlist de domenii YouTube, poster aprobat și ID video sintactic valid; respinge linkuri externe false, aprobări lipsă, poster fără drepturi, dată în viitor și durată invalidă. Câmpul `recordingContext` împiedică prezentarea montajelor de studio ca recital live. Playerul YouTube fără cookie-uri se încarcă **numai la click**, fără autoplay. Pentru clipurile publicabile poate apărea `VideoObject` cu thumbnail, uploadDate, duration, embedUrl și descriere reale; fără aprobări, `/video` și `/en/video` sunt goale și noindex, iar detaliile inaccesibile returnează 404.

**Limitare:** verificarea sintactică a URL-ului nu dovedește de una singură că videoclipul există sau că deținătorul are drepturi. Editorul trebuie să deschidă sursa, să verifice imaginea/sunetul, proprietarul, acordul și licența, să compare durata cu înregistrarea și să confirme transcrierea. Un titlu/video tehnic valid dar fals trebuie respins manual.

## Materiale de furnizat înainte de lansare
- Filmări originale cu acordul pentru difuzare, descriere a modului de înregistrare (live/studio), miniaturi aprobate și durata/data reală; opțional 45–90 secunde showreel și un fragment lung neîntrerupt. Aceste durate sunt propuneri editoriale, nu garanții de SEO.
- Fotografii hero/live/portrait și dimensiuni adaptate, drepturi scrise, autor și alt; biografie și acreditări cu surse verificabile.
- Oferte reale: formatul prestat, componența, durata, ce include/exclude, aria și prețuri aprobate sau status «evaluare individuală» dacă nu sunt disponibile.
- Un set de testimoniale cu permisiune și, pentru studii de caz, context, cronologie, constrângeri, dovezi autentice și consimțământ.
- 12 materiale în stadiu de **brief**, descrise în `docs/step-4-editorial-briefs.md`. Acestea nu sunt publicate automat, iar planul de 12 săptămâni nu este o predicție SEO.

## QA și rollout controlat
- `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:int`, `npm run db:migrate`, `npm run test:import`, `npm run test:db`, `npm run seed:content` de două ori, `npm run build`, `npm run test:e2e` pe MySQL 8.0 și MariaDB 10.11 în mediul de test izolat.
- Teste locale fonturi, drepturi video, tipuri de înregistrare, lipsă media, canonical/video schema, navigate/dimensiuni mobile, accesibilitate și booking fără oferte aprobate.
- Înainte de orice lansare: aprobare separată pentru merge/deploy, backup verificabil, mediul staging, materiale reale aprobate, GDPR, Core Web Vitals măsurate, verificarea manuală a Playerului YouTube, subtitrărilor și capturilor pe mobil. Indexarea rămâne sub controlul gate-ului din Pasul 1.

**Fără merge, deployment, publicare de conținut, schimbare de prețuri sau editare a bazei de date de producție prin PR #10.**
