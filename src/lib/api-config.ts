import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { QueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

// API CLIENT CONFIGURATION

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Cookie names
const COOKIE_ACCESS_TOKEN = "nla_access_token";
const COOKIE_REFRESH_TOKEN = "nla_refresh_token";
const COOKIE_USER = "nla_user";

// Cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
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
    "Content-Type": "application/json",
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
  },
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
          // No refresh token, clear and redirect
          tokenManager.clearTokens();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to refresh token
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

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
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// REACT QUERY CLIENT FACTORY

// This avoids passing the class instance across Server/Client Component boundary
export function makeQueryClient() {
  return new QueryClient({
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
}

// TYPE DEFINITIONS

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
  role: "external" | "internal" | "admin";
  userType:
    | "individual"
    | "academic_institution"
    | "research_organization"
    | "private_company"
    | "ngo"
    | "government_agency"
    | "international_organization"
    | "employee";
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
  role?: "external" | "internal" | "admin";
  userType:
    | "individual"
    | "academic_institution"
    | "research_organization"
    | "private_company"
    | "ngo"
    | "government_agency"
    | "international_organization"
    | "employee";
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

// ANALYTICS & DASHBOARD TYPES

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  in_review: number;
  resubmitted?: number;
}

export interface UserStats {
  total: number;
  external: number;
  internal: number;
  admin: number;
  verified: number;
  unverified: number;
}

export interface DatasetStats {
  total: number;
  categories: number;
  totalRequests: number;
}

export interface RecentRequest {
  id: string;
  requestNumber: string;
  title: string;
  status: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface DashboardData {
  requests: RequestStats;
  users?: UserStats;
  datasets?: DatasetStats;
  recentActivity: RecentRequest[];
  requestsByMonth?: MonthlyData[];
}

// API FUNCTIONS

export const api = {
  // Dashboard
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      "/analytics/dashboard",
    );
    return response.data.data!;
  },

  // Requests
  getRequests: async (
    params: RequestsQueryParams,
  ): Promise<RequestsResponse> => {
    const response = await apiClient.get<ApiResponse<RequestsResponse>>(
      "/requests",
      { params },
    );
    return response.data.data!;
  },

  // Draft management
  createDraftRequest: async (data: {
    title: string;
    description: string;
    priority?: "low" | "normal" | "high" | "urgent";
  }): Promise<Request> => {
    const response = await apiClient.post<ApiResponse<Request>>("/requests", {
      ...data,
      status: "draft",
    });
    return response.data.data!;
  },

  updateDraftRequest: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: "low" | "normal" | "high" | "urgent";
    },
  ): Promise<Request> => {
    const response = await apiClient.put<ApiResponse<Request>>(
      `/requests/${id}`,
      data,
    );
    return response.data.data!;
  },

  submitRequest: async (id: string): Promise<Request> => {
    const response = await apiClient.put<ApiResponse<Request>>(
      `/requests/${id}/status`,
      { status: "pending" },
    );
    return response.data.data!;
  },

  // Admin actions
  requestChanges: async (id: string, notes: string): Promise<Request> => {
    const response = await apiClient.put<ApiResponse<Request>>(
      `/requests/${id}/status`,
      { status: "changes_requested", adminNotes: notes },
    );
    return response.data.data!;
  },

  resubmitRequest: async (id: string): Promise<Request> => {
    const response = await apiClient.put<ApiResponse<Request>>(
      `/requests/${id}/status`,
      { status: "pending" },
    );
    return response.data.data!;
  },

  createRequest: async (data: {
    title: string;
    description: string;
    priority?: "low" | "normal" | "high" | "urgent";
  }): Promise<Request> => {
    const response = await apiClient.post<ApiResponse<Request>>(
      "/requests",
      data,
    );
    return response.data.data!;
  },

  getRequestById: async (requestId: string): Promise<Request> => {
    const response = await apiClient.get<ApiResponse<Request>>(
      `/requests/${requestId}`,
    );
    return response.data.data!;
  },

  updateRequest: async (
    requestId: string,
    data: {
      title?: string;
      description?: string;
      priority?: "low" | "normal" | "high" | "urgent";
    },
  ): Promise<Request> => {
    const response = await apiClient.put<ApiResponse<Request>>(
      `/requests/${requestId}`,
      data,
    );
    return response.data.data!;
  },

  addDatasetToRequest: async (
    requestId: string,
    data: {
      datasetId: string;
      dateRangeFrom?: string;
      dateRangeTo?: string;
      administrativeLevel?: any;
      transactionTypes?: string[];
      landUseTypes?: string[];
      sizeRangeMin?: number;
      sizeRangeMax?: number;
      upiList?: string[];
      idList?: string[];
      additionalCriteria?: any;
    },
  ): Promise<RequestDataset> => {
    const response = await apiClient.post<ApiResponse<RequestDataset>>(
      `/requests/${requestId}/datasets`,
      data,
    );
    return response.data.data!;
  },

  uploadDocumentToRequest: async (
    requestId: string,
    file: File,
    category: "verification" | "research" | "authorization" | "other",
  ): Promise<RequestDocument> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const response = await apiClient.post<ApiResponse<RequestDocument>>(
      `/requests/${requestId}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data!;
  },

  deleteRequest: async (requestId: string): Promise<void> => {
    await apiClient.delete(`/requests/${requestId}`);
  },

  removeDatasetFromRequest: async (
    requestId: string,
    datasetId: string,
  ): Promise<void> => {
    await apiClient.delete(`/requests/${requestId}/datasets/${datasetId}`);
  },

  getDatasetCategories: async (params?: {
    includeInactive?: boolean;
    search?: string;
  }): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      "/dataset-categories",
      { params },
    );
    return response.data.data!;
  },

  createDatasetCategory: async (data: {
    name: string;
    icon?: string;
    description?: string;
    sortOrder?: number;
  }): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/dataset-categories",
      data,
    );
    return response.data.data!;
  },

  updateDatasetCategory: async (
    categoryId: string,
    data: {
      name?: string;
      icon?: string;
      description?: string;
      sortOrder?: number;
      deactivatedAt?: string | null;
    },
  ): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/dataset-categories/${categoryId}`,
      data,
    );
    return response.data.data!;
  },

  getDatasets: async (params?: {
    categoryId?: string;
    includeInactive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>("/datasets", {
      params,
    });
    return response.data.data!;
  },

  getDatasetById: async (datasetId: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/datasets/${datasetId}`,
    );
    return response.data.data!;
  },

  createDataset: async (data: {
    categoryId?: string;
    name: string;
    description?: string;
    requiresPeriod?: boolean;
    requiresUpiList?: boolean;
    requiresIdList?: boolean;
    requiresUpi?: boolean;
    hasAdminLevel?: boolean;
    hasUserLevel?: boolean;
    hasTransactionType?: boolean;
    hasLandUse?: boolean;
    hasSizeRange?: boolean;
    fields?: any;
    criteria?: any;
    requiresApproval?: boolean;
    autoApproveForRoles?: string[];
    allowsRecurring?: boolean;
  }): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>("/datasets", data);
    return response.data.data!;
  },

  updateDataset: async (
    datasetId: string,
    data: {
      categoryId?: string;
      name?: string;
      description?: string;
      requiresPeriod?: boolean;
      requiresUpiList?: boolean;
      requiresIdList?: boolean;
      requiresUpi?: boolean;
      hasAdminLevel?: boolean;
      hasUserLevel?: boolean;
      hasTransactionType?: boolean;
      hasLandUse?: boolean;
      hasSizeRange?: boolean;
      fields?: any;
      criteria?: any;
      requiresApproval?: boolean;
      autoApproveForRoles?: string[];
      allowsRecurring?: boolean;
      deactivatedAt?: string | null;
    },
  ): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/datasets/${datasetId}`,
      data,
    );
    return response.data.data!;
  },

  deleteDataset: async (datasetId: string): Promise<void> => {
    await apiClient.delete(`/datasets/${datasetId}`);
  },

  // User Profile
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/users/me");
    return response.data.data!;
  },

  updateCurrentUser: async (data: {
    name?: string;
    phone?: string;
    address?: string;
    organizationName?: string;
    organizationEmail?: string;
  }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>("/users/me", data);
    return response.data.data!;
  },

  // Users Management
  getUsers: async (params: UsersQueryParams): Promise<UsersResponse> => {
    const response = await apiClient.get<ApiResponse<UsersResponse>>("/users", {
      params,
    });
    return response.data.data!;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data.data!;
  },

  updateUser: async (
    userId: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      organizationName?: string;
      organizationEmail?: string;
    },
  ): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${userId}`,
      data,
    );
    return response.data.data!;
  },

  updateUserPermissions: async (
    userId: string,
    permissions: Partial<UserPermissions>,
  ): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${userId}/permissions`,
      permissions,
    );
    return response.data.data!;
  },

  verifyUser: async (userId: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${userId}/verify`,
    );
    return response.data.data!;
  },

  // Analytics
  getRequestAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/analytics/requests",
      { params },
    );
    return response.data.data!;
  },

  getUserAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>("/analytics/users", {
      params,
    });
    return response.data.data!;
  },

  getDatasetAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/analytics/datasets",
      { params },
    );
    return response.data.data!;
  },

  // Audit Trail
  getAuditTrail: async (params?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>("/audit-trail", {
      params,
    });
    return response.data.data!;
  },

  getAuditStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/audit-trail/statistics",
      { params },
    );
    return response.data.data!;
  },

  // Export Logs
  getExportLogs: async (params?: {
    requestId?: string;
    userId?: string;
    exportFormat?: string;
    exportType?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>("/exports/logs", {
      params,
    });
    return response.data.data!;
  },

  createExport: async (data: {
    requestId: string;
    exportFormat: "csv" | "xlsx" | "json" | "shapefile" | "pdf";
    exportType: string;
    datasetInfo?: any;
    expiresInDays?: number;
  }): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>("/exports", data);
    return response.data.data!;
  },

  downloadExport: async (exportId: string): Promise<Blob> => {
    const response = await apiClient.get(`/exports/${exportId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Comments
  getRequestComments: async (requestId: string): Promise<RequestComment[]> => {
    const response = await apiClient.get<ApiResponse<RequestComment[]>>(
      `/requests/${requestId}/comments`,
    );
    return response.data.data!;
  },

  addComment: async (
    requestId: string,
    data: {
      comment: string;
      isInternal?: boolean;
      parentCommentId?: string;
    },
  ): Promise<RequestComment> => {
    const response = await apiClient.post<ApiResponse<RequestComment>>(
      `/requests/${requestId}/comments`,
      data,
    );
    return response.data.data!;
  },

  updateComment: async (
    requestId: string,
    commentId: string,
    data: {
      comment: string;
    },
  ): Promise<RequestComment> => {
    const response = await apiClient.put<ApiResponse<RequestComment>>(
      `/requests/${requestId}/comments/${commentId}`,
      data,
    );
    return response.data.data!;
  },

  deleteComment: async (
    requestId: string,
    commentId: string,
  ): Promise<void> => {
    await apiClient.delete(`/requests/${requestId}/comments/${commentId}`);
  },

  // Documents
  getRequestDocuments: async (
    requestId: string,
  ): Promise<RequestDocument[]> => {
    const response = await apiClient.get<ApiResponse<RequestDocument[]>>(
      `/requests/${requestId}/documents`,
    );
    return response.data.data!;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },

  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  verifyDocument: async (
    documentId: string,
    data: { isVerified: boolean },
  ): Promise<RequestDocument> => {
    const response = await apiClient.put<ApiResponse<RequestDocument>>(
      `/documents/${documentId}/verify`,
      data,
    );
    return response.data.data!;
  },
};

// ============================================================================
// REQUESTS TYPES
// ============================================================================

export interface RequestDocument {
  id: string;
  originalFilename: string;
  category: string;
  isVerified: boolean;
  storedFilename?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RequestComment {
  id: string;
  requestId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  replies?: RequestComment[];
}

export interface RequestDataset {
  id: string;
  datasetId: string;
  datasetStatus: string;
  criteria: any;
  dataset: {
    id: string;
    name: string;
    deactivatedAt: string | null;
  };
}

export interface Request {
  id: string;
  requestNumber: string | null;
  title: string;
  description: string | null;
  status:
    | "draft"
    | "pending"
    | "in_review"
    | "changes_requested"
    | "partially_approved"
    | "approved"
    | "rejected";
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  userId: string;
  approvedBy: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    userType: string;
  };
  datasets: RequestDataset[];
  documents: RequestDocument[];
  _count: {
    comments: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RequestsResponse {
  requests: Request[];
  pagination: PaginationMeta;
}

export interface RequestsQueryParams {
  status?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// USERS TYPES
// ============================================================================

export interface UsersQueryParams {
  role?: string;
  userType?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationMeta;
}

// ============================================================================
// ERROR HANDLING

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return (
      axiosError.response?.data?.error?.message ||
      error.message ||
      "An unexpected error occurred"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export default apiClient;
