# Brigitta — website și administrare

Website Next.js 16 cu CMS propriu la `/admin`, MySQL/MariaDB și rulare Node.js 24 prin Passenger. Designul editorial existent este păstrat. Payload și PostgreSQL au fost înlocuite.

- [Ghid de administrare și fotografii](docs/actualizare-site.md)
- [Instalare, import și update pe cPanel](docs/cpanel.md)
- [Schimbări, cercetare și SEO](docs/second-pass.md)

## Instalare și actualizare

```sh
npm ci
npm run db:migrate
npm run seed:content
npm run build
npm run start
```

Configurează variabilele conform `.env.example`, fără a publica valori reale. MySQL 8.0+ sau MariaDB 10.11+ trebuie să fie disponibile înainte de migrare/build. Rulează `npm run admin:create` pentru primul administrator. Pentru mediul virtual CloudLinux folosește `npm run install:cpanel` în loc de `npm ci`. Media se păstrează într-un director persistent separat de repository.

## Verificări

```sh
npm run lint
npm run typecheck
npm run test:int
npm run build
npm run test:e2e
```

CI verifică MariaDB 10.11 și MySQL 8.0, migrațiile, seed-ul și build-ul de producție cu Playwright. Testele de bază și browser rulează numai pe baze de test, nu pe producție.

Tipurile din `src/cms/types.ts` descriu numai câmpurile aplicației. Se generează din definițiile editoriale, fără conectare la bază. Migrațiile MySQL conțin doar structura necesară aplicației, fără date private. Exporturile/importurile, fișierele media și configurația reală nu se comit.
