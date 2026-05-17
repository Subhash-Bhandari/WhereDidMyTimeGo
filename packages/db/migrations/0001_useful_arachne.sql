CREATE TABLE "category_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"keyword" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"label" varchar(80) NOT NULL,
	"title" text NOT NULL,
	"category_id" integer,
	"duration_minutes" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "category_keywords" ADD CONSTRAINT "category_keywords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_keywords" ADD CONSTRAINT "category_keywords_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_templates" ADD CONSTRAINT "entry_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_templates" ADD CONSTRAINT "entry_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "category_keywords_user_keyword_idx" ON "category_keywords" USING btree ("user_id","keyword");--> statement-breakpoint
CREATE INDEX "category_keywords_user_category_idx" ON "category_keywords" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "entry_templates_user_id_idx" ON "entry_templates" USING btree ("user_id");