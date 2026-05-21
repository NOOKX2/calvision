CREATE TABLE "meal_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"food_name" text,
	"protein_g" real NOT NULL,
	"carbs_g" real NOT NULL,
	"fat_g" real NOT NULL,
	"kcal" integer NOT NULL,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"sex" text NOT NULL,
	"age" integer NOT NULL,
	"weight_kg" real NOT NULL,
	"height_cm" real NOT NULL,
	"activity_level" text NOT NULL,
	"goal" text NOT NULL,
	"tdee" integer NOT NULL,
	"target_kcal" integer NOT NULL,
	"target_protein_g" real NOT NULL,
	"target_carbs_g" real NOT NULL,
	"target_fat_g" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;