# Deploy Brigi pe cPanel — build exclusiv în GitHub Actions

Hosting: Node 24 / npm 11, Passenger, MySQL 8.0.46. CloudLinux limitează firele/procesele native, astfel că **nu se execută `next build` sau `npm run build` pe hosting**. Nici la primul deploy, nici la update.

## Directoarele rămân separate

| Rol | Cale |
| --- | --- |
| Checkout și launcher Passenger | `/home/tavroro/brigi-app` |
| Versiuni compilate, private | `/home/tavroro/brigi-app/.deploy/releases/` |
| Versiune activă | `/home/tavroro/brigi-app/.deploy/current` (symlink) |
| Fotografii persistente | `/home/tavroro/brigi-data/media` |
| Document root Apache | `/home/tavroro/public_html/brigi.ro` |

În Setup Node.js App: Node 24, Production, Application root `brigi-app`, URL `https://brigi.ro`, startup file **`app.cjs`**. Passenger trebuie să ruteze domeniul către aplicație. Nu copia repository-ul, `.env`, arhivele sau `.deploy` în `public_html`. Configurația Apache/Passenger este administrată de cPanel, nu de acest script.

## 1. Construirea artefactului

Workflow: **Actions → cPanel production artifact**. Rulează automat la push în `main` sau manual cu Run workflow, selectând `main`.

1. Ubuntu 22.04, Node 24, `npm ci` cu lockfile.
2. Lint, typecheck, teste și build cu `SITE_URL` / `NEXT_PUBLIC_SERVER_URL=https://brigi.ro`.
3. Build fără acces la baza de producție și fără credențiale. Paginile CMS, sitemap, robots și llms sunt dinamice: citesc baza și setările reale la runtime, nu sunt înghețate cu date CI.
4. MySQL 8 temporar este migrat și populat numai pentru teste, după build.
5. Pachetul este extras într-un director izolat; acolo se instalează numai dependențele de producție și se pornește efectiv `node app.cjs`. Sunt verificate CMS-ul, loginul, formularele, imaginile, RO/EN, fișierele statice, SEO și 404.
6. Numai după succes se publică artefactul **`brigi-cpanel-build-COMMIT`**, păstrat 30 zile. Poți reexecuta workflow-ul pentru a produce altă copie.

Descarcă artefactul din interfața GitHub autentificată. ZIP-ul GitHub conține:

- `brigi-cpanel-build.tar.gz`
- `brigi-cpanel-build.tar.gz.sha256`

Extrage ZIP-ul și încarcă ambele fișiere împreună într-un director privat, de exemplu `/home/tavroro/brigi-artifacts/`. Nu extrage manual tar-ul peste repository. Nu pune token-uri GitHub în comenzi, `.env.example` sau remote-uri Git.

## 2. Configurația privată

Păstrează `.env` deja existent. Scriptul nu îl copiază, nu îl înlocuiește și nu îl execută ca shell. Variabilele din mediul cPanel au prioritate. La comenzile din terminal trebuie să fie disponibile aceleași valori; `.env` este încărcat explicit din rădăcina aplicației.

```dotenv
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_POOL_MAX=3
SITE_URL=https://brigi.ro
NEXT_PUBLIC_SERVER_URL=https://brigi.ro
MEDIA_DIR=/home/tavroro/brigi-data/media
DEFAULT_LOCALE=ro
SUPPORTED_LOCALES=ro,en
INQUIRY_RATE_LIMIT_PER_HOUR=5
INQUIRY_RETENTION_DAYS=
PRIVACY_OPERATOR=
PRIVACY_CONTACT=
PRODUCTION_GATES_CLOSED=false
```

Completează valorile private numai pe server. `false` ține indexarea oprită; după completarea datelor reale și verificarea site-ului setează `true` și repornește Passenger. Aceste setări sunt citite la runtime. Domeniul `NEXT_PUBLIC_SERVER_URL` este și o valoare de build: pentru schimbarea domeniului modifică workflow-ul și generează un artefact nou.

## 3. Prima instalare a versiunii precompilate și update-uri

Baza, seed-ul și administratorul existente se păstrează. **Nu relua seed-ul și nu importa peste baza populată.** Fă backupul obișnuit înaintea migrărilor.

Pe server există un test local `cpus: 1`. Verifică `git diff -- next.config.mjs`. Dacă SINGURA schimbare este testul `cpus: 2` → `cpus: 1`, îl poți elimina cu `git restore -- next.config.mjs`. Nu folosi reset/clean pentru alte modificări. Workflow-ul păstrează valoarea originală `cpus: 2`; nu depinde de limitări de thread pe hosting.

Activează mediul exact afișat de Setup Node.js App (calea uzuală este cea de mai jos), apoi:

```bash
source /home/tavroro/nodevenv/brigi-app/24/bin/activate
cd /home/tavroro/brigi-app
git switch main
git pull --ff-only
git rev-parse HEAD
bash scripts/deploy-cpanel.sh /home/tavroro/brigi-artifacts/brigi-cpanel-build.tar.gz
```

