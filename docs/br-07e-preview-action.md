# BR-07e: acțiune de preview în editor

Articles include acum o acțiune UI articlePreview la începutul formularului. Fields o randează înaintea grupurilor fără nume, folosind ID-ul documentului din răspunsul CMS și limba curentă din editor. Nu adaugă un câmp salvat și nu necesită migrare.

Pentru documente salvate, acțiunea deschide /admin/preview/articles/ID?locale=ro/en într-o filă nouă cu noopener/noreferrer. Pentru ID lipsă sau invalid nu este generat link. Slugul nu este folosit și o modificare nesalvată a lui nu schimbă destinația. Acțiunea nu face save ori publish; textul precizează că preview-ul arată ultima versiune salvată.

Protecția este în continuare pe server: sesiune validă, permisiuni, noindex/no-store și fără acces anonim. Acest buton nu acordă acces suplimentar și nu introduce tokenuri în URL.

Limită explicită: linkul generic vechi din bara de salvare rămâne în Admin.tsx. El nu este încă adaptat articolelor; folosiți noua acțiune dedicată. Avertismentul de lângă slug a fost actualizat. Documentele BR-07b/c/d descriu etape istorice; această acțiune înlocuiește necesitatea introducerii manuale a adresei, nu rescrie întreaga bară de acțiuni.

Testele propuse verifică URL-ul, RO/EN, ID-uri invalide, markup-ul, dispatcherul Fields și lipsa persistării unui câmp UI. Nu certifică fluxul autentificat în browser sau păstrarea limbii la întoarcerea din preview; editorul cere încă selectarea EN la revenire. Verificați separat în mediul de test. CI nu este așteptat, dar nu este declarat trecut. Fără seed, modificări DB, merge sau deploy.
