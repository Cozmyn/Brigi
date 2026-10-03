# Content ownership

The public website reads published content from the application's MySQL CMS.
`src/lib/site.ts` and `src/lib/editorial.ts` provide initial Romanian content;
`src/lib/english.ts` provides English interface defaults. CMS content takes precedence.

Collections retain their existing editorial fields in `src/collections`; global
settings live in `src/globals`. These are application field definitions, not Payload
configurations. They drive validation, structured admin forms and application types.

`cms_documents` owns IDs and timestamps. `cms_locales` stores validated JSON content
and a separate published snapshot per language, with indexed collection, slug and
unique request/redirect keys. JSON is stored as LONGTEXT for consistent MySQL/MariaDB
behavior. `cms_globals` stores localized settings. `cms_revisions` retains 30 previous
versions per document and locale. Users, sessions, rate limits and aggregate analytics
have dedicated tables. No passwords or sessions are exposed by content APIs.

Pages, services, video, repertoire, testimonials and FAQ support separate RO/EN
documents. Media assets, redirects and inquiries are shared; inquiries retain the
submission language. Untranslated pages are not generated automatically. RO URLs are
preserved; English content is available under `/en`.

See `cpanel.md` for deployment and `actualizare-site.md` for editing and image sizes.
