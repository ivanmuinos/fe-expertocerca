import { IAuthService, AuthResult, SessionResult, AuthStateCallback, AuthSubscription } from '@/src/core/interfaces'
import { supabase } from '@/src/config/supabase'

/**
 * Supabase Auth Provider
 * Implementación concreta de autenticación usando Supabase
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class SupabaseAuthProvider implements IAuthService {
  async signInWithGoogle(): Promise<AuthResult> {
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

  async signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async getSession(): Promise<SessionResult> {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }

  onAuthStateChange(callback: AuthStateCallback): AuthSubscription {
    const { data } = supabase.auth.onAuthStateChange(callback)
    return {
      unsubscribe: () => {
        data?.subscription?.unsubscribe()
      }
    }
  }
}
