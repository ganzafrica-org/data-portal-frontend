"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api-config";

export default function AnalyticsTab() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDatasets({ limit: 100 });
      setDatasets(data.datasets || data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const activeDatasets = datasets.length;
  const inactiveDatasets = 0; // No longer tracking inactive datasets

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-blue text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Total Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{datasets.length}</div>
          <p className="text-xs text-white/80">{activeDatasets} active</p>
        </CardContent>
      </Card>

      <Card className="bg-green text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Active Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDatasets}</div>
          <p className="text-xs text-white/80">Ready for use</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Inactive Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveDatasets}</div>
          <p className="text-xs text-gray-600">Deactivated</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Dataset Requirements Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Requires Period</p>
              <p className="text-2xl font-bold">
                {datasets.filter((d) => d.requiresPeriod).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Requires UPI</p>
              <p className="text-2xl font-bold">
                {datasets.filter((d) => d.requiresUpi).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Has Admin Level</p>
              <p className="text-2xl font-bold">
                {datasets.filter((d) => d.hasAdminLevel).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Has Transaction Type</p>
              <p className="text-2xl font-bold">
                {datasets.filter((d) => d.hasTransactionType).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
