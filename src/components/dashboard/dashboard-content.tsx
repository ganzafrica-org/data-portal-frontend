"use client";

import { Suspense, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { StatsCards, StatsCardsSkeleton } from "./stats-cards";
import { RecentRequests, RecentRequestsSkeleton } from "./recent-requests";
import { api } from "@/lib/api-config";
import { use } from "react";

function StatsCardsWrapper({ dataPromise }: { dataPromise: Promise<any> }) {
  const data = use(dataPromise);
  const { user, canManageUsers, canApproveRequests } = useAuth();

  if (!user) return null;

  return (
    <StatsCards
      requestStats={data.requests}
      userStats={data.users}
      datasetStats={data.datasets}
      userRole={user.role}
      canManageUsers={canManageUsers()}
      canApproveRequests={canApproveRequests()}
    />
  );
}

function RecentRequestsWrapper({ dataPromise }: { dataPromise: Promise<any> }) {
  const data = use(dataPromise);
  const { user, canApproveRequests, hasPermission } = useAuth();

  if (!user) return null;

  const showSystemStats =
    user.role === "admin" || hasPermission("canViewAllRequests");

  return (
    <RecentRequests
      requests={data.recentActivity}
      canApproveRequests={canApproveRequests()}
      showSystemStats={showSystemStats}
      userRole={user.role}
    />
  );
}

export default function DashboardContent() {
  const { user } = useAuth();

  if (!user) return null;

  // Create the promise once using useMemo to prevent re-creating on every render
  const dashboardDataPromise = useMemo(() => api.getDashboardData(), []);

  const getWelcomeMessage = () => {
    switch (user.role) {
      case "admin":
        return {
          title: "Admin Dashboard",
          subtitle: "Manage data requests, users, and system oversight.",
        };
      case "internal":
        return {
          title: `Welcome back, ${user.name}!`,
          subtitle: user.permissions.canApproveRequests
            ? "Review and manage data requests."
            : "Access internal data and submit requests.",
        };
      case "external":
        return {
          title: `Welcome back, ${user.name}!`,
          subtitle: "Manage your data requests and track their progress here.",
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Welcome to the NLA Data Portal.",
        };
    }
  };

  const welcomeMessage = getWelcomeMessage();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-green rounded-lg p-6 relative overflow-hidden">
        <h1 className="text-2xl font-bold text-white mb-2">
          {welcomeMessage.title}
        </h1>
        <p className="text-yellow mb-4">{welcomeMessage.subtitle}</p>
        {(user.role === "internal" || user.role === "external") && (
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Link>
          </Button>
        )}

        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <div className="w-full h-full bg-white rounded-full -translate-y-16 translate-x-16"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
          <div className="w-full h-full bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      </div>

      {/* Stats Cards with Suspense */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCardsWrapper dataPromise={dashboardDataPromise} />
      </Suspense>

      {/* Recent Requests with Suspense */}
      <Suspense fallback={<RecentRequestsSkeleton />}>
        <RecentRequestsWrapper dataPromise={dashboardDataPromise} />
      </Suspense>
    </div>
  );
}
