-- Add specialty_category column to professional_profiles table
-- This column stores the main category (e.g., "Electricista", "Otros")
-- while specialty stores the actual specialty (which could be custom for "Otros")

ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS specialty_category TEXT;

-- Set default value for existing rows (same as specialty)
UPDATE professional_profiles
SET specialty_category = specialty
WHERE specialty_category IS NULL;

-- Create index for better query performance when filtering by category
CREATE INDEX IF NOT EXISTS idx_professional_profiles_specialty_category
ON professional_profiles(specialty_category);

-- Add comment to document the column
COMMENT ON COLUMN professional_profiles.specialty_category IS
'Main specialty category for filtering. For predefined specialties, this matches specialty. For custom specialties, this is set to "Otros".';
