# BR-07c: citire publică și rute pentru ghiduri

## Implementare propusă

Huburi /ghiduri și /en/ghiduri, articole /ghiduri/slug și /en/ghiduri/slug. Rutele dedicate au prioritate față de catch-all-ul EN și nu schimbă codul paginilor comerciale. Înainte de deploy inventariați CMS-ul: un vechi Page cu slug ghiduri trebuie rezolvat explicit, nu suprascris fără aprobare. Navigația homepage existentă nu este modificată în acest lot.

Cititorul dedicat public-articles folosește tabelele existente și numai l.published_data, cu filtrare SQL după locale, colecție și starea publicată/aprobată/vizibilă. Revalidează snapshot-ul și slugul cu schema Articles și resolverul comun. Nu citește l.data, nu folosește overrideAccess=true și nu modifică politica ContentStore, care rămâne implicit închisă pentru articles. O schimbare de slug în draft nu mută articolul publicat.

Lipsa DB în preview produce listă goală; lipsa configurației cu gate-ul de producție activ sau o eroare SQL produce eroare, nu articole fabricate. Lista citește toate snapshot-urile aprobate în MVP; paginarea și bugetul de performanță se stabilesc înainte de volume mari. Nu rulați teste pe baza de producție.

## Publicare și SEO

Articolele nepublicabile răspund 404. Huburile goale sunt noindex și nu intră în sitemap. Articolele noindex rămân accesibile, dar sunt excluse din sitemap. Canonical-ul articolelor este normalizat la URL absolut intern; numai canonical-ul propriu, fără query/fragment, este eligibil pentru indexare cu gate activ. Paginile comerciale păstrează filtrarea anterioară; remedierea lor generală BR-08 rămâne separată.

Schema este Article și BreadcrumbList, fără Service sau oferte adăugate automat. Autorul, datele, sursele și secțiunile din schemă provin din snapshot-ul afișat. Nu sunt generate autori, recenzii, imagini sau afirmații de performanță. Imaginile din secțiuni/SEO și relațiile editoriale nu sunt încă randate; trebuie integrate cu filtrarea media/referințelor aprobate. Nu există hreflang pentru traduceri presupuse.

## Limite rămase

Preview-ul Article autentificat, linkul de preview din admin, redirecturile la schimbarea slugului publicat, relațiile, imaginile și integrarea navigației generale urmează separat. Nu folosiți încă preview-ul generic din admin pentru articole. BR-07 nu este declarat complet. Nu se adaugă conținut seed, migrare SQL, configurare hosting, merge sau deploy.

## Verificări

Teste izolate pentru snapshot valid/invalid, acces exclusiv published_data, slug publicat, locale, canonical și gate. Testele de indexare simulează lista de articole pentru a nu accesa DB. E2E verifică huburile RO/EN, canonical, viewport mobil și 404 pentru un slug inexistent. Nu există încă un e2e pozitiv de publicare/retragere cu articol real în DB; este obligatoriu înainte de livrare, împreună cu inspectarea HTML/metadatelor și capturilor.

Dezvoltarea acestui lot nu așteaptă CI, dar rezultatele lint/typecheck/test:int/build/e2e trebuie verificate separat. Documentul nu certifică trecerea lor. Rollback: revert al lotului, fără ștergerea articolelor sau a tabelelor.
