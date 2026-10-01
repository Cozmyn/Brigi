# Operations

1. Use Node 24 / npm 11; install with `npm ci`.
2. Configure PostgreSQL, PAYLOAD_SECRET and SITE_URL.
3. Apply `npm run payload -- migrate` before serving the new production app.
4. Run lint, typecheck, tests and build. Publish using the existing deployment infrastructure.
5. Verify a test inquiry reaches `/admin` and all new fields are stored.
6. Configure final public contact/legal details before setting PRODUCTION_GATES_CLOSED=true.

No booking email notifications are configured. Staff must read inquiries in Payload.
Rate limiting is per process; enforce central limits at the edge for multiple replicas.
Retention must be confirmed and operated according to the configured policy; the
configuration value alone does not delete historical data automatically.

See README for rollback limitations and public asset requirements.