Artefactul trebuie să corespundă exact commit-ului afișat. Dacă `main` a avansat între download și pull, descarcă build-ul nou. Pentru primul transfer la acest mecanism, oprește aplicația din cPanel pe durata operației, apoi pornește-o. La update-uri ulterioare, versiunea veche rămâne disponibilă până la activare; migrările viitoare trebuie să rămână compatibile cu versiunea veche în acest interval, altfel folosește o fereastră de mentenanță.

Scriptul:

- verifică versiunea Node, checkout-ul curat, SHA256 și commit-ul;
- respinge traversal, symlink-uri în arhivă, `.env`, media și fișiere neașteptate;
- extrage într-un director nou, fără suprascrierea versiunii active;
- execută `npm ci --omit=dev --include=optional --ignore-scripts` în acel director; nu modifică symlink-ul CloudLinux `node_modules` de la rădăcină;
- verifică Next, Knex, mysql2, procesarea WebP cu Sharp și conexiunea MySQL;
- rulează migrațiile din versiunea nouă cu configurația privată existentă;
- schimbă atomic `.deploy/current`, păstrează `.deploy/previous` și toate versiunile vechi;
- execută `touch tmp/restart.txt`.

Nu există comenzi de build sau ștergere a media/bazei/secretelor. Dacă o verificare sau migrare eșuează, versiunea activă rămâne neschimbată. DDL MySQL nu are rollback tranzacțional complet: o migrare întreruptă poate necesita reluare/remediere chiar dacă aplicația nu a fost activată.

Apasă și Restart în cPanel dacă furnizorul nu urmărește `tmp/restart.txt`. Verifică **https://brigi.ro**, **https://brigi.ro/admin**, autentificarea, un formular și încărcarea unei fotografii. Verifică existența fotografiei în directorul persistent și după un nou restart. Testele GitHub nu înlocuiesc acest control pe Passenger-ul furnizorului.

## 4. Conținutul exact al pachetului

Pachetul conține `.next/` complet (inclusiv server, static, fonturi și manifestele runtime), fără cache-ul de compilare; fișierele publice urmărite de Git; `app.cjs`, `server.cjs`, `next.config.mjs`, package/lockfile, `.npmrc`, Knex config, migrările MySQL și preflight-ul runtime. Nu conține `node_modules`, sursele TS/TSX, `.env`, baza CI, upload-uri ori dump-uri.

Nu folosim `output: standalone`: [Next.js precizează că serverele personalizate nu sunt trasate de standalone](https://nextjs.org/docs/app/guides/custom-server). Păstrăm API-ul documentat `next({dir})` și [primul apel listen interceptat de Passenger](https://www.phusionpassenger.com/docs/advanced_guides/in_depth/node/reverse_port_binding.html), fără API-uri interne Next. Nici doar `.next`, nici serverul generat standalone nu ar înlocui automat întregul runtime actual.

## 5. Dependențe native

| Dependență | Unde este folosită |
| --- | --- |
| SWC, Tailwind Oxide/Rayon, Lightning CSS | Compilare în GitHub; nu sunt invocate de procedura de deploy |
| esbuild / tsx | Unelte de dezvoltare și unele CLI TS; nu sunt necesare pornirii pachetului |
| Sharp / libvips | Runtime: upload-uri și optimizarea imaginilor |
| mysql2 / Knex | Runtime JavaScript și migrații |

Eroarea Rayon nu identifică singură modulul care a eșuat. Nu mai încercăm compilarea nativă pe CloudLinux. Nu transferăm binare din Ubuntu pe hosting: npm instalează pachetele opționale precompilate potrivite platformei țintă. Scripturile npm sunt dezactivate pentru a evita fallback-uri de compilare. Preflight-ul oprește deploy-ul dacă Sharp nu funcționează. Vezi [cerințele Sharp](https://sharp.pixelplumbing.com/install/) pentru glibc/CPU; providerul trebuie să le îndeplinească. Pentru x64, Sharp cere glibc >=2.26 și CPU cu SSE4.2. Memoria/firele necesare funcționării Node și procesării imaginilor rămân necesare, chiar fără build.

## 6. Diagnostic și revenire

Pornire manuală, numai când Passenger este oprit: `node app.cjs`. Pentru starea bazei, fără dependențe de dezvoltare:

```bash
cd /home/tavroro/brigi-app/.deploy/current
DOTENV_CONFIG_PATH=/home/tavroro/brigi-app/.env node node_modules/knex/bin/cli.js --knexfile knexfile.mjs migrate:list
```

Pentru revenire, inspectează `readlink .deploy/previous`. Dacă schema este compatibilă, cu Passenger oprit:

```bash
cd /home/tavroro/brigi-app
ln -s "$(readlink .deploy/previous)" .deploy/rollback-link
mv -Tf .deploy/rollback-link .deploy/current
touch tmp/restart.txt
```

Repornește Passenger. Acest lucru schimbă codul activ; nu inversează migrațiile și nu restaurează baza. Pentru schimbări incompatibile restaurează backupul compatibil separat. Versiunile vechi nu se șterg automat; curăță-le numai după validare, fără a atinge current/previous sau media.

CLI-urile TypeScript de administrare/seed/import rămân în repository pentru mentenanță, nu în runtime-ul minimal. Dacă devin necesare, instalează separat uneltele cu `npm run install:cpanel`; aceasta nu compilează website-ul. Nu reinstala și nu reseta administratorul existent la fiecare deploy.
