export interface DataRequest {
    id: string
    title: string
    requestNumber: string
    userId: string
    userName: string
    userEmail: string
    status: 'pending' | 'approved' | 'rejected'
    dateCreated: string
    dateUpdated?: string
    description: string
    requestedDatasets: string[]
    dateRange?: {
        from: string
        to: string
    }
    supportingDocuments?: {
        name: string
        size: string
        type: string
        category: 'verification' | 'research' | 'authorization' | 'other'
    }[]
    applicantType: 'individual' | 'organization' | 'company'
    adminNotes?: string
    approvedBy?: string
    rejectionReason?: string
}

export interface User {
    id: string
    name: string
    email: string
    role: 'external' | 'internal' | 'admin'
    dateJoined: string
    permissions: {
        canViewAllRequests: boolean
        canApproveRequests: boolean
        canManageUsers: boolean
        canViewAuditTrail: boolean
        canExportData: boolean
        requiresApproval: boolean
    }
}

export const DUMMY_USERS: User[] = [
    {
        id: '1',
        name: 'John Mukiza',
        email: 'john.mukiza@researcher.com',
        role: 'external',
        dateJoined: '2024-01-15',
        permissions: {
            canViewAllRequests: false,
            canApproveRequests: false,
            canManageUsers: false,
            canViewAuditTrail: false,
            canExportData: false,
            requiresApproval: true
        }
    },
    {
        id: '2',
        name: 'Marie Uwimana',
        email: 'marie.uwimana@nla.gov.rw',
        role: 'internal',
        dateJoined: '2023-06-10',
        permissions: {
            canViewAllRequests: true,
            canApproveRequests: false,
            canManageUsers: false,
            canViewAuditTrail: true,
            canExportData: true,
            requiresApproval: true
        }
    },
    {
        id: '3',
        name: 'Admin User',
        email: 'admin@nla.gov.rw',
        role: 'admin',
        dateJoined: '2023-01-01',
        permissions: {
            canViewAllRequests: true,
            canApproveRequests: true,
            canManageUsers: true,
            canViewAuditTrail: true,
            canExportData: true,
            requiresApproval: false
        }
    },
    {
        id: '4',
        name: 'Peter Nzeyimana',
        email: 'peter.nzeyimana@nla.gov.rw',
        role: 'internal',
        dateJoined: '2023-08-20',
        permissions: {
            canViewAllRequests: false,
            canApproveRequests: true,
            canManageUsers: false,
            canViewAuditTrail: true,
            canExportData: true,
            requiresApproval: false
        }
    }
]

