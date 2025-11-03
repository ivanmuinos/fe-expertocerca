-- Complete migration to add professional license number functionality
-- This allows professionals to register their official license number (matricula)
-- Common for electricians, plumbers, gas technicians, HVAC technicians, etc. in Argentina

-- Step 1: Add license_number column to professional_profiles table
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS license_number TEXT;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN public.professional_profiles.license_number IS 'Professional license number (matricula profesional) for regulated professions in Argentina';

-- Step 2: Update RPC functions to include license_number field
-- Drop existing functions first to avoid type conflicts
DROP FUNCTION IF EXISTS public.discover_professionals();
DROP FUNCTION IF EXISTS public.browse_professionals();

-- Recreate discover_professionals with license_number and work_zone
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
  work_zone_name text,
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
    pp.location_city as profile_location_city,
    pp.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    NULL::text as whatsapp_phone,
    pp.hourly_rate,
    pp.main_portfolio_image,
    pwz.work_zone_id,
    wz.name as work_zone_name,
    pp.license_number
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  LEFT JOIN professional_work_zones pwz ON pp.id = pwz.professional_profile_id
  LEFT JOIN work_zones wz ON pwz.work_zone_id = wz.id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;

-- Recreate browse_professionals with license_number and work_zone
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
  work_zone_name text,
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
    pp.location_city as profile_location_city,
    pp.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    COALESCE(pp.whatsapp_phone, p.whatsapp_phone) as whatsapp_phone,
    pp.hourly_rate,
    pp.main_portfolio_image,
    pwz.work_zone_id,
    wz.name as work_zone_name,
    pp.license_number
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  LEFT JOIN professional_work_zones pwz ON pp.id = pwz.professional_profile_id
  LEFT JOIN work_zones wz ON pwz.work_zone_id = wz.id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true
    AND auth.uid() IS NOT NULL;
$$;
