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