import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_inquiries_package_interest" ADD VALUE IF NOT EXISTS 'custom';
    ALTER TYPE "public"."enum_inquiries_preferred_contact" ADD VALUE IF NOT EXISTS 'email';
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "county" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "approximate_time" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "email" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "music_preferences" varchar;
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "approximate_budget" varchar;
  `)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Keep additive enum values: PostgreSQL cannot remove them without rewriting existing data.
  await db.execute(sql`
    ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "county";
    ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "approximate_time";
    ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "email";
    ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "music_preferences";
    ALTER TABLE "inquiries" DROP COLUMN IF EXISTS "approximate_budget";
  `)
}
