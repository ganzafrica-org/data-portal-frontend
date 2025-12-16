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
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api-config";
import DatasetReviewersDialog from "./dataset-reviewers-dialog";

export default function DatasetsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [datasets, setDatasets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [reviewersDialog, setReviewersDialog] = useState<{
    open: boolean;
    datasetId: string;
    datasetName: string;
  }>({
    open: false,
    datasetId: "",
    datasetName: "",
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
    router.push("/configuration/datasets/new");
  };

  const handleEditDataset = (dataset: any) => {
    router.push(`/configuration/datasets/new?id=${dataset.id}&mode=edit`);
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

  const handleManageReviewers = (dataset: any) => {
    setReviewersDialog({
      open: true,
      datasetId: dataset.id,
      datasetName: dataset.name,
    });
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
                  className={`relative overflow-hidden transition-all hover:shadow-md flex flex-col h-[300px] ${
                    !isActive ? "opacity-75" : ""
                  }`}
                >
                  <CardHeader className="pb-2 shrink-0">
                    <div className="flex items-start gap-2">
                      <div className="text-2xl flex-shrink-0">
                        {category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold mb-1.5 line-clamp-2 min-h-[40px]">
                          {dataset.name}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isActive ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
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
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col overflow-hidden pb-2 pt-0">
                    <CardDescription className="line-clamp-2 text-xs min-h-[24px] mb-2">
                      {dataset.description || "No description provided"}
                    </CardDescription>

                    <div className="flex flex-wrap gap-1 min-h-[28px] content-start">
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

                    <div className="flex-1" />

                    <div className="space-y-2 mt-auto pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageReviewers(dataset)}
                        className="w-full h-8 text-xs"
                      >
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        Manage Reviewers
                      </Button>

                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t">
                        <div className="text-xs text-gray-500 truncate">
                          {isActive && dataset.createdAt
                            ? new Date(dataset.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(dataset)}
                            title={isActive ? "Deactivate" : "Activate"}
                            className="h-7 w-7 p-0"
                          >
                            {isActive ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDataset(dataset)}
                            title="Edit"
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDataset(dataset.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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

      {/* Reviewer Assignment Dialog */}
      <DatasetReviewersDialog
        open={reviewersDialog.open}
        onOpenChange={(open) =>
          setReviewersDialog({ ...reviewersDialog, open })
        }
        datasetId={reviewersDialog.datasetId}
        datasetName={reviewersDialog.datasetName}
        onSuccess={fetchData}
      />
    </>
  );
}
