"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { RecentRequest } from "@/lib/api-config";

interface RecentRequestsProps {
  requests: RecentRequest[];
  canApproveRequests: boolean;
  showSystemStats: boolean;
  userRole: "admin" | "internal" | "external";
}

export function RecentRequests({
  requests,
  canApproveRequests,
  showSystemStats,
  userRole,
}: RecentRequestsProps) {
  // Filter requests for reviewers to only show pending/in_review
  const displayRequests = canApproveRequests
    ? requests.filter((r) => r.status === "pending" || r.status === "in_review")
    : requests;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRequestsCardTitle = () => {
    if (canApproveRequests) {
      return {
        title: "Pending Requests",
        description: "Requests awaiting your approval",
      };
    }
    return {
      title: "Recent Requests",
      description: showSystemStats
        ? "Latest system activity"
        : "Your recent data requests",
    };
  };

  const requestsCardInfo = getRequestsCardTitle();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{requestsCardInfo.title}</CardTitle>
          <CardDescription>{requestsCardInfo.description}</CardDescription>
        </div>
        <Button asChild>
          <Link href="/requests">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {displayRequests.length === 0 ? (
          <div className="text-center py-8">
            {canApproveRequests ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600">No pending requests to review.</p>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No requests yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first data request.
                </p>
                {userRole === "external" && (
                  <Button asChild>
                    <Link href="/requests/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Request
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.requestNumber}
                      {showSystemStats &&
                        request.user &&
                        ` • ${request.user.name}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1).replace("_", " ")}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/requests/${request.id}`}>
                      {canApproveRequests && request.status === "pending"
                        ? "Review"
                        : "View"}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentRequestsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4 flex-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
