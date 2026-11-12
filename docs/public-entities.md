# Public entities: RO/EN routes
Adds /formate, /parteneri, /studii-de-caz and their /en equivalents, plus detail routes.
Only approved, visible published_data snapshots are read; mutable draft slugs are never public lookup keys.
Consent and case evidence are revalidated. Ambiguous published URLs fail closed and are excluded from lists.
Relations stay in the same locale; no RO fallback for EN. Related entities must also resolve uniquely at their public URL.
Media uses the existing approved local-image policy with real alt/dimensions, unoptimized serving and no persistent reference cache.
Limits: 16 distinct media IDs and 8 references per relationship field. Missing media never removes section text.
Canonical, noindex and sitemap share the production gate. Empty/non-indexable hubs are excluded from sitemap.
WebPage and breadcrumb JSON-LD describe visible content; no invented prices, ratings, endorsements or Organization identity.
RO navigation adds an Explore menu and mobile links only for nonempty hubs. EN layout adds resource footer links, including Guides when published.
Before deployment audit existing CMS pages named formate/parteneri/studii-de-caz: these namespaces are now reserved and static routes take precedence.
No content seed, migration, merge or deploy. The admin description from the foundation still mentions inactive public routes; update it with the preview UI cleanup before release.
Generic admin preview is not yet adapted to these entities. Automatic slug-history redirects for these three collections are not implemented in this batch; do not rename published URLs before that follow-up.
Added snapshot/query tests and an isolated real-DB/HTTP CI lifecycle test. No tests are claimed passed before CI.
Remaining: preview cleanup, concurrent publication tests, new-entity URL-history handling, authenticated browser/media checks and hosting validation.
