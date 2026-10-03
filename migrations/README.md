# MySQL / MariaDB migrations

Run `npm run db:migrate` with the DB_* variables configured. Application migrations
are in `migrations/mysql`, contain schema only, and run without PostgreSQL or Docker.
`npm run db:status` lists applied/pending migrations. The initial migration can resume
after an interrupted install because MySQL DDL auto-commits; each table is guarded.
Migrations intentionally refuse destructive automatic rollback. Restore a verified
backup with compatible code when necessary. Content import is a separate operation;
see `docs/cpanel.md`.
