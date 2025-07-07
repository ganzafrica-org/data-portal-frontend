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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem('nla-user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true)

        await new Promise(resolve => setTimeout(resolve, 1000))

        const foundUser = DUMMY_USERS.find(u => u.email === email)

        if (foundUser && password === 'password') {
            setUser(foundUser)
            localStorage.setItem('nla-user', JSON.stringify(foundUser))
            setIsLoading(false)
            return true
        }

        setIsLoading(false)
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('nla-user')
    }

    const hasPermission = (permission: keyof User['permissions']): boolean => {
        return user?.permissions[permission] ?? false
    }

    const canViewRequest = (requestUserId: string): boolean => {
        if (!user) return false

        if (user.permissions.canViewAllRequests) return true

        return user.id === requestUserId
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isLoading,
            hasPermission,
            canViewRequest
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