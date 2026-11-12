# Pasul 3 — CMS editorial, SEO și RO/EN

Acest PR: BR-07, BR-08, BR-10 și fundația structurală BR-12. Este stacked peste PR #8, care depinde de PR #7. Codul editorial este reutilizat selectiv din PR #6; PR #6 nu se integrează ca atare.

## Implementare
- Articole/ghiduri: CMS cu draft/published snapshots, titlu și slug localizat, autor, recenzor, surse HTTPS, contribuție originală, secțiuni, imagini aprobate, relații, date reale pentru publicare/revizie, SEO și preview privat per limbă.
- Rute: /ghiduri și /en/ghiduri, fiecare cu detalii pe /[slug]. Formate muzicale, parteneri și studii de caz au hub și pagină individuală în RO și EN.
- Articolele sunt publice numai pentru snapshoturi published, visible=true, approvedForPublication=true și editorialStatus=approved. Previewul necesită sesiune și drepturi și are noindex, no-store, no-referrer.
- Schimbarea slugului unui articol publicat creează un alias 308 atomic, fără lanț; aliasul nu funcționează după retragerea publicării. Conflictele de URL blochează publicarea pentru revizie manuală.
- Colecțiile de formate, parteneri și studii de caz cer verificare editorială. Partenerii/case studies cer acord explicit; case studies cer dovadă validată. Nu se adaugă profiluri inventate sau prețuri neconfirmate.
- SEO Article + BreadcrumbList pentru articole și WebPage + BreadcrumbList pentru entități. Titluri, canonical, OG/Twitter și imagini doar din datele aprobate.
- Canonical intern absolut și relativ echivalente; canonical extern/nepotrivit sau noindex este exclus din sitemap și din hreflang.
- Hreflang ro-RO și en-GB apare pentru același ID CMS publicat și aprobat în ambele limbi, cu canonical propriu și fără noindex. Huburile necesită minimum un document comun tradus. Homepage/booking sunt perechi statice cunoscute, dacă sunt indexabile.
- Navigația editorială apare doar dacă există conținut aprobat; sitemapul elimină URL-urile duplicate și nu activează singur indexarea.

## Flux de publicare
1. Creează articolul în Admin > Ghiduri & articole. Introdu autor real, surse verificabile și contribuție originală.
2. Salvează draftul, verifică previewul privat și toate drepturile pentru imagini și citate. Aprobă editorial și publică snapshotul RO doar când e complet.
3. Scrie și aprobă separat traducerea EN pentru același ID. Nu se publică traduceri automate sau hreflang fără conținut real.
4. Pentru parteneri și studii de caz păstrează acordul pentru publicare; elimină detaliile private ale evenimentelor.
5. În staging (după aprobarea unui deployment separat) verifică 404 pentru drafturi, 308 pentru slug vechi, canonical, hreflang, sitemap și gate-ul robots.

## Verificări
CI pe Node 24, MySQL 8.0 și MariaDB 10.11: lint, TypeScript, integrare, migrații, DB/outbox, seed repetat, build și E2E. Nu sunt necesare migrații de schemă pentru colecțiile editorial CMS, fiind stocate în infrastructura CMS existentă. Migrația notificărilor Pasului 2 rămâne prezentă și intactă.

## Limite
- Nu se publică automat articole sau parteneri. Pentru conținut real sunt necesare materiale, verificări și acorduri. Huburile fără documente aprobate rămân neindexabile.
- Rutele și schema VideoObject sunt planificate împreună cu media autentică în Pasul 4; nu pretindem existența unor materiale video încă nevalidate.
- Redirecționările automate pentru slug istoric sunt implementate la articole; alte entități nu primesc aliasuri automate în acest PR.
- Niciun merge, deployment, modificare în baza de date de producție, activare a indexării sau schimbare de prețuri fără aprobare explicită.
