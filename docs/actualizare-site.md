# Administrarea website-ului Brigitta

Modificările se fac în `/admin`, în CMS-ul MySQL al aplicației. Fișierul `src/lib/site.ts` este baza inițială și fallback pentru un preview fără bază de date. Pentru instalare și transferul datelor existente, urmează [ghidul cPanel](cpanel.md).

## Prima actualizare

Pe mediul de hosting, cu variabilele existente configurate:

```sh
npm ci
npm run db:migrate
npm run seed:content
npm run build
npm run start
```

Migrațiile creează tabelele MySQL. Datele din vechiul Payload se transferă separat prin export/import, înainte de seed. Seed-ul este repetabil și nu înlocuiește paginile/pachetele existente. Primul cont Owner se creează din terminal prin `npm run admin:create`. Nu există înregistrare publică ori parolă prestabilită.

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

Sunt acceptate JPG, PNG, WebP și AVIF, maximum 12 MB. Lasă spațiu deasupra capului și evită subiectul lipit de margine. Coordonatele focalX/focalY controlează punctul focal. Uploadul produce variante WebP și elimină metadatele originale. Fișierele sunt stocate în `MEDIA_DIR`, recomandat `/home/tavroro/brigi-data/media`, separat de cod. Include acest director în backup. Imaginile neaprobate pot fi văzute numai după autentificare. Ștergerea imaginilor încă folosite este blocată; înlocuirea păstrează asocierea cu secțiunile.

## Pagini noi și SEO

Creează o pagină cu slug fără `/`, titlu, H1, introducere și secțiuni structurate. Adaugă întrebări reale și pagini asociate. Completează SEO title, description, index/noindex, eventual canonical și Open Graph. Canonical gol înseamnă adresa proprie. Nu folosi canonical pentru a masca texte duplicate.

Pentru o pagină locală selectează `location`, completează aria de servicii și scrie conținut propriu: context local, disponibilitate reală, imagini sau evenimente reale, întrebări utile. Nu genera pagini doar schimbând numele orașului. Schimbarea unui slug creează o redirecționare permanentă de la vechea adresă. Verifică legăturile din textele libere.

Pagina video rămâne neindexabilă până există materiale: adaugă materialele aprobate și debifează noindex în SEO-ul paginii. Noindex global pentru preview este controlat prin `PRODUCTION_GATES_CLOSED=false`.

Selectorul de limbă din editor schimbă între RO și EN. Traducerile sunt salvate și publicate separat. Paginile EN apar la `/en/slug`; homepage-ul EN și formularul sunt la `/en` și `/en/booking`. Un draft păstrează versiunea publicată anterior. Pentru eliminarea de pe website folosește **Retrage publicarea**. **Istoric versiuni** permite restaurarea unei versiuni ca ciornă. Parolele utilizatorilor se resetează din admin sau prin `npm run admin:reset`.

## Cereri

Inboxul oferă căutare după nume, telefon, email, oraș sau locație, filtre și sortare. Stările sunt Nouă, Citită, Contactat, Ofertă trimisă, Confirmat, Închis, Arhivat și Spam. Deschiderea unei cereri noi o marchează citită. Folosește Internal notes pentru discuții și Last contacted at pentru urmărire. Schimbările de stare sunt auditate.

Emailul nu este trimis automat. Cererea este considerată reușită numai după salvarea în baza de date. Dashboardul arată ultimele cereri. Accesul editorilor la solicitări se acordă separat prin Can access inquiries.

## Statistici

Activează Analytics enabled în Site settings. Vizitatorul poate accepta sau refuza; refuzul nu blochează site-ul. Preferința poate fi schimbată din subsol. Do Not Track / Global Privacy Control sunt respectate.

Dashboard: vizite astăzi/7/30 zile, pagini văzute, top pagini, domenii de proveniență, campanii UTM, clickuri telefon/contact, formulare începute/finalizate și selecții de pachete. Datele se referă numai la vizitatorii care acceptă. O vizită reprezintă o sesiune de filă, nu o persoană unică. Clickul pe telefon nu este dovada unui apel. Inboxul rămâne sursa pentru numărul real de cereri.

Nu se păstrează IP-uri, identificatori de vizitator sau trasee individuale în analytics. Sursa este doar domeniul, fără query/path. Campaniile acceptă identificatori simpli, fără date personale. Contoarele sunt agregate zilnic, pe fusul Europe/Bucharest; datele mai vechi de 90 zile se șterg la următoarea înregistrare. Nu introduce nume, emailuri sau telefoane în UTM-uri.

## Lansare

Configurează domeniul HTTPS prin SITE_URL și NEXT_PUBLIC_SERVER_URL, identitatea/contactul operatorului și regula de păstrare. Setează PRODUCTION_GATES_CLOSED=true doar când conținutul este pregătit. Adaugă codurile Google/Bing în Site settings și trimite `/sitemap.xml` în instrumentele lor. `/llms.txt` este experimental; nu garantează vizibilitate sau poziții.

Nu publica fișiere de mediu reale, credențiale, exporturi de conținut sau snapshot-uri ale bazei. Tipurile din `src/cms/types.ts` descriu numai câmpurile aplicației și sunt sigure pentru repository; nu sunt extrase din baza de date.
