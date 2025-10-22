/**
 * Query key factory for consistent cache key management
 * Following TanStack Query best practices for hierarchical keys
 */

export const queryKeys = {
  // Auth related queries
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // User related queries
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    list: (params?: Record<string, any>) => ['users', 'list', params] as const,
  },
  
  // Video projects related queries
  videoProjects: {
    all: ['video-projects'] as const,
    detail: (id: string) => ['video-projects', id] as const,
    list: (params?: Record<string, any>) => ['video-projects', 'list', params] as const,
    byUser: (userId: string) => ['video-projects', 'user', userId] as const,
  },
  
  // Processing steps related queries
  processingSteps: {
    all: ['processing-steps'] as const,
    detail: (id: string) => ['processing-steps', id] as const,
    byProject: (projectId: string) => ['processing-steps', 'project', projectId] as const,
  },
  
  // API responses related queries
  apiResponses: {
    all: ['api-responses'] as const,
    detail: (id: string) => ['api-responses', id] as const,
    byProject: (projectId: string) => ['api-responses', 'project', projectId] as const,
  },
  
  // Dashboard/Overview queries
  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    stats: ['dashboard', 'stats'] as const,
    charts: (type: string) => ['dashboard', 'charts', type] as const,
  },
  
  // Settings related queries
  settings: {
    general: ['settings', 'general'] as const,
    billing: ['settings', 'billing'] as const,
    users: ['settings', 'users'] as const,
  },
} as const

// Helper function to create query keys with filters
export const createQueryKey = <T extends readonly unknown[]>(
  baseKey: T,
  ...additionalKeys: unknown[]
): [...T, ...unknown[]] => {
  return [...baseKey, ...additionalKeys] as [...T, ...unknown[]]
}

// Helper function to invalidate related queries
export const invalidateQueries = {
  users: () => ['users'],
  user: (id: string) => ['users', id],
  videoProjects: () => ['video-projects'],
  videoProject: (id: string) => ['video-projects', id],
  dashboard: () => ['dashboard'],
} as const
