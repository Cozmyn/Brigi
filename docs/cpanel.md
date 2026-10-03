# Instalare Brigi pe cPanel

Aplicația folosește Next.js 16, Node.js 24, npm 11, Knex și driverul mysql2. Nu folosește Payload, PostgreSQL, Docker, PM2 sau servicii externe de baze de date.

## 1. Pregătire în cPanel

1. În **MySQL Databases**, creează o bază și un utilizator, apoi atribuie utilizatorului toate privilegiile **numai pe această bază**. Numele complete includ de obicei prefixul contului, de exemplu `tavroro_brigi`. phpMyAdmin este interfața de administrare, nu un tip separat de bază.
2. Verifică versiunea serverului: `SELECT VERSION();` în phpMyAdmin. Ținta este MySQL 8.0+ sau MariaDB 10.11+. Nu folosi MySQL 5.7 ori versiuni ieșite din suport.
3. În **Setup Node.js App** creează aplicația cu Node 24, Production, Application root `brigi-app`, URL-ul domeniului ales și Startup file **`app.cjs`**.
4. Activează HTTPS. Directorul aplicației `/home/tavroro/brigi-app` și cel cu media nu trebuie expuse ca directoare statice Apache. Nu folosi întregul repository ca `public_html`.
5. Pentru comenzile următoare, folosește terminalul cPanel și comanda **Enter to the virtual environment** afișată de Setup Node.js App. Pe configurația indicată, aceasta arată de obicei astfel; folosește exact calea afișată de furnizor dacă diferă:

```bash
source /home/tavroro/nodevenv/brigi-app/24/bin/activate
cd /home/tavroro/brigi-app
node --version
npm --version
```

Codul trebuie să fie deja clonat în `/home/tavroro/brigi-app`, din repository-ul privat prin Git Version Control sau prin accesul Git configurat în cont. Nu pune token-uri în URL-ul remote ori în comenzi partajate.

## 2. Configurare privată

Variabilele se pot seta în Setup Node.js App sau în fișierul `.env` local, care este ignorat de Git. Pentru scripturile din terminal trebuie să fie disponibile aceleași valori. Nu trimite parolele în chat.

```bash
cd /home/tavroro/brigi-app
cp -n .env.example .env
chmod 600 .env
mkdir -p /home/tavroro/brigi-data/media
chmod 750 /home/tavroro/brigi-data /home/tavroro/brigi-data/media
```

Completează `.env` în editorul cPanel:

| Variabilă | Valoare |
| --- | --- |
| `NODE_ENV` | `production` |
| `DB_HOST` | Gazda MySQL indicată de furnizor; frecvent `127.0.0.1` sau `localhost` |
| `DB_PORT` | `3306`, dacă furnizorul nu indică alt port |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Datele private create în cPanel |
| `DB_POOL_MAX` | `3`, potrivit unui site cu trafic moderat pe shared hosting |
| `SITE_URL` | Domeniul real cu HTTPS, fără slash final |
| `NEXT_PUBLIC_SERVER_URL` | Același domeniu |
| `MEDIA_DIR` | `/home/tavroro/brigi-data/media` |
| `PRODUCTION_GATES_CLOSED` | `false` pentru verificări, `true` înainte de lansare/indexare |
| `PRIVACY_OPERATOR`, `PRIVACY_CONTACT` | Operatorul și contactul real pentru date personale |
| `INQUIRY_RETENTION_DAYS` | Perioada de păstrare aleasă, între 30 și 3650 zile |

Nu schimba `PORT` pentru Passenger: Passenger interceptează apelul `listen()` și alocă socketul. Portul este folosit doar când rulezi manual aplicația.

## 3. Instalare și bază nouă

```bash
cd /home/tavroro/brigi-app
npm run install:cpanel
npm run db:migrate
npm run db:status
npm run seed:content
npm run admin:create
npm run build
mkdir -p tmp
touch tmp/restart.txt
```

`install:cpanel` folosește `npm ci --include=dev` în instalații normale și `npm install --include=dev` când CloudLinux a creat un symlink `node_modules`, pentru a nu-l șterge. Păstrează lockfile-ul livrat. Dependențele de dezvoltare sunt necesare build-ului și scripturilor TypeScript.

`admin:create` cere utilizatorul și parola în terminal, cu parola ascunsă. Nu există înregistrare publică a primului administrator și nici parolă implicită. Apoi intră la **`https://DOMENIUL-TAU/admin`**. Pentru recuperare: `npm run admin:reset`.

Seed-ul este repetabil: adaugă conținutul inițial fără să înlocuiască paginile și pachetele deja existente. Ajustează prețurile, contactul, fotografiile și textele legale în admin înainte de lansare.

Apasă și **Restart** în Setup Node.js App dacă furnizorul nu urmărește `tmp/restart.txt`. Pornirea manuală pentru diagnostic este:

```bash
npm run start
```

