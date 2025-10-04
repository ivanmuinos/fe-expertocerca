-- Ensure RLS is enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

DROP POLICY IF EXISTS "Anyone can view portfolio photos" ON public.portfolio_photos;
DROP POLICY IF EXISTS "Professional owners can manage their portfolio photos" ON public.portfolio_photos;

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = reviewer_user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = reviewer_user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = reviewer_user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = reviewer_user_id AND auth.uid() IS NOT NULL);

-- Portfolio photos policies
CREATE POLICY "Anyone can view portfolio photos"
ON public.portfolio_photos
FOR SELECT
USING (true);

CREATE POLICY "Professional owners can insert portfolio photos"
ON public.portfolio_photos
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Professional owners can update their portfolio photos"
ON public.portfolio_photos
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Professional owners can delete their portfolio photos"
ON public.portfolio_photos
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM professional_profiles pp
    WHERE pp.id = portfolio_photos.professional_profile_id
    AND pp.user_id = auth.uid()
  )
);
