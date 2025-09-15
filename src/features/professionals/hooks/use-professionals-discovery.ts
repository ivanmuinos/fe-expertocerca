import { useQuery } from '@tanstack/react-query'
import { useAuthState } from '@/src/features/auth'
import { ProfessionalsService } from '../services/professionals-service'

const QUERY_KEYS = {
  discover: ['professionals', 'discover'],
  browse: ['professionals', 'browse'],
} as const

export function useProfessionalsDiscovery() {
  const { user } = useAuthState()

  // Public discovery - no auth required
  const {
    data: publicProfessionals = [],
    isLoading: isLoadingPublic,
    error: publicError,
  } = useQuery({
    queryKey: QUERY_KEYS.discover,
    queryFn: ProfessionalsService.discoverProfessionals,
  })

  // Authenticated browse - requires auth
  const {
    data: authenticatedProfessionals = [],
    isLoading: isLoadingAuthenticated,
    error: authenticatedError,
  } = useQuery({
    queryKey: QUERY_KEYS.browse,
    queryFn: ProfessionalsService.browseProfessionals,
    enabled: !!user,
  })

  return {
    // Public access
    publicProfessionals,
    isLoadingPublic,
    publicError,

    // Authenticated access
    authenticatedProfessionals,
    isLoadingAuthenticated,
    authenticatedError,

    // Helper
    isAuthenticated: !!user,
  }
}