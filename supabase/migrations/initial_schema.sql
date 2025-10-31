

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."browse_professionals"() RETURNS TABLE("id" "uuid", "trade_name" "text", "description" "text", "specialty" "text", "years_experience" integer, "user_id" "uuid", "profile_full_name" "text", "profile_location_city" "text", "profile_location_province" "text", "profile_skills" "text"[], "profile_avatar_url" "text", "has_contact_info" boolean, "whatsapp_phone" "text", "hourly_rate" numeric, "main_portfolio_image" "text", "work_zone_id" "uuid", "work_zone_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    pp.id,
    pp.trade_name,
    pp.description,
    pp.specialty,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    -- Show professional profile location (saved per publication)
    pp.location_city as profile_location_city,
    pp.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    COALESCE(pp.whatsapp_phone, p.whatsapp_phone) as whatsapp_phone,
    pp.hourly_rate,
    pp.main_portfolio_image,
    pwz.work_zone_id,
    wz.name as work_zone_name
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  LEFT JOIN professional_work_zones pwz ON pp.id = pwz.professional_profile_id
  LEFT JOIN work_zones wz ON pwz.work_zone_id = wz.id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true
    AND auth.uid() IS NOT NULL;
$$;


ALTER FUNCTION "public"."browse_professionals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."discover_professionals"() RETURNS TABLE("id" "uuid", "trade_name" "text", "description" "text", "specialty" "text", "years_experience" integer, "user_id" "uuid", "profile_full_name" "text", "profile_location_city" "text", "profile_location_province" "text", "profile_skills" "text"[], "profile_avatar_url" "text", "has_contact_info" boolean, "whatsapp_phone" "text", "hourly_rate" numeric, "main_portfolio_image" "text", "work_zone_id" "uuid", "work_zone_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    pp.id,
    pp.trade_name,
    pp.description,
    pp.specialty,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    -- Show professional profile location (saved per publication)
    pp.location_city as profile_location_city,
    pp.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    NULL::text as whatsapp_phone, -- Hide contact info for discovery
    pp.hourly_rate,
    pp.main_portfolio_image,
    pwz.work_zone_id,
    wz.name as work_zone_name
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  LEFT JOIN professional_work_zones pwz ON pp.id = pwz.professional_profile_id
  LEFT JOIN work_zones wz ON pwz.work_zone_id = wz.id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;


ALTER FUNCTION "public"."discover_professionals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_reviews_with_names"("_professional_profile_id" "uuid") RETURNS TABLE("id" "uuid", "professional_profile_id" "uuid", "reviewer_user_id" "uuid", "rating" integer, "comment" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "reviewer_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    r.id,
    r.professional_profile_id,
    r.reviewer_user_id,
    r.rating,
    r.comment,
    r.created_at,
    r.updated_at,
    COALESCE(p.full_name, 'Usuario anónimo') as reviewer_name
  FROM reviews r
  LEFT JOIN profiles p ON r.reviewer_user_id = p.user_id
  WHERE r.professional_profile_id = _professional_profile_id
  ORDER BY r.created_at DESC;
$$;


ALTER FUNCTION "public"."get_reviews_with_names"("_professional_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    first_name,
    last_name,
    avatar_url,
    onboarding_completed
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'given_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'family_name', null),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    FALSE
  ) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_minimal"("_full_name" "text", "_phone" "text", "_avatar_url" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.profiles
  set full_name = coalesce(_full_name, full_name),
      phone = coalesce(_phone, phone),
      updated_at = now(),
      avatar_url = coalesce(_avatar_url, avatar_url)
  where user_id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."update_profile_minimal"("_full_name" "text", "_phone" "text", "_avatar_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_whatsapp"("_whatsapp_phone" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.profiles
  set whatsapp_phone = coalesce(_whatsapp_phone, whatsapp_phone),
      updated_at = now()
  where user_id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."update_profile_whatsapp"("_whatsapp_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."portfolio_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_profile_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."portfolio_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professional_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trade_name" "text" NOT NULL,
    "description" "text",
    "years_experience" integer DEFAULT 0,
    "work_phone" "text",
    "hourly_rate" numeric(10,2),
    "availability_schedule" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "whatsapp_phone" "text",
    "user_type" "text",
    "specialty" "text" NOT NULL,
    "skills" "text"[],
    "working_days" "text"[],
    "working_hours_start" time without time zone,
    "working_hours_end" time without time zone,
    "accepts_weekend_work" boolean DEFAULT false,
    "emergency_available" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "accepts_new_clients" boolean DEFAULT true,
    "minimum_project_value" numeric(10,2),
    "travel_radius_km" integer,
    "main_portfolio_image" "text",
    "specialty_category" "text",
    "location_city" "text",
    "location_province" "text",
    CONSTRAINT "check_description_length" CHECK (("length"("description") <= 2000)),
    CONSTRAINT "check_work_phone_length" CHECK (("length"("work_phone") <= 20))
);


ALTER TABLE "public"."professional_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."professional_profiles" IS 'Stores professional profiles for users. Users can have multiple profiles (publications) for different services they offer.';



COMMENT ON COLUMN "public"."professional_profiles"."user_type" IS 'Customer or Professional';



CREATE TABLE IF NOT EXISTS "public"."professional_work_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_profile_id" "uuid",
    "work_zone_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."professional_work_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text",
    "first_name" "text",
    "last_name" "text",
    "avatar_url" "text",
    "location_city" "text",
    "location_province" "text",
    "phone" "text",
    "whatsapp_phone" "text",
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_type" "text",
    "facebook_url" "text",
    "instagram_url" "text",
    "linkedin_url" "text",
    "twitter_url" "text",
    "website_url" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."facebook_url" IS 'Facebook profile URL';



COMMENT ON COLUMN "public"."profiles"."instagram_url" IS 'Instagram profile URL';



COMMENT ON COLUMN "public"."profiles"."linkedin_url" IS 'LinkedIn profile URL';



COMMENT ON COLUMN "public"."profiles"."twitter_url" IS 'Twitter/X profile URL';



COMMENT ON COLUMN "public"."profiles"."website_url" IS 'Personal or business website URL';



CREATE TABLE IF NOT EXISTS "public"."provinces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."provinces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "professional_profile_id" "uuid" NOT NULL,
    "reviewer_user_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "province_id" "uuid",
    "zone_type" "text" DEFAULT 'region'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."work_zones" OWNER TO "postgres";


ALTER TABLE ONLY "public"."portfolio_photos"
    ADD CONSTRAINT "portfolio_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_profiles"
    ADD CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_work_zones"
    ADD CONSTRAINT "professional_work_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_work_zones"
    ADD CONSTRAINT "professional_work_zones_professional_profile_id_work_zone_i_key" UNIQUE ("professional_profile_id", "work_zone_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_professional_profile_id_reviewer_user_id_key" UNIQUE ("professional_profile_id", "reviewer_user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."work_zones"
    ADD CONSTRAINT "work_zones_name_province_id_key" UNIQUE ("name", "province_id");



ALTER TABLE ONLY "public"."work_zones"
    ADD CONSTRAINT "work_zones_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_professional_profiles_main_portfolio_image" ON "public"."professional_profiles" USING "btree" ("main_portfolio_image");



CREATE INDEX "idx_professional_profiles_specialty" ON "public"."professional_profiles" USING "btree" ("specialty");



CREATE INDEX "idx_professional_profiles_specialty_category" ON "public"."professional_profiles" USING "btree" ("specialty_category");



CREATE INDEX "idx_professional_profiles_user_id" ON "public"."professional_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_user_type" ON "public"."profiles" USING "btree" ("user_type");



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_portfolio_photos_updated_at" BEFORE UPDATE ON "public"."portfolio_photos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_professional_profiles_updated_at" BEFORE UPDATE ON "public"."professional_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reviews_updated_at" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."professional_profiles"
    ADD CONSTRAINT "professional_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_work_zones"
    ADD CONSTRAINT "professional_work_zones_professional_profile_id_fkey" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professional_work_zones"
    ADD CONSTRAINT "professional_work_zones_work_zone_id_fkey" FOREIGN KEY ("work_zone_id") REFERENCES "public"."work_zones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_zones"
    ADD CONSTRAINT "work_zones_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can view all roles" ON "public"."user_roles" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Anyone can view portfolio photos" ON "public"."portfolio_photos" FOR SELECT USING (true);



CREATE POLICY "Anyone can view provinces" ON "public"."provinces" FOR SELECT USING (true);



CREATE POLICY "Anyone can view reviews" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Anyone can view work zones" ON "public"."work_zones" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create reviews" ON "public"."reviews" FOR INSERT WITH CHECK ((("auth"."uid"() = "reviewer_user_id") AND ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Owners can update their professional profile" ON "public"."professional_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Professional owners can delete their portfolio photos" ON "public"."portfolio_photos" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."professional_profiles" "pp"
  WHERE (("pp"."id" = "portfolio_photos"."professional_profile_id") AND ("pp"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Professional owners can insert portfolio photos" ON "public"."portfolio_photos" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."professional_profiles" "pp"
  WHERE (("pp"."id" = "portfolio_photos"."professional_profile_id") AND ("pp"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Professional owners can update their portfolio photos" ON "public"."portfolio_photos" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."professional_profiles" "pp"
  WHERE (("pp"."id" = "portfolio_photos"."professional_profile_id") AND ("pp"."user_id" = "auth"."uid"())))))) WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."professional_profiles" "pp"
  WHERE (("pp"."id" = "portfolio_photos"."professional_profile_id") AND ("pp"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Public profiles are viewable by anyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can delete their own professional profile" ON "public"."professional_profiles" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own reviews" ON "public"."reviews" FOR DELETE USING ((("auth"."uid"() = "reviewer_user_id") AND ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Users can insert their own professional profile" ON "public"."professional_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own work zones" ON "public"."professional_work_zones" USING ((EXISTS ( SELECT 1
   FROM "public"."professional_profiles" "pp"
  WHERE (("pp"."id" = "professional_work_zones"."professional_profile_id") AND ("pp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own professional profile" ON "public"."professional_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE USING ((("auth"."uid"() = "reviewer_user_id") AND ("auth"."uid"() IS NOT NULL))) WITH CHECK ((("auth"."uid"() = "reviewer_user_id") AND ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Users can view their own professional profile" ON "public"."professional_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profiles" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own work zones" ON "public"."professional_work_zones" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."professional_profiles" "pp"
  WHERE (("pp"."id" = "professional_work_zones"."professional_profile_id") AND ("pp"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."portfolio_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professional_work_zones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."provinces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_zones" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."browse_professionals"() TO "anon";
GRANT ALL ON FUNCTION "public"."browse_professionals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."browse_professionals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."discover_professionals"() TO "anon";
GRANT ALL ON FUNCTION "public"."discover_professionals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."discover_professionals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reviews_with_names"("_professional_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_reviews_with_names"("_professional_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reviews_with_names"("_professional_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_minimal"("_full_name" "text", "_phone" "text", "_avatar_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_minimal"("_full_name" "text", "_phone" "text", "_avatar_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_minimal"("_full_name" "text", "_phone" "text", "_avatar_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_whatsapp"("_whatsapp_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_whatsapp"("_whatsapp_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_whatsapp"("_whatsapp_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."portfolio_photos" TO "anon";
GRANT ALL ON TABLE "public"."portfolio_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio_photos" TO "service_role";



GRANT ALL ON TABLE "public"."professional_profiles" TO "anon";
GRANT ALL ON TABLE "public"."professional_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."professional_work_zones" TO "anon";
GRANT ALL ON TABLE "public"."professional_work_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_work_zones" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."provinces" TO "anon";
GRANT ALL ON TABLE "public"."provinces" TO "authenticated";
GRANT ALL ON TABLE "public"."provinces" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."work_zones" TO "anon";
GRANT ALL ON TABLE "public"."work_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."work_zones" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























