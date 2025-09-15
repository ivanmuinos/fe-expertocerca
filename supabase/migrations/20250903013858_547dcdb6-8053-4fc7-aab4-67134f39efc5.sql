-- Add public SELECT policy for professional profiles discovery
-- This allows customers to browse available professionals while maintaining security

CREATE POLICY "Anyone can view published professional profiles"
ON public.professional_profiles
FOR SELECT
USING (
  -- Only show profiles that have completed onboarding
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = professional_profiles.user_id 
    AND p.onboarding_completed = true
  )
);