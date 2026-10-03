# ADR 0002: MySQL/MariaDB and cPanel Passenger

## Status

Accepted. Replaces the database and CMS decision in ADR 0001.

## Reason

The production hosting provides Node 24, Passenger and MySQL/MariaDB, without PostgreSQL. Payload has no official MySQL adapter; using an unsupported adapter would make upgrades and data integrity harder to maintain.

## Decision

Preserve Next.js, the public components, editorial design, content field contracts and SEO. Replace Payload with an integrated `/admin`, Knex migrations and the maintained mysql2 driver. Structured content uses validated JSON in LONGTEXT, compatible with MySQL 8 and MariaDB 10.11. Document IDs, localized drafts, published snapshots, users, sessions and inquiries persist in SQL.

Use password hashing with salted scrypt, server-side roles, revocable sessions, same-origin mutations and bounded uploads. Media lives outside the checkout. Passenger starts the CommonJS `app.cjs`; no Docker or external database is needed on the hosting.

## Migration and limits

Import only application content and media into an empty database. Remap relationships and preserve draft/public versions and original document timestamps. Do not import passwords, sessions, database dumps or the entire historical Payload revision log. Users are recreated with new passwords. A successful fixture import does not certify unprovided production data.

See [cPanel installation and update instructions](../cpanel.md). Existing publication, privacy and factual-content gates remain in effect.
