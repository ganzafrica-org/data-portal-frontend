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

        const docs = []

        if (user.role === 'external') {
            if (user.userType === 'individual') {
                docs.push(
                    { text: 'National ID or Passport', category: 'verification' as const, required: true },
                    { text: 'Research proposal or project documentation', category: 'research' as const, required: true }
                )
            } else {

                docs.push(
                    { text: 'Organization registration certificate', category: 'verification' as const, required: true },
                    { text: 'Authorization letter from organization', category: 'authorization' as const, required: true },
                    { text: 'Research proposal or project documentation', category: 'research' as const, required: true },
                    { text: 'Representative ID/Passport', category: 'verification' as const, required: true }
                )

                if (user.userType === 'academic_institution') {
                    docs.push({ text: 'Academic ethics approval (if applicable)', category: 'research' as const, required: false })
                } else if (user.userType === 'private_company') {
                    docs.push(
                        { text: 'Business license', category: 'verification' as const, required: true },
                        { text: 'Tax clearance certificate', category: 'verification' as const, required: false }
                    )
                } else if (user.userType === 'international_organization') {
                    docs.push({ text: 'Diplomatic note or official communication', category: 'authorization' as const, required: true })
                }
            }
        } else {

            docs.push(
                { text: 'Authorization letter from supervisor/department head', category: 'authorization' as const, required: true },
                { text: 'Project documentation (if applicable)', category: 'research' as const, required: false }
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