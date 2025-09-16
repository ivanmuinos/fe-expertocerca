// Hooks
export { useMyProfiles, useMyProfile } from './hooks/use-my-profiles'
export { useProfessionalsDiscovery } from './hooks/use-professionals-discovery'
export { useSecureProfessionals } from '@/src/shared/hooks'
export { useMyProfessionalProfiles } from '@/src/shared/hooks'

// Services
export { ProfessionalsService } from './services/professionals-service'

// Types
export type {
  ProfessionalProfile,
  ProfileData,
  MyProfessionalProfile,
  SecureProfessional,
  AuthenticatedProfessional,
  ProfessionalFormData,
  ProfessionalFilters,
} from './types'

// Schemas
export {
  ProfessionalFormSchema,
  ProfessionalFiltersSchema,
  type ProfessionalFormInput,
  type ProfessionalFiltersInput,
} from './schemas'