/**
 * API service layer for all backend communication
 * Centralized API functions for use with TanStack Query
 */

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Types
export interface User {
  email: string
  full_name?: string
  is_active: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface RegisterData {
  email: string
  full_name: string
  password: string
}

export interface VideoProject {
  id: string
  user_id: string
  status: string
  user_context?: string
  voice: string
  script_style: string
  animation_style: string
  caption_position: string
  min_words: number
  max_words: number
  created_at: string
  updated_at: string
  error_message?: string
  progress?: any
  results?: any
}

export interface ProcessingStep {
  id: string
  video_project_id: string
  step_name: string
  status: string
  started_at?: string
  completed_at?: string
  error_message?: string
  step_data?: any
}

export interface ApiResponse {
  id: string
  video_project_id: string
  step_name: string
  service: string
  request_data?: any
  response_data?: any
  created_at: string
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken()
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = JSON.parse(errorText)
      errorMessage = errorData.detail || errorData.message || errorMessage
    } catch {
      // Use the default error message if parsing fails
    }
    
    throw new ApiError(errorMessage, response.status, response.statusText)
  }

  // Handle empty responses
  const text = await response.text()
  if (!text) {
    return {} as T
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('Invalid JSON response', response.status, response.statusText)
  }
}

// Auth API functions
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  register: async (userData: RegisterData): Promise<User> => {
    return apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/auth/me')
  },

  logout: async (): Promise<void> => {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  },
}

// Users API functions
export const usersApi = {
  getAll: async (params?: Record<string, any>): Promise<User[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/users?${queryString}` : '/users'
    
    return apiRequest<User[]>(endpoint)
  },

  getById: async (id: string): Promise<User> => {
    return apiRequest<User>(`/users/${id}`)
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}

// Video Projects API functions
export const videoProjectsApi = {
  getAll: async (params?: Record<string, any>): Promise<VideoProject[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/video-projects?${queryString}` : '/video-projects'
    
    return apiRequest<VideoProject[]>(endpoint)
  },

  getById: async (id: string): Promise<VideoProject> => {
    return apiRequest<VideoProject>(`/video-projects/${id}`)
  },

  create: async (data: Partial<VideoProject>): Promise<VideoProject> => {
    return apiRequest<VideoProject>('/video-projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: Partial<VideoProject>): Promise<VideoProject> => {
    return apiRequest<VideoProject>(`/video-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/video-projects/${id}`, {
      method: 'DELETE',
    })
  },

  getByUser: async (userId: string): Promise<VideoProject[]> => {
    return apiRequest<VideoProject[]>(`/users/${userId}/video-projects`)
  },
}

// Processing Steps API functions
export const processingStepsApi = {
  getAll: async (params?: Record<string, any>): Promise<ProcessingStep[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/processing-steps?${queryString}` : '/processing-steps'
    
    return apiRequest<ProcessingStep[]>(endpoint)
  },

  getById: async (id: string): Promise<ProcessingStep> => {
    return apiRequest<ProcessingStep>(`/processing-steps/${id}`)
  },

  getByProject: async (projectId: string): Promise<ProcessingStep[]> => {
    return apiRequest<ProcessingStep[]>(`/video-projects/${projectId}/processing-steps`)
  },

  update: async (id: string, data: Partial<ProcessingStep>): Promise<ProcessingStep> => {
    return apiRequest<ProcessingStep>(`/processing-steps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// API Responses API functions
export const apiResponsesApi = {
  getAll: async (params?: Record<string, any>): Promise<ApiResponse[]> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/api-responses?${queryString}` : '/api-responses'
    
    return apiRequest<ApiResponse[]>(endpoint)
  },

  getById: async (id: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>(`/api-responses/${id}`)
  },

  getByProject: async (projectId: string): Promise<ApiResponse[]> => {
    return apiRequest<ApiResponse[]>(`/video-projects/${projectId}/api-responses`)
  },
}

// Dashboard API functions
export const dashboardApi = {
  getOverview: async (): Promise<any> => {
    return apiRequest<any>('/dashboard/overview')
  },

  getStats: async (): Promise<any> => {
    return apiRequest<any>('/dashboard/stats')
  },

  getChartData: async (type: string): Promise<any> => {
    return apiRequest<any>(`/dashboard/charts/${type}`)
  },
}
