import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import type { Database } from '@/src/integrations/supabase/types'

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export type SupabaseClient = typeof supabase