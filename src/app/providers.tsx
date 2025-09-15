'use client'

import { AppProviders } from '@/src/shared/components/providers'
import { TooltipProvider } from '@/src/shared/components/ui/tooltip'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </AppProviders>
  )
}