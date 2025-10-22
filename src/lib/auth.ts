/**
 * Authentication service for communicating with the backend API
 */

export interface User {
  email: string;
  full_name?: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
}

class AuthService {
  private baseUrl: string;
  private tokenKey = 'auth_token';

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user information');
    }

    return response.json();
  }

  /**
   * Verify if token is valid
   */
  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.removeToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    const localToken = localStorage.getItem(this.tokenKey);
    if (localToken) return localToken;
    
    // Fallback to cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${this.tokenKey}=`)
    );
    
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    return null;
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage
    localStorage.setItem(this.tokenKey, token);
    
    // Also set as cookie for SSR support
    document.cookie = `${this.tokenKey}=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }

  /**
   * Remove authentication token
   */
  private removeToken(): void {
    if (typeof window === 'undefined') return;
    
    // Remove from localStorage
    localStorage.removeItem(this.tokenKey);
    
    // Remove cookie
    document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export const authService = new AuthService();
