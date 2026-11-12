# Pasul 5 — instrumente, continuitate și pregătirea lansării

## Domeniu și aprobări

Acest PR implementează BR-11, continuă fundația BR-12 și adaugă BR-13. Este **stacked peste PR #10**, care depinde de #9, #8 și #7. Până la aprobări distincte, **nu integrați PR-urile, nu faceți deploy, nu rulați migrări/restaurări pe producție și nu setați PRODUCTION_GATES_CLOSED=true**.

## Instrumente publice RO și EN

| RO | EN | Funcție |
| --- | --- | --- |
| /instrumente | /en/instrumente | Hub, trei instrumente autentice |
| /instrumente/planner | /en/instrumente/planner | Cronologie, bifare, note, descărcare PDF |
| /instrumente/comparator | /en/instrumente/comparator | Compară doar formate publicate și pachete reverificate |
| /instrumente/estimator | /en/instrumente/estimator | Sume personale + opțional preț comercial confirmat |

- Plannerul funcționează fără cont și fără request API pentru notițe. Nimic nu se salvează automat. Butonul de salvare locală folosește `localStorage`, cel de ștergere elimină planul de pe dispozitiv, iar încărcarea este explicită. Nu se garantează sincronizare între dispozitive.
- PDF-ul A4 se generează complet offline în browser ca imagini JPEG încapsulate într-un PDF multi-pagină. Fonturile locale redau diacriticele; documentul este **rasterizat**, nu text selectabil / PDF-UA. Nu include date din CMS neverificate, nu trimite către server, nu creează rezervări.
- Comparatorul preia exclusiv `getPublicEntities('musical-formats', locale)` și pachetele din `getSiteContent(locale)`. Formatul poate avea prețul «nepublicat»; niciun partener, tarif sau serviciu nu este inferat automat.
- Estimatorul acceptă doar pachetele care trec `published`, `visible`, `priceApproved` și `commerciallyVerified` în CMS și sumele introduse de vizitator. Fără curs valutar, formule pe invitați sau costuri presupuse. «De la» înseamnă doar pragul comunicat, nu ofertă finală. Totalul fără pachet este doar suma personală.
- Pentru instrumente se emit doar evenimente anonime `planner_exported`, `format_compared`, `budget_calculated`, cu consimțământul explicit pentru statistici; nu sunt trimise numele, notele, orașul sau bugetele introduse.

## Verificări automate și monitorizare read-only

