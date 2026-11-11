# Pasul 1 — corecții tehnice

## Schimbări

- `vocalistCopy` și `repairPublicText` sunt păstrate pentru compatibilitatea importurilor, dar returnează conținutul neschimbat. Nu mai rescriu instrumente, nume, citate sau texte CMS, nici în seed. O migrare istorică nu trebuie să ruleze implicit la citire ori la import.
- Analytics acceptă URL-uri cu mai multe segmente, precum `/en/booking` și `/ghiduri/program-nunta`, cu slash final opțional. Limita de 150 de caractere este păstrată în schema Zod.
- Sunt respinse segmentele `admin`, `api`, `next` la orice nivel, URL-urile externe, query strings, fragmentele, secvențele codificate și căile malformate. Aceasta este validare de formă, nu o listă completă a paginilor publicate; orice rută privată nouă trebuie exclusă explicit. Nu trimiteți date personale în sluguri.
- Testul vechi care cerea alterarea textului a fost înlocuit cu teste de conservare a conținutului.
- Sunt adăugate teste izolate pentru robots, sitemap și metadata cu gate-ul de producție activ/inactiv. CMS-ul este simulat; aceste teste nu validează hostingul sau conținutul real din baza de date.

## Indexare: comportament păstrat

`PRODUCTION_GATES_CLOSED=true` permite indexarea în implementarea existentă. Orice altă valoare păstrează blocarea robots, metadata noindex și sitemap gol. Acest commit NU setează variabile de hosting, NU activează indexarea, NU modifică prețuri sau date CMS și NU face deploy.

Înainte de activarea pe hosting, verificați separat `SITE_URL`, HTTPS, datele operatorului și regulile proiectului din `scripts/validate-production-config.mjs`. Nu schimbați gate-ul doar pentru a elimina noindex.

## Verificare în CI / dezvoltare

Pe Node.js și npm în versiunile cerute de package.json:

```sh
npm ci
npm run lint
npm run typecheck
npm run test:int
```

Pe un mediu de test configurat conform README, rulați și build-ul și testele e2e. Nu rulați aceste operații pe baza de producție. Modificările au fost pregătite prin inspecție statică; acest document nu certifică trecerea testelor. Verificați rezultatele CI înainte de merge.

## Verificare după un deploy aprobat separat

1. Inspectați `/robots.txt`, `/sitemap.xml` și HTML-ul paginilor comerciale; confirmați domeniul și canonical-urile.
2. Staging trebuie să rămână neindexabil. Robots nu reprezintă autentificare și nu protejează date confidențiale.
3. Cu acord analytics activ, verificați acceptarea evenimentelor pentru `/en/booking`; query strings și căile private trebuie respinse.
4. În preview, verificați că un text aprobat despre saxofon rămâne identic după citire și după seed pe o bază de test.
5. Textele deja alterate și persistate anterior nu se pot reconstitui automat. Pentru restaurare: export/backup, identificarea exactă a înregistrărilor, propunere before/after și aprobare separată.

## Rollback

Revert al commitului pe branch, revizuire și deploy separat. Nu există migrare de bază de date în acest pas. Atenție: revenirea la codul anterior reactivează transformarea automată a textelor.
