# Pasul 1 — stabilizare tehnică BRIGITTA

## Domeniu de aplicare

Acest PR derivă din `main` și reutilizează numai corecțiile BR-01/BR-03 și testele BR-02 din PR #6, evitând amestecarea cu funcționalitățile editoriale BR-07 aflate încă în draft.

### BR-01 — păstrarea integrală a textului aprobat

- `getSiteContent` și `cmsPage` nu mai rulează `repairPublicText` la citirea conținutului; titlurile, citatele, numele de instrumente, biografiile și descrierile rămân nemodificate.
- `scripts/seed-content.ts` nu mai traversează colecțiile/globalele pentru a rescrie text publicat. Comportamentul existent de creare a conținutului inițial rămâne separat.
- `vocalistCopy` și `repairPublicText` rămân temporar ca helper-e compatibile fără transformare semantică, astfel încât apelurile vechi nu pot reintroduce rescrierea.
- Datele modificate deja istoric NU sunt restaurate automat. Pentru remedierea lor, export/backup restaurabil, selectarea explicită a înregistrărilor, comparație before/after și aprobare individuală. Textul original nu poate fi dedus cu certitudine doar din cel alterat.

### BR-03 — analytics pentru rute publice ierarhice

- `analyticsSchema` acceptă `/`, rute simple, `/en/booking`, `/ghiduri/program-nunta`, viitoare rute `/instrumente/...` și un slash final opțional.
- Respinge schemă/host extern, query, fragment, segmente private `admin`, `api`, `next` oriunde în cale, caractere codificate, segmente goale sau malformate.
- Păstrează limita de 150 de caractere, consimțământul explicit și restricțiile pentru referrer/campaign. Validarea verifică forma unei rute, nu confirmă că ea este publicată. O nouă rută privată necesită actualizarea acestei liste.

### BR-02 — gate-ul de indexare

- Comportamentul existent este păstrat: doar `PRODUCTION_GATES_CLOSED=true` activează eligibilitatea pentru indexare; toate celelalte valori păstrează `robots` cu `Disallow: /`, metadata noindex și sitemap gol.
- Testele izolate verifică ambele stări, păstrarea excluderilor administrative și URL-ul de sitemap. Nu schimbăm variabile de hosting și nu activăm indexarea.
- Înainte de un deploy separat aprobat, verifică `SITE_URL` pe HTTPS, domeniul real, operatorul și contactul legal, accesul la DB, media și starea efectivă a `/robots.txt`, `/sitemap.xml` și a paginilor pe staging/producție.

## Verificări automate

Pe Node.js 24 și npm 11, într-un mediu de test izolat (nu pe DB de producție):

```sh
npm ci
npm run lint
npm run typecheck
npm run test:int
npm run db:migrate
npm run test:import
npm run test:db
npm run seed:content
npm run seed:content
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

CI rulează pe MySQL 8.0 și MariaDB 10.11. Verificarea verde a CI nu înlocuiește testele live, măsurătorile Core Web Vitals sau verificarea datelor CMS reale.

## Excluderi intenționate și rollback

- Nu există migrații noi, modificări ale bazei live, emailuri automate, modificări de prețuri, conținut generat sau deployment.
- Conținutul, URL resolver-ul, schema și modelele de articol din PR #6 rămân pentru Pasul 3 și NU sunt incluse aici.
- PR-ul este draft până la revizie. Merge și deployment numai după aprobarea explicită a proprietarului.
- Rollback cod: revert al commitului acestui PR după verificarea impactului. Reveniți cu atenție: codul vechi din `main` **reactivează** transformările distructive de text și seed. Evitați redeploy-ul acelei versiuni fără o corecție echivalentă.
