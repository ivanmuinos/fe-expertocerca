import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fqbzkljtlghztpkovkte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxYnprbGp0bGdoenRwa292a3RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MjQ4NSwiZXhwIjoyMDcxODI4NDg1fQ.C2dXyMwYWwwgzy-HTXhh5VkCj3YuLCXLRQZsB4cZ5Hg';

console.log('🚀 Starting migration...\n');
console.log('⚠️  IMPORTANT INSTRUCTIONS:\n');
console.log('Since we cannot execute DDL (ALTER TABLE) through the API,');
console.log('please follow these steps:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/fqbzkljtlghztpkovkte/sql/new');
console.log('2. Copy and paste the following SQL:\n');
console.log('---START SQL---');
console.log(`
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS main_portfolio_image text;

CREATE INDEX IF NOT EXISTS idx_professional_profiles_main_portfolio_image
ON professional_profiles(main_portfolio_image);
`);
console.log('---END SQL---\n');
console.log('3. Click "Run" in the SQL editor');
console.log('4. Once done, press ENTER here to continue with the data migration...\n');

// Wait for user input
await new Promise((resolve) => {
  process.stdin.once('data', resolve);
});

console.log('\n✅ Proceeding with data migration...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

try {
  // Get all profiles
  console.log('Fetching all professional profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('professional_profiles')
    .select('id, main_portfolio_image');

  if (profilesError) {
    throw profilesError;
  }

  console.log(`Found ${profiles.length} professional profiles\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let noPhotosCount = 0;

  for (const profile of profiles) {
    if (profile.main_portfolio_image) {
      skippedCount++;
      process.stdout.write('.');
      continue;
    }

    // Get first photo
    const { data: photos, error: photosError } = await supabase
      .from('portfolio_photos')
      .select('image_url, created_at')
      .eq('professional_profile_id', profile.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (photosError) {
      console.error(`\n❌ Error fetching photos for profile ${profile.id}:`, photosError);
      continue;
    }

    if (!photos || photos.length === 0) {
      noPhotosCount++;
      process.stdout.write('-');
      continue;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('professional_profiles')
      .update({ main_portfolio_image: photos[0].image_url })
      .eq('id', profile.id);

    if (updateError) {
      console.error(`\n❌ Error updating profile ${profile.id}:`, updateError);
      continue;
    }

    updatedCount++;
    process.stdout.write('✓');
  }

  console.log('\n\n📈 Migration Summary:');
  console.log(`   ✅ Updated: ${updatedCount} profiles`);
  console.log(`   ⏭️  Skipped (already had image): ${skippedCount} profiles`);
  console.log(`   📭 No photos: ${noPhotosCount} profiles`);
  console.log(`   📊 Total processed: ${profiles.length} profiles\n`);

  console.log('✨ Data migration completed!\n');
  console.log('⚠️  FINAL STEP: Update the SQL functions');
  console.log('Go back to the SQL editor and run the function updates from:');
  console.log('/supabase/migrations/20251003_add_main_portfolio_image_column.sql');
  console.log('(Starting from "CREATE OR REPLACE FUNCTION public.discover_professionals()")\n');

  process.exit(0);

} catch (error) {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
}
