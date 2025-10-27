"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import apiClient, {
  User,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
  getErrorMessage,
  tokenManager,
} from '@/lib/api-config'

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    isLoading: boolean
    hasPermission: (permission: keyof User['permissions']) => boolean
    canViewRequest: (requestUserId: string) => boolean
    canApproveRequests: () => boolean
    canManageUsers: () => boolean
    canViewAuditTrail: () => boolean
    canExportData: () => boolean
    canConfigureDatasets: () => boolean
    canViewAnalytics: () => boolean
    requiresApproval: () => boolean
    isAdmin: () => boolean
    isInternal: () => boolean
    isExternal: () => boolean
    getUserDisplayInfo: () => {
        displayName: string
        roleLabel: string
        typeLabel: string
        isOrganization: boolean
    }
    getRequiredDocuments: () => Array<{
        text: string
        category: 'verification' | 'research' | 'authorization' | 'other'
        required: boolean
    }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = () => {
            const savedUser = tokenManager.getUser()
            const accessToken = tokenManager.getAccessToken()

            if (savedUser && accessToken) {
                setUser(savedUser)
            }

            setIsLoading(false)
        }
        checkAuth()
    }, [])

    // Register function
    const register = async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data)

            if (response.data.success && response.data.data) {
                // Registration successful - user needs to verify email
                return { success: true }
            }

            return { success: false, error: response.data.message || 'Registration failed' }
        } catch (error) {
            return { success: false, error: getErrorMessage(error) }
        }
    }

    // Login function
    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true)

            const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
                email,
                password,
            })

            if (response.data.success && response.data.data) {
                const { accessToken, refreshToken, user: userData } = response.data.data

                // Store tokens and user
                tokenManager.setTokens(accessToken, refreshToken, userData)
                setUser(userData)

                return { success: true }
            }

            return { success: false, error: response.data.message || 'Login failed' }
        } catch (error) {
            return { success: false, error: getErrorMessage(error) }
        } finally {
            setIsLoading(false)
        }
    }

    // Logout function
    const logout = async (): Promise<void> => {
        try {
            // Call logout endpoint
            await apiClient.post('/auth/logout')
        } catch (error) {
            console.error('Logout error:', getErrorMessage(error))
        } finally {
            // Clear tokens and user regardless of API response
            tokenManager.clearTokens()
            setUser(null)
        }
    }

    const hasPermission = (permission: keyof User['permissions']): boolean => {
        return user?.permissions[permission] ?? false
    }

    const canViewRequest = (requestUserId: string): boolean => {
        if (!user) return false
        // Admin and users with canViewAllRequests can view any request
        if (user.role === 'admin' || user.permissions.canViewAllRequests) return true
        // Otherwise, can only view own requests
        return user.id === requestUserId
    }

    const canApproveRequests = (): boolean => {
        if (!user) return false
        return user.role === 'admin' || user.permissions.canApproveRequests
    }

    const canManageUsers = (): boolean => {
        if (!user) return false
        return user.role === 'admin' || user.permissions.canManageUsers
    }

    const canViewAuditTrail = (): boolean => {
        if (!user) return false
        return user.role === 'admin' || user.permissions.canViewAuditTrail
    }

    const canExportData = (): boolean => {
        if (!user) return false
        return user.role === 'admin' || user.permissions.canExportData
    }

    const canConfigureDatasets = (): boolean => {
        if (!user) return false
        return user.role === 'admin' || user.permissions.canConfigureDatasets
    }

    const canViewAnalytics = (): boolean => {
        if (!user) return false
        return user.role === 'admin' || user.permissions.canViewAnalytics
    }

    const requiresApproval = (): boolean => {
        if (!user) return true
        return user.permissions.requiresApproval
    }

    // Role checks
    const isAdmin = (): boolean => {
        return user?.role === 'admin'
    }

    const isInternal = (): boolean => {
        return user?.role === 'internal'
    }

    const isExternal = (): boolean => {
        return user?.role === 'external'
    }

    const getUserDisplayInfo = () => {
        if (!user) {
            return {
                displayName: '',
                roleLabel: '',
                typeLabel: '',
                isOrganization: false
            }
        }

        const roleLabels = {
            'external': 'External User',
            'internal': 'Internal Staff',
            'admin': 'Administrator'
        }

        const typeLabels = {
            'individual': 'Individual Researcher',
            'academic_institution': 'Academic Institution',
            'research_organization': 'Research Organization',
            'private_company': 'Private Company',
            'ngo': 'NGO/Non-Profit',
            'government_agency': 'Government Agency',
            'international_organization': 'International Organization',
            'employee': 'NLA Employee'
        }

        const isOrganization = !['individual', 'employee'].includes(user.userType)

        return {
            displayName: user.organizationName || user.name,
            roleLabel: roleLabels[user.role],
            typeLabel: typeLabels[user.userType],
            isOrganization
        }
    }

    const getRequiredDocuments = () => {
        if (!user) return []

        const docs = [] as Array<{ text: string; category: 'verification' | 'research' | 'authorization' | 'other'; required: boolean }>

        // Map external roles according to provided NLA requirements
        if (user.role === 'external') {
            switch (user.userType) {
                case 'individual':
                    // Individual academic researcher
                    docs.push(
                        { text: 'Application letter addressed to the DG of NLA', category: 'authorization', required: true },
                        { text: 'Copy of identity card or passport', category: 'verification', required: true },
                        { text: 'Research permit from National Council for Science and Technology (NCST)', category: 'authorization', required: true },
                        { text: 'Formal research proposal (objectives, methodology, duration, expected outcomes)', category: 'research', required: true },
                        { text: 'Data specifications (format, projection, time period, etc.) if applicable', category: 'research', required: false }
                    )
                    break
                case 'academic_institution':
                    docs.push(
                        { text: 'Application letter addressed to the DG of NLA', category: 'authorization', required: true },
                        { text: 'Copy of institutional registration certificate (or proof of legal establishment)', category: 'verification', required: true },
                        { text: 'Research permit from NCST (for PhD and MSc researchers)', category: 'authorization', required: true },
                        { text: 'Accreditation certificate from relevant education authority or ministry (if applicable)', category: 'verification', required: false },
                        { text: 'Formal research proposal (objectives, methodology, duration, expected outcomes)', category: 'research', required: true },
                        { text: 'Letter of support from a government institution linked to the research', category: 'authorization', required: true },
                        { text: 'Data specifications (format, projection, time period, etc.) if applicable', category: 'research', required: false }
                    )
                    break
                case 'research_organization':
                    docs.push(
                        { text: 'Application letter addressed to the DG of NLA', category: 'authorization', required: true },
                        { text: 'Brief description of the organization (mandate, focus areas, past relevant projects)', category: 'other', required: true },
                        { text: 'Registration certificate or proof of legal status', category: 'verification', required: true },
                        { text: 'Formal research proposal (objectives, methodology, duration, expected outcomes)', category: 'research', required: true },
                        { text: 'Letter of support from a government institution linked to the project', category: 'authorization', required: true },
                        { text: 'Data specifications (format, projection, time period, etc.) if applicable', category: 'research', required: false }
                    )
                    break
                case 'private_company':
                    docs.push(
                        { text: 'Application letter addressed to the DG of NLA', category: 'authorization', required: true },
                        { text: 'Registration certificate or proof of legal status', category: 'verification', required: true },
                        { text: 'Concept note (why data is needed, objectives, methodology, expected outcomes)', category: 'research', required: true },
                        { text: 'Letter of support from a government institution linked to the project', category: 'authorization', required: true },
                        { text: 'Proof of payment of fees as per relevant laws/regulations', category: 'verification', required: true },
                        { text: 'Data specifications (format, projection, time period, etc.) if applicable', category: 'research', required: false }
                    )
                    break
                case 'ngo':
                    docs.push(
                        { text: 'Application letter addressed to the DG of NLA', category: 'authorization', required: true },
                        { text: 'Registration certificate or proof of legal status', category: 'verification', required: true },
                        { text: 'Research permit from National Council for Science and Technology (NCST)', category: 'authorization', required: true },
                        { text: 'Concept note (why data is needed, objectives, methodology, expected outcomes)', category: 'research', required: true },
                        { text: 'Letter of support from a government institution linked to the project', category: 'authorization', required: true },
                        { text: 'Data specifications (format, projection, time period, etc.) if applicable', category: 'research', required: false }
                    )
                    break
                case 'government_agency':
                    docs.push(
                        { text: 'Application letter addressed to the DG of NLA', category: 'authorization', required: true },
                        { text: 'Concept note (why data is needed, objectives, methodology, expected outcomes)', category: 'research', required: true },
                        { text: 'Data specifications (format, projection, time period, etc.) if applicable', category: 'research', required: false }
                    )
                    break
                case 'international_organization':
                    docs.push(
                        { text: 'Application letter addressed to the DG of NLA', category: 'authorization', required: true },
                        { text: 'Concept note (why data is needed, objectives, methodology, expected outcomes)', category: 'research', required: true },
                        { text: 'Research permit from National Council for Science and Technology (NCST)', category: 'authorization', required: true },
                        { text: 'Letter of support from a government institution linked to the project', category: 'authorization', required: true },
                        { text: 'Data specifications (format, projection, time period, etc.) if applicable', category: 'research', required: false }
                    )
                    break
                default:
                    break
            }
        } else {
            // Internal staff (employees)
            docs.push(
                { text: 'Authorization letter from supervisor/department head', category: 'authorization', required: true },
                { text: 'Project documentation (if applicable)', category: 'research', required: false }
            )
        }

        return docs
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isLoading,
            hasPermission,
            canViewRequest,
            canApproveRequests,
            canManageUsers,
            canViewAuditTrail,
            canExportData,
            canConfigureDatasets,
            canViewAnalytics,
            requiresApproval,
            isAdmin,
            isInternal,
            isExternal,
            getUserDisplayInfo,
            getRequiredDocuments
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}