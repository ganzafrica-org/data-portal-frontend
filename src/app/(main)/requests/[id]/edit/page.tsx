"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import RequestFormNew from "@/components/requests/request-form-new";
import { api, getErrorMessage, type Request } from "@/lib/api-config";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface EditRequestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditRequestPage({ params }: EditRequestPageProps) {
  const resolvedParams = use(params);
  const [request, setRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setIsLoading(true);
        const data = await api.getRequestById(resolvedParams.id);
        setRequest(data);
      } catch (error: any) {
        console.error("Error fetching request:", error);
        if (error.response?.status === 404) {
          setNotFoundError(true);
        } else {
          toast.error(getErrorMessage(error));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [resolvedParams.id]);

  if (notFoundError) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return <RequestFormNew mode="edit" initialData={request} />;
}
