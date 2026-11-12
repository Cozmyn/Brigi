# BR-07d: preview Article privat

Ruta: /admin/preview/articles/ID?locale=ro sau locale=en. Înlocuiți ID cu identificatorul documentului salvat. Lipsa parametrului locale înseamnă ro; alte valori sau parametri ambigui sunt refuzați. În această etapă adresa se deschide direct după autentificare. Linkul generic de preview din editor nu este încă înlocuit și nu trebuie folosit pentru articole.

Citirea cere o sesiune validă, utilizator activ și canManage(user, articles). Folosește byID cu overrideAccess:false, draft:true și depth:0. Nu există token partajabil, acces anonim sau fallback de la EN la RO. Cererile neautorizate, ID-urile invalide și documentele inexistente nu afișează draftul. Permisiunea existentă permite editorilor activi administrarea articolelor; nu este introdus un rol nou.

Preview-ul afișează draftul deja salvat, nu modificările nesalvate. Nu publică, nu schimbă stări, nu salvează conținut și nu modifică snapshot-ul publicat. Nu încarcă relații sau imagini private și nu emite canonical, JSON-LD sau analytics. Folosește fonturile locale și un stylesheet izolat; nu certifică identitatea pixel-perfect cu pagina publică.

Ruta primește X-Robots-Tag noindex/nofollow/noarchive/nosnippet, Referrer-Policy no-referrer și Cache-Control private/no-store. Metadata este noindex. Autentificarea protejează datele; robots nu înlocuiește controlul de acces. Layout-ul admin rămâne lang=ro, iar documentul preview are lang=ro/en pe main.

Testele izolate verifică orchestrat accesul cu authenticate simulat și canManage real, refuzul înainte de citirea CMS, ID/locale și opțiunile exacte pentru draft. E2E verifică refuzul anonim și antetele. Nu certifică sesiuni reale, afișarea unui draft autentificat sau cache-ul de la proxy; acestea se verifică separat în mediul de test și pe hosting. CI nu este așteptat pentru continuarea dezvoltării, dar nu este declarat trecut fără rezultat.

Rămân: integrarea linkului dedicat în editor, redirecturile la schimbarea slugului, media/relațiile și un e2e complet publicare/draft/retragere. Fără seed, migrare, merge sau deploy. Rollback: revert al lotului; nu sunt modificate documentele sau tabelele.
