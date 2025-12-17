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
  bypassApproval: boolean;
  bypassApprovalForDatasets: string[];
  isReviewer: boolean;
  canAssignReviewers: boolean;
  canDelegateReviews: boolean;
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
  total?: number;
  myRequests?: number;
  pending: number;
  approved: number;
  rejected: number;
  in_review: number;
  changes_requested?: number;
  partially_approved?: number;
  approvalRate?: number;
  avgProcessingDays?: number;
  currentMonth?: {
    total: number;
    approved: number;
  };
  byPriority?: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
}

export interface UserStats {
  total: number;
  external: number;
  internal: number;
  admin: number;
  verified: number;
  unverified: number;
  active?: number;
  inactive?: number;
  currentMonth?: number;
}

export interface DatasetStats {
  total: number;
  categories: number;
  totalRequests: number;
  currentMonthRequests?: number;
  mostRequested?: Array<{
    datasetId: string;
    count: number;
  }>;
}

export interface ReviewStats {
  total: number;
  pending: number;
  in_progress: number;
  approved: number;
  rejected: number;
  changes_requested: number;
  activeReviewers: number;
  byDataset?: Array<{
    datasetId: string;
    reviewerCount: number;
  }>;
  byProvince?: Array<{
    provinceId: string;
    reviewerCount: number;
  }>;
  byDistrict?: Array<{
    districtId: string;
    reviewerCount: number;
  }>;
}

export interface ExportStats {
  total: number;
  currentMonth: number;
  totalDownloads: number;
  byFormat: {
    csv: number;
    xlsx: number;
    json: number;
    shapefile: number;
    pdf: number;
  };
  activeExports: number;
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
  reviews?: ReviewStats;
  exports?: ExportStats;
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

  // Reviews
  getMyReviews: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ReviewsResponse> => {
    const response = await apiClient.get<ApiResponse<ReviewsResponse>>(
      "/reviews/my-reviews",
      { params },
    );
    return response.data.data!;
  },

  getReviewById: async (reviewId: string): Promise<RequestReview> => {
    const response = await apiClient.get<ApiResponse<RequestReview>>(
      `/reviews/${reviewId}`,
    );
    return response.data.data!;
  },

