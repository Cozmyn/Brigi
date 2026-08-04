# Brigitta operations runbook

## First owner

Start the app against an empty PostgreSQL database and open `/admin`. Create the first user with a username and password, then set the role to `owner`. Email is not required.

## Password reset

There is no email-based forgot-password flow. Another owner resets access directly in the admin/API after verifying the person through an agreed offline process. If no owner can sign in, use an audited database maintenance procedure and rotate the password immediately.

## Enquiries

New records start as `new`, unread, and due in ten calendar days. Work through `read`, `contacted`, `offer_prepared`, and a final `confirmed`, `lost`, `archived`, or `spam` state. Status changes create audit records. Do not copy enquiry PII into external AI tools.

## Production gates

Before setting `PRODUCTION_GATES_CLOSED=true`, complete G1–G7: real HTTPS domain; Node/PostgreSQL/persistent media hosting; real phone and WhatsApp; operator, privacy contact and retention rule; approved media/rights; approved biography; and commercially verified prices.

## Backup and recovery

Back up PostgreSQL and the media volume daily. Test restoration on staging. Run migrations before application deployment and retain the previous application image for rollback.

## Retention

Do not start automatic enquiry deletion until the owner has entered and legally validated the retention rule. After approval, schedule a daily housekeeping job using `INQUIRY_RETENTION_DAYS` and log deletions to the audit system without copying PII into logs.

