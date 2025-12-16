"use client";

import { useAuth } from "@/contexts/auth-context";
import { User, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    const nameParts = name.split(" ").filter((n) => n.length > 0);

    // If only one name, return first letter
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }

    // Return first letter of first name and first letter of last name
    const firstInitial = nameParts[0][0];
    const lastInitial = nameParts[nameParts.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "external":
        return "External User";
      case "internal":
        return "Internal Staff";
      case "admin":
        return "Administrator";
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-gray-200 backdrop-blur-md bg-white/95 supports-[backdrop-filter]:bg-white/95">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="hidden md:block mr-2 h-4"
          />
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100 px-2 py-6 rounded-md"
              >
                <div className="hidden lg:flex lg:flex-col lg:items-end">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getRoleDisplay(user.role)}
                  </p>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
