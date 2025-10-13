import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { container } from '@/src/core/di'
import { ProfessionalProfile } from '@/src/core/repositories'

/**
 * Hook para gestionar profesionales
 * Cumple con Single Responsibility Principle (SRP)
 */
export function useProfessionals() {
  const service = container.getProfessionalsService()
  const queryClient = useQueryClient()

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals', 'browse'],
    queryFn: () => service.browseProfessionals(),
  })

  return {
    professionals,
    isLoading,
  }
}

export function useDiscoverProfessionals() {
  const service = container.getProfessionalsService()

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals', 'discover'],
    queryFn: () => service.discoverProfessionals(),
  })

  return {
    professionals,
    isLoading,
  }
}

export function useMyProfessionalProfiles() {
  const service = container.getProfessionalsService()

  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['my-profiles'],
    queryFn: () => service.getMyProfiles(),
  })

  return {
    profiles,
    isLoading,
    refetch,
  }
}

export function useCreateProfessional() {
  const service = container.getProfessionalsService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ProfessionalProfile>) => service.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    },
  })
}

export function useUpdateProfessional() {
  const service = container.getProfessionalsService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProfessionalProfile> }) =>
      service.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    },
  })
}

export function useDeleteProfessional() {
  const service = container.getProfessionalsService()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => service.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    },
  })
}
