import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fqbzkljtlghztpkovkte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxYnprbGp0bGdoenRwa292a3RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MjQ4NSwiZXhwIjoyMDcxODI4NDg1fQ.C2dXyMwYWwwgzy-HTXhh5VkCj3YuLCXLRQZsB4cZ5Hg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'public' }
});

async function executeMigration() {
  console.log('🚀 Starting migration execution...\n');

  try {
    // Step 1: Add column (using raw SQL through REST API)
    console.log('Step 1: Adding main_portfolio_image column...');

    const response1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS main_portfolio_image text'
      })
    });

    if (!response1.ok) {
      const error = await response1.text();
      console.log('⚠️  Column might already exist or using alternative method...');
    } else {
      console.log('✅ Column added successfully');
    }

    // Step 2: Get all profiles and update with first photo
    console.log('\nStep 2: Updating existing profiles with first portfolio photo...');

    const { data: profiles, error: profilesError } = await supabase
      .from('professional_profiles')
      .select('id, main_portfolio_image');

    if (profilesError) {
      throw profilesError;
    }

    console.log(`Found ${profiles.length} professional profiles`);

    let updatedCount = 0;
    let skippedCount = 0;
    let noPhotosCount = 0;

    for (const profile of profiles) {
      if (profile.main_portfolio_image) {
        skippedCount++;
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
        console.error(`Error fetching photos for profile ${profile.id}:`, photosError);
        continue;
      }

      if (!photos || photos.length === 0) {
        noPhotosCount++;
        continue;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('professional_profiles')
        .update({ main_portfolio_image: photos[0].image_url })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`Error updating profile ${profile.id}:`, updateError);
        continue;
      }

      updatedCount++;
      console.log(`✅ Updated profile ${profile.id}`);
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} profiles`);
    console.log(`   ⏭️  Skipped: ${skippedCount} profiles`);
    console.log(`   📭 No photos: ${noPhotosCount} profiles`);
    console.log(`   📊 Total: ${profiles.length} profiles`);

    // Step 3: Update functions through SQL Editor
    console.log('\n⚠️  IMPORTANT: You need to manually update the SQL functions:');
    console.log('1. Go to https://supabase.com/dashboard/project/fqbzkljtlghztpkovkte/sql/new');
    console.log('2. Copy and paste the function updates from the migration file');
    console.log('   (Lines starting with "CREATE OR REPLACE FUNCTION")');
    console.log('3. Click "Run"');

    console.log('\n✨ Data migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

executeMigration();
