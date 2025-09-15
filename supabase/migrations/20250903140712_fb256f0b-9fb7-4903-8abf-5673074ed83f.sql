-- Security fixes migration - Part 1: Remove public policy and harden RPC functions

-- 1. Remove public SELECT policy on professional_profiles (keeps phone data private)
DROP POLICY IF EXISTS "Anyone can view professional profiles for discovery" ON public.professional_profiles;

-- 2. Harden RPC functions with proper search_path
CREATE OR REPLACE FUNCTION public.discover_professionals()
RETURNS TABLE(
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
SET search_path = public
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
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true;
$$;

CREATE OR REPLACE FUNCTION public.browse_professionals()
RETURNS TABLE(
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
SET search_path = public
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
    (pp.whatsapp_phone IS NOT NULL OR pp.work_phone IS NOT NULL OR p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    COALESCE(pp.whatsapp_phone, p.whatsapp_phone) as whatsapp_phone,
    pp.hourly_rate
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND auth.uid() IS NOT NULL; -- Require authentication
$$;