# Brigitta website

Bilingual commercial website and Payload CMS back-office for Brigitta. Romanian is served at the domain root and English below `/en`. The public experience focuses on qualified event enquiries; no email field, email adapter, newsletter, advertising pixel, public EPK or rider is included.

## Stack

- Next.js 16, React 19 and strict TypeScript
- Payload CMS 3 with PostgreSQL 16
- Tailwind CSS and a custom editorial design system
- Vitest and Playwright

## Local setup

1. Copy `.env.example` to `.env` and set a local PostgreSQL connection plus long random secrets.
2. Run `npm install`.
3. Run `npm run payload -- migrate`.
4. Run `npm run dev` and open `/admin` to create the first owner.

The public site can be built in preview mode while commercial and legal gates remain open:

```sh
npm run lint
npm run typecheck
npm run test:int
npm run build
```

## Docker deployment

The production image uses Node.js 24 and Next.js standalone output. Docker Compose starts PostgreSQL 16, applies Payload migrations, then starts the application with persistent database and media volumes.

```sh
cp .env.example .env
# Replace every placeholder and configure the real HTTPS URLs.
docker compose up --build -d
docker compose ps
```

Expose port `3000` through an HTTPS reverse proxy such as Caddy or Nginx. Back up both the PostgreSQL and media volumes. For a host with ephemeral storage, configure an S3-compatible media adapter before production.

## Production safety

Set `PRODUCTION_GATES_CLOSED=true` only after all G1–G7 items from the implementation specification are completed. The prebuild validator then requires an HTTPS `SITE_URL`, real phone and WhatsApp values, a verified data operator and privacy contact, and a retention rule. Approved imagery, live video, testimonials, biography claims and commercially verified prices must also be enabled in Payload before launch.

See `docs/runbook.md`, `docs/content-model.md`, and `docs/ADR/0001-payload-postgres-and-production-gates.md` for operations and architecture decisions.
