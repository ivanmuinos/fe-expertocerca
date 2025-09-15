-- Make role column optional and remove role restrictions
ALTER TABLE public.profiles 
ALTER COLUMN role DROP NOT NULL;

-- Update existing users to have no specific role (unified account type)
UPDATE public.profiles 
SET role = NULL;