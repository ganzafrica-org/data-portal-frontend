"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

export function UsersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Local state for search input (debounced)
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const debouncedSearch = useDebounce(searchInput, 500)

  // Get current filters from URL
  const currentRole = searchParams.get("role") || ""
  const currentUserType = searchParams.get("userType") || ""
  const currentIsVerified = searchParams.get("isVerified") || ""
  const currentIsActive = searchParams.get("isActive") || ""

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    } else {
      params.delete("search")
    }

    // Reset to page 1 when search changes
    params.set("page", "1")

    router.push(`?${params.toString()}`, { scroll: false })
  }, [debouncedSearch])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Always set the value in URL (including "all")
    params.set(key, value)

    // Reset to page 1 when filters change
    params.set("page", "1")

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setSearchInput("")
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("limit", searchParams.get("limit") || "20")
    params.set("role", "all")
    params.set("userType", "all")
    params.set("isVerified", "all")
    params.set("isActive", "all")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const hasActiveFilters = searchInput || currentRole || currentUserType || currentIsVerified || currentIsActive

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or organization..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <Select
          value={currentRole || "all"}
          onValueChange={(value) => updateFilter("role", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="external">External</SelectItem>
          </SelectContent>
        </Select>

        {/* User Type Filter */}
        <Select
          value={currentUserType || "all"}
          onValueChange={(value) => updateFilter("userType", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="academic_institution">Academic</SelectItem>
            <SelectItem value="research_organization">Research Org</SelectItem>
            <SelectItem value="private_company">Private Company</SelectItem>
            <SelectItem value="ngo">NGO</SelectItem>
            <SelectItem value="government_agency">Government</SelectItem>
            <SelectItem value="international_organization">International</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>

        {/* Verified Filter */}
        <Select
          value={currentIsVerified || "all"}
          onValueChange={(value) => updateFilter("isVerified", value)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filter */}
        <Select
          value={currentIsActive || "all"}
          onValueChange={(value) => updateFilter("isActive", value)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Active</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
