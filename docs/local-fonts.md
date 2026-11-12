# Fonturi locale: Bodoni Moda și Manrope

## Implementare

Fonturile originale și licențele OFL sunt păstrate în `src/assets/fonts`. Sursa exactă, hash-urile și verificarea diacriticelor sunt în `sources.json`. Modulul `src/lib/fonts.ts` folosește `next/font/local` și este importat de layout-urile RO și EN. Nu există descărcare de la Google Fonts în build-ul obișnuit pentru aceste fonturi.

Bodoni Moda: normal și italic, greutăți 400–500. Manrope: variabil, 200–800, normal. Variabilele `--font-serif` și `--font-sans`, precum și `display: swap`, sunt păstrate. Fișierele TTF integrale includ caracterele românești; nu sunt subsetate sau modificate. CSS-ul existent nu este rescris. Licențele fonturilor rămân OFL, separat de licența codului.

## Verificări

Importul inițial verifică hash-urile și maparea caracterelor ĂăÂâÎîȘșȚț în toate cele trei fonturi. Testele de integrare verifică aceiași octeți, licențele și folosirea modulului comun. Testele Playwright încarcă RO/EN la 360 și 1440 px, cer explicit greutățile/stilurile utilizate, verifică fonturile încărcate și lipsa solicitărilor către Google Fonts și salvează capturi de probe și homepage.

Rulați `npm run lint`, `npm run typecheck`, `npm run test:int`, `npm run build` și `npm run test:e2e` pe mediul de test. Build-ul și testele browser nu sunt considerate trecute până la confirmarea CI. Capturile sunt probe pentru revizuire, nu comparații automate cu un baseline vizual aprobat. Verificarea manuală urmărește ruperile de rând, greutățile 400/500, italic, butoanele și diacriticele, inclusiv cu încărcare lentă.

## Import și mentenanță

`vendor-local-fonts.yml` și scriptul aferent sunt instrumente de import, nu pași din build. Workflow-ul este limitat la branch-ul de remediere și la schimbările explicite ale scriptului/workflow-ului. Nu actualizați automat sursa `google/fonts`: orice schimbare cere revizie fixată, hash-uri noi și reverificarea fonturilor/licențelor.

După verificarea migrării, se poate elimina workflow-ul temporar printr-un commit separat. Nu rulați importerul în prebuild, pe hosting sau în browser.

Nu există în această migrare modificări de date CMS, prețuri, gate de indexare sau deploy.
