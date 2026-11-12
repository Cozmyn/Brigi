# BRIGITTA — SEO & lead acquisition (research snapshot, November 2026)

## Scope and evidence quality

This is a **public search-result and content audit**, not a competitor Google Analytics, Google Ads account, Search Console, Ahrefs or Semrush export. Those private datasets are not available. We therefore **do not state keyword search volume, CPC, conversion rate, competitor traffic, ranking position or ROAS** as measured facts.

Public examples inspected November 2026:
- [WERRO — Solist în București](https://werro.ro/cautare/solist/bucuresti) — location/service directory, structured artist profiles, starting-price facets and inquiry flow; a business model comparator, not BRIGITTA pricing.
- [Eventist — Mares Pana](https://www.eventist.ro/s/mares-pana-solist-nunta-solist-nunta-bucuresti-solist-evenimente-solist-si-dj-evenimente-muzica-nunta/) — competitor profile specifying set count, length, offer combinations and booking CTA; no implication of the same offering at BRIGITTA.
- [The Knot — wedding band vs. DJ](https://www.theknot.com/content/wedding-reception-music-bands-vs-djs) — intent-rich comparison that answers how to choose format.
- [The Knot — wedding-music contracts](https://www.theknot.com/content/wedding-reception-music-contract-points) — contract, logistics, song requests, set duration and responsibility questions.
- [The Knot — reception timeline](https://www.theknot.com/content/a-traditional-wedding-reception-timeline) — example of practical planning content.
- [Google Search Central — helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [AI Search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) — authenticity, clear evidence and no manipulation or AI content spam.

Search results vary by location, date, personalization and device. **We have not verified any actual Brigi.ro ranking or analytics numbers.** Google positions cannot be guaranteed.

## Content strategy tied to customer intent

| Priority | Query family (qualitative, no volume claimed) | Primary landing page | Supporting guide | Conversion |
| --- | --- | --- | --- | --- |
| P0 | solistă nuntă, solist vocal nuntă, muzică live nuntă | `/nunti-si-ceremonii` | `/ghiduri/solista-dj-sau-formatie-la-nunta` | /rezervare |
| P0 | preț solistă nuntă, ofertă solistă, câte programe muzicale | `/nunti-si-ceremonii` | `/ghiduri/pret-solista-nunta-ce-influenteaza-oferta` | /rezervare |
| P0 | solistă botez, muzică botez | `/solista-botez` | `/ghiduri/solista-botez-muzica-live-si-momente` | /rezervare |
| P1 | muzică live corporate, solistă gală | `/evenimente-corporate` | `/ghiduri/muzica-live-eveniment-corporate-brief-organizare` | /rezervare |
| P1 | program muzical nuntă, checklist nunta muzică | `/instrumente/planner` | `/ghiduri/program-muzical-nunta-cronologie-checklist` | /rezervare |
| P1 | muzică live cununie civilă, solistă cununie | `/nunti-si-ceremonii` | `/ghiduri/muzica-live-cununie-civila-si-primire-invitati` | /rezervare |
| P2 | solistă eveniment privat, aniversare muzică live | `/evenimente-private` | Repertoriu + comparator | /rezervare |

The commercial site should show one clear H1, a genuine explanation of service scope, an unambiguous CTA and honest price/status. The user can ask for a quote **without exact date, without consent to analytics and without choosing a package**. Real photos, rights-cleared videos, optional verified offers and consented testimonials improve trust; **never fabricate those**.

## Automatically prepared / editable CMS content

- Six original, source-linked Romanian informational guides are seeded **only if no article with the same slug exists**. They can be edited, translated, unpublished and deleted in `/admin/collections/articles`.
- Byline is the **brand** BRIGITTA, with an explicit disclosure of AI-assisted drafting/review; it does not invent a named human expert or an artist's performance history.
- Existing seed pages are untouched: no overwrite of custom editorial content, pricing, biographical credentials, booking dates or gallery uploads.
- H1, keyword-oriented metadata and a visible service descriptor are provided by the app. A single-click editor assistant prepares SEO title/description and Romanian diacritic-safe URL from the author's own text.
- No automatically generated city landing pages. Location names and Google Business Profile service area must use **confirmed** geographic availability, not inferred user/device location.

## Launch gate and search-engine configuration

1. **Before deploy**: obtain permission for merge/deployment (source `main` is **not the live server**), configure HTTPS canonical host `SITE_URL=https://brigi.ro` and legal privacy details, verify DB backups/restores and review original pictures/music rights.
2. **Deploy**: release package is built by GitHub Actions, but deployment must be executed by an authorized operator. The package runs MySQL migrations and the idempotent CMS bootstrap; no manual article text entry is required.
3. **Index gate**: production index status is separately controlled by `PRODUCTION_GATES_CLOSED=true`. Keep false while content/legal readiness is incomplete. Verify robots allows public crawling, draft routes are noindex, sitemap contains only self-canonical indexable pages, and RO/EN alternate links exist only for real paired translations.
4. **Google Search Console**: verify the domain DNS or meta tag. Optional site-settings `googleVerification` emits a verification meta tag. Submit `https://brigi.ro/sitemap.xml`, inspect the key pages and monitor coverage, sitemap errors and query-page combinations. Search Console access requires the owner's Google account; code cannot grant that permission.
5. **Bing Webmaster Tools**: optional site-settings `bingVerification`. **Google Analytics 4**, if desired, requires a real measurement ID and consent/legal setup; built-in privacy-friendly aggregate analytics and CRM remain available without GA4.
6. **Local business**: use a Google Business Profile only if eligible under Google's policies, with accurate address or service area; no fictitious physical location, service cities or reviews.

## KPIs and improvements, not artificial rankings

Weekly: Search Console non-brand impressions, clicks, CTR, indexed query-relevant URLs and change in landing-page mix; CMS aggregate click-to-contact/WhatsApp/form activity **only with consent**; CRM new → qualified → offer → confirmed stages and lead-response time. Separate branded and non-branded searches. Before interpreting CTR, segment by query, location, device and intent. No arbitrary position or lead-count promises.

After Search Console has data, prioritize:
- relevant pages with strong impressions but weak CTR: revise **human-useful** page title/meta, not keyword stuffing;
- pages receiving relevant organic clicks but few qualified inquiries: improve clarity, trust, response speed and CTA;
- searches that bring irrelevant traffic: clarify that BRIGITTA is a **vocal solo performance**, not automatically a complete DJ/band booking;
- localized content: add a location page only with specific, genuine local availability, examples and practical details — not duplicated doorway pages.

## Admin navigation

`/admin` — dashboard, leads, media, service packages, pages, articles, videos.
`/admin/seo` — priority clusters, configuration checklist and links to relevant editors.
`/admin/collections/articles/create` — create a new article without source-code edits; built-in slug/meta assistant suggests text from the editor's title and summary.
`/admin/globals/site-settings` — phone, email, WhatsApp, verified geographic area, public socials, Google/Bing ownership meta tags and consented site analytics.
`/admin/globals/home-settings` — hero, approved photos/OG, bio-adjacent copy and on-page experience.

New media requires rights and alt text; price fields require commercial verification; approval states remain separate and cannot be inferred. **A service provider's exact availability, voice quality, rates, endorsements and legal contact information are not reliable facts until confirmed by the owner.**

## Technical SEO acceptance

- Google Search Central guidelines apply to Google AI summaries too; specialized `llms.txt` or AI indexing hacks are not considered necessary.
- Aim for LCP <=2.5 seconds, INP <=200 ms and CLS <=0.1 on actual field data; CI responsive tests do not certify these live metrics.
- Every indexable landing page has a unique descriptive title, coherent H1, self canonical, relevant internal links and a clear next step. Schema `Article`, `WebPage`, `Service`, and `VideoObject` only claim what the content actually supports.
- No private personal data in a CMS public listing, in video metadata, third-party analytics or outbound leads.
