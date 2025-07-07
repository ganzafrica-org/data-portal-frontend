"use client"

import { useAuth } from "@/contexts/auth-context"
import { AppSidebar } from "@/components/navigation/app-sidebar"
import { SiteHeader } from "@/components/navigation/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [user, isLoading, router])


    if (!user) {
        return null
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col bg-muted max-w-full overflow-x-hidden">
                    <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}