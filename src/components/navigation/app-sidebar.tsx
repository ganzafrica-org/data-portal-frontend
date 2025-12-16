"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  FileText,
  Users,
  Database,
  BarChart3,
  ClipboardCheck,
  X,
} from "lucide-react";

import { NavMain } from "@/components/navigation/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function AppHeader() {
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Image
            src="/images/logo.png"
            alt="NLA Logo"
            width={110}
            height={110}
            className="object-contain"
          />
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/10"
              onClick={(e) => {
                e.preventDefault();
                setOpenMobile(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, canManageUsers, canConfigureDatasets, canViewAnalytics } =
    useAuth();

  if (!user) return null;

  const getNavigationItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Requests", url: "/requests", icon: FileText },
    ];

    // Reviews - only for users with isReviewer permission
    if (user.permissions?.isReviewer) {
      baseItems.push({
        title: "My Reviews",
        url: "/reviews",
        icon: ClipboardCheck,
      });
    }

    // Users - only for admins or users with canManageUsers permission
    if (canManageUsers()) {
      baseItems.push({ title: "Users", url: "/users", icon: Users });
    }

    // Dataset Configuration - only for admins or users with canConfigureDatasets permission
    if (canConfigureDatasets()) {
      baseItems.push({
        title: "Dataset Config",
        url: "/configuration",
        icon: Database,
      });
    }

    // Analytics - only for admins or users with canViewAnalytics permission
    if (canViewAnalytics()) {
      baseItems.push({
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
      });
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="bg-green border-r-0"
      {...props}
    >
      <SidebarHeader className="bg-green">
        <AppHeader />
      </SidebarHeader>

      <SidebarContent className="bg-green">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
