import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_settings" ALTER COLUMN "showreel_visible" SET DEFAULT true;
  ALTER TABLE "home_settings" ALTER COLUMN "testimonials_visible" SET DEFAULT true;
  ALTER TABLE "home_settings" ALTER COLUMN "trust_strip_visible" SET DEFAULT true;
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('service', 'editorial', 'location', 'about', 'repertoire', 'media');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('service', 'editorial', 'location', 'about', 'repertoire', 'media');
  CREATE TYPE "public"."enum_services_currency" AS ENUM('EUR', 'RON');
  CREATE TYPE "public"."enum__services_v_version_currency" AS ENUM('EUR', 'RON');
  CREATE TYPE "public"."enum_home_settings_events_event_type" AS ENUM('wedding', 'ceremony', 'corporate', 'anniversary', 'cocktail', 'public', 'other');
  CREATE TABLE "analytics_daily" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"day" varchar NOT NULL,
  	"event" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"referrer" varchar,
  	"campaign" varchar,
  	"count" numeric DEFAULT 0 NOT NULL
  );
  
  CREATE TABLE "pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "_pages_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "home_settings_experience_moments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "home_settings_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"event_type" "enum_home_settings_events_event_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "home_settings_repertoire_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "home_settings_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  ALTER TABLE "inquiries" ADD COLUMN "selected_package_name" varchar;
  ALTER TABLE "pages" ADD COLUMN "page_type" "enum_pages_page_type" DEFAULT 'editorial';
  ALTER TABLE "pages" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "pages" ADD COLUMN "service_area" varchar;
  ALTER TABLE "pages" ADD COLUMN "show_packages" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "cta_label" varchar DEFAULT 'Verifică disponibilitatea';
  ALTER TABLE "pages" ADD COLUMN "seo_canonical" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_noindex" boolean DEFAULT false;
  ALTER TABLE "pages_locales" ADD COLUMN "seo_og_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "seo_og_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_page_type" "enum__pages_v_version_page_type" DEFAULT 'editorial';
  ALTER TABLE "_pages_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_service_area" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_show_packages" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_cta_label" varchar DEFAULT 'Verifică disponibilitatea';
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_canonical" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_noindex" boolean DEFAULT false;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_seo_og_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_seo_og_description" varchar;
  ALTER TABLE "services" ADD COLUMN "set_count" numeric;
  ALTER TABLE "services" ADD COLUMN "duration" numeric DEFAULT 45;
  ALTER TABLE "services" ADD COLUMN "currency" "enum_services_currency" DEFAULT 'EUR';
  ALTER TABLE "services" ADD COLUMN "from_pricing" boolean DEFAULT true;
  ALTER TABLE "services" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "_services_v" ADD COLUMN "version_set_count" numeric;
  ALTER TABLE "_services_v" ADD COLUMN "version_duration" numeric DEFAULT 45;
  ALTER TABLE "_services_v" ADD COLUMN "version_currency" "enum__services_v_version_currency" DEFAULT 'EUR';
  ALTER TABLE "_services_v" ADD COLUMN "version_from_pricing" boolean DEFAULT true;
  ALTER TABLE "_services_v" ADD COLUMN "version_featured" boolean DEFAULT false;
  ALTER TABLE "media_locales" ADD COLUMN "caption" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "analytics_daily_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "email" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biography" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "analytics_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "google_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "bing_verification" varchar;
  ALTER TABLE "home_settings" ADD COLUMN "seo_canonical" varchar;
  ALTER TABLE "home_settings" ADD COLUMN "seo_noindex" boolean DEFAULT false;
  ALTER TABLE "home_settings" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "home_settings" ADD COLUMN "hero_accent" varchar DEFAULT 'Toată atmosfera.';
  ALTER TABLE "home_settings" ADD COLUMN "availability_label" varchar DEFAULT 'Verifică disponibilitatea';
  ALTER TABLE "home_settings" ADD COLUMN "quote_label" varchar DEFAULT 'Cere ofertă';
  ALTER TABLE "home_settings" ADD COLUMN "experience_title" varchar DEFAULT 'Muzica se simte.
  Seara se schimbă.';
  ALTER TABLE "home_settings" ADD COLUMN "experience_text" varchar DEFAULT 'Un început cald. Un refren cântat împreună. Energia care ridică sala. Un program live își găsește locul între momentele evenimentului, cu un repertoriu ales pentru oamenii din fața scenei.';
  ALTER TABLE "home_settings" ADD COLUMN "events_title" varchar DEFAULT 'Pentru fiecare ocazie, un alt ritm.';
  ALTER TABLE "home_settings" ADD COLUMN "repertoire_title" varchar DEFAULT 'De la emoție
  la energie.';
  ALTER TABLE "home_settings" ADD COLUMN "repertoire_text" varchar DEFAULT 'Pop, dance, evergreen și refrene care aduc oamenii împreună. Alegem direcția muzicală în funcție de eveniment, de public și de atmosfera pe care o dorești.';
  ALTER TABLE "home_settings" ADD COLUMN "packages_title" varchar DEFAULT 'Alege ritmul serii.';
  ALTER TABLE "home_settings" ADD COLUMN "pricing_note" varchar DEFAULT 'Prețuri de pornire orientative. Oferta finală ține cont de dată, oraș, locație, deplasare, numărul de seturi, cerințele tehnice, cererile muzicale și formatul evenimentului.';
  ALTER TABLE "home_settings" ADD COLUMN "process_title" varchar DEFAULT 'De la prima discuție, la primul refren.';
  ALTER TABLE "home_settings" ADD COLUMN "about_title" varchar DEFAULT 'Vocea, în prim-plan.';
  ALTER TABLE "home_settings" ADD COLUMN "faq_title" varchar DEFAULT 'Detaliile unui program bine pregătit.';
  ALTER TABLE "home_settings" ADD COLUMN "booking_title" varchar DEFAULT 'Seara ta începe
  cu o conversație.';
  ALTER TABLE "home_settings" ADD COLUMN "booking_text" varchar DEFAULT 'Spune-ne când, unde și ce pregătești. Verificăm disponibilitatea și găsim formatul potrivit.';
  ALTER TABLE "home_settings" ADD COLUMN "photos_hero_id" integer;
  ALTER TABLE "home_settings" ADD COLUMN "photos_live_id" integer;
  ALTER TABLE "home_settings" ADD COLUMN "photos_portrait_id" integer;
  ALTER TABLE "home_settings" ADD COLUMN "photos_social_id" integer;
  ALTER TABLE "home_settings_locales" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "home_settings_locales" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "home_settings_locales" ADD COLUMN "seo_og_title" varchar;
  ALTER TABLE "home_settings_locales" ADD COLUMN "seo_og_description" varchar;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faqs" ADD CONSTRAINT "pages_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_faqs" ADD CONSTRAINT "_pages_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_settings_experience_moments" ADD CONSTRAINT "home_settings_experience_moments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_settings_events" ADD CONSTRAINT "home_settings_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_settings_repertoire_categories" ADD CONSTRAINT "home_settings_repertoire_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_settings_process" ADD CONSTRAINT "home_settings_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "analytics_daily_key_idx" ON "analytics_daily" USING btree ("key");
  CREATE INDEX "analytics_daily_day_idx" ON "analytics_daily" USING btree ("day");
  CREATE INDEX "pages_sections_order_idx" ON "pages_sections" USING btree ("_order");
  CREATE INDEX "pages_sections_parent_id_idx" ON "pages_sections" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_image_idx" ON "pages_sections" USING btree ("image_id");
  CREATE INDEX "pages_faqs_order_idx" ON "pages_faqs" USING btree ("_order");
  CREATE INDEX "pages_faqs_parent_id_idx" ON "pages_faqs" USING btree ("_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_version_sections_order_idx" ON "_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_parent_id_idx" ON "_pages_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_image_idx" ON "_pages_v_version_sections" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_faqs_order_idx" ON "_pages_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_faqs_parent_id_idx" ON "_pages_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "home_settings_experience_moments_order_idx" ON "home_settings_experience_moments" USING btree ("_order");
  CREATE INDEX "home_settings_experience_moments_parent_id_idx" ON "home_settings_experience_moments" USING btree ("_parent_id");
  CREATE INDEX "home_settings_events_order_idx" ON "home_settings_events" USING btree ("_order");
  CREATE INDEX "home_settings_events_parent_id_idx" ON "home_settings_events" USING btree ("_parent_id");
  CREATE INDEX "home_settings_repertoire_categories_order_idx" ON "home_settings_repertoire_categories" USING btree ("_order");
  CREATE INDEX "home_settings_repertoire_categories_parent_id_idx" ON "home_settings_repertoire_categories" USING btree ("_parent_id");
  CREATE INDEX "home_settings_process_order_idx" ON "home_settings_process" USING btree ("_order");
  CREATE INDEX "home_settings_process_parent_id_idx" ON "home_settings_process" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_daily_fk" FOREIGN KEY ("analytics_daily_id") REFERENCES "public"."analytics_daily"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_settings" ADD CONSTRAINT "home_settings_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_settings" ADD CONSTRAINT "home_settings_photos_hero_id_media_id_fk" FOREIGN KEY ("photos_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_settings" ADD CONSTRAINT "home_settings_photos_live_id_media_id_fk" FOREIGN KEY ("photos_live_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_settings" ADD CONSTRAINT "home_settings_photos_portrait_id_media_id_fk" FOREIGN KEY ("photos_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_settings" ADD CONSTRAINT "home_settings_photos_social_id_media_id_fk" FOREIGN KEY ("photos_social_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_analytics_daily_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_daily_id");
  CREATE INDEX "home_settings_seo_seo_image_idx" ON "home_settings" USING btree ("seo_image_id");
  CREATE INDEX "home_settings_photos_photos_hero_idx" ON "home_settings" USING btree ("photos_hero_id");
  CREATE INDEX "home_settings_photos_photos_live_idx" ON "home_settings" USING btree ("photos_live_id");
  CREATE INDEX "home_settings_photos_photos_portrait_idx" ON "home_settings" USING btree ("photos_portrait_id");
  CREATE INDEX "home_settings_photos_photos_social_idx" ON "home_settings" USING btree ("photos_social_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "home_settings" ALTER COLUMN "showreel_visible" SET DEFAULT false;
  ALTER TABLE "home_settings" ALTER COLUMN "testimonials_visible" SET DEFAULT false;
  ALTER TABLE "home_settings" ALTER COLUMN "trust_strip_visible" SET DEFAULT false;
   ALTER TABLE "analytics_daily" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_settings_experience_moments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_settings_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_settings_repertoire_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_settings_process" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "analytics_daily" CASCADE;
  DROP TABLE "pages_sections" CASCADE;
  DROP TABLE "pages_faqs" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_sections" CASCADE;
  DROP TABLE "_pages_v_version_faqs" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "home_settings_experience_moments" CASCADE;
  DROP TABLE "home_settings_events" CASCADE;
  DROP TABLE "home_settings_repertoire_categories" CASCADE;
  DROP TABLE "home_settings_process" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_analytics_daily_fk";
  
  ALTER TABLE "home_settings" DROP CONSTRAINT "home_settings_seo_image_id_media_id_fk";
  
  ALTER TABLE "home_settings" DROP CONSTRAINT "home_settings_photos_hero_id_media_id_fk";
  
  ALTER TABLE "home_settings" DROP CONSTRAINT "home_settings_photos_live_id_media_id_fk";
  
  ALTER TABLE "home_settings" DROP CONSTRAINT "home_settings_photos_portrait_id_media_id_fk";
  
  ALTER TABLE "home_settings" DROP CONSTRAINT "home_settings_photos_social_id_media_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_analytics_daily_id_idx";
  DROP INDEX "home_settings_seo_seo_image_idx";
  DROP INDEX "home_settings_photos_photos_hero_idx";
  DROP INDEX "home_settings_photos_photos_live_idx";
  DROP INDEX "home_settings_photos_photos_portrait_idx";
  DROP INDEX "home_settings_photos_photos_social_idx";
  ALTER TABLE "inquiries" DROP COLUMN "selected_package_name";
  ALTER TABLE "pages" DROP COLUMN "page_type";
  ALTER TABLE "pages" DROP COLUMN "excerpt";
  ALTER TABLE "pages" DROP COLUMN "service_area";
  ALTER TABLE "pages" DROP COLUMN "show_packages";
  ALTER TABLE "pages" DROP COLUMN "cta_label";
  ALTER TABLE "pages" DROP COLUMN "seo_canonical";
  ALTER TABLE "pages" DROP COLUMN "seo_noindex";
  ALTER TABLE "pages_locales" DROP COLUMN "seo_og_title";
  ALTER TABLE "pages_locales" DROP COLUMN "seo_og_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_page_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_pages_v" DROP COLUMN "version_service_area";
  ALTER TABLE "_pages_v" DROP COLUMN "version_show_packages";
  ALTER TABLE "_pages_v" DROP COLUMN "version_cta_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_canonical";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_noindex";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_seo_og_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_seo_og_description";
  ALTER TABLE "services" DROP COLUMN "set_count";
  ALTER TABLE "services" DROP COLUMN "duration";
  ALTER TABLE "services" DROP COLUMN "currency";
  ALTER TABLE "services" DROP COLUMN "from_pricing";
  ALTER TABLE "services" DROP COLUMN "featured";
  ALTER TABLE "_services_v" DROP COLUMN "version_set_count";
  ALTER TABLE "_services_v" DROP COLUMN "version_duration";
  ALTER TABLE "_services_v" DROP COLUMN "version_currency";
  ALTER TABLE "_services_v" DROP COLUMN "version_from_pricing";
  ALTER TABLE "_services_v" DROP COLUMN "version_featured";
  ALTER TABLE "media_locales" DROP COLUMN "caption";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "analytics_daily_id";
  ALTER TABLE "site_settings" DROP COLUMN "email";
  ALTER TABLE "site_settings" DROP COLUMN "biography";
  ALTER TABLE "site_settings" DROP COLUMN "analytics_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "google_verification";
  ALTER TABLE "site_settings" DROP COLUMN "bing_verification";
  ALTER TABLE "home_settings" DROP COLUMN "seo_canonical";
  ALTER TABLE "home_settings" DROP COLUMN "seo_noindex";
  ALTER TABLE "home_settings" DROP COLUMN "seo_image_id";
  ALTER TABLE "home_settings" DROP COLUMN "hero_accent";
  ALTER TABLE "home_settings" DROP COLUMN "availability_label";
  ALTER TABLE "home_settings" DROP COLUMN "quote_label";
  ALTER TABLE "home_settings" DROP COLUMN "experience_title";
  ALTER TABLE "home_settings" DROP COLUMN "experience_text";
  ALTER TABLE "home_settings" DROP COLUMN "events_title";
  ALTER TABLE "home_settings" DROP COLUMN "repertoire_title";
  ALTER TABLE "home_settings" DROP COLUMN "repertoire_text";
  ALTER TABLE "home_settings" DROP COLUMN "packages_title";
  ALTER TABLE "home_settings" DROP COLUMN "pricing_note";
  ALTER TABLE "home_settings" DROP COLUMN "process_title";
  ALTER TABLE "home_settings" DROP COLUMN "about_title";
  ALTER TABLE "home_settings" DROP COLUMN "faq_title";
  ALTER TABLE "home_settings" DROP COLUMN "booking_title";
  ALTER TABLE "home_settings" DROP COLUMN "booking_text";
  ALTER TABLE "home_settings" DROP COLUMN "photos_hero_id";
  ALTER TABLE "home_settings" DROP COLUMN "photos_live_id";
  ALTER TABLE "home_settings" DROP COLUMN "photos_portrait_id";
  ALTER TABLE "home_settings" DROP COLUMN "photos_social_id";
  ALTER TABLE "home_settings_locales" DROP COLUMN "seo_title";
  ALTER TABLE "home_settings_locales" DROP COLUMN "seo_description";
  ALTER TABLE "home_settings_locales" DROP COLUMN "seo_og_title";
  ALTER TABLE "home_settings_locales" DROP COLUMN "seo_og_description";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum__pages_v_version_page_type";
  DROP TYPE "public"."enum_services_currency";
  DROP TYPE "public"."enum__services_v_version_currency";
  DROP TYPE "public"."enum_home_settings_events_event_type";`)
}
