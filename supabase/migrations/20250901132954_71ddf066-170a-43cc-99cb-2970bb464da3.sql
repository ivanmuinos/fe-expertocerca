-- Fix 1: Update handle_new_user function to be VOLATILE to fix Google auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, full_name, onboarding_completed)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CONCAT(
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
    ),
    false
  );
  RETURN NEW;
END;
$function$;

-- Fix 2: Remove public SELECT access from professional_profiles
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.professional_profiles;

-- Fix 3: Create user roles system for future use
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 4: Create public RPC function to browse professionals (only non-sensitive data)
CREATE OR REPLACE FUNCTION public.browse_professionals()
RETURNS TABLE (
  id uuid,
  trade_name text,
  description text,
  years_experience integer,
  profile_full_name text,
  profile_location_city text,
  profile_location_province text,
  profile_skills text[],
  profile_avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pp.id,
    pp.trade_name,
    pp.description,
    pp.years_experience,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    p.skills as profile_skills,
    p.avatar_url as profile_avatar_url
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
$$;

-- Fix 5: Add length constraints for data validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_bio_length CHECK (length(bio) <= 1000);

ALTER TABLE public.professional_profiles 
ADD CONSTRAINT check_description_length CHECK (length(description) <= 2000),
ADD CONSTRAINT check_work_phone_length CHECK (length(work_phone) <= 20);