# Operations

1. Use Node 24 / npm 11; install with `npm ci`.
2. Configure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, MEDIA_DIR and SITE_URL.
3. Apply `npm run db:migrate` before serving the new production app. See `cpanel.md` for import and initial setup.
4. Run lint, typecheck, tests and build. Publish using the existing deployment infrastructure.
5. Verify a test inquiry reaches `/admin` and all new fields are stored.
6. Configure final public contact/legal details before setting PRODUCTION_GATES_CLOSED=true.

No booking email notifications are configured. Staff read inquiries in `/admin`.
Login and inquiry rate limits are stored in MySQL and shared by Passenger processes.
Analytics limits remain per process. Set the trusted proxy headers at the hosting edge.
`npm run maintenance` previews inquiry retention cleanup; `-- --apply` removes eligible
closed/archived/spam records. Configure a cPanel cron only after reviewing retention.

See README for rollback limitations and public asset requirements.
