"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api-config";
import DatasetDialog from "./dataset-dialog";

export default function DatasetsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [datasets, setDatasets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const searchQuery = searchParams.get("search") || "";
  const filterCategory = searchParams.get("category") || "all";
  const filterStatus = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  // Set default URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    if (!params.has("page")) {
      params.set("page", "1");
      hasChanges = true;
    }
    if (!params.has("limit")) {
      params.set("limit", "12");
      hasChanges = true;
    }
    if (!params.has("status")) {
      params.set("status", "all");
      hasChanges = true;
    }
    if (!params.has("category")) {
      params.set("category", "all");
      hasChanges = true;
    }

    if (hasChanges) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [searchQuery, filterCategory, filterStatus, page, limit]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getDatasetCategories({ includeInactive: true });
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page,
        limit,
        includeInactive: true,
      };

      if (searchQuery) params.search = searchQuery;
      if (filterCategory !== "all") params.categoryId = filterCategory;

      const data = await api.getDatasets(params);

      let filteredDatasets = data.datasets || data;

      // Client-side status filter
      if (filterStatus === "active") {
        filteredDatasets = filteredDatasets.filter(
          (d: any) => !d.deactivatedAt,
        );
      } else if (filterStatus === "inactive") {
        filteredDatasets = filteredDatasets.filter((d: any) => d.deactivatedAt);
      }

      setDatasets(filteredDatasets);
      setPagination(
        data.pagination || {
          page,
          limit,
          total: filteredDatasets.length,
          totalPages: 1,
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateURLParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== "page") {
      params.set("page", "1");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAddDataset = () => {
    setSelectedDataset(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditDataset = (dataset: any) => {
    setSelectedDataset(dataset);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (dataset: any) => {
    try {
      const newStatus = dataset.deactivatedAt ? null : new Date().toISOString();
      await api.updateDataset(dataset.id, { deactivatedAt: newStatus });
      toast.success(
        `Dataset ${newStatus ? "deactivated" : "activated"} successfully`,
      );
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this dataset? This action cannot be undone.",
      )
    )
      return;

    try {
      await api.deleteDataset(datasetId);
      toast.success("Dataset deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category || { name: "Uncategorized", icon: "📁" };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => updateURLParams("search", e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleAddDataset}
                className="bg-green hover:bg-green/90 w-full sm:w-auto shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Dataset
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={filterCategory}
                onValueChange={(v) => updateURLParams("category", v)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={(v) => updateURLParams("status", v)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datasets Grid */}
      {datasets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No datasets found
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Try adjusting your filters or create a new dataset.
            </p>
            <Button
              onClick={handleAddDataset}
              className="bg-green hover:bg-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Dataset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset) => {
              const category = getCategoryInfo(dataset.categoryId);
              const isActive = !dataset.deactivatedAt;

              return (
                <Card
                  key={dataset.id}
                  className={`relative overflow-hidden transition-all hover:shadow-md ${
                    !isActive ? "opacity-75" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">
                          {category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2">
                            {dataset.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            {isActive ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <CardDescription className="line-clamp-2 text-sm min-h-[2.5rem]">
                      {dataset.description || "No description provided"}
                    </CardDescription>

                    {/* Requirements Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {dataset.hasAdminLevel && (
                        <Badge variant="outline" className="text-xs">
                          Admin Level
                        </Badge>
                      )}
                      {dataset.requiresPeriod && (
                        <Badge variant="outline" className="text-xs">
                          Period
                        </Badge>
                      )}
                      {dataset.requiresUpi && (
                        <Badge variant="outline" className="text-xs">
                          UPI
                        </Badge>
                      )}
                      {dataset.requiresUpiList && (
                        <Badge variant="outline" className="text-xs">
                          UPI List
                        </Badge>
                      )}
                      {dataset.hasTransactionType && (
                        <Badge variant="outline" className="text-xs">
                          Transaction
                        </Badge>
                      )}
                      {dataset.hasLandUse && (
                        <Badge variant="outline" className="text-xs">
                          Land Use
                        </Badge>
                      )}
                      {dataset.hasSizeRange && (
                        <Badge variant="outline" className="text-xs">
                          Size Range
                        </Badge>
                      )}
                      {dataset.hasUserLevel && (
                        <Badge variant="outline" className="text-xs">
                          User Level
                        </Badge>
                      )}
                      {dataset.requiresIdList && (
                        <Badge variant="outline" className="text-xs">
                          ID List
                        </Badge>
                      )}
                    </div>

                    {/* Actions and Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t">
                      {isActive && dataset.createdAt && (
                        <div className="text-xs text-gray-500">
                          Activated:{" "}
                          {new Date(dataset.createdAt).toLocaleDateString()}
                        </div>
                      )}
                      {!isActive && (
                        <div className="text-xs text-gray-500"></div>
                      )}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(dataset)}
                          title={isActive ? "Deactivate" : "Activate"}
                        >
                          {isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDataset(dataset)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDataset(dataset.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-gray-600">
                Showing {datasets.length} of {pagination.total} datasets
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateURLParams("page", "1")}
                  disabled={page === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateURLParams("page", String(page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateURLParams("page", String(page + 1))}
                  disabled={page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateURLParams("page", String(pagination.totalPages))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <DatasetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        dataset={selectedDataset}
        categories={categories}
        onSuccess={fetchData}
        isEditing={isEditing}
      />
    </>
  );
}
