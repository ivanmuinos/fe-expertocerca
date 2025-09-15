'use client'

import { useAuth } from '../hooks/use-auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth state
  useAuth()

  return <>{children}</>
}