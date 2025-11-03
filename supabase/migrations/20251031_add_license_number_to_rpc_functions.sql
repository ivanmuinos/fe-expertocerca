-- Update RPC functions to include license_number field
-- This allows the frontend to display "Matriculado" badge for licensed professionals

-- Drop existing functions first to avoid type conflicts
DROP FUNCTION IF EXISTS public.discover_professionals();
DROP FUNCTION IF EXISTS public.browse_professionals();

-- Recreate discover_professionals with license_number
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
  main_portfolio_image text,
  license_number text
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
    (p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    pp.main_portfolio_image,
    pp.license_number
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;

-- Recreate browse_professionals with license_number
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
  license_number text
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
    (p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    p.whatsapp_phone as whatsapp_phone,
    pp.hourly_rate,
    pp.main_portfolio_image,
    pp.license_number
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;
