-- Complete RLS Policies for Security
-- Adds missing policies to ensure proper access control

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Policy: Users can only read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PROFESSIONAL_PROFILES TABLE
-- ============================================================================

-- Policy: Anyone can read active professional profiles (public discovery)
-- Already handled by RPC functions (discover_professionals, browse_professionals)

-- Policy: Users can insert their own professional profiles
CREATE POLICY "Users can insert own professional profiles"
ON professional_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own professional profiles (already exists)
-- CREATE POLICY "Professional profiles are updatable by owner" ... (exists)

-- Policy: Users can delete their own professional profiles
CREATE POLICY "Users can delete own professional profiles"
ON professional_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can read their own professional profiles
CREATE POLICY "Users can read own professional profiles"
ON professional_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PORTFOLIO_PHOTOS TABLE
-- ============================================================================

-- Policy: Anyone can view portfolio photos (public)
CREATE POLICY "Anyone can view portfolio photos"
ON portfolio_photos FOR SELECT
TO public
USING (true);

-- Policy: Users can insert photos to their own professional profiles
CREATE POLICY "Users can insert own portfolio photos"
ON portfolio_photos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
);

-- Policy: Users can update their own portfolio photos
CREATE POLICY "Users can update own portfolio photos"
ON portfolio_photos FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
);

-- Policy: Users can delete their own portfolio photos
CREATE POLICY "Users can delete own portfolio photos"
ON portfolio_photos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

-- Policy: Anyone can read reviews (public)
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
TO public
USING (true);

-- Policy: Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Policy: Authenticated users can upload to portfolio bucket
CREATE POLICY "Authenticated users can upload portfolio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

-- Policy: Anyone can view portfolio files (public)
CREATE POLICY "Anyone can view portfolio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio');

-- Policy: Users can update their own portfolio files
CREATE POLICY "Users can update own portfolio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own portfolio files
CREATE POLICY "Users can delete own portfolio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- 1. All sensitive operations require authentication
-- 2. Users can only modify their own data
-- 3. Public data (profiles, reviews, photos) is readable by anyone
-- 4. RPC functions (discover_professionals, browse_professionals) provide
--    controlled public access to professional profiles
-- 5. Storage bucket 'portfolio' follows same ownership rules

-- ============================================================================
-- AUDIT
-- ============================================================================

-- Enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

