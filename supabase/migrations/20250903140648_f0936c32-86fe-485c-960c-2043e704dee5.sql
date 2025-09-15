-- Security fixes migration

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

-- 3. Create storage policies for portfolio bucket
CREATE POLICY "Public read access for portfolio images"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio');

CREATE POLICY "Users can insert their own portfolio images"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'portfolio' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can update their own portfolio images"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'portfolio' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can delete their own portfolio images"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'portfolio' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE (auth.uid()::text || '/%')
);

-- 4. Create secure function for reviews with reviewer names
CREATE OR REPLACE FUNCTION public.get_reviews_with_names(_professional_profile_id uuid)
RETURNS TABLE(
  id uuid,
  professional_profile_id uuid,
  reviewer_user_id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  updated_at timestamptz,
  reviewer_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

-- 5. Enable DELETE for professional_profiles
CREATE POLICY "Users can delete their own professional profile"
ON public.professional_profiles
FOR DELETE
USING (auth.uid() = user_id);