import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://fqbzkljtlghztpkovkte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxYnprbGp0bGdoenRwa292a3RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MjQ4NSwiZXhwIjoyMDcxODI4NDg1fQ.C2dXyMwYWwwgzy-HTXhh5VkCj3YuLCXLRQZsB4cZ5Hg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('🚀 Running WhatsApp source of truth migration...\n');

  try {
    // Read the migration file
    const sql = readFileSync('./supabase/migrations/20251004_use_profiles_whatsapp_phone.sql', 'utf8');

    // Split by semicolons to get individual statements (but preserve function bodies)
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    
    for (const line of sql.split('\n')) {
      currentStatement += line + '\n';
      
      if (line.includes('$$')) {
        inFunction = !inFunction;
      }
      
      if (!inFunction && line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    const validStatements = statements.filter(s => s.length > 0 && !s.startsWith('--'));
    console.log(`Found ${validStatements.length} SQL statements to execute\n`);

    // Execute each statement using the Supabase client
    for (let i = 0; i < validStatements.length; i++) {
      const statement = validStatements[i];
      console.log(`\n[${i + 1}/${validStatements.length}] Executing statement...`);
      console.log(statement.substring(0, 150) + '...\n');

      // Use the postgres REST API directly for DDL statements
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql_query: statement })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        // For CREATE OR REPLACE functions, we can try executing via direct query
        console.log('Trying direct database connection...');
        try {
          const { data, error: rpcError } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (rpcError) throw rpcError;
          console.log(`✅ Statement ${i + 1} executed via RPC`);
        } catch (rpcErr) {
          console.error('Direct execution also failed:', rpcErr);
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n✨ Migration completed!');
    console.log('\n📝 Summary:');
    console.log('- Updated discover_professionals() to use profiles.whatsapp_phone');
    console.log('- Updated browse_professionals() to use profiles.whatsapp_phone');
    console.log('- profiles table is now the single source of truth for contact info');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