În CI: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:int`, `npm run test:ops`, migrații MySQL/MariaDB, import legacy, teste DB/outbox, seed repetat, build și Playwright. Testele includ fișierul PDF descărcat, diacritice în UI, confidențialitate localStorage, viewport mobil, index gate, politica de prețuri, backup criptat și restaurare permisă doar în staging.

Endpoint nou `/api/health`: verifică `SELECT 1` în baza configurată. Răspunde numai `{status:'ok'}` HTTP 200 ori `{status:'unavailable'}` HTTP 503, cu `Cache-Control: no-store`. Nu expune credentiale, date CRM sau tabele.

Monitorul read-only rulează patru verificări fără autentificare sau schimbarea setărilor: `/api/health`, homepage, `/robots.txt` și `/sitemap.xml`. Compară rezultatul real cu flagul **explicit** `MONITOR_EXPECT_INDEXABLE`; un rezultat degradat produce exit code 1 (util pentru emailul de eroare al cronului). Redirecturile HTTP sunt refuzate.

Exemplu în staging (numai după aprobarea deploymentului în staging):

```sh
MONITOR_SITE_URL=https://staging.exemplu.tld MONITOR_EXPECT_INDEXABLE=false npm run ops:monitor
```

În producție, după aprobare de indexare, setați `MONITOR_EXPECT_INDEXABLE=true`. Pentru cron cPanel folosiți fișier de environment privat și email la exit code nenul; frecvența este o decizie operațională (de exemplu 5 minute). Nu salvați parole sau tokenuri în repository sau loguri.

## Backup criptat și verificare, numai la execuție aprobată

Cerințe: Node 24, `mysqldump`, `tar`, acces read-only / backup la MySQL, suficiente drepturi de citire la `MEDIA_DIR`, `BACKUP_DIR` absolut **în afara aplicației/public_html** cu permisiuni 0700 și `BACKUP_ENCRYPTION_KEY` păstrată separat de server și de arhive (minim 24 caractere, ideal secret aleator lung). DB_HOST/PORT/NAME/USER/PASSWORD se iau din environment privat, nu din argumente de proces.

```sh
BACKUP_DIR=/home/ACCOUNT/private/brigi-backups BACKUP_ENCRYPTION_KEY='SECRET_PASTRAT_SEPARAT' npm run ops:backup
BACKUP_DIR=/home/ACCOUNT/private/brigi-backups BACKUP_FILE='brigitta-...-db.sql.gz.enc' BACKUP_ENCRYPTION_KEY='SECRET_PASTRAT_SEPARAT' npm run ops:backup:verify
```

Scriptul `ops:backup` produce un dump SQL cu consistență de tranzacție (`mysqldump --single-transaction`), opțional o arhivă tar pentru media, le comprimă, criptează **AES-256-GCM** cu salt/IV aleatoare și scrie un manifest. Niciun fișier SQL/tar în clar nu este scris pe disc. Fișierele sunt create cu 0600, iar arhiva finală este verificată prin decriptare + autentificare GCM + gzip; procedura nu șterge automat copii vechi.

**Important:** faceți o copie a arhivelor **criptate** într-un spațiu offsite separat, cu retenție și drepturi verificate; asigurați disponibilitatea cheii de decriptare pentru persoanele autorizate și revizuiți politica de retenție conform informării GDPR. Testul de unitate criptografic nu înlocuiește un test de restaurare real.

## Restaurare controlată exclusiv într-o bază nouă, goală, în staging

1. Creați manual în staging o bază de date complet nouă, goală, cu numele `brigitta_restore_...` și credențiale separate. Verificați că există **zero tabele**; instrumentul refuză orice DB deja populată.
2. Selectați un dump `.sql.gz.enc` a cărui autentificare a fost validată. Nu restaurați backupul într-o bază live și nu utilizați credențiale de producție pentru test.
3. Configurați explicit `RESTORE_ENVIRONMENT=staging`, `RESTORE_DB_HOST`, `RESTORE_DB_PORT`, `RESTORE_DB_NAME`, `RESTORE_DB_USER`, `RESTORE_DB_PASSWORD`, `BACKUP_DIR`, `BACKUP_FILE` și cheia. Dacă staging folosește același host DB ca mediul principal, este necesar și `ALLOW_SHARED_DB_HOST_FOR_RESTORE=true` ca alegere **explicită**, cu nume de DB diferit.
4. Executați **numai după aprobarea operațională a stagingului**:

```sh
npm run ops:restore:staging
```

Scriptul verifică arhiva, se asigură că baza țintă este goală, decriptează în flux în clientul `mysql` fără dump temporar, apoi verifică existența tabelelor. Nu schimbă `DB_NAME`, nu rulează pe DB de producție și nu face deploy. Un test bun continuă cu verificarea eșantioanelor și a schemelor, migrațiilor și fotografiilor în staging, **fără a expune PII în loguri**. Pentru media, decriptați arhiva numai în director de test privat și inspectați intrările tar înainte de extragere; restaurarea media în locația activă nu este automatizată.

## Checklist de lansare și rollback

- [ ] Aprobare separată pentru ordinea de merge a PR-urilor #7 → #8 → #9 → #10 → #11. Revizie de securitate și drepturi înainte de merge.
- [ ] Backup verificat, copie offsite criptată, cheia separată și **restaurare demonstrată** într-un mediu nou. Stabiliți RPO/RTO adecvate împreună cu proprietarul.
- [ ] Staging cu HTTPS și `SITE_URL` corect, deploy aprobat și migrații doar după backup.
- [ ] Verificați domeniu, operator legal, contact GDPR, retenție, consimțământ analytics, cookies, robots/sitemap, noindex drafturi, hreflang numai pentru traduceri autentice.
- [ ] Fotografie/video originale aprobate cu licențe, acorduri, credite și date, biografie verificată și măcar o ofertă comercial validată înainte de publicare de prețuri.
- [ ] Testați solicitări rapide/detaliate, idempotency concurentă, inbox CRM, workerul de notificări și deduplicarea destinatarului; configurați webhookul numai către un operator aprobat.
- [ ] Testați planner PDF cu diacritice pe Chrome/Safari/Firefox și dispozitive 360–1440px; asigurați text lizibil. Faceți test manual pentru Core Web Vitals, performanță și accesibilitate pe staging.
- [ ] Monitorizare read-only activă, alertare la cron, politica de rotație a backupurilor și responsabilul incidentelor stabilit.
- [ ] Păstrați `PRODUCTION_GATES_CLOSED=false` până la aprobarea **separată** a indexării, după validarea conținutului real.
- [ ] Plan rollback cod și DB: rollback aplicație compatibilă cu schema extinsă; înainte de orice restore folosiți staging și un backup validat. Redeployul unei versiuni vechi poate reactiva rescrieri istorice ale textelor (BR-01).

## Limitări și garanții

Nu s-a rulat scriptul de backup sau restore pe producție din acest PR și nu au fost instalate cronuri în hosting. CI poate verifica implementarea criptografică și simularea monitorului, dar nu demonstrează, singur, reziliența serverului cPanel, actualitatea conținutului, RTO/RPO ori viteza rețelei reale. Acestea necesită acord explicit și verificări în mediul țintă.
