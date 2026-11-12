# BR-07f: lot comun media, relații și SEO

## Trei integrări în același lot

1. Imaginile secțiunilor sunt rezolvate după ID prin ContentStore cu acces public explicit. Se acceptă numai fișiere WebP procesate local, aprobate, cu URL/filename concordante, text alt și dimensiuni valide. Obiectele media încorporate în snapshot nu sunt considerate dovadă de aprobare.
2. Pagini asociate: ID-uri deduplicate, snapshot publicat, vizibil și aprobat în aceeași limbă. URL-ul este calculat cu resolverul comun. Pagina lipsă, retrasă, neaprobată sau cu slug invalid este omisă. Nu există fallback EN spre RO.
3. Imaginea socială aprobată este folosită în pagina articolului, Open Graph/Twitter și schema Article cu dimensiunile reale. Nu sunt fabricate imagini 1200x630. Dacă este deja o imagine de secțiune nu este dublată în antet.

Media este globală în CMS, deci locale ro pentru fișiere nu reprezintă un fallback editorial de limbă. În MVP textul alt/caption/credit al media nu are traduceri separate. Caption și credit sunt afișate numai dacă există.

## Siguranță și limite

Imaginile sunt randate cu next/image unoptimized, intenționat, pentru a folosi direct ruta media care verifică aprobarea și livrează private/no-store. Astfel nu adăugăm o copie nouă în cache-ul optimizerului care să prelungească accesul după retragerea aprobării. Acest lot nu poate elimina copii deja descărcate sau cache-uri externe/sociale.

Textul secțiunilor se păstrează când o imagine lipsește. Sunt rezolvate maximum 16 ID-uri media distincte și 8 pagini asociate per articol; imaginile suplimentare sunt omise, nu textul. Deduplicarea este per randare, nu un cache persistent. Erorile DB nu sunt mascate drept lipsă de conținut. Metadata și pagina se pot citi la momente diferite; verificarea lor nu este o tranzacție comună.

Relațiile relatedServices, navigația generală și redirecturile automate nu sunt incluse. Redirecturile necesită integrare și teste separate în tranzacția de publicare, inclusiv conflicte, bucle și schimbări repetate de slug; nu sunt deduse din revizii de draft.

## Validare

Testele propuse acoperă politica media, ID-uri invalide, acces public, locale, deduplicare, referințe retrase și coerența imaginii în SEO. Accesul CMS este simulat; nu certifică servirea fișierelor, revocarea efectivă în browser, persistența DB, responsivitatea sau cache-ul de hosting. Sunt necesare verificări pozitive în mediul de test cu media reală și capturi.

Continuarea dezvoltării nu așteaptă CI; rezultatele nu sunt declarate trecute înainte de verificare. Nu sunt create fișiere media, conținut seed, acorduri, prețuri sau înregistrări DB. Fără migrare, merge ori deploy. Rollback: revert al lotului, fără ștergerea conținutului.
