-- Add WhatsApp phone number to professional profiles
ALTER TABLE public.professional_profiles 
ADD COLUMN whatsapp_phone text;

-- Add WhatsApp phone number to user profiles  
ALTER TABLE public.profiles
ADD COLUMN whatsapp_phone text;