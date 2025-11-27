"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api-config";
import DatasetDialog from "./dataset-dialog";

export default function DatasetsTab() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [datasetsData, categoriesData] = await Promise.all([
        api.getDatasets({ includeInactive: true, limit: 100 }),
        api.getDatasetCategories({ includeInactive: true }),
      ]);
      setDatasets(datasetsData.datasets || datasetsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
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
        `Dataset ${newStatus ? "deactivated" : "activated"} successfully`
      );
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;

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
    return category || { name: "Unknown", icon: "📁" };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleAddDataset}
          className="bg-green hover:bg-green/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Dataset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {datasets.map((dataset) => {
          const category = getCategoryInfo(dataset.categoryId);
          const isActive = !dataset.deactivatedAt;

          return (
            <Card key={dataset.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {dataset.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(dataset)}
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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDataset(dataset.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {dataset.description}
                </p>

                <div className="flex flex-wrap gap-1">
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
                      Transaction Type
                    </Badge>
                  )}
                  {dataset.hasLandUse && (
                    <Badge variant="outline" className="text-xs">
                      Land Use
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {datasets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No datasets found. Create one to get started.</p>
        </div>
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
