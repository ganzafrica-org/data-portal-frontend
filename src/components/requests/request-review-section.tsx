"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  api,
  getErrorMessage,
  type RequestReview,
} from "@/lib/api-config";
import { toast } from "sonner";

interface RequestReviewSectionProps {
  requestId: string;
  onReviewComplete?: () => void;
}

export default function RequestReviewSection({
  requestId,
  onReviewComplete,
}: RequestReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<RequestReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReview, setActiveReview] = useState<RequestReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [requestId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRequestReviews(requestId);
      setReviews(data);

      // Find the active review for current user
      const myActiveReview = data.find(
        (r) =>
          r.reviewerUserId === user?.id &&
          (r.reviewStatus === "pending" || r.reviewStatus === "in_progress")
      );
      setActiveReview(myActiveReview || null);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewDecision = async (
    decision: "approved" | "rejected" | "changes_requested"
  ) => {
    if (!activeReview) return;

    if (decision === "rejected" && !reviewNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (decision === "changes_requested" && !reviewNotes.trim()) {
      toast.error("Please specify what changes are needed");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.submitReviewDecision(activeReview.id, {
        decision,
        notes: reviewNotes.trim() || undefined,
      });

      toast.success(
        `Review ${decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : "sent back for changes"} successfully`
      );

      // Reload reviews and notify parent
      await loadReviews();
      onReviewComplete?.();
      setReviewNotes("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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
        return <Clock className="h-4 w-4 text-gray-600" />;
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading review information...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return null; // No reviews configured for this request
  }

  // Group reviews by level
  const reviewsByLevel = reviews.reduce((acc, review) => {
    if (!acc[review.reviewLevel]) {
      acc[review.reviewLevel] = [];
    }
    acc[review.reviewLevel].push(review);
    return acc;
  }, {} as Record<number, RequestReview[]>);

  const sortedLevels = Object.keys(reviewsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Review Workflow
        </CardTitle>
        <CardDescription>
          Multi-level approval process for this request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Timeline */}
        <div className="space-y-4">
          {sortedLevels.map((level, levelIndex) => {
            const levelReviews = reviewsByLevel[level].sort(
              (a, b) => a.reviewOrder - b.reviewOrder
            );

            return (
              <div key={level} className="relative">
                {/* Level Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-semibold">
                    Level {level}
                  </Badge>
                  {levelIndex < sortedLevels.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Reviewers in this level */}
                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                  {levelReviews.map((review, index) => (
                    <div
                      key={review.id}
                      className={`p-3 rounded-lg border ${
                        review.reviewerUserId === user?.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="mt-0.5">
                            {getStatusIcon(review.reviewStatus)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {review.reviewer?.name || "Unknown Reviewer"}
                              </span>
                              {review.isPrimary && (
                                <Badge variant="secondary" className="text-xs">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Order {review.reviewOrder} •{" "}
                              {review.reviewer?.email}
                            </p>
                            {review.requestDataset?.dataset && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Dataset: {review.requestDataset.dataset.name}
                              </p>
                            )}
                            {review.reviewNotes && (
                              <p className="text-sm mt-2 p-2 bg-white rounded border">
                                {review.reviewNotes}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(review.reviewStatus)}>
                          {review.reviewStatus
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Review Action Panel */}
        {activeReview && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">
              Action Required: Your Review
            </AlertTitle>
            <AlertDescription className="space-y-4 mt-2">
              <p className="text-blue-800">
                You are assigned to review this request for dataset:{" "}
                <span className="font-semibold">
                  {activeReview.requestDataset?.dataset?.name || "N/A"}
                </span>
              </p>

              <div className="space-y-2">
                <Label htmlFor="review-notes" className="text-blue-900">
                  Review Notes (Optional for approval, required for
                  rejection/changes)
                </Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review comments here..."
                  rows={4}
                  className="bg-white"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleReviewDecision("approved")}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReviewDecision("changes_requested")}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
                <Button
                  onClick={() => handleReviewDecision("rejected")}
                  disabled={isSubmitting}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
