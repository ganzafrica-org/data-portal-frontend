"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { api, getErrorMessage } from "@/lib/api-config";
import { Skeleton } from "@/components/ui/skeleton";
import DatasetForm from "@/components/configuration/dataset-form";

export default function NewDatasetPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = searchParams.get("id");
  const mode = (searchParams.get("mode") || "create") as "create" | "edit";

  const [isLoading, setIsLoading] = useState(false);
  const [dataset, setDataset] = useState<any | null>(null);

  // Redirect if no permission
  useEffect(() => {
    if (user && !hasPermission("canConfigureDatasets")) {
      toast.error("You don't have permission to configure datasets");
      router.push("/configuration");
    }
  }, [user, hasPermission]);

  // Load dataset if editing
  useEffect(() => {
    if (datasetId && mode === "edit") {
      fetchDataset();
    }
  }, [datasetId, mode]);

  const fetchDataset = async () => {
    if (!datasetId) return;

    try {
      setIsLoading(true);
      const data = await api.getDatasetById(datasetId);
      setDataset(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push("/configuration?tab=datasets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/configuration?tab=datasets");
  };

  const handleSuccess = () => {
    toast.success(
      mode === "create"
        ? "Dataset created successfully"
        : "Dataset updated successfully",
    );
    router.push("/configuration?tab=datasets");
  };

  if (!user || !hasPermission("canConfigureDatasets")) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
        <Skeleton className="h-10 w-96" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create" ? "Create New Dataset" : "Edit Dataset"}
          </h1>
          <p className="text-gray-600">
            {mode === "create"
              ? "Configure a new dataset with approval settings and criteria"
              : "Update dataset configuration and approval settings"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <DatasetForm
            dataset={dataset}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        </CardContent>
      </Card>
    </div>
  );
}
