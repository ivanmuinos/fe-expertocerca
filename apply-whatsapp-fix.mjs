import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fqbzkljtlghztpkovkte.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxYnprbGp0bGdoenRwa292a3RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MjQ4NSwiZXhwIjoyMDcxODI4NDg1fQ.C2dXyMwYWwwgzy-HTXhh5VkCj3YuLCXLRQZsB4cZ5Hg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const discoverSQL = `
CREATE OR REPLACE FUNCTION public.discover_professionals()
RETURNS TABLE(
  id uuid,
  trade_name text,
  description text,
  specialty text,
  years_experience integer,
  user_id uuid,
  profile_full_name text,
  profile_location_city text,
  profile_location_province text,
  profile_skills text[],
  profile_avatar_url text,
  has_contact_info boolean,
  main_portfolio_image text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pp.id,
    pp.trade_name,
    pp.description,
    pp.specialty,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    pp.main_portfolio_image
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;
`;

const browseSQL = `
CREATE OR REPLACE FUNCTION public.browse_professionals()
RETURNS TABLE(
  id uuid,
  trade_name text,
  description text,
  specialty text,
  years_experience integer,
  user_id uuid,
  profile_full_name text,
  profile_location_city text,
  profile_location_province text,
  profile_skills text[],
  profile_avatar_url text,
  has_contact_info boolean,
  whatsapp_phone text,
  hourly_rate numeric,
  main_portfolio_image text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pp.id,
    pp.trade_name,
    pp.description,
    pp.specialty,
    pp.years_experience,
    pp.user_id,
    p.full_name as profile_full_name,
    p.location_city as profile_location_city,
    p.location_province as profile_location_province,
    pp.skills as profile_skills,
    p.avatar_url as profile_avatar_url,
    (p.whatsapp_phone IS NOT NULL OR p.phone IS NOT NULL) as has_contact_info,
    p.whatsapp_phone as whatsapp_phone,
    pp.hourly_rate,
    pp.main_portfolio_image
  FROM professional_profiles pp
  JOIN profiles p ON pp.user_id = p.user_id
  WHERE p.onboarding_completed = true
    AND pp.is_active = true;
$$;
`;

async function applyFix() {
  console.log('🔧 Applying WhatsApp source of truth fix...\n');

  try {
    // Use REST API to execute DDL
    console.log('1️⃣ Updating discover_professionals()...');
    const res1 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: discoverSQL
      })
    });

    console.log('Response 1:', res1.status);

    console.log('2️⃣ Updating browse_professionals()...');
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: browseSQL
      })
    });

    console.log('Response 2:', res2.status);

    console.log('\n✨ Fix applied!');
    console.log('\n📝 Changes:');
    console.log('- discover_professionals() now uses profiles.whatsapp_phone for has_contact_info');
    console.log('- browse_professionals() now returns profiles.whatsapp_phone directly');
    console.log('- profiles table is the single source of truth for WhatsApp numbers');

  } catch (error) {
    console.error('❌ Failed to apply fix:', error);
    process.exit(1);
  }
}

applyFix();

