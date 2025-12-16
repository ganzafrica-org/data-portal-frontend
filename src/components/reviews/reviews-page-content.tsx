"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Calendar,
  FileText,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api, RequestReview, ReviewStats } from "@/lib/api-config";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Stats Cards Component
function ReviewStatsCards({ stats }: { stats: ReviewStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.totalPending}
              </h3>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                In Progress
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.totalInProgress}
              </h3>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.totalCompleted}
              </h3>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overdue
              </p>
              <h3 className="text-2xl font-bold mt-2 text-red-600">
                {stats.overdueReviews}
              </h3>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Review List Item Component
function ReviewListItem({ review }: { review: RequestReview }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "changes_requested":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "changes_requested":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Review Info */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="mt-1">{getStatusIcon(review.reviewStatus)}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/requests/${review.requestId}`}
                    className="text-lg font-semibold text-gray-900 hover:text-green transition-colors"
                  >
                    {review.request?.title || "Untitled Request"}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    {review.request?.requestNumber}
                  </p>
                </div>
              </div>

              {review.request?.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {review.request.description}
                </p>
              )}
            </div>
          </div>

          {/* Dataset Info */}
          {review.requestDataset?.dataset && (
            <div className="flex items-center gap-2 pl-7">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                <span className="font-medium">Dataset:</span>{" "}
                {review.requestDataset.dataset.name}
              </span>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pl-7">
            {review.request?.user && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{review.request.user.name}</span>
                {review.request.user.organizationName && (
                  <span className="text-gray-400">
                    ({review.request.user.organizationName})
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Assigned: {formatDate(review.assignedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Level {review.reviewLevel} - Order {review.reviewOrder}
              </Badge>
            </div>
          </div>

          {/* Review Notes */}
          {review.reviewNotes && (
            <div className="pl-7 pt-2 border-t">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {review.reviewNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Status & Actions */}
        <div className="flex flex-col items-end gap-3">
          <Badge className={getStatusColor(review.reviewStatus)}>
            {review.reviewStatus
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
          <Button size="sm" asChild>
            <Link href={`/requests/${review.requestId}`}>
              <Eye className="h-4 w-4 mr-2" />
              Review
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Reviews List Component
function ReviewsList({
  reviews,
  isLoading,
}: {
  reviews: RequestReview[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-600">
            You don't have any reviews matching the current filters.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewListItem key={review.id} review={review} />
      ))}
    </div>
  );
}

// Main Page Content Component
export default function ReviewsPageContent() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState<RequestReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );

  // Check if user is a reviewer
  const isReviewer = useMemo(
    () => user?.permissions?.isReviewer || false,
    [user]
  );

  // Fetch reviews and stats
  const fetchData = useCallback(async () => {
    if (!isReviewer) return;

    try {
      setIsLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        api.getMyReviews({
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 50,
        }),
        api.getReviewStats(),
      ]);
      setReviews(reviewsData.reviews);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isReviewer, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (statusFilter === "all") {
      params.delete("status");
    } else {
      params.set("status", statusFilter);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [statusFilter, router, searchParams]);

  if (!user) return null;

  if (!isReviewer) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600">
            You don't have reviewer permissions. Please contact your
            administrator if you believe this is an error.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-green text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            My Reviews
          </CardTitle>
          <p className="text-yellow mt-1">
            Review and approve data access requests assigned to you
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      {stats && <ReviewStatsCards stats={stats} />}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="changes_requested">
                  Changes Requested
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <ReviewsList reviews={reviews} isLoading={isLoading} />
    </div>
  );
}
