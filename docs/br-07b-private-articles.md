# BR-07b: Articles în CMS privat

## Scop

Colecția articles este înregistrată în CMS-ul generic și în navigația administrativă. Folosește tabelele JSON și mecanismele existente pentru locale, snapshot publicat, retragere și istoric; nu adaugă tabele și nu rulează migrări. Tipul Article extinde ModelMap prin module augmentation în src/cms/article-types.ts, reexportat de configurația colecției.

Câmpuri: titlu, slug, rezumat, temă, intenție, autor, recenzor, contribuție originală, secțiuni, surse HTTPS, pagini/pachete asociate, date editoriale, SEO, vizibilitate, aprobare și stări. Datele editoriale sunt introduse de editor; simpla completare nu dovedește identitatea autorului ori adevărul afirmațiilor. Nu introduceți date private ale clienților.

## Workflow

1. Creați în admin un articol cu titlu și slug; salvați ca draft.
2. Completați conținutul și treceți editorialStatus la review.
3. După revizuire umană, completați autorul/recenzorul, sursele, contribuția originală și datele reale, apoi approved și approvedForPublication.
4. Publicarea necesită toate acestea plus cel puțin o secțiune și o sursă. Validarea este server-side prin validateFields, după validarea câmpurilor din grupul fără nume; un simplu _status=published este respins. Datele viitoare sunt refuzate: nu există scheduler.
5. Drafturile ulterioare păstrează snapshot-ul publicat prin mecanismul existent. Retragerea publicării rămâne operația explicită existentă.

Owner și editor păstrează permisiunile existente. Nu există aprobare în doi utilizatori impusă tehnic, verificare externă a identității autorului sau verificare automată a surselor. Sursele nu sunt descărcate de server.

## Ce NU este încă disponibil

Nu există rută publică Article, hub, schema Article, sitemap sau preview dedicat. Nu folosiți linkul generic de preview din editor pentru articole: el construiește încă o rută de pagină simplă. Această limită este afișată și lângă slug. Accesul public din ContentStore rămâne blocat implicit pentru articles; nu folosiți overrideAccess=true în viitoarele rute publice. Salvarea unui snapshot nu publică un articol pe website în acest lot.

Integrarea următoare trebuie să adauge politica publică explicită, rutele RO/EN și preview-ul corect, redirecturi și consumul resolverului comun în metadata, relații și sitemap. BR-07 rămâne incomplet până la aceste integrări și verificări.

## Verificare

Testele propuse verifică registrul, tipul, defaults, validarea editorială, sursele, slugurile, RO/EN, conservarea textelor și refuzul accesului anonim cu un query builder simulat. Nu certifică persistența, tranzacțiile, restaurarea sau izolarea în baza reală. Rulați lint/typecheck/test:int/build/e2e în CI; validați separat CRUD, versiuni și retragere pe baza de test MySQL/MariaDB și ergonomia în admin. Nu declarați aceste verificări trecute înainte de rezultate.

## Rollback

Revert al lotului dezînregistrează colecția fără a șterge documentele existente. Exportați/faceți backup dacă au fost create articole de test. Nu modificați sau ștergeți manual tabelele în producție. Fără merge/deploy sau modificări de hosting autorizate prin acest lot.
