import { IAuthService, AuthResult, SessionResult, AuthStateCallback, AuthSubscription } from '@/src/core/interfaces'
import { IHttpClient } from '@/src/core/interfaces'

/**
 * Auth Service Implementation
 * Maneja la autenticación de usuarios
 */
export class AuthService implements IAuthService {
  constructor(
    private httpClient: IHttpClient,
    private authProvider: IAuthService
  ) {}

  async signInWithGoogle(): Promise<AuthResult> {
    if (typeof window === 'undefined') {
      return { error: new Error('Cannot sign in during SSR') }
    }

    try {
      const response = await this.httpClient.post<{ url: string }>('/auth/google')
      const { url } = response
      
      if (url) {
        window.location.href = url
      }
      
      return { error: null, url }
    } catch (error: any) {
      return { error }
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      await this.httpClient.post('/auth/signout')
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  async getSession(): Promise<SessionResult> {
    try {
      const session = await this.httpClient.get('/auth/session')
      return { session, error: null }
    } catch (error: any) {
      return { session: null, error }
    }
  }

  onAuthStateChange(callback: AuthStateCallback): AuthSubscription {
    return this.authProvider.onAuthStateChange(callback)
  }
}
