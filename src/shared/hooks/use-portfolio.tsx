import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { container } from '@/src/core/di'
import { PortfolioItem } from '@/src/core/repositories'

/**
 * Hook para gestionar el portafolio
 * Cumple con Single Responsibility Principle (SRP)
 */
export function usePortfolio() {
  const repository = container.getPortfolioRepository()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => repository.findAll(),
  })

  return {
    items,
    isLoading,
  }
}

export function useCreatePortfolioItem() {
  const repository = container.getPortfolioRepository()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<PortfolioItem>) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}
