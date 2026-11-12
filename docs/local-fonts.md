# Fonturi locale RO / EN

Bodoni Moda normal/italic și Manrope sunt livrate din `src/assets/fonts`, împreună cu licențele OFL originale și manifestul sursei. Fișierele au fost importate din google/fonts la commitul c30b221beb0c1da59d563feb91ec8656a1fa972a, verificate prin Git blob SHA și SHA-256. Importul verifică și prezența caracterelor ĂăÂâÎîȘșȚț în tabelele cmap ale tuturor celor trei fonturi.

`src/lib/fonts.ts` folosește exclusiv `next/font/local`. Ambele layout-uri publice importă acest modul. Variabilele `--font-serif` și `--font-sans`, display swap și CSS-ul aplicației sunt păstrate. Bodoni Moda are greutăți 400–500, normal și italic; Manrope păstrează intervalul variabil 200–800, normal. Fișierele upstream sunt nemodificate, fără subset sau conversie.

## Build fără Google Fonts

Build-ul obișnuit folosește fișierele din repository. Nu execută `scripts/vendor-local-fonts.mjs`, nu depinde de un răspuns Google Fonts și nu descarcă fonturi la npm install. Workflow-ul de import este separat, limitat la branch-ul de lucru și declanșat numai la modificarea scriptului ori a propriului workflow. Acesta nu trebuie activat ca pas de prebuild.

## Verificări

- `npm run lint`, `npm run typecheck`, `npm run test:int`, `npm run build`, `npm run test:e2e`, pe un mediu de test configurat conform README.
- Testele de integrare verifică integritatea fișierelor/licențelor, manifestul și utilizarea modulului comun în layout-uri.
- Testele Playwright deschid / și /en la 390 și 1440 px, blochează Google Fonts, verifică încărcarea fețelor locale pentru greutăți/stiluri și atașează capturi cu diacritice și homepage.
- Capturile sunt dovezi pentru inspecție, nu un test de regresie pixel-perfect: nu există încă baseline-uri aprobate. Verificarea existenței glifelor nu certifică singură aspectul lor vizual.

Nu declarați succesul build-ului, al e2e ori al revizuirii vizuale înainte de verificarea rezultatelor CI și a capturilor. Nu există deploy sau modificare a datelor prin această migrare. La rollback, revenirea la next/font/google reactivează dependența de descărcarea externă la build.