  submitReviewDecision: async (
    reviewId: string,
    data: {
      decision: "approved" | "rejected" | "changes_requested";
      notes?: string;
    },
  ): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/reviews/${reviewId}/decision`,
      data,
    );
    return response.data.data!;
  },

  getRequestReviews: async (requestId: string): Promise<RequestReview[]> => {
    const response = await apiClient.get<ApiResponse<RequestReview[]>>(
      `/reviews/request/${requestId}`,
    );
    return response.data.data!;
  },

  reassignReview: async (
    reviewId: string,
    data: {
      newReviewerUserId: string;
      notes?: string;
    },
  ): Promise<RequestReview> => {
    const response = await apiClient.put<ApiResponse<RequestReview>>(
      `/reviews/${reviewId}/reassign`,
      data,
    );
    return response.data.data!;
  },

  getReviewStats: async (): Promise<ReviewStats> => {
    const response =
      await apiClient.get<ApiResponse<ReviewStats>>("/reviews/stats");
    return response.data.data!;
  },

  // Reviewer Assignment
  getDatasetReviewers: async (
    datasetId: string,
  ): Promise<DatasetReviewerAssignment[]> => {
    const response = await apiClient.get<
      ApiResponse<DatasetReviewerAssignment[]>
    >(`/reviewer-assignments/dataset/${datasetId}`);
    return response.data.data!;
  },

  getAllReviewers: async (): Promise<ReviewerUser[]> => {
    const response = await apiClient.get<ApiResponse<ReviewerUser[]>>(
      "/reviewer-assignments/reviewers",
    );
    return response.data.data!;
  },

  createReviewerAssignment: async (data: {
    datasetId: string;
    reviewerUserId: string;
    reviewLevel?: number;
    reviewOrder?: number;
    provinceId?: string;
    districtId?: string;
    sectorId?: string;
    cellId?: string;
    villageId?: string;
    criteriaConfig?: any;
    isPrimary?: boolean;
  }): Promise<DatasetReviewerAssignment> => {
    const response = await apiClient.post<
      ApiResponse<DatasetReviewerAssignment>
    >("/reviewer-assignments", data);
    return response.data.data!;
  },

  updateReviewerAssignment: async (
    assignmentId: string,
    data: {
      reviewLevel?: number;
      reviewOrder?: number;
      provinceId?: string;
      districtId?: string;
      sectorId?: string;
      cellId?: string;
      villageId?: string;
      criteriaConfig?: any;
      isPrimary?: boolean;
      isActive?: boolean;
    },
  ): Promise<DatasetReviewerAssignment> => {
    const response = await apiClient.put<
      ApiResponse<DatasetReviewerAssignment>
    >(`/reviewer-assignments/${assignmentId}`, data);
    return response.data.data!;
  },

  deleteReviewerAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/reviewer-assignments/${assignmentId}`);
  },

  bulkCreateReviewerAssignments: async (data: {
    datasetId: string;
    assignments: Array<{
      reviewerUserId: string;
      reviewLevel?: number;
      reviewOrder?: number;
      provinceId?: string;
      districtId?: string;
      sectorId?: string;
      cellId?: string;
      villageId?: string;
      criteriaConfig?: any;
      isPrimary?: boolean;
    }>;
  }): Promise<DatasetReviewerAssignment[]> => {
    const response = await apiClient.post<
      ApiResponse<DatasetReviewerAssignment[]>
    >("/reviewer-assignments/bulk", data);
    return response.data.data!;
  },

  // ============================================================================
  // ADMINISTRATIVE LEVELS
  // ============================================================================

  getProvinces: async (): Promise<ProvinceLevel[]> => {
    const response = await apiClient.get<ApiResponse<ProvinceLevel[]>>(
      "/administrative-levels/provinces",
    );
    return response.data.data!;
  },

  getDistricts: async (provinceCode: string): Promise<DistrictLevel[]> => {
    const response = await apiClient.get<ApiResponse<DistrictLevel[]>>(
      `/administrative-levels/provinces/${provinceCode}/districts`,
    );
    return response.data.data!;
  },

  getSectors: async (districtCode: string): Promise<SectorLevel[]> => {
    const response = await apiClient.get<ApiResponse<SectorLevel[]>>(
      `/administrative-levels/districts/${districtCode}/sectors`,
    );
    return response.data.data!;
  },

  getCells: async (sectorCode: string): Promise<CellLevel[]> => {
    const response = await apiClient.get<ApiResponse<CellLevel[]>>(
      `/administrative-levels/sectors/${sectorCode}/cells`,
    );
    return response.data.data!;
  },

  getVillages: async (cellCode: string): Promise<VillageLevel[]> => {
    const response = await apiClient.get<ApiResponse<VillageLevel[]>>(
      `/administrative-levels/cells/${cellCode}/villages`,
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

export interface RequestDataset {
  id: string;
  datasetId: string;
  datasetStatus: string;
  criteria: any; // Deprecated - criteria fields are now at the top level
  // Criteria fields (flattened at root level in API response)
  dateRangeFrom?: string;
  dateRangeTo?: string;
  administrativeLevel?: {
    provinces?: string[];
    districts?: string[];
    sectors?: string[];
    cells?: string[];
    villages?: string[];
  };
  transactionTypes?: string[];
  landUseTypes?: string[];
  sizeRangeMin?: number | null;
  sizeRangeMax?: number | null;
  upiList?: string[];
  idList?: string[];
  userId?: string;
  additionalCriteria?: any;
  dataset: {
    id: string;
    name: string;
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
  reviews?: RequestReview[];
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
  email?: string;
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
// REVIEWS TYPES
// ============================================================================

export interface RequestReview {
  id: string;
  requestId: string;
  requestDatasetId: string;
  reviewerUserId: string;
  reviewLevel: number;
  reviewOrder: number;
  reviewStatus:
    | "pending"
    | "in_progress"
    | "approved"
    | "rejected"
    | "changes_requested"
    | "delegated";
  reviewNotes: string | null;
  isInternal: boolean;
  assignedBy: string;
  assignedAt: string;
  reviewedAt: string | null;
  emailSentAt: string | null;
  reminderSentCount: number;
  lastReminderAt: string | null;
  createdAt: string;
  updatedAt: string;
  request?: {
    id: string;
    requestNumber: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      organizationName: string | null;
    };
  };
  requestDataset?: {
    id: string;
    datasetId: string;
    criteria: any;
    dataset: {
      id: string;
      name: string;
      description: string;
    };
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assigner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReviewsResponse {
  reviews: RequestReview[];
  pagination: PaginationMeta;
}

export interface ReviewStats {
  totalPending: number;
  totalInProgress: number;
  totalCompleted: number;
  overdueReviews: number;
}

export interface DatasetReviewerAssignment {
  id: string;
  datasetId: string;
  reviewerUserId: string;
  reviewerRole: string | null;
  reviewLevel: number;
  reviewOrder: number;
  provinceId: string | null;
  districtId: string | null;
  sectorId: string | null;
  cellId: string | null;
  villageId: string | null;
  criteriaConfig: any;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  dataset?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface ReviewerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    canAssignReviewers: boolean;
    canDelegateReviews: boolean;
  };
}

// ============================================================================
// ADMINISTRATIVE LEVELS TYPES
// ============================================================================

export interface ProvinceLevel {
  id: string;
  provinceCode: string;
  provinceName: string;
}

export interface DistrictLevel {
  id: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
}

export interface SectorLevel {
  id: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  sectorCode: string;
  sectorName: string;
}

export interface CellLevel {
  id: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  sectorCode: string;
  sectorName: string;
  cellCode: string;
  cellName: string;
}

export interface VillageLevel {
  id: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  sectorCode: string;
  sectorName: string;
  cellCode: string;
  cellName: string;
  villageCode: string;
  villageName: string;
}

export interface AdministrativeLevel {
  id: string;
  level: number;
  code: string;
  name: string;
  nameKinyarwanda: string | null;
  parentId: string | null;
  provinceCode: string | null;
  districtCode: string | null;
  sectorCode: string | null;
  cellCode: string | null;
  villageCode: string | null;
  createdAt: string;
  updatedAt: string;
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
