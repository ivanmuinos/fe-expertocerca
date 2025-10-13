/**
 * Auth Service Interface
 * Define el contrato para servicios de autenticación
 */
export interface IAuthService {
  signInWithGoogle(): Promise<AuthResult>
  signOut(): Promise<AuthResult>
  getSession(): Promise<SessionResult>
  onAuthStateChange(callback: AuthStateCallback): AuthSubscription
}

export interface AuthResult {
  error: Error | null
  url?: string
}

export interface SessionResult {
  session: any | null
  error: Error | null
}

export type AuthStateCallback = (event: string, session: any) => void

export interface AuthSubscription {
  unsubscribe: () => void
}