export const DUMMY_REQUESTS: DataRequest[] = [
    {
        id: '1',
        title: 'Land Use Analysis for Kigali',
        requestNumber: 'REQ-2024-001',
        userId: '1',
        userName: 'John Mukiza',
        userEmail: 'john.mukiza@researcher.com',
        status: 'pending',
        dateCreated: '2024-12-01',
        description: 'Requesting land use data for Kigali district for research on urban development patterns.',
        requestedDatasets: ['Parcel Data', 'Land Use Classification', 'Administrative Boundaries'],
        dateRange: {
            from: '2023-01-01',
            to: '2024-11-30'
        },
        supportingDocuments: [
            { name: 'national_id.pdf', size: '1.2 MB', type: 'PDF', category: 'verification' },
            { name: 'research_proposal.pdf', size: '2.3 MB', type: 'PDF', category: 'research' },
            { name: 'ethics_approval.pdf', size: '1.1 MB', type: 'PDF', category: 'research' }
        ],
        applicantType: 'individual'
    },
    {
        id: '2',
        title: 'Transaction Report - Q4 2024',
        requestNumber: 'REQ-2024-002',
        userId: '2',
        userName: 'Marie Uwimana',
        userEmail: 'marie.uwimana@nla.gov.rw',
        status: 'approved',
        dateCreated: '2024-11-28',
        dateUpdated: '2024-11-29',
        description: 'Monthly transaction report for internal monitoring and evaluation.',
        requestedDatasets: ['Transaction Reports', 'Approval Statistics'],
        dateRange: {
            from: '2024-10-01',
            to: '2024-12-31'
        },
        supportingDocuments: [
            { name: 'authorization_letter.pdf', size: '900 KB', type: 'PDF', category: 'authorization' }
        ],
        applicantType: 'organization',
        approvedBy: 'Admin User'
    },
    {
        id: '3',
        title: 'Agricultural Land Study',
        requestNumber: 'REQ-2024-003',
        userId: '1',
        userName: 'John Mukiza',
        userEmail: 'john.mukiza@researcher.com',
        status: 'rejected',
        dateCreated: '2024-11-25',
        dateUpdated: '2024-11-26',
        description: 'Research on agricultural land productivity in rural areas.',
        requestedDatasets: ['Agricultural Land Data', 'Soil Classification'],
        dateRange: {
            from: '2024-01-01',
            to: '2024-11-30'
        },
        supportingDocuments: [
            { name: 'national_id.pdf', size: '1.2 MB', type: 'PDF', category: 'verification' },
            { name: 'research_outline.pdf', size: '800 KB', type: 'PDF', category: 'research' }
        ],
        applicantType: 'individual',
        rejectionReason: 'Insufficient supporting documentation provided.'
    },
    {
        id: '4',
        title: 'Urban Planning Dataset',
        requestNumber: 'REQ-2024-004',
        userId: '1',
        userName: 'John Mukiza',
        userEmail: 'john.mukiza@researcher.com',
        status: 'approved',
        dateCreated: '2024-11-20',
        dateUpdated: '2024-11-22',
        description: 'Data for urban planning research project.',
        requestedDatasets: ['Urban Parcel Data', 'Zoning Information'],
        dateRange: {
            from: '2024-01-01',
            to: '2024-10-31'
        },
        supportingDocuments: [
            { name: 'national_id.pdf', size: '1.2 MB', type: 'PDF', category: 'verification' },
            { name: 'university_letter.pdf', size: '1.5 MB', type: 'PDF', category: 'authorization' }
        ],
        applicantType: 'individual',
        approvedBy: 'Peter Nzeyimana'
    },
    {
        id: '5',
        title: 'Infrastructure Planning Data',
        requestNumber: 'REQ-2024-005',
        userId: '4',
        userName: 'Peter Nzeyimana',
        userEmail: 'peter.nzeyimana@nla.gov.rw',
        status: 'pending',
        dateCreated: '2024-12-02',
        description: 'Infrastructure development planning data for internal project.',
        requestedDatasets: ['Parcel Data', 'Infrastructure Maps', 'Topographical Data'],
        dateRange: {
            from: '2024-01-01',
            to: '2024-12-31'
        },
        supportingDocuments: [
            { name: 'project_approval.pdf', size: '1.8 MB', type: 'PDF', category: 'authorization' }
        ],
        applicantType: 'organization'
    }
]

export const AVAILABLE_DATASETS = [
    { id: 'parcel-data', name: 'Parcel Data', description: 'Land parcel boundaries and information' },
    { id: 'land-use', name: 'Land Use Classification', description: 'Current land use types and classifications' },
    { id: 'admin-boundaries', name: 'Administrative Boundaries', description: 'Province, district, sector, and cell boundaries' },
    { id: 'transaction-reports', name: 'Transaction Reports', description: 'Land transaction statistics and reports' },
    { id: 'approval-stats', name: 'Approval Statistics', description: 'Application approval metrics' },
    { id: 'agricultural-data', name: 'Agricultural Land Data', description: 'Agricultural land parcels and productivity data' },
    { id: 'soil-classification', name: 'Soil Classification', description: 'Soil types and quality classifications' },
    { id: 'urban-parcel', name: 'Urban Parcel Data', description: 'Urban area parcel information' },
    { id: 'zoning', name: 'Zoning Information', description: 'Urban planning and zoning data' },
    { id: 'infrastructure', name: 'Infrastructure Maps', description: 'Infrastructure and utilities mapping' },
    { id: 'topographical', name: 'Topographical Data', description: 'Elevation and terrain information' }
]