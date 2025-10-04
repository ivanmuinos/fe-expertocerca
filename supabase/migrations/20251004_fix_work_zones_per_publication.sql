-- Drop existing functions first
DROP FUNCTION IF EXISTS public.browse_professionals();
DROP FUNCTION IF EXISTS public.discover_professionals();

-- Update browse_professionals to get work zones from professional_work_zones instead of profiles
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
  main_portfolio_image text,
  work_zone_id uuid,
  work_zone_name text
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

-- Update discover_professionals to get work zones from professional_work_zones instead of profiles
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
  whatsapp_phone text,
  hourly_rate numeric,
  main_portfolio_image text,
  work_zone_id uuid,
  work_zone_name text
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

