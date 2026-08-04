# ADR 0001: Payload, PostgreSQL and explicit production gates

## Status

Accepted.

## Context

The implementation specification requires one Next.js application for the public website and Payload back-office, PostgreSQL persistence, no email workflow, and no invented legal, media or biographical data.

## Decision

- Use the official Payload Website template with the PostgreSQL adapter.
- Keep Romanian at the domain root and English below `/en`.
- Store enquiries only in `inquiries`; do not install an email adapter.
- Keep unapproved video, testimonials, trust-strip claims and real-person imagery hidden.
- Permit preview builds while production gates are open. A live build sets `PRODUCTION_GATES_CLOSED=true`; the validation script then rejects missing domain, phone, WhatsApp, operator, privacy contact or retention configuration.

## Consequences

The codebase can be reviewed before commercial and legal facts are available, but cannot be treated as launch-ready until G1–G7 are closed. The public preview intentionally uses typography and geometric art instead of fabricated or stock performance imagery.

