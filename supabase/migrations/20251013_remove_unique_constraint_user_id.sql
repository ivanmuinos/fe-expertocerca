-- Remove UNIQUE constraint from user_id in professional_profiles to allow multiple publications per user
-- This allows users to have multiple professional profiles (publications)

-- First, drop the existing unique constraint
ALTER TABLE public.professional_profiles
  DROP CONSTRAINT IF EXISTS professional_profiles_user_id_key;

-- Verify the foreign key constraint still exists (should not be dropped)
-- The foreign key ensures referential integrity but doesn't prevent multiple rows per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'professional_profiles_user_id_fkey'
    AND table_name = 'professional_profiles'
  ) THEN
    ALTER TABLE public.professional_profiles
      ADD CONSTRAINT professional_profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add an index on user_id for performance (since we removed the unique constraint which was also an index)
CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id
  ON public.professional_profiles(user_id);

-- Add a comment to document this change
COMMENT ON TABLE public.professional_profiles IS 'Stores professional profiles for users. Users can have multiple profiles (publications) for different services they offer.';
