"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RequestForm from "@/components/requests/request-form";
import { api } from "@/lib/api-config";
import type { Request } from "@/lib/api-config";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewRequestPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");
  const mode = (searchParams.get("mode") || "create") as "create" | "edit";
  const [initialData, setInitialData] = useState<Request | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      if (requestId) {
        try {
          setIsLoading(true);
          const request = await api.getRequestById(requestId);

          // Only load if it's a draft or changes_requested
          if (
            request.status === "draft" ||
            request.status === "changes_requested"
          ) {
            setInitialData(request);
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDraft();
  }, [requestId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        <Card className="bg-blue p-4">
          <CardContent className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RequestForm
      mode={mode}
      requestId={requestId || undefined}
      initialData={initialData}
    />
  );
}
