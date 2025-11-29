-- Ensure public-images bucket exists and configure RLS
-- First, ensure the bucket exists (this will not error if it already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-images', 'public-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Public read access for public images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload service request images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update service request images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete service request images" ON storage.objects;

-- Public read access for public-images
CREATE POLICY "Public read access for public images"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'public-images');

-- Authenticated users can insert to public-images/service-requests/
-- Note: No path restriction on user_id, just require authentication
CREATE POLICY "Authenticated users can upload service request images"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'public-images' 
  AND auth.uid() IS NOT NULL 
  AND (name LIKE 'service-requests/%')
);

-- Users can update images in public-images/service-requests/
CREATE POLICY "Users can update service request images"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'public-images' 
  AND auth.uid() IS NOT NULL 
  AND (name LIKE 'service-requests/%')
);

-- Users can delete images in public-images/service-requests/
CREATE POLICY "Users can delete service request images"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'public-images' 
  AND auth.uid() IS NOT NULL 
  AND (name LIKE 'service-requests/%')
);
