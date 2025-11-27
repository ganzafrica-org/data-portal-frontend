"use client"

import { Suspense, useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api, UsersQueryParams, UsersResponse } from "@/lib/api-config"
import { UsersFilters } from "./users-filters"
import { UsersList, UsersListSkeleton } from "./users-list"
import { RequestsPagination, RequestsPaginationSkeleton } from "../requests/requests-pagination"

// Component that fetches and displays users
function UsersData({ queryParams }: { queryParams: UsersQueryParams }) {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create a stable key for dependencies
  const queryKey = useMemo(() => JSON.stringify(queryParams), [queryParams])

  // Memoize the fetch function
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await api.getUsers(queryParams)
      setData(result)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [queryKey])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  if (isLoading || !data) return <UsersListSkeleton />

  return (
    <>
      <UsersList users={data.users} />
      {data.pagination.totalPages > 1 && (
        <div className="mt-6">
          <RequestsPagination pagination={data.pagination} />
        </div>
      )}
    </>
  )
}

export default function UsersPageContent() {
  const { user, canManageUsers } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check permission
  if (!user || !canManageUsers()) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to manage users.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Build query params from URL with defaults
  const queryParams: UsersQueryParams = useMemo(() => {
    const params: UsersQueryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    }

    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const userType = searchParams.get("userType")
    const isVerified = searchParams.get("isVerified")
    const isActive = searchParams.get("isActive")

    if (search) params.search = search
    // Only add filters to API call if not "all"
    if (role && role !== "all") params.role = role
    if (userType && userType !== "all") params.userType = userType
    if (isVerified && isVerified !== "all") params.isVerified = isVerified === "true"
    if (isActive && isActive !== "all") params.isActive = isActive === "true"

    return params
  }, [searchParams])

  // Ensure default params are in URL on mount
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString())
    let needsUpdate = false

    if (!currentParams.has("page")) {
      currentParams.set("page", "1")
      needsUpdate = true
    }
    if (!currentParams.has("limit")) {
      currentParams.set("limit", "20")
      needsUpdate = true
    }
    if (!currentParams.has("role")) {
      currentParams.set("role", "all")
      needsUpdate = true
    }
    if (!currentParams.has("userType")) {
      currentParams.set("userType", "all")
      needsUpdate = true
    }
    if (!currentParams.has("isVerified")) {
      currentParams.set("isVerified", "all")
      needsUpdate = true
    }
    if (!currentParams.has("isActive")) {
      currentParams.set("isActive", "all")
      needsUpdate = true
    }

    if (needsUpdate) {
      router.replace(`?${currentParams.toString()}`, { scroll: false })
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-green text-white">
        <CardHeader>
          <CardTitle className="text-2xl">User Management</CardTitle>
          <p className="text-yellow mt-1">
            Manage user accounts, permissions, and verification status
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <UsersFilters />
        </CardContent>
      </Card>

      {/* Users List with Suspense */}
      <Suspense
        key={JSON.stringify(queryParams)}
        fallback={
          <div className="space-y-6">
            <UsersListSkeleton />
            <RequestsPaginationSkeleton />
          </div>
        }
      >
        <UsersData queryParams={queryParams} />
      </Suspense>
    </div>
  )
}
