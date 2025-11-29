-- Add user_id column and foreign key to service_requests
-- This migration adds a UUID column referencing the auth.users table
-- and updates RLS policies to allow users to access their own requests.

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Add foreign key constraint (optional, for data integrity)
ALTER TABLE public.service_requests
  ADD CONSTRAINT fk_service_requests_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to allow authenticated users to select, insert, update, delete their own requests
DROP POLICY IF EXISTS "Select own service requests" ON public.service_requests;
CREATE POLICY "Select own service requests"
  ON public.service_requests
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Insert own service requests" ON public.service_requests;
CREATE POLICY "Insert own service requests"
  ON public.service_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Update own service requests" ON public.service_requests;
CREATE POLICY "Update own service requests"
  ON public.service_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delete own service requests" ON public.service_requests;
CREATE POLICY "Delete own service requests"
  ON public.service_requests
  FOR DELETE
  USING (auth.uid() = user_id);
