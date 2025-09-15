-- Update the browse_professionals function to use profile phone as fallback for whatsapp
DROP FUNCTION IF EXISTS public.browse_professionals();

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
  SELECT 
    pp.id,
    pp.trade_name,
    pp.description,
    pp.years_experience,
    COALESCE(pp.whatsapp_phone, p.whatsapp_phone, p.phone) as whatsapp_phone,
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