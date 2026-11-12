# BR-07g: cinci pași legați

1. Redirecturile Article sunt create în tranzacția de salvare a snapshot-ului publicat. Se compară cu snapshot-ul publicat anterior, nu cu draftul sau reviziile. Un draft nu creează redirect. Sunt rezervate și verificate adresele deja folosite; conflictele cu redirecturi manuale sau ale altui articol opresc publicarea și tranzacția revine.
2. Rutele vechi folosesc 308 către snapshot-ul curent al aceluiași document și aceleiași limbi. Nu urmăresc lanțuri arbitrare. Ținta retrasă/neaprobată/inexistentă produce 404. Aliasurile administrate sunt etichetate cu document și limbă, actualizate la redenumiri repetate; revenirea la o adresă veche elimină numai aliasul propriu de la acea adresă. Redirecturile istorice anterioare acestei integrări nu sunt reconstruite automat.
3. relatedServices afișează maximum 8 pachete distincte, publicate/vizibile/cu preț aprobat, în aceeași limbă. Linkul folosește selectie=ID, compatibil cu formularul existent. Nu sunt inventate prețuri și nu se adaugă automat OfferCatalog pe ghiduri.
4. Navigația principală RO desktop/mobil adaugă Ghiduri dacă există articole publicate și linkul nu există deja. Navigația EN a homepage-ului rămâne separată și nu este modificată în acest lot.
5. Test pozitiv de flux cu baza reală CI: draft, publicare, protecția draftului, redenumiri fără lanț, conflict cu rollback, revenire la slug vechi, EN separat și retragere RO. Testul creează și șterge fixture-uri de articol/pachet/redirect numai cu CI=true, DB_NAME=brigitta_test, DB_HOST=127.0.0.1, gate=false și URL de test local. Altfel este omis. Nu rulați teste care scriu pe producție.

## Detalii SQL și operare

Nu se adaugă tabele sau migrări. unique_key are 180 de caractere: căile scurte sunt stocate ca înainte, cele lungi primesc o cheie article:SHA256; adresa completă rămâne în JSON, fără trunchiere. Nu modificați manual aliasurile administrate înainte de export/revizuire: editorul generic de redirecturi nu păstrează etichetele interne, iar pierderea lor blochează actualizarea automată în loc să suprascrie date necunoscute.

Un redirect manual nu este transformat automat într-un alias Article. Pentru un conflict rezolvați explicit în admin după verificarea destinației; nu ștergeți arbitrar înregistrări. Publicarea concurentă poate întâlni un deadlock sau conflict unic; tranzacția trebuie să eșueze fără publicare parțială, iar editorul poate reîncerca. Testul nou nu certifică încă scenarii concurente.

## Limite și livrare

Codul este pregătit fără a aștepta CI. Nu sunt declarate teste trecute. Testul pozitiv folosește CMS-ul intern și HTTP public, nu autentificarea și clickurile editorului. Verificați separat formularul cu pachet selectat, media reală, responsive, sesiuni și cache/proxy pe hosting. Testul nu activează indexarea și nu rulează seed editorial în producție.

Fără merge/deploy ori migrare. După folosire în staging, rollback-ul codului nu șterge aliasurile deja create: exportați înainte și planificați păstrarea URL-urilor. BR-07 rămâne cu validări de hosting, curățarea linkului generic vechi și verificări concurente; nu este declarat integral livrat.
