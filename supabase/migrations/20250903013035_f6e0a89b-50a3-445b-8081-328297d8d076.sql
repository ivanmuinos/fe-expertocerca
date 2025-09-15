-- Create storage bucket for work portfolio photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio', 'portfolio', true);

-- Create portfolio work photos table
CREATE TABLE public.portfolio_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio photos
CREATE POLICY "Anyone can view portfolio photos" 
ON public.portfolio_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Professional owners can manage their portfolio photos" 
ON public.portfolio_photos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM professional_profiles pp 
    WHERE pp.id = portfolio_photos.professional_profile_id 
    AND pp.user_id = auth.uid()
  )
);

-- Create storage policies for portfolio bucket
CREATE POLICY "Anyone can view portfolio images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can upload portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own portfolio images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create trigger for timestamp updates
CREATE TRIGGER update_portfolio_photos_updated_at
BEFORE UPDATE ON public.portfolio_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();