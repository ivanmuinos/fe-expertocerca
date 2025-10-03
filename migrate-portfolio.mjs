/**
 * Migration script to set main_portfolio_image for all professional profiles
 * that don't have one yet, using their first portfolio photo.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fqbzkljtlghztpkovkte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxYnprbGp0bGdoenRwa292a3RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MjQ4NSwiZXhwIjoyMDcxODI4NDg1fQ.C2dXyMwYWwwgzy-HTXhh5VkCj3YuLCXLRQZsB4cZ5Hg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateMainPortfolioImages() {
  console.log('🚀 Starting migration to set main_portfolio_image for all profiles...\n');

  try {
    // 1. Get all professional profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('professional_profiles')
      .select('id, main_portfolio_image');

    if (profilesError) {
      throw profilesError;
    }

    console.log(`📊 Found ${profiles.length} professional profiles\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let noPhotosCount = 0;

    // 2. For each profile
    for (const profile of profiles) {
      if (profile.main_portfolio_image) {
        skippedCount++;
        console.log(`⏭️  Profile ${profile.id}: Already has main_portfolio_image, skipping`);
        continue;
      }

      // 3. Get the first portfolio photo for this profile
      const { data: photos, error: photosError } = await supabase
        .from('portfolio_photos')
        .select('id, image_url, created_at')
        .eq('professional_profile_id', profile.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (photosError) {
        console.error(`❌ Error fetching photos for profile ${profile.id}:`, photosError);
        continue;
      }

      if (!photos || photos.length === 0) {
        noPhotosCount++;
        console.log(`📭 Profile ${profile.id}: No portfolio photos found`);
        continue;
      }

      const firstPhoto = photos[0];

      // 4. Update the profile with the first photo as main_portfolio_image
      const { error: updateError } = await supabase
        .from('professional_profiles')
        .update({ main_portfolio_image: firstPhoto.image_url })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`❌ Error updating profile ${profile.id}:`, updateError);
        continue;
      }

      updatedCount++;
      console.log(`✅ Profile ${profile.id}: Set main_portfolio_image`);
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} profiles`);
    console.log(`   ⏭️  Skipped (already had image): ${skippedCount} profiles`);
    console.log(`   📭 No photos: ${noPhotosCount} profiles`);
    console.log(`   📊 Total processed: ${profiles.length} profiles`);
    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateMainPortfolioImages();
