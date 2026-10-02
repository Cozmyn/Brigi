# Administrarea website-ului Brigitta

Modificările se fac în `/admin`. Website-ul folosește acum conținutul Payload. Fișierul `src/lib/site.ts` este doar baza inițială și fallback pentru un preview fără bază de date.

## Prima actualizare

Pe mediul de hosting, cu variabilele existente configurate:

```sh
npm ci
npm run db:migrate
npm run seed:content
npm run build
npm run start
```

Migrația adaugă câmpurile necesare; păstrează cererile și conținutul existent. Importul de conținut este idempotent: nu înlocuiește paginile/pachetele existente; corectează doar eventualele formulări vechi care prezentau artista ca instrumentistă. Dacă existau deja pagini în CMS, revizuiește-le înainte de publicare. Primul cont creat prin ecranul inițial devine Owner. Nu există cont sau parolă prestabilită.

## Unde modifici

| Conținut | Locul din admin |
|---|---|
| Hero, subtitluri, CTA, secțiuni, evenimente, proces | Homepage / `home-settings` |
| Fotografii hero, live, portret și imagine socială | Homepage → Photos; selectează un fișier din Media |
| Telefon, email, biografie, zonă, profiluri oficiale | Site settings |
| Prețuri, monedă, seturi, durată, recomandat, includeri | Services |
| Pagini, texte, întrebări, SEO, imagine OG | Pages |
| Piese și interpret original | Repertoire |
| Linkuri YouTube, Spotify și alte materiale | Videos |
| Întrebări de pe homepage | FAQ |
| Mesaje și progresul ofertelor | Inquiries |
| Statistici și cereri recente | Dashboard |

Salvarea/publicarea invalidează cache-ul site-ului. Paginile publice folosesc și o revalidare de rezervă la 60 de secunde. Un draft nu apare public. Pentru Pages sunt necesare starea Published, Visible și Approved for publication. Pentru Services: Published, Visible și Price approved. Fotografiile și materialele video trebuie aprobate pentru publicare.

## Pachete și prețuri

Poți modifica numele, numărul de seturi (`setCount`), durata, prețul, EUR/RON, eticheta „de la”, descrierea, includerile, ordinea și evidențierea. Debifarea Visible ascunde pachetul și îl scoate din formular și schema publică. Nu trebuie modificat codul.

Câmpul `sets` păstrează codul compatibil cu cererile istorice. `setCount` și `duration` stabilesc programul afișat. În cerere este salvat și numele pachetului selectat, pentru a distinge variantele. Prețurile inițiale de 450/750/1050 EUR rămân repere de confirmat înainte de lansare.

## Fotografii

În Media: încarcă imaginea, adaugă un text alternativ descriptiv, setează punctul focal și aprobă publicarea. Apoi selecteaz-o în secțiunea dorită. Câmpurile goale nu produc imagini defecte. Nu șterge o fotografie folosită înainte să o înlocuiești.

| Utilizare | Rezoluție recomandată | Raport | Dimensiune orientativă |
|---|---|---|---|
| Hero și fotografie live | 1600 × 2000 px | 4:5 | 200–400 KB |
| Portret despre artistă | 1200 × 1600 px | 3:4 | 120–300 KB |
| Imagine într-o pagină | 1800 × 1200 px | 3:2 | 150–350 KB |
| Open Graph / social | 1200 × 630 px | 1,91:1 | sub 250 KB |

WebP/AVIF sunt preferate. Lasă spațiu deasupra capului și evită subiectul lipit de margine. Punctul focal este aplicat în frontend. CMS produce variante de dimensiune; Next optimizează imaginile publice. Fisierele sunt stocate local în `public/media`: hostingul trebuie să păstreze acest director între deploy-uri și să îl includă în backup. Nu se versionează în git.

## Pagini noi și SEO

Creează o pagină cu slug fără `/`, titlu, H1, introducere și secțiuni structurate. Adaugă întrebări reale și pagini asociate. Completează SEO title, description, index/noindex, eventual canonical și Open Graph. Canonical gol înseamnă adresa proprie. Nu folosi canonical pentru a masca texte duplicate.

Pentru o pagină locală selectează `location`, completează aria de servicii și scrie conținut propriu: context local, disponibilitate reală, imagini sau evenimente reale, întrebări utile. Nu genera pagini doar schimbând numele orașului. Schimbarea unui slug creează o redirecționare permanentă de la vechea adresă. Verifică legăturile din textele libere.

Pagina video rămâne neindexabilă până există materiale: adaugă materialele aprobate și debifează noindex în SEO-ul paginii. Noindex global pentru preview este controlat prin `PRODUCTION_GATES_CLOSED=false`.

## Cereri

Inboxul oferă căutare după nume, telefon, email, oraș sau locație, filtre și sortare. Stările sunt Nouă, Citită, Contactat, Ofertă trimisă, Confirmat, Închis, Arhivat și Spam. Deschiderea unei cereri noi o marchează citită. Folosește Internal notes pentru discuții și Last contacted at pentru urmărire. Schimbările de stare sunt auditate.

Emailul nu este trimis automat. Cererea este considerată reușită numai după salvarea în baza de date. Dashboardul arată ultimele cereri. Accesul editorilor la solicitări se acordă separat prin Can access inquiries.

## Statistici

Activează Analytics enabled în Site settings. Vizitatorul poate accepta sau refuza; refuzul nu blochează site-ul. Preferința poate fi schimbată din subsol. Do Not Track / Global Privacy Control sunt respectate.

Dashboard: vizite astăzi/7/30 zile, pagini văzute, top pagini, domenii de proveniență, campanii UTM, clickuri telefon/contact, formulare începute/finalizate și selecții de pachete. Datele se referă numai la vizitatorii care acceptă. O vizită reprezintă o sesiune de filă, nu o persoană unică. Clickul pe telefon nu este dovada unui apel. Inboxul rămâne sursa pentru numărul real de cereri.

Nu se păstrează IP-uri, identificatori de vizitator sau trasee individuale în analytics. Sursa este doar domeniul, fără query/path. Campaniile acceptă identificatori simpli, fără date personale. Contoarele sunt agregate zilnic, pe fusul Europe/Bucharest; datele mai vechi de 90 zile se șterg la următoarea înregistrare. Nu introduce nume, emailuri sau telefoane în UTM-uri.

## Lansare

Configurează domeniul HTTPS prin SITE_URL și NEXT_PUBLIC_SERVER_URL, identitatea/contactul operatorului și regula de păstrare. Setează PRODUCTION_GATES_CLOSED=true doar când conținutul este pregătit. Adaugă codurile Google/Bing în Site settings și trimite `/sitemap.xml` în instrumentele lor. `/llms.txt` este experimental; nu garantează vizibilitate sau poziții.

Nu publica fișiere de mediu reale, credențiale, tipurile generate sau snapshot-uri JSON ale migrațiilor. În repository se păstrează numai exemplul de variabile fără secrete și migrațiile necesare.
