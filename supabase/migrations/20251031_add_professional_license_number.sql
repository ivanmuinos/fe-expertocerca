-- Add professional license number column to professional_profiles table
-- This allows professionals to register their official license number (matricula)
-- Common for electricians, plumbers, gas technicians, HVAC technicians, etc. in Argentina

ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS license_number TEXT;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN public.professional_profiles.license_number IS 'Professional license number (matricula profesional) for regulated professions in Argentina';
