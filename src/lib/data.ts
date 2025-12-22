// LAIS Schema Types
export interface LAISSchema {
  name: string;
  description?: string;
}

export interface LAISTable {
  name: string;
  schema: string;
  fullName: string;
  description?: string;
}

export interface LAISColumn {
  name: string;
  dataType: string;
  sqlType: string;
  isNullable: boolean;
  maxLength?: number;
  precision?: number;
  scale?: number;
  defaultValue?: string;
  description?: string;
}

export interface LAISRelationship {
  constraintName: string;
  columnName: string;
  referencedSchema: string;
  referencedTable: string;
  referencedColumn: string;
  suggestedJoin?: string;
}

export interface LAISSearchResult {
  type: "table" | "column";
  schema: string;
  table: string;
  column?: string;
  fullPath: string;
  description?: string;
}

// Query Builder Types
export interface QueryConfigBaseTable {
  schema: string;
  table: string;
  alias: string;
}

export interface QueryConfigJoin {
  type: "LEFT JOIN" | "INNER JOIN" | "RIGHT JOIN" | "FULL OUTER JOIN";
  schema: string;
  table: string;
  alias: string;
  on: string;
  alwaysInclude: boolean;
  requiredForCriteria?: string[];
}

export interface QueryConfigColumn {
  name: string;
  label: string;
  expression: string;
  description?: string;
}

