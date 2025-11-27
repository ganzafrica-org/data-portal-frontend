"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import UserDetailsNew from "@/components/users/user-details-new";
import { api, getErrorMessage, type User } from "@/lib/api-config";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { user: currentUser, hasPermission } = useAuth();
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await api.getUserById(resolvedParams.id);
        setUser(data);
      } catch (error: any) {
        console.error("Error fetching user:", error);
        if (error.response?.status === 404) {
          setNotFoundError(true);
        } else {
          toast.error(getErrorMessage(error));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [resolvedParams.id]);

  // Check permission
  const canManageUsers = currentUser && hasPermission("canManageUsers");

  if (!canManageUsers) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to view user details.
        </p>
        <p className="text-sm text-gray-500">
          Only administrators can manage users.
        </p>
      </div>
    );
  }

  if (notFoundError) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <UserDetailsNew
      user={user}
      onUpdate={() => {
        // Refresh user data after update
        api.getUserById(resolvedParams.id).then(setUser);
      }}
    />
  );
}
