import { supabase } from '@/src/config/supabase'

export async function signInWithGoogle() {
  if (typeof window === 'undefined') {
    return { error: new Error('Cannot sign in during SSR') }
  }

  const redirectUrl = `${window.location.origin}/`
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  })

  return { error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}