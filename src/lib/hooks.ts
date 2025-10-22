/**
 * Custom hooks for data fetching using TanStack Query
 * Provides a clean interface for components to access data
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { 
  usersApi, 
  videoProjectsApi, 
  processingStepsApi, 
  apiResponsesApi, 
  dashboardApi,
  User,
  VideoProject,
  ProcessingStep,
  ApiResponse,
  ApiError
} from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'

// Users hooks
export const useUsers = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      usersApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

// Video Projects hooks
export const useVideoProjects = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.videoProjects.list(params),
    queryFn: () => videoProjectsApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useVideoProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.videoProjects.detail(id),
    queryFn: () => videoProjectsApi.getById(id),
    enabled: !!id,
  })
}

export const useVideoProjectsByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.videoProjects.byUser(userId),
    queryFn: () => videoProjectsApi.getByUser(userId),
    enabled: !!userId,
  })
}

export const useCreateVideoProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: videoProjectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProjects.all })
    },
  })
}

export const useUpdateVideoProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VideoProject> }) => 
      videoProjectsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProjects.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProjects.detail(variables.id) })
    },
  })
}

export const useDeleteVideoProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: videoProjectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProjects.all })
    },
  })
}

export const useRetryVideoProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: videoProjectsApi.retry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProjects.all })
    },
  })
}

// Processing Steps hooks
export const useProcessingSteps = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.processingSteps.all,
    queryFn: () => processingStepsApi.getAll(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useProcessingStep = (id: string) => {
  return useQuery({
    queryKey: queryKeys.processingSteps.detail(id),
    queryFn: () => processingStepsApi.getById(id),
    enabled: !!id,
  })
}

export const useProcessingStepsByProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.processingSteps.byProject(projectId),
    queryFn: () => processingStepsApi.getByProject(projectId),
    enabled: !!projectId,
  })
}

export const useUpdateProcessingStep = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProcessingStep> }) => 
      processingStepsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.processingSteps.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.processingSteps.detail(variables.id) })
    },
  })
}

// API Responses hooks
export const useApiResponses = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.apiResponses.all,
    queryFn: () => apiResponsesApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useApiResponse = (id: string) => {
  return useQuery({
    queryKey: queryKeys.apiResponses.detail(id),
    queryFn: () => apiResponsesApi.getById(id),
    enabled: !!id,
  })
}

export const useApiResponsesByProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.apiResponses.byProject(projectId),
    queryFn: () => apiResponsesApi.getByProject(projectId),
    enabled: !!projectId,
  })
}

// Dashboard hooks
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardApi.getOverview,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: dashboardApi.getStats,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useDashboardChart = (type: string) => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts(type),
    queryFn: () => dashboardApi.getChartData(type),
    enabled: !!type,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Utility hooks
export const useErrorHandler = () => {
  return (error: unknown) => {
    if (error instanceof ApiError) {
      console.error(`API Error ${error.status}: ${error.message}`)
      return error.message
    }
    console.error('Unknown error:', error)
    return 'An unexpected error occurred'
  }
}

// Infinite query hook for paginated data
export const useInfiniteVideoProjects = (params?: Record<string, any>) => {
  return useInfiniteQuery({
    queryKey: queryKeys.videoProjects.list(params),
    queryFn: ({ pageParam = 0 }) => 
      videoProjectsApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // Adjust this logic based on your API's pagination structure
      return lastPage.length > 0 ? allPages.length : undefined
    },
    initialPageParam: 0,
  })
}
