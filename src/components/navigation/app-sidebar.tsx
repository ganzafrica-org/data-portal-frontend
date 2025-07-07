"use client"

import * as React from "react"
import { useAuth } from "@/contexts/auth-context"
import {
    LayoutDashboard,
    FileText,
    Users,
    X
} from "lucide-react";

import { NavMain } from "@/components/navigation/nav-main"
import { NavUser } from "@/components/navigation/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

function AppHeader() {
    const { setOpenMobile, isMobile } = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="cursor-default hover:bg-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white">
              NLA Data Portal
            </span>
                    </div>
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-white/10"
                            onClick={(e) => {
                                e.preventDefault()
                                setOpenMobile(false)
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, logout } = useAuth()

    if (!user) return null

    const getNavigationItems = () => {
        const baseItems = [
            { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
            { title: "Requests", url: "/requests", icon: FileText }
        ]

        if (user.role === 'admin') {
            baseItems.push({ title: "Users", url: "/users", icon: Users })
        }

        return baseItems
    }

    const navItems = getNavigationItems()

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="bg-primary border-r-0"
            {...props}
        >
            <SidebarHeader className="bg-primary">
                <AppHeader />
            </SidebarHeader>

            <SidebarContent className="bg-primary">
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter className="bg-primary">
                <NavUser onSignOut={logout} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}