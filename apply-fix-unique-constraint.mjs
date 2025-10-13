import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyFix() {
  console.log('🔧 Applying fix to remove UNIQUE constraint from professional_profiles.user_id...\n');

  try {
    // Step 1: Drop the UNIQUE constraint
    console.log('1️⃣ Dropping UNIQUE constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.professional_profiles DROP CONSTRAINT IF EXISTS professional_profiles_user_id_key;`
    });

    if (dropError) {
      // If rpc doesn't work, try direct query
      const { error: directError } = await supabase
        .from('_sql')
        .select()
        .limit(0);

      // Since we can't execute DDL directly, let's provide the SQL for manual execution
      console.log('\n⚠️  Cannot execute DDL via client. Please run this SQL manually in Supabase SQL Editor:\n');
      console.log('----------------------------------------');
      console.log('-- Remove UNIQUE constraint from user_id in professional_profiles');
      console.log('ALTER TABLE public.professional_profiles');
      console.log('  DROP CONSTRAINT IF EXISTS professional_profiles_user_id_key;');
      console.log('');
      console.log('-- Add an index on user_id for performance');
      console.log('CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id');
      console.log('  ON public.professional_profiles(user_id);');
      console.log('');
      console.log('-- Add a comment to document this change');
      console.log("COMMENT ON TABLE public.professional_profiles IS 'Stores professional profiles for users. Users can have multiple profiles (publications) for different services they offer.';");
      console.log('----------------------------------------\n');

      console.log('📝 Please execute the above SQL in your Supabase dashboard SQL Editor.');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new\n');

      return;
    }

    console.log('✅ UNIQUE constraint dropped successfully\n');

    // Step 2: Add index for performance
    console.log('2️⃣ Adding index on user_id...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON public.professional_profiles(user_id);`
    });

    if (!indexError) {
      console.log('✅ Index created successfully\n');
    }

    // Step 3: Add comment
    console.log('3️⃣ Adding table comment...');
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `COMMENT ON TABLE public.professional_profiles IS 'Stores professional profiles for users. Users can have multiple profiles (publications) for different services they offer.';`
    });

    if (!commentError) {
      console.log('✅ Comment added successfully\n');
    }

    console.log('🎉 Fix applied successfully!');
    console.log('✨ Users can now create multiple publications.\n');

  } catch (error) {
    console.error('❌ Error applying fix:', error);
    process.exit(1);
  }
}

applyFix();
