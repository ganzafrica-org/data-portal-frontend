"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Save, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api-config";

export default function CategoriesTab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
  });

  const searchQuery = searchParams.get("search") || "";
  const filterStatus = searchParams.get("status") || "all";

  // Set default URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    if (!params.has("status")) {
      params.set("status", "all");
      hasChanges = true;
    }

    if (hasChanges) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery, filterStatus]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDatasetCategories({ includeInactive: true });
      setCategories(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name?.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (filterStatus === "active") {
      filtered = filtered.filter((cat) => !cat.deactivatedAt);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((cat) => cat.deactivatedAt);
    }

    setFilteredCategories(filtered);
  };

  const updateURLParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await api.createDatasetCategory(formData);
      toast.success("Category created successfully");
      setFormData({ name: "", icon: "", description: "" });
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Category Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Add New Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Spatial Data"
              />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="🌍"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Category description"
              />
            </div>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-green hover:bg-green/90 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => updateURLParams("search", e.target.value)}
                className="pl-10"
              />
            </div>
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
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Try adjusting your filters or create a new category.
            </p>
            <Button
              onClick={() => {
                updateURLParams("search", "");
                updateURLParams("status", "all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map((category) => {
            const isActive = !category.deactivatedAt;

            return (
              <Card
                key={category.id}
                className={`${!isActive ? "opacity-75" : ""}`}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">
                        {category.icon}
                      </span>
                      <CardTitle className="text-base sm:text-lg break-words">
                        {category.name}
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isActive ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {category.datasets?.length || 0} datasets
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 break-words">
                    {category.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {filteredCategories.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      )}
    </div>
  );
}
