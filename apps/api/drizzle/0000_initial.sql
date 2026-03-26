CREATE TYPE "public"."booking_status" AS ENUM('confirmed');

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "full_name" text NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "bookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "session_start" timestamp with time zone NOT NULL,
  "session_end" timestamp with time zone NOT NULL,
  "duration_minutes" integer NOT NULL,
  "timezone" text NOT NULL,
  "status" "booking_status" DEFAULT 'confirmed' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade
);

CREATE UNIQUE INDEX IF NOT EXISTS "bookings_unique_session_start" ON "bookings" ("session_start");
