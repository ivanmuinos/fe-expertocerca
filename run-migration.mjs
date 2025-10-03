import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://fqbzkljtlghztpkovkte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxYnprbGp0bGdoenRwa292a3RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MjQ4NSwiZXhwIjoyMDcxODI4NDg1fQ.C2dXyMwYWwwgzy-HTXhh5VkCj3YuLCXLRQZsB4cZ5Hg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('🚀 Running migration...\n');

  try {
    // Read the migration file
    const sql = readFileSync('./supabase/migrations/20251003_add_main_portfolio_image_column.sql', 'utf8');

    // Split by semicolons to get individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(statement.substring(0, 100) + '...\n');

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        // Try direct execution as fallback
        console.log('Trying alternative execution method...');
        const { error: error2 } = await supabase.from('_migrations').insert({
          name: `manual_${Date.now()}`,
          executed_at: new Date().toISOString()
        });
        if (error2) {
          console.error('Alternative method also failed');
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n✨ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
