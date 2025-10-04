-- Allow public read access to profiles table
-- This is needed for displaying professional information on their public pages

-- Drop the restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;

-- Create policies that allow:
-- 1. Users can view their own profiles
CREATE POLICY "Users can view their own profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Anyone can view basic profile info (for professional listings)
CREATE POLICY "Public profiles are viewable by anyone"
  ON public.profiles FOR SELECT
  USING (true);
