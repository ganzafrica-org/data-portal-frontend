import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { QueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Cookie names
const COOKIE_ACCESS_TOKEN = 'nla_access_token';
const COOKIE_REFRESH_TOKEN = 'nla_refresh_token';
const COOKIE_USER = 'nla_user';

// Cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

// Token management functions
export const tokenManager = {
  getAccessToken: () => Cookies.get(COOKIE_ACCESS_TOKEN),
  getRefreshToken: () => Cookies.get(COOKIE_REFRESH_TOKEN),
  getUser: () => {
    const user = Cookies.get(COOKIE_USER);
    return user ? JSON.parse(user) : null;
  },
  setTokens: (accessToken: string, refreshToken: string, user?: any) => {
    Cookies.set(COOKIE_ACCESS_TOKEN, accessToken, COOKIE_OPTIONS);
    Cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS);
    if (user) {
      Cookies.set(COOKIE_USER, JSON.stringify(user), COOKIE_OPTIONS);
    }
  },
  clearTokens: () => {
    Cookies.remove(COOKIE_ACCESS_TOKEN);
    Cookies.remove(COOKIE_REFRESH_TOKEN);
    Cookies.remove(COOKIE_USER);
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
          // No refresh token, clear and redirect
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to refresh token
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Update tokens
          tokenManager.setTokens(accessToken, newRefreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// REACT QUERY CLIENT
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    stack?: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserPermissions {
  id: string;
  userId: string;
  canViewAllRequests: boolean;
  canApproveRequests: boolean;
  canManageUsers: boolean;
  canViewAuditTrail: boolean;
  canExportData: boolean;
  canConfigureDatasets: boolean;
  canViewAnalytics: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'external' | 'internal' | 'admin';
  userType: 'individual' | 'academic_institution' | 'research_organization' |
            'private_company' | 'ngo' | 'government_agency' |
            'international_organization' | 'employee';
  nationality: string;
  identityNumber: string;
  isIdVerified: boolean;
  organizationName: string | null;
  organizationEmail: string | null;
  phone: string;
  address: string | null;
  dateJoined: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: UserPermissions;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'external' | 'internal' | 'admin';
  userType: 'individual' | 'academic_institution' | 'research_organization' |
            'private_company' | 'ngo' | 'government_agency' |
            'international_organization' | 'employee';
  nationality: string;
  identityNumber: string;
  organizationName?: string;
  organizationEmail?: string;
  phone: string;
  address?: string;
}

export interface RegisterResponse {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.error?.message || error.message || 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export default apiClient;