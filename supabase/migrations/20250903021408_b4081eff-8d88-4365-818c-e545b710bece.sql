-- Fix security issue: Allow public discovery of professional profiles
-- Add public SELECT policy to professional_profiles table to enable marketplace functionality

CREATE POLICY "Anyone can view professional profiles for discovery" 
ON public.professional_profiles 
FOR SELECT 
USING (
  -- Allow public access to professional profiles where onboarding is completed
  EXISTS (
    SELECT 1 
    FROM public.profiles p 
    WHERE p.user_id = professional_profiles.user_id 
    AND p.onboarding_completed = true
  )
);