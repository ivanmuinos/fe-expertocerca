'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { createQueryClient } from '@/src/config/query-client'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}