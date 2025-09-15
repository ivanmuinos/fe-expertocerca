import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { AuthState, AuthActions } from '../types'

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    user: null,
    session: null,
    loading: true,

    // Actions
    signInWithGoogle: async () => {
      const { signInWithGoogle } = await import('../services/auth-service')
      return signInWithGoogle()
    },

    signOut: async () => {
      const { signOut } = await import('../services/auth-service')
      const result = await signOut()
      if (!result.error) {
        set({ user: null, session: null })
      }
      return result
    },

    clearAuth: () => {
      set({ user: null, session: null, loading: false })
    },
  }))
)