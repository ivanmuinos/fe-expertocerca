import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { onAuthStateChange, getSession } from '../services/auth-service'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    // Skip auth setup during SSR
    if (typeof window === 'undefined') {
      store.clearAuth()
      return
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      useAuthStore.setState({
        session,
        user: session?.user ?? null,
        loading: false
      })
    })

    // THEN check for existing session
    getSession().then(({ session }) => {
      useAuthStore.setState({
        session,
        user: session?.user ?? null,
        loading: false
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return store
}

// Hook for components that only need auth state (no setup)
export function useAuthState() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const loading = useAuthStore((state) => state.loading)

  return { user, session, loading }
}

// Hook for auth actions (no state)
export function useAuthActions() {
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const signOut = useAuthStore((state) => state.signOut)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return { signInWithGoogle, signOut, clearAuth }
}