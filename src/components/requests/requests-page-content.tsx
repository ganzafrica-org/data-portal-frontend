"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api, RequestsQueryParams, RequestsResponse } from "@/lib/api-config";
import { RequestsFilters } from "./requests-filters";
import { RequestsList, RequestsListSkeleton } from "./requests-list";
import {
  RequestsPagination,
  RequestsPaginationSkeleton,
} from "./requests-pagination";

// Component that fetches and displays requests
function RequestsData({ queryParams }: { queryParams: RequestsQueryParams }) {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState<RequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create a stable key for dependencies
  const queryKey = useMemo(() => JSON.stringify(queryParams), [queryParams]);

  // Memoize the fetch function
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.getRequests(queryParams);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (!user) return null;
  if (isLoading || !data) return <RequestsListSkeleton />;

  const showUserInfo =
    user.role === "admin" || hasPermission("canViewAllRequests");

  return (
    <>
      <RequestsList requests={data.requests} showUserInfo={showUserInfo} />
      {data.pagination.totalPages > 1 && (
        <div className="mt-6">
          <RequestsPagination pagination={data.pagination} />
        </div>
      )}
    </>
  );
}

export default function RequestsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!user) return null;

  // Build query params from URL with defaults
  const queryParams: RequestsQueryParams = useMemo(() => {
    const params: RequestsQueryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (search) params.search = search;
    // Only add status/priority to API call if not "all"
    if (status && status !== "all") params.status = status;
    if (priority && priority !== "all") params.priority = priority;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return params;
  }, [searchParams]);

  // Ensure default params are in URL on mount
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    let needsUpdate = false;

    if (!currentParams.has("page")) {
      currentParams.set("page", "1");
      needsUpdate = true;
    }
    if (!currentParams.has("limit")) {
      currentParams.set("limit", "20");
      needsUpdate = true;
    }
    if (!currentParams.has("status")) {
      currentParams.set("status", "all");
      needsUpdate = true;
    }
    if (!currentParams.has("priority")) {
      currentParams.set("priority", "all");
      needsUpdate = true;
    }

    if (needsUpdate) {
      router.replace(`?${currentParams.toString()}`, { scroll: false });
    }
  }, []);

  const canCreateRequest = user.role === "external" || user.role === "internal";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-green text-white">
        <CardHeader>
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">Data Requests</CardTitle>
              <p className="text-yellow mt-1">
                {user.role === "admin" || user.permissions.canViewAllRequests
                  ? "Manage and review all data access requests"
                  : "Track and manage your data access requests"}
              </p>
            </div>
            {canCreateRequest && (
              <Button asChild variant="secondary" className="shrink-0">
                <Link href="/requests/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <RequestsFilters />
        </CardContent>
      </Card>

      {/* Requests List with Suspense */}
      <Suspense
        key={JSON.stringify(queryParams)}
        fallback={
          <div className="space-y-6">
            <RequestsListSkeleton />
            <RequestsPaginationSkeleton />
          </div>
        }
      >
        <RequestsData queryParams={queryParams} />
      </Suspense>
    </div>
  );
}
