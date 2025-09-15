-- Security fixes migration - Part 3: Reviews function and DELETE policy

-- Create secure function for reviews with reviewer names
CREATE OR REPLACE FUNCTION public.get_reviews_with_names(_professional_profile_id uuid)
RETURNS TABLE(
  id uuid,
  professional_profile_id uuid,
  reviewer_user_id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  updated_at timestamptz,
  reviewer_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.professional_profile_id,
    r.reviewer_user_id,
    r.rating,
    r.comment,
    r.created_at,
    r.updated_at,
    COALESCE(p.full_name, 'Usuario anónimo') as reviewer_name
  FROM reviews r
  LEFT JOIN profiles p ON r.reviewer_user_id = p.user_id
  WHERE r.professional_profile_id = _professional_profile_id
  ORDER BY r.created_at DESC;
$$;

-- Enable DELETE for professional_profiles
CREATE POLICY "Users can delete their own professional profile"
ON public.professional_profiles
FOR DELETE
USING (auth.uid() = user_id);