import { container } from '@/src/core/di'

/**
 * Auth Service - Feature Layer
 * Usa el servicio del core a través del DI Container
 * Cumple con Dependency Inversion Principle (DIP)
 */
const authService = container.getAuthService()

export async function signInWithGoogle() {
  return authService.signInWithGoogle()
}

export async function signOut() {
  return authService.signOut()
}

export async function getSession() {
  return authService.getSession()
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return authService.onAuthStateChange(callback)
}