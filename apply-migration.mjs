#!/usr/bin/env node
import { readFileSync } from 'fs';
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Read the migration file
const migrationSQL = readFileSync('./supabase/migrations/20251004_fix_reviews_and_portfolio_rls.sql', 'utf8');

console.log('Applying migration via Supabase Management API...\n');

try {
  // Use Supabase REST API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({ query: migrationSQL })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  console.log('✓ Migration applied successfully!');
} catch (error) {
  console.error('Error applying migration:', error.message);
  console.log('\nTrying alternative approach...');

  // Alternative: Split and execute statement by statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    console.log('Executing:', statement.substring(0, 60) + '...');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        },
        body: JSON.stringify({ query: statement + ';' })
      });

      if (res.ok) {
        console.log('  ✓');
      } else {
        console.log('  ✗', await res.text());
      }
    } catch (err) {
      console.log('  ✗', err.message);
    }
  }
}
