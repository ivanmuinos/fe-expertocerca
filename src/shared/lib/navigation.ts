'use client'

import { useRouter, useParams } from 'next/navigation'

// Simple back function with fallback
function goBackWithFallback(router: any, fallbackPath: string = '/') {
  if (typeof window !== 'undefined') {
    // Check if we have previous pages in session history
    if (window.history.length > 1 && document.referrer) {
      try {
        router.back()
      } catch {
        router.push(fallbackPath)
      }
    } else {
      // No history, go to fallback
      router.push(fallbackPath)
    }
  } else {
    router.push(fallbackPath)
  }
}

// Navigation hook that provides compatibility with React Router
export function useNavigate() {
  const router = useRouter()

  return (path: string | number, fallbackPath: string = '/') => {
    if (typeof path === 'number') {
      // Handle go back functionality
      if (path === -1) {
        goBackWithFallback(router, fallbackPath)
      } else {
        // For other numbers, use window.history if available
        if (typeof window !== 'undefined' && window.history) {
          window.history.go(path)
        }
      }
    } else {
      router.push(path)
    }
  }
}

// Hook for going back with fallback
export function useGoBack(fallbackPath: string = '/') {
  const router = useRouter()

  return () => {
    goBackWithFallback(router, fallbackPath)
  }
}

// Params hook that provides compatibility with React Router
export function useRouterParams() {
  const params = useParams()
  return params
}

// For backwards compatibility, export router functions
export { useRouter, useParams } from 'next/navigation'