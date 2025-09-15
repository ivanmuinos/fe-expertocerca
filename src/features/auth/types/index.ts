import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {}

export interface AuthSession extends Session {}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
}

export interface AuthActions {
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  clearAuth: () => void
}