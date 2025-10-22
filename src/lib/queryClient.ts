import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 401 errors
        if (error?.status === 404 || error?.status === 401) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
})
