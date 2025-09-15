-- Fix discover_professionals and browse_professionals functions to return correct avatars

-- Drop and recreate discover_professionals function
DROP FUNCTION IF EXISTS public.discover_professionals();

CREATE OR REPLACE FUNCTION public.discover_professionals()
RETURNS TABLE (
  id uuid,
  trade_name text,
  description text,
  years_experience integer,
  user_id uuid,
  profile_full_name text,
  profile_location_city text,
  profile_location_province text,
  profile_skills text[],
  profile_avatar_url text,
  has_contact_info boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    pp.id,
    pp.trade_name,
    pp.description,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    p.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    -- Indicate if contact info is available without exposing it
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true;
$$;

-- Drop and recreate browse_professionals function  
DROP FUNCTION IF EXISTS public.browse_professionals();

CREATE OR REPLACE FUNCTION public.browse_professionals()
RETURNS TABLE (
  id uuid,
  trade_name text,
  description text,
  years_experience integer,
  user_id uuid,
  profile_full_name text,
  profile_location_city text,
  profile_location_province text,
  profile_skills text[],
  profile_avatar_url text,
  has_contact_info boolean,
  whatsapp_phone text,
  hourly_rate numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    pp.id,
    pp.trade_name,
    pp.description,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    p.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    -- Indicate if contact info is available
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    -- Include contact info for authenticated users
    COALESCE(pp.whatsapp_phone, p.whatsapp_phone) as whatsapp_phone,
    pp.hourly_rate
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true;
$$;