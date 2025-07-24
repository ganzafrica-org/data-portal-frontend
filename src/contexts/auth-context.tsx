"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, DUMMY_USERS } from '@/lib/data'

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isLoading: boolean
    hasPermission: (permission: keyof User['permissions']) => boolean
    canViewRequest: (requestUserId: string) => boolean
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

    useEffect(() => {

        const checkAuth = async () => {

            await new Promise(resolve => setTimeout(resolve, 500))
            setIsLoading(false)
        }
        checkAuth()
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true)

        await new Promise(resolve => setTimeout(resolve, 1000))

        const foundUser = DUMMY_USERS.find(u => u.email === email)

        if (foundUser && password === 'password') {
            setUser(foundUser)
            setIsLoading(false)
            return true
        }

        setIsLoading(false)
        return false
    }

    const logout = () => {
        setUser(null)
    }

    const hasPermission = (permission: keyof User['permissions']): boolean => {
        return user?.permissions[permission] ?? false
    }

    const canViewRequest = (requestUserId: string): boolean => {
        if (!user) return false

        if (user.permissions.canViewAllRequests) return true

        return user.id === requestUserId
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
            logout,
            isLoading,
            hasPermission,
            canViewRequest,
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