Aceasta folosește același `app.cjs`. În producție, Passenger ține aplicația pornită; nu lăsa un al doilea proces manual pe același port.

## 4. Transferul conținutului din vechiul Payload

Această secțiune este necesară numai dacă ai editări sau solicitări în baza veche. **Importul se face înainte de seed, într-o bază nouă goală**, păstrând vechiul site și backupul până la verificare.

Exportul necesită vechea aplicație încă funcțională, accesibilă prin HTTPS și un cont owner. Scriptul este independent de pachetele Payload și nu citește schema bazei:

```bash
node scripts/export-legacy.mjs https://ADRESA-VECHIULUI-SITE /home/tavroro/brigi-private-export
npm run content:import -- /home/tavroro/brigi-private-export/content.json --dry-run
npm run content:import -- /home/tavroro/brigi-private-export/content.json
npm run seed:content
npm run admin:create
npm run build
touch tmp/restart.txt
```

Exportul conține conținut editorial, setări, media și solicitări. Poate conține date personale: rămâne în afara Git și `public_html`. Parolele, sesiunile și structura completă a bazei nu sunt exportate. Utilizatorii se recreează în noul admin; parolele trebuie setate din nou. Istoricul complet de versiuni Payload nu este transferat; se păstrează documentele curente și varianta publicată, apoi noul CMS păstrează până la 30 de versiuni.

`--dry-run` verifică datele, referințele și imaginile. Importul efectiv remapează ID-urile și relațiile într-o tranzacție; o eroare anulează scrierile în baza nouă. Refuză importul peste conținut existent. Tipurile rich-text necunoscute și legăturile interne Lexical neconvertite produc o eroare explicită, fără pierdere silențioasă de text. Imaginile externe trebuie aduse și verificate local. Nu șterge vechea bază înainte de comparația finală.

După import verifică numărul de pagini, pachete, media și solicitări, ambele limbi, imaginile asociate și o cerere de contact. Migrarea reală de producție nu poate fi confirmată fără acces la exportul tău.

## 5. Actualizări ulterioare

Înainte de update, descarcă un backup al bazei din phpMyAdmin și arhivează `/home/tavroro/brigi-data/media` și configurația privată într-un loc protejat. Înregistrează commit-ul curent cu `git rev-parse HEAD`.

Pentru un update simplu pe shared hosting, oprește aplicația din Setup Node.js App pe durata instalării/build-ului:

```bash
source /home/tavroro/nodevenv/brigi-app/24/bin/activate
cd /home/tavroro/brigi-app
git pull --ff-only
npm run install:cpanel
npm run db:migrate
npm run build
mkdir -p tmp
touch tmp/restart.txt
```

Pornește/repornește aplicația din cPanel. Nu rula importul la update și nu ai nevoie să rulezi seed la fiecare update. Fotografiile și `.env` rămân pe hosting. Dacă build-ul eșuează, nu considera update-ul finalizat; păstrează aplicația oprită până la remediere sau restaurează împreună codul compatibil și backupul. Migrațiile nu oferă rollback destructiv automat.

## 6. Verificare și întreținere

```bash
npm run lint
npm run typecheck
npm run test:int
npm run db:status
```

Testele `test:db` și `test:e2e` se rulează **numai pe o bază dedicată de test**, deoarece creează și modifică date de test. `test:import` necesită o bază goală cu numele terminat în `_test`; verifică relațiile, RO/EN, ciornele, data solicitărilor și rollbackul, apoi elimină fixture-urile. CI conține verificări pentru MariaDB 10.11 și MySQL 8.0; Docker este utilizat doar în CI, nu pe hosting.

Înainte de indexare setează `PRODUCTION_GATES_CLOSED=true`, completează toate variabilele obligatorii și reconstruiește. Verifică `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/admin`, o pagină inexistentă și trimiterea formularului. Înregistrează domeniul în Search Console/Bing separat.

Solicitările se salvează în admin. Notificarea automată prin email nu era configurată și nu este adăugată de această migrare. Statisticile funcționează numai după acordul vizitatorului. Sesiunile și rate-limiturile expirate sunt curățate; poți rula periodic:

```bash
npm run maintenance
```

Aceasta raportează cererile închise/arhivate/spam eligibile. Numai `npm run maintenance -- --apply` le șterge conform perioadei configurate. Cererile active nu sunt șterse de acest script. Un cron cPanel trebuie să folosească mediul Node al aplicației.

## Limite ale hostingului

Rularea efectivă cu Passenger, memoria permisă pentru `next build`, librăriile native pentru `sharp`, spațiul pe disc și setările Apache trebuie verificate pe contul tău. Dacă build-ul depășește memoria planului, construiește pe un Linux compatibil și transferă artefactul sau cere mai multă memorie; nu dezactiva verificările TypeScript. Fonturile existente sunt descărcate la build și servite local ulterior.