export interface QueryConfigCriteriaDateRange {
  enabled: boolean;
  fromColumn: string;
  toColumn: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface QueryConfigCriteriaMultiSelect {
  enabled: boolean;
  column: string;
  operator: string;
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface QueryConfigCriteriaRange {
  enabled: boolean;
  column: string;
  operator: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface QueryConfigCriteriaText {
  enabled: boolean;
  column: string;
  operator: string;
  label: string;
  required: boolean;
  description?: string;
}

export type QueryConfigCriteria =
  | QueryConfigCriteriaDateRange
  | QueryConfigCriteriaMultiSelect
  | QueryConfigCriteriaRange
  | QueryConfigCriteriaText;

export interface QueryConfigOrderBy {
  column: string;
  direction: "ASC" | "DESC";
}

export interface QueryConfig {
  baseTable: QueryConfigBaseTable;
  joins?: QueryConfigJoin[];
  columns: QueryConfigColumn[];
  criteriaMapping: Record<string, QueryConfigCriteria>;
  staticConditions?: string[];
  orderBy?: QueryConfigOrderBy[];
}

// Dataset Criteria Types (for users)
export interface DatasetCriteria {
  key: string;
  label: string;
  type: "dateRange" | "multiSelect" | "range" | "text";
  required: boolean;
  description?: string;
  options?: { value: string; label: string }[];
}

export interface DatasetOutputColumn {
  name: string;
  type: string;
  description?: string;
}

export interface DatasetCriteriaResponse {
  criteria: DatasetCriteria[];
  outputColumns: DatasetOutputColumn[];
  hasGeometry: boolean;
  exportFormat: string;
}

// Export Types
export interface ExportDatasetInfo {
  datasetId: string;
  datasetName: string;
  format: string;
  size: string;
}

export interface ExportItem {
  id: string;
  exportType: string;
  exportFormat: string;
  fileName: string;
  fileSize: number;
  datasetInfo: {
    requestNumber: string;
    totalDatasets: number;
    datasets: ExportDatasetInfo[];
  };
  downloadCount: number;
  expiresAt: string;
  createdAt: string;
  status: "available" | "expiring_soon" | "expired";
}

export interface DataRequest {
  id: string;
  title: string;
  requestNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected";
  dateCreated: string;
  dateUpdated?: string;
  description: string;
  requestedDatasets: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  supportingDocuments?: {
    name: string;
    size: string;
    type: string;
    category: "verification" | "research" | "authorization" | "other";
  }[];
  adminNotes?: string;
  approvedBy?: string;
  rejectionReason?: string;
  exports?: ExportItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
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
  organizationName?: string;
  organizationEmail?: string;
  dateJoined: string;
  isVerified: boolean;
  permissions: {
    canViewAllRequests: boolean;
    canApproveRequests: boolean;
    canManageUsers: boolean;
    canViewAuditTrail: boolean;
    canExportData: boolean;
    canConfigureDatasets: boolean;
    canViewAnalytics: boolean;
    requiresApproval: boolean;
  };
}

export const USER_TYPES = [
  {
    value: "individual",
    label: "Individual Researcher",
    description: "Independent researcher or student",
  },
  {
    value: "academic_institution",
    label: "Academic Institution",
    description: "University, college, or academic research center",
  },
  {
    value: "research_organization",
    label: "Research Organization",
    description: "Research institute or think tank",
  },
  {
    value: "private_company",
    label: "Private Company",
    description: "Commercial enterprise or consulting firm",
  },
  {
    value: "ngo",
    label: "NGO/Non-Profit",
    description: "Non-governmental organization or non-profit",
  },
  {
    value: "government_agency",
    label: "Government Agency",
    description: "Government department or public institution",
  },
  {
    value: "international_organization",
    label: "International Organization",
    description: "UN agencies, World Bank, etc.",
  },
];

export const DUMMY_USERS: User[] = [
  {
    id: "1",
    name: "John Mukiza",
    email: "john.mukiza@researcher.com",
    role: "external",
    userType: "individual",
    dateJoined: "2024-01-15",
    isVerified: true,
    permissions: {
      canViewAllRequests: false,
      canApproveRequests: false,
      canManageUsers: false,
      canViewAuditTrail: false,
      canExportData: false,
      canConfigureDatasets: false,
      canViewAnalytics: false,
      requiresApproval: true,
    },
  },
  {
    id: "2",
    name: "Marie Uwimana",
    email: "marie.uwimana@nla.gov.rw",
    role: "internal",
    userType: "employee",
    dateJoined: "2023-06-10",
    isVerified: true,
    permissions: {
      canViewAllRequests: true,
      canApproveRequests: false,
      canManageUsers: false,
      canViewAuditTrail: true,
      canExportData: true,
      canConfigureDatasets: false,
      canViewAnalytics: false,
      requiresApproval: true,
    },
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@nla.gov.rw",
    role: "admin",
    userType: "employee",
    dateJoined: "2023-01-01",
    isVerified: true,
    permissions: {
      canViewAllRequests: true,
      canApproveRequests: true,
      canManageUsers: true,
      canViewAuditTrail: true,
      canExportData: true,
      canConfigureDatasets: true,
      canViewAnalytics: true,
      requiresApproval: false,
    },
  },
  {
    id: "4",
    name: "Peter Nzeyimana",
    email: "peter.nzeyimana@nla.gov.rw",
    role: "internal",
    userType: "employee",
    dateJoined: "2023-08-20",
    isVerified: true,
    permissions: {
      canViewAllRequests: false,
      canApproveRequests: true,
      canManageUsers: false,
      canViewAuditTrail: true,
      canExportData: true,
      canConfigureDatasets: false,
      canViewAnalytics: false,
      requiresApproval: false,
    },
  },
  {
    id: "5",
    name: "Sarah Johnson",
    email: "sarah.johnson@university.edu",
    role: "external",
    userType: "academic_institution",
    organizationName: "University of Rwanda",
    organizationEmail: "research@ur.ac.rw",
    dateJoined: "2024-02-20",
    isVerified: true,
    permissions: {
      canViewAllRequests: false,
      canApproveRequests: false,
      canManageUsers: false,
      canViewAuditTrail: false,
      canExportData: false,
      canConfigureDatasets: false,
      canViewAnalytics: false,
      requiresApproval: true,
    },
  },
  {
    id: "6",
    name: "David Smith",
    email: "david.smith@consultancy.com",
    role: "external",
    userType: "private_company",
    organizationName: "Land Consultancy Ltd",
    organizationEmail: "info@consultancy.com",
    dateJoined: "2024-03-10",
    isVerified: false,
    permissions: {
      canViewAllRequests: false,
      canApproveRequests: false,
      canManageUsers: false,
      canViewAuditTrail: false,
      canExportData: false,
      canConfigureDatasets: false,
      canViewAnalytics: false,
      requiresApproval: true,
    },
  },
];

export const DUMMY_REQUESTS: DataRequest[] = [
  {
    id: "1",
    title: "Land Use Analysis for Kigali",
    requestNumber: "REQ-2024-001",
    userId: "1",
    userName: "John Mukiza",
    userEmail: "john.mukiza@researcher.com",
    status: "pending",
    dateCreated: "2024-12-01",
    description:
      "Requesting land use data for Kigali district for research on urban development patterns.",
    requestedDatasets: [
      "Parcel Data",
      "Land Use Classification",
      "Administrative Boundaries",
    ],
    dateRange: {
      from: "2023-01-01",
      to: "2024-11-30",
    },
    supportingDocuments: [
      {
        name: "national_id.pdf",
        size: "1.2 MB",
        type: "PDF",
        category: "verification",
      },
      {
        name: "research_proposal.pdf",
        size: "2.3 MB",
        type: "PDF",
        category: "research",
      },
      {
        name: "ethics_approval.pdf",
        size: "1.1 MB",
        type: "PDF",
        category: "research",
      },
    ],
  },
  {
    id: "2",
    title: "Transaction Report - Q4 2024",
    requestNumber: "REQ-2024-002",
    userId: "2",
    userName: "Marie Uwimana",
    userEmail: "marie.uwimana@nla.gov.rw",
    status: "approved",
    dateCreated: "2024-11-28",
    dateUpdated: "2024-11-29",
    description:
      "Monthly transaction report for internal monitoring and evaluation.",
    requestedDatasets: ["Transaction Reports", "Approval Statistics"],
    dateRange: {
      from: "2024-10-01",
      to: "2024-12-31",
    },
    supportingDocuments: [
      {
        name: "authorization_letter.pdf",
        size: "900 KB",
        type: "PDF",
        category: "authorization",
      },
    ],
    approvedBy: "Admin User",
  },
  {
    id: "3",
    title: "Agricultural Land Study",
    requestNumber: "REQ-2024-003",
    userId: "1",
    userName: "John Mukiza",
    userEmail: "john.mukiza@researcher.com",
    status: "rejected",
    dateCreated: "2024-11-25",
    dateUpdated: "2024-11-26",
    description: "Research on agricultural land productivity in rural areas.",
    requestedDatasets: ["Agricultural Land Data", "Soil Classification"],
    dateRange: {
      from: "2024-01-01",
      to: "2024-11-30",
    },
    supportingDocuments: [
      {
        name: "national_id.pdf",
        size: "1.2 MB",
        type: "PDF",
        category: "verification",
      },
      {
        name: "research_outline.pdf",
        size: "800 KB",
        type: "PDF",
        category: "research",
      },
    ],
    rejectionReason: "Insufficient supporting documentation provided.",
  },
  {
    id: "4",
    title: "Urban Planning Dataset",
    requestNumber: "REQ-2024-004",
    userId: "5",
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@university.edu",
    status: "approved",
    dateCreated: "2024-11-20",
    dateUpdated: "2024-11-22",
    description: "Data for urban planning research project.",
    requestedDatasets: ["Urban Parcel Data", "Zoning Information"],
    dateRange: {
      from: "2024-01-01",
      to: "2024-10-31",
    },
    supportingDocuments: [
      {
        name: "university_authorization.pdf",
        size: "1.5 MB",
        type: "PDF",
        category: "authorization",
      },
      {
        name: "research_proposal.pdf",
        size: "2.1 MB",
        type: "PDF",
        category: "research",
      },
    ],
    approvedBy: "Peter Nzeyimana",
  },
  {
    id: "5",
    title: "Infrastructure Planning Data",
    requestNumber: "REQ-2024-005",
    userId: "4",
    userName: "Peter Nzeyimana",
    userEmail: "peter.nzeyimana@nla.gov.rw",
    status: "pending",
    dateCreated: "2024-12-02",
    description:
      "Infrastructure development planning data for internal project.",
    requestedDatasets: [
      "Parcel Data",
      "Infrastructure Maps",
      "Topographical Data",
    ],
    dateRange: {
      from: "2024-01-01",
      to: "2024-12-31",
    },
    supportingDocuments: [
      {
        name: "project_approval.pdf",
        size: "1.8 MB",
        type: "PDF",
        category: "authorization",
      },
    ],
  },
];
