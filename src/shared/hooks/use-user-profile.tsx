import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { container } from '@/src/core/di'
import { UserProfile } from '@/src/core/repositories'

/**
 * Hook para gestionar el perfil de usuario
 * Cumple con Single Responsibility Principle (SRP)
 */
export function useUserProfile(userId?: string) {
  const service = container.getUserProfileService()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => service.getUserProfile(userId),
  })

  return {
    profile,
    isLoading,
    error,
  }
}

export function useCreateUserProfile() {
  const service = container.getUserProfileService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => service.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

export function useUpdateUserProfile() {
  const service = container.getUserProfileService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => service.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

export function useSetUserType() {
  const service = container.getUserProfileService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userType: string) => service.setUserType(userType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

export function useOnboardingStatus() {
  const service = container.getUserProfileService()

  const { data: status, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => service.getOnboardingStatus(),
  })

  return {
    status,
    isLoading,
  }
}
