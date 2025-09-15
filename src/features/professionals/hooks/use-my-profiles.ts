import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthState } from '@/src/features/auth'
import { ProfessionalsService } from '../services/professionals-service'
import { useToast } from '@/src/shared/hooks/use-toast'
import type { ProfessionalFormData } from '../types'

const QUERY_KEYS = {
  myProfiles: (userId: string) => ['professionals', 'my-profiles', userId],
  myProfile: (userId: string, profileId: string) => ['professionals', 'my-profile', userId, profileId],
} as const

export function useMyProfiles() {
  const { user } = useAuthState()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: myProfiles = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.myProfiles(user?.id || ''),
    queryFn: () => ProfessionalsService.getMyProfiles(user!.id),
    enabled: !!user?.id,
  })

  const createProfileMutation = useMutation({
    mutationFn: (data: ProfessionalFormData) =>
      ProfessionalsService.createProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myProfiles(user!.id)
      })
      toast({
        title: "Éxito",
        description: "Publicación creada exitosamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la publicación",
        variant: "destructive",
      })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: Partial<ProfessionalFormData> }) =>
      ProfessionalsService.updateProfile(user!.id, profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myProfiles(user!.id)
      })
      toast({
        title: "Éxito",
        description: "Publicación actualizada exitosamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la publicación",
        variant: "destructive",
      })
    },
  })

  const deleteProfileMutation = useMutation({
    mutationFn: (profileId: string) =>
      ProfessionalsService.deleteProfile(user!.id, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myProfiles(user!.id)
      })
      toast({
        title: "Éxito",
        description: "Publicación eliminada exitosamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la publicación",
        variant: "destructive",
      })
    },
  })

  return {
    myProfiles,
    loading,
    error,
    createProfile: createProfileMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    deleteProfile: deleteProfileMutation.mutate,
    isCreating: createProfileMutation.isPending,
    isUpdating: updateProfileMutation.isPending,
    isDeleting: deleteProfileMutation.isPending,
  }
}

export function useMyProfile(profileId: string) {
  const { user } = useAuthState()

  return useQuery({
    queryKey: QUERY_KEYS.myProfile(user?.id || '', profileId),
    queryFn: () => ProfessionalsService.getMyProfile(user!.id, profileId),
    enabled: !!user?.id && !!profileId,
  })
}