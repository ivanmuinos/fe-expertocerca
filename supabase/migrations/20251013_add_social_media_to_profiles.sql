-- Add social media URL columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN public.profiles.facebook_url IS 'Facebook profile URL';
COMMENT ON COLUMN public.profiles.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.twitter_url IS 'Twitter/X profile URL';
COMMENT ON COLUMN public.profiles.website_url IS 'Personal or business website URL';
