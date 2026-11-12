# Pasul 2 — conversii, cereri și CRM (BR-04 / BR-05 / BR-06)

## Formular și proces CRM
- Cerere rapidă / detaliată: data exactă, lună estimată sau dată necunoscută.
- Telefon sau email, cu un canal de contact valid. Județul, invitații și preferințele artistice sunt opționale.
- CRM: responsabil, calificare, negociere, ofertă și valoare confirmată introduse de administrator; fără estimări fabricate.
- Cheia UUID de idempotency este unică în MySQL/MariaDB; date identice întorc 200 la retry, conținut diferit cu aceeași cheie întoarce 409.
- În aceeași tranzacție DB cu salvarea cererii se inserează un job de notificare în inquiry_outbox; lipsa migrației oprește înregistrarea cererii, nu pierde jobul.

## Notificări (neactivate prin acest PR)
1. După backup restaurabil și aprobare de deployment, execută npm run db:migrate într-o fereastră de mentenanță.
2. Configurează INQUIRY_NOTIFY_WEBHOOK_URL=https://... și INQUIRY_NOTIFY_TOKEN în mediul server, către un endpoint HTTPS aprobat contractual. Nu stoca tokenul în repo.
3. Configurează cron cPanel la interval adecvat (de exemplu, 2 minute) din directorul aplicației: npm run notify:inquiries. Asigură versiunea Node și dependența tsx; testează întâi pe staging.
4. Monitorizează în dashboard stările pending, processing și failed. După investigarea cauzei, administratorul poate reintroduce în coadă joburile eșuate: npm run notify:inquiries -- --retry-failed.

Webhookul trimite doar tipul evenimentului tehnic inquiry.created, ID-ul cererii și, dacă SITE_URL folosește HTTPS, linkul spre adminul autentificat. Nu trimite nume, email, telefon ori detalii de eveniment. Fără configurarea webhookului, cererile și joburile rămân în baza de date; nu se trimite niciun email implicit.

**Garanție de livrare:** at-least-once. Dacă receptorul procesează evenimentul și răspunsul se pierde, workerul îl poate relivra. Receptorul trebuie să deduplice folosind inquiryId. Se folosesc claim-uri atomice, lease și backoff exponențial; după 10 încercări apare starea failed, recuperabilă manual.

## Atribuire și confidențialitate
- First/last-touch se colectează doar după consimțământul pentru statistici, în sessionStorage; recoltarea pornește pe toate rutele publice, nu doar în formular.
- Referrer = doar domeniul, niciodată URL complet; UTMs sunt limitate la caractere sigure, iar rutele sunt validate ca publice.
- Retragerea acordului șterge capturile. API-ul elimină câmpurile marketing din cererea fără attributionConsent=true, chiar dacă un client trimite valori manual.
- O cerere de disponibilitate poate fi depusă fără consimțământ statistic; informarea privind procesarea datelor pentru cerere rămâne distinctă.

## Verificare
- npm run lint, npm run typecheck, npm run test:int
- npm run db:migrate, npm run test:import, npm run test:db, npm run build, npm run test:e2e în CI pe MySQL și MariaDB.
- Teste pentru date imprecise, email-only, lipsa consimțământului statistic, validare PII, idempotency concurentă, CRM și notificări cu retry, fără HTTP extern real.

PR #8 este stacked peste PR #7: ambele necesită aprobări explicite pentru merge și apoi deployment, backup și migrație. Nicio bază de date de producție și niciun webhook real nu au fost configurate.
