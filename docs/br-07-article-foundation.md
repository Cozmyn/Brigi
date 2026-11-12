# BR-07a: fundația resolverului de URL-uri

## Livrat în acest lot

Helper pur în src/lib/content-paths.ts și teste de integrare fără acces la baza de date. Pages păstrează /slug și /en/slug. Articles propune /ghiduri/slug și /en/ghiduri/slug, conform convenției /en/slug din raport; denumiri traduse de prefix necesită o decizie separată. Slugul este un singur segment ASCII, fără normalizare tăcută, query, fragment sau codificare procentuală. Prefixele rezervate sunt refuzate.

contentPath calculează o cale; nu dovedește existența documentului și nu acordă acces. publicContentPath cere explicit published, visible și approvedForPublication. Consumatorii trebuie să citească snapshot-ul publicat prin store cu overrideAccess: false. Helperul nu transformă un draft administrativ în conținut public și nu verifică singur permisiunile unei cereri.

## Limite importante

Acest lot NU înregistrează colecția Article, NU adaugă rute publice și NU schimbă linkurile, metadata sau sitemap-ul existente. Nu declară BR-07 finalizat. Nu modifică schema SQL, conținutul CMS, prețurile sau variabilele de hosting. Nicio migrare sau publicare automată.

Publicabilitatea nu este indexabilitate: noindex, canonical și gate-ul de producție se aplică ulterior, comun în metadata și sitemap. Nu setați noindex=false doar pentru că helperul returnează o cale.

## Următoarea integrare

1. Article: autor, recenzor, rezumat, secțiuni, surse, contribuție originală și relații; draft/review/approved/published cu validare server-side.
2. Registrul CMS, tipuri, acces public bazat pe snapshot și teste cu MySQL/MariaDB; nu este suficientă adăugarea unei colecții în UI.
3. Rute dedicate pentru RO/EN, 404 pentru drafturi, preview autentificat/noindex, redirect la schimbare de slug.
4. Relații rezolvate prin helper; reguli unice pentru canonical, schema Article, metadata și sitemap; verificarea coliziunilor pe locale/path.
5. Formatele, partenerii și studiile de caz vin în loturi separate; acordurile și dovezile nu se inventează.

## Verificare și rollback

Rulați npm run lint, npm run typecheck, npm run test:int, build și e2e în mediul de test conform README. Testele din acest lot nu certifică rute sau publicare CMS funcționale. Rezultatul CI trebuie verificat pentru commitul exact. Fără măsurători sau validări de producție declarate.

Rollback: revert al lotului; helperul încă nu are consumatori în aplicație. Nu există migrare de bază de date de revenit. Merge-ul și deploy-ul cer aprobare separată.
