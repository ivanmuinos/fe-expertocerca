-- Remove the overly permissive public policy that exposes phone numbers
DROP POLICY IF EXISTS "Anyone can view published professional profiles" ON public.professional_profiles;

-- Create a more secure function for public professional discovery
-- This function will only expose safe information and mask sensitive data
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
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE p.onboarding_completed = true
$function$;

-- Keep the existing browse_professionals function for authenticated access
-- But make it more secure by restricting to authenticated users only
CREATE OR REPLACE FUNCTION public.browse_professionals()
 RETURNS TABLE(
   id uuid, 
   trade_name text, 
   description text, 
   years_experience integer, 
   whatsapp_phone text,
   user_id uuid,
   profile_full_name text, 
   profile_location_city text, 
   profile_location_province text, 
   profile_skills text[], 
   profile_avatar_url text
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Only return contact info if user is authenticated
  SELECT 
    pp.id,
    pp.trade_name,
    pp.description,
    pp.years_experience,
    CASE 
      WHEN auth.uid() IS NOT NULL THEN COALESCE(pp.whatsapp_phone, p.whatsapp_phone, p.phone)
      ELSE NULL
    END as whatsapp_phone,
    pp.user_id,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    p.skills as profile_skills,
    p.avatar_url as profile_avatar_url
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
$function$;