// Re-export all hooks
export { useIsMobile as useMobile } from './use-mobile'
export { useAuth } from './useAuth'
export { useUserRedirect } from './useUserRedirect'

// Legacy hooks (mantener para compatibilidad)
export { useMyProfessionalProfiles } from './useMyProfessionalProfiles'
export { useOnboardingStatus } from './useOnboardingStatus'
export { usePortfolio } from './usePortfolio'
export { useProfiles } from './useProfiles'
export { useReviews } from './useReviews'
export { useSecureProfessionals } from './useSecureProfessionals'

// New SOLID hooks (recomendados)
export * from './use-user-profile'
export * from './use-professionals'
export * from './use-portfolio'
export * from './use-reviews'