-- Add location fields to professional_profiles
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_province text;

-- Optional: backfill from profiles for existing rows where empty
UPDATE public.professional_profiles pp
SET location_city = p.location_city,
    location_province = p.location_province
FROM public.profiles p
WHERE pp.user_id = p.user_id
  AND (pp.location_city IS NULL OR pp.location_province IS NULL);

-- Grant select to anon/authenticated if needed (depending on existing policies)

