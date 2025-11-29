-- Fix foreign key relationship for service_requests to use profiles instead of auth.users
-- This allows PostgREST to properly join service_requests with profiles

-- Drop the existing foreign key constraint
ALTER TABLE public.service_requests
  DROP CONSTRAINT IF EXISTS service_requests_user_id_fkey;

ALTER TABLE public.service_requests
  DROP CONSTRAINT IF EXISTS fk_service_requests_user_id;

-- Add new foreign key constraint pointing to profiles.user_id
ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;
