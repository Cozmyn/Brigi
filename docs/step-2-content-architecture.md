# Pasul 2 — arhitectura conținutului

## Lot 2A: fundația rutelor

Acest lot nu finalizează întregul pas 2. Extinde colecția existentă `pages` cu sluguri ierarhice controlate, fără să copieze conținut sau să creeze date comerciale fictive.

Namespace-uri acceptate:

- `ghiduri/slug` pentru ghiduri.
- `formate/slug` pentru formule muzicale reale.
- `parteneri/slug` pentru colaboratori confirmați.
- `evenimente-reale/slug` pentru cazuri documentate.

Helperul `src/lib/content-paths.ts` este sursa validării. URL-urile comerciale existente rămân valide. Slugurile noi nu conțin / inițial, parametri, fragmente sau mai mult de două segmente. Bazele namespace-urilor sunt rezervate pentru huburi; acest lot nu implementează încă huburile.

Ruta `[slug]/[entry]` delegă către aceeași implementare română care gestionează conținutul public, preview-ul, metadata, canonical, 404 și redirecturile. Nu introduce un catch-all pentru admin/API. Nu creează rute engleze noi. Sitemap-ul existent și linkurile related construiesc URL-ul din slug și pot reprezenta sluguri cu namespace; comportamentul efectiv trebuie verificat în build/e2e.

## Date și publicare

Nu există migrare SQL sau seed nou în acest lot. Modelul actual salvează slugul în aceeași colecție și păstrează relațiile `relatedPages`. Regulile existente de publicare și aprobare sunt păstrate. Nu publicați documente în namespace-urile noi în producție înainte de finalizarea șabloanelor și verificărilor pasului 2.

Nu publicați o ofertă de band, o colaborare ori un studiu de caz fără confirmarea businessului și drepturile asupra materialelor. Namespace-ul nu certifică disponibilitatea și nu înlocuiește verificarea umană.

## Restul pasului 2 — încă neimplementat

- Huburi navigabile pentru cele patru namespace-uri, fără arhive goale indexabile.
- Câmpuri editoriale pentru autor, surse, revizuire, acord de parteneriat și permisiuni media; actualizarea tipurilor și afișarea datelor relevante.
- Șabloane specifice și CTA corecte pentru ghiduri, formate, parteneri și cazuri; nu reutilizați automat pachetele artistei pentru un partener.
- Date structurate după tipul conținutului și breadcrumbs ierarhice; template-ul moștenit nu reprezintă implementarea finală.
- Teste de publicare, preview, sitemap, redirect și navigare pe MySQL/MariaDB.

## Verificare

Rulați lint, typecheck și `npm run test:int`, apoi build/e2e pe o bază de test. Testele adăugate validează sluguri și compatibilitatea cu paginile implicite; ele nu demonstrează încă randarea în browser.

Test manual pe staging: un document draft nu este accesibil public; un document publicat și aprobat are URL corect; o rută neacceptată răspunde 404; schimbarea slugului creează redirectul așteptat; sitemap și canonical folosesc aceeași adresă.

Modificările sunt pregătite static. Rezultatele CI nu sunt certificate de acest document. Fără merge/deploy implicit. Rollback: revert al commitului; dacă au fost create ulterior date cu sluguri noi, exportați-le și tratați-le separat înainte de retragerea rutelor.
