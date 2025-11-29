-- Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  location_city TEXT NOT NULL,
  location_province TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON public.service_requests(category);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_location_city ON public.service_requests(location_city);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view open service requests
CREATE POLICY "Anyone can view open service requests"
  ON public.service_requests
  FOR SELECT
  USING (status = 'open' OR auth.uid() = user_id);

-- Authenticated users can create service requests
CREATE POLICY "Authenticated users can create service requests"
  ON public.service_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own service requests
CREATE POLICY "Users can update their own service requests"
  ON public.service_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own service requests
CREATE POLICY "Users can delete their own service requests"
  ON public.service_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT ON public.service_requests TO anon;
GRANT ALL ON public.service_requests TO authenticated;
