-- COPY AND PASTE THIS ENTIRE FILE IN SUPABASE SQL EDITOR
-- This updates RPC functions to use whatsapp_phone from profiles table as source of truth

-- Update discover_professionals function
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
    (p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    pp.main_portfolio_image
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;

-- Update browse_professionals function
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
    (p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    p.whatsapp_phone as whatsapp_phone,
    pp.hourly_rate,
    pp.main_portfolio_image
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;

