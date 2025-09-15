-- Extend profiles table for onboarding flow
ALTER TABLE public.profiles 
ADD COLUMN full_name TEXT,
ADD COLUMN role TEXT CHECK (role IN ('cliente', 'proveedor')),
ADD COLUMN location_province TEXT,
ADD COLUMN location_city TEXT,
ADD COLUMN bio TEXT,
ADD COLUMN skills TEXT[],
ADD COLUMN portfolio_images TEXT[],
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- Update the handle_new_user function to support onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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