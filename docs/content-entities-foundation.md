# Etapele 1 și 2: primul lot de continuare

## BR-07: verificare și corecție de contract

CI 43230111777, commit 2db4d83, a eșuat la typecheck pe MySQL și MariaDB. Raportul pe etape nu oferă mesajele compilatorului; cauza exactă nu este declarată confirmată. AliasRow este completat cu coloanele collection, locale și unique_key folosite în filtrele Knex. Nu sunt dezactivate teste și nu se declară CI verde înainte de verificare.

Lotul anterior 504582e are raport CI pozitiv pe ambele baze. Acest rezultat nu certifică redirecturile noi. Rămân de verificat testul real de flux, conflictele concurente, preview în browser, linkul generic din admin, navigația EN, media și hosting.

## Extinderea CMS: trei colecții

- musical-formats: componență, contexte potrivite, cerințe tehnice și referințe la pachete.
- partners: rol/relație confirmate, website HTTPS opțional, logo și drept de publicare confirmat.
- case-studies: context, abordare, rezultat și dovezi publicabile; consimțământ și verificarea dovezilor obligatorii la publicare. Anul evenimentului este opțional, întreg și neviitor.

Toate folosesc colecțiile/documentele SQL existente, versiuni, câmpuri RO/EN, secțiuni și SEO. Implicit draft, invizibil, neaprobat. Publicarea snapshot-ului CMS necesită revizor, dată neviitoare, rezumat și secțiuni complete plus câmpurile specifice. Nu sunt adăugate afirmații comerciale, parteneriate sau rezultate reale.

Adminul și API-ul administrativ folosesc registrul existent. Accesul anonim prin ContentStore rămâne interzis, inclusiv pentru snapshot-uri marcate published. Păstrați această interdicție până la un cititor public dedicat, validat, cu politici pentru media și relații. Nu furnizați overrideAccess=true dintr-o rută anonimă.

## Ce nu este încă livrat

Acesta este fundamentul CMS, nu întregul pas 2. Nu sunt adăugate rute publice, huburi, sitemap, navigație sau JSON-LD pentru aceste entități. Sunt necesare separat resolverul de căi, citirea exclusiv a snapshot-urilor aprobate în aceeași limbă, filtrarea relațiilor/media și testele de publicare/retragere pe baza reală. Preview-ul dedicat de articole nu este extins automat la entitățile noi.

Testele adăugate verifică validarea și refuzul accesului anonim cu conexiune simulată; nu certifică CRUD real, sesiuni, responsive sau hosting. Fără migrări, seed, înregistrări create/publicate, merge ori deploy. Nu așteptăm CI pentru dezvoltare, dar nu declarăm etapele 1 sau 2 închise.
