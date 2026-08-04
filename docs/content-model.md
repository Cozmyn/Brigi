# Content model

## Human access

- `owner`: all content, users, enquiries, audit and configuration.
- `editor`: content and media; enquiry access only when explicitly enabled by the owner.
- `automation`: API-key account for draft content only. It cannot publish, delete, or access enquiries, users, audits or privacy configuration.

## Collections

`users`, `automation-accounts`, `inquiries`, `pages`, `services`, `videos`, `repertoire`, `testimonials`, `faq`, `media`, `redirects`, and `audit-events` follow the v3 specification. Public content that depends on rights or approval carries an approval/visibility field.

## Globals

`site-settings`, `header`, `footer`, `home-settings`, and `privacy-settings` control shared content and production visibility.

## Localisation

Public copy fields are localised for `ro` and `en` with Romanian as the default. English does not fall back to Romanian.

