"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { DateRange } from "react-day-picker";

interface RequestsFiltersProps {
  showUserRoleFilter?: boolean;
}

export function RequestsFilters({
  showUserRoleFilter = true,
}: RequestsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for search input (debounced)
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 500);

  // Get current filters from URL
  const currentStatus = searchParams.get("status") || "";
  const currentPriority = searchParams.get("priority") || "";

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      return {
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      };
    }
    return undefined;
  });

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    // Reset to page 1 when search changes
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Always set the value in URL (including "all")
    params.set(key, value);

    // Reset to page 1 when filters change
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    const params = new URLSearchParams(searchParams.toString());

    if (newDateRange?.from) {
      params.set("startDate", newDateRange.from.toISOString().split("T")[0]);
    } else {
      params.delete("startDate");
    }

    if (newDateRange?.to) {
      params.set("endDate", newDateRange.to.toISOString().split("T")[0]);
    } else {
      params.delete("endDate");
    }

    // Reset to page 1 when date range changes
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchInput("");
    setDateRange(undefined);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", searchParams.get("limit") || "20");
    params.set("status", "all");
    params.set("priority", "all");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters =
    searchInput || currentStatus || currentPriority || dateRange;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, description, or request number..."
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

        {/* Status Filter */}
        <Select
          value={currentStatus || "all"}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="resubmitted">Resubmitted</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={currentPriority || "all"}
          onValueChange={(value) => updateFilter("priority", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
          className="w-full sm:w-[280px]"
        />

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
  );
}
