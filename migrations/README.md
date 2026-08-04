# PostgreSQL migrations

The committed initial migration reflects the complete v3 content model. Dry-run it against the selected PostgreSQL 16 staging database, then apply it before the first application deployment. Every later collection or global schema change requires a new generated and reviewed migration in this directory.
