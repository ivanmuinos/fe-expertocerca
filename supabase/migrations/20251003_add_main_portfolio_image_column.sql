-- Add main_portfolio_image column to professional_profiles table
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS main_portfolio_image text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_professional_profiles_main_portfolio_image
ON professional_profiles(main_portfolio_image);

-- Update existing records to set their first portfolio photo as main image
UPDATE professional_profiles pp
SET main_portfolio_image = (
  SELECT pf.image_url
  FROM portfolio_photos pf
  WHERE pf.professional_profile_id = pp.id
  ORDER BY pf.created_at ASC
  LIMIT 1
)
WHERE pp.main_portfolio_image IS NULL;

-- Update discover_professionals function to use the column
CREATE OR REPLACE FUNCTION public.discover_professionals()
RETURNS TABLE(
  id uuid,
  trade_name text,
  description text,
  specialty text,
  years_experience integer,
  user_id uuid,
  profile_full_name text,
  profile_location_city text,
  profile_location_province text,
  profile_skills text[],
  profile_avatar_url text,
  has_contact_info boolean,
  main_portfolio_image text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pp.id,
    pp.trade_name,
    pp.description,
    pp.specialty,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    pp.main_portfolio_image
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;

-- Update browse_professionals function to use the column
CREATE OR REPLACE FUNCTION public.browse_professionals()
RETURNS TABLE(
  id uuid,
  trade_name text,
  description text,
  specialty text,
  years_experience integer,
  user_id uuid,
  profile_full_name text,
  profile_location_city text,
  profile_location_province text,
  profile_skills text[],
  profile_avatar_url text,
  has_contact_info boolean,
  whatsapp_phone text,
  hourly_rate numeric,
  main_portfolio_image text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pp.id,
    pp.trade_name,
    pp.description,
    pp.specialty,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    COALESCE(pp.whatsapp_phone, p.whatsapp_phone) as whatsapp_phone,
    pp.hourly_rate,
    pp.main_portfolio_image
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;
