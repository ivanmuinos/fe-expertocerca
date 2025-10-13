import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { container } from '@/src/core/di'
import { Review } from '@/src/core/repositories'

/**
 * Hook para gestionar reseñas
 * Cumple con Single Responsibility Principle (SRP)
 */
export function useReviews(professionalId: string) {
  const repository = container.getReviewsRepository()

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', professionalId],
    queryFn: () => repository.findByProfessionalId(professionalId),
    enabled: !!professionalId,
  })

  return {
    reviews,
    isLoading,
  }
}

export function useCreateReview() {
  const repository = container.getReviewsRepository()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Review>) => repository.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', variables.professional_id] 
      })
    },
  })
}
