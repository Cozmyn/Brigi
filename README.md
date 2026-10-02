# Brigitta — website și administrare

A doua etapă păstrează Next.js, Payload și PostgreSQL și conectează frontendul la conținutul publicat din admin.

- [Ghid de administrare și fotografii](docs/actualizare-site.md)
- [Schimbări, cercetare și SEO](docs/second-pass.md)

## Instalare și actualizare

```sh
npm ci
npm run db:migrate
npm run seed:content
npm run build
npm run start
```

Configurează variabilele de hosting conform `.env.example`, fără a publica valori reale. PostgreSQL trebuie să fie disponibil înainte de migrare/build. Importul inițial păstrează conținutul existent. Media necesită stocare persistentă.

## Verificări

```sh
npm run lint
npm run typecheck
npm run test:int
npm run build
npm run test:e2e
```

CI folosește PostgreSQL 16, aplică migrațiile și importă conținutul înainte de a testa build-ul de producție cu Playwright. Capturile și raportul se salvează ca artifact `browser-qa`.

Tipurile Payload și snapshot-urile JSON se generează local și nu sunt versionate. Migrațiile TypeScript conțin numai schimbări de structură necesare aplicației.
