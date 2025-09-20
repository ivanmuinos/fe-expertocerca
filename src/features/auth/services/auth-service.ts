import { apiClient } from '@/src/shared/lib/api-client'
import { supabase } from '@/src/config/supabase'

export async function signInWithGoogle() {
  if (typeof window === 'undefined') {
    return { error: new Error('Cannot sign in during SSR') }
  }

  try {
    const response = await apiClient.signInWithGoogle()

    const { url } = response
    if (url) {
      window.location.href = url
    }
    return { error: null }
  } catch (error: any) {
    return { error }
  }
}

export async function signOut() {
  try {
    await apiClient.signOut()
    return { error: null }
  } catch (error: any) {
    return { error }
  }
}

export async function getSession() {
  try {
    const session = await apiClient.getSession()
    return { session, error: null }
  } catch (error: any) {
    return { session: null, error }
  }
}

// Keep auth state change on client for real-time updates
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}