"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  Download,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  ArrowLeft,
  Shield,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  Eye,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  Archive,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  api,
  getErrorMessage,
  type Request,
  type RequestReview,
} from "@/lib/api-config";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RequestDetailsProps {
  request: Request;
  onRequestUpdate?: () => void;
}

export default function RequestDetails({
  request: initialRequest,
  onRequestUpdate,
}: RequestDetailsProps) {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviews, setReviews] = useState<RequestReview[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<
    "approved" | "rejected" | "changes_requested" | null
  >(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(
    new Set(),
  );
  const [exports, setExports] = useState<any[]>([]);
  const [isLoadingExports, setIsLoadingExports] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!user) return null;

  // Only the request owner can edit their request (not internal/admin users)
  const canEdit =
    user.id === request.userId &&
    (request.status === "draft" || request.status === "changes_requested");

  const canApprove =
    hasPermission("canApproveRequests") &&
    (request.status === "pending" || request.status === "in_review") &&
    currentReviewId !== null;

  const isOwner = user.id === request.userId;

  // Load reviews from the request
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const reviewsData = await api.getRequestReviews(request.id);
        setReviews(reviewsData);

        // Find if current user has any pending reviews for this request
        const myPendingReview = reviewsData.find(
          (review) =>
            review.reviewerUserId === user.id &&
            review.reviewStatus === "pending",
        );

        if (myPendingReview) {
          setCurrentReviewId(myPendingReview.id);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
  }, [request.id, user.id]);

  // Load exports when request is approved
  useEffect(() => {
    const loadExports = async () => {
      if (request.status !== "approved") {
        return;
      }

      try {
        setIsLoadingExports(true);
        const exportsData = await api.getRequestExports(request.id);
        setExports(exportsData.exports || []);

        // Check if exports are being generated
        if (exportsData.exports.length === 0) {
          const statusData = await api.getExportStatus(request.id);
          setExportStatus(statusData.status);

          // Poll status if processing
          if (statusData.status === "processing") {
            const pollInterval = setInterval(async () => {
              try {
                const updatedStatus = await api.getExportStatus(request.id);
                setExportStatus(updatedStatus.status);

                if (updatedStatus.status === "completed") {
                  clearInterval(pollInterval);
                  // Reload exports
                  const updatedExports = await api.getRequestExports(
                    request.id,
                  );
                  setExports(updatedExports.exports || []);
                }

                if (updatedStatus.status === "failed") {
                  clearInterval(pollInterval);
                  toast.error(
                    "Export generation failed. Please contact support.",
                  );
                }
              } catch (error) {
                console.error("Failed to poll export status:", error);
              }
            }, 5000); // Poll every 5 seconds

            // Cleanup on unmount
            return () => clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error("Failed to load exports:", error);
      } finally {
        setIsLoadingExports(false);
      }
    };

    loadExports();
  }, [request.id, request.status]);

  // Refresh request data
  const refreshRequest = async () => {
    try {
      const updated = await api.getRequestById(request.id);
      setRequest(updated);
      onRequestUpdate?.();
    } catch (error) {
      console.error("Failed to refresh request:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="h-5 w-5 text-gray-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "in_review":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "changes_requested":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "changes_requested":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = async () => {
    if (!currentReviewId) {
      toast.error("No pending review found for this request");
      return;
    }

    setIsProcessing(true);
    try {
      await api.submitReviewDecision(currentReviewId, {
        decision: "approved",
      });
      await refreshRequest();
      toast.success("Request approved successfully");

      // Reload reviews to get updated status
      const reviewsData = await api.getRequestReviews(request.id);
      setReviews(reviewsData);
      setCurrentReviewId(null); // Clear current review ID
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = () => {
    if (!currentReviewId) {
      toast.error("No pending review found for this request");
      return;
    }
    setReviewAction("changes_requested");
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const handleReject = () => {
    if (!currentReviewId) {
      toast.error("No pending review found for this request");
      return;
    }
    setReviewAction("rejected");
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewNotes.trim() && reviewAction !== "approved") {
      toast.error("Please provide review notes");
      return;
    }

    if (!currentReviewId || !reviewAction) {
      toast.error("Invalid review state");
      return;
    }

    setIsProcessing(true);
    try {
      await api.submitReviewDecision(currentReviewId, {
        decision: reviewAction,
        notes: reviewNotes.trim() || undefined,
      });

      const actionMessages = {
        approved: "Request approved successfully",
        rejected: "Request rejected successfully",
        changes_requested: "Changes requested. User has been notified.",
      };

      toast.success(actionMessages[reviewAction]);
      setShowReviewDialog(false);
      setReviewNotes("");
      setReviewAction(null);

      // Reload request and reviews
      await refreshRequest();
      const reviewsData = await api.getRequestReviews(request.id);
      setReviews(reviewsData);
      setCurrentReviewId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocument = async (
    documentId: string,
    filename: string,
  ) => {
    try {
      const blob = await api.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleViewDocument = async (documentId: string, filename: string) => {
    try {
      const blob = await api.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      const newWindow = window.open(url, "_blank");

      if (!newWindow) {
        toast.error("Please allow pop-ups to view documents");
        return;
      }

      // Clean up the URL after a delay to ensure the browser loads it
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDownloadExport = async (exportId: string) => {
    try {
      setIsDownloading(true);
      const blob = await api.downloadRequestExport(exportId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `request-${request.requestNumber}-data.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download started successfully");

      // Refresh exports to update download count
      const exportsData = await api.getRequestExports(request.id);
      setExports(exportsData.exports || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleDatasetExpansion = (datasetId: string) => {
    setExpandedDatasets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(datasetId)) {
        newSet.delete(datasetId);
      } else {
        newSet.add(datasetId);
      }
      return newSet;
    });
  };

  const formatCriteriaValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return "N/A";

    // Handle date fields
    if (key === "dateRangeFrom" || key === "dateRangeTo") {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return String(value);
      }
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return "None selected";

      // For UPI/ID lists, show count if too many
      if ((key === "upiList" || key === "idList") && value.length > 5) {
        return `${value.length} items provided`;
      }

      return value.join(", ");
    }

    // Handle administrative level object
    if (key === "administrativeLevel" && typeof value === "object") {
      const parts: string[] = [];
      if (value.provinces?.length)
        parts.push(`${value.provinces.length} Province(s)`);
      if (value.districts?.length)
        parts.push(`${value.districts.length} District(s)`);
      if (value.sectors?.length)
        parts.push(`${value.sectors.length} Sector(s)`);
      if (value.cells?.length) parts.push(`${value.cells.length} Cell(s)`);
      if (value.villages?.length)
        parts.push(`${value.villages.length} Village(s)`);
      return parts.length > 0 ? parts.join(", ") : "Not specified";
    }

    // Handle other objects
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    // Handle booleans
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Handle numbers with units
    if (key === "sizeRangeMin" || key === "sizeRangeMax") {
      return `${value} hectares`;
    }

    return String(value);
  };

  const formatCriteriaLabel = (key: string): string => {
    // Custom labels for specific fields
    const labelMap: Record<string, string> = {
      dateRangeFrom: "Date Range From",
      dateRangeTo: "Date Range To",
      administrativeLevel: "Geographic Area",
      transactionTypes: "Transaction Types",
      landUseTypes: "Land Use Types",
      sizeRangeMin: "Minimum Size",
      sizeRangeMax: "Maximum Size",
      upiList: "UPI List",
      idList: "National ID List",
      userId: "User ID",
      additionalCriteria: "Additional Criteria",
    };

    if (labelMap[key]) {
      return labelMap[key];
    }

    // Fallback: Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Filter review notes based on user role and visibility
  const visibleReviews = reviews.filter((review) => {
    // Only show reviews that have actual notes (not null, not empty)
    const hasNotes =
      review.reviewNotes !== null &&
      review.reviewNotes !== undefined &&
      review.reviewNotes.trim().length > 0;

    // Skip reviews without notes
    if (!hasNotes) {
      return false;
    }

    // Admin users see all review notes
    if (user.role === "admin") return true;

    // Reviewers (users with canApproveRequests permission) see all reviews
    if (hasPermission("canApproveRequests")) return true;

    // Request owners MUST see changes_requested notes (even if internal)
    // so they know what to fix
    if (isOwner && review.reviewStatus === "changes_requested") return true;

    // Request owners see only non-internal notes for other statuses
    if (isOwner && !review.isInternal) return true;

    return false;
  });

  return (
    <div className="max-w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/requests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {request.title}
            </h1>
            {request.requestNumber && (
              <p className="text-gray-600">{request.requestNumber}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(request.status)}
          <Badge className={getStatusColor(request.status)}>
            {request.status.replace("_", " ").toUpperCase()}
          </Badge>
          <Badge className={getPriorityColor(request.priority)}>
            {request.priority.toUpperCase()} Priority
          </Badge>
        </div>
      </div>

      {/* Changes Requested Alert */}
      {request.status === "changes_requested" && isOwner && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Changes Requested</AlertTitle>
          <AlertDescription>
            {request.adminNotes ||
              "The reviewer has requested changes to your request."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  DESCRIPTION
                </Label>
                <p className="mt-1 text-gray-900">{request.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  REQUESTED DATASETS
                </Label>
                <div className="space-y-3 mt-2">
                  {request.datasets.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No datasets selected yet
                    </p>
                  ) : (
                    request.datasets.map((ds) => {
                      const isExpanded = expandedDatasets.has(ds.id);

                      // Extract criteria fields directly from the dataset object
                      const criteriaFields: Record<string, any> = {};
                      const criteriaKeys = [
                        "dateRangeFrom",
                        "dateRangeTo",
                        "administrativeLevel",
                        "transactionTypes",
                        "landUseTypes",
                        "sizeRangeMin",
                        "sizeRangeMax",
                        "upiList",
                        "idList",
                        "userId",
                        "additionalCriteria",
                      ];

                      criteriaKeys.forEach((key) => {
                        if (
                          ds[key as keyof typeof ds] !== undefined &&
                          ds[key as keyof typeof ds] !== null
                        ) {
                          criteriaFields[key] = ds[key as keyof typeof ds];
                        }
                      });

                      const hasCriteria =
                        Object.keys(criteriaFields).length > 0;

                      return (
                        <div
                          key={ds.id}
                          className="border rounded-lg overflow-hidden"
                        >
                          {/* Dataset Header */}
                          <div
                            className={`p-3 bg-blue-50 flex items-center justify-between ${
                              hasCriteria
                                ? "cursor-pointer hover:bg-blue-100"
                                : ""
                            }`}
                            onClick={() =>
                              hasCriteria && toggleDatasetExpansion(ds.id)
                            }
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">
                                {ds.dataset.name}
                              </span>
                              {ds.datasetStatus !== "pending" && (
                                <Badge
                                  className={
                                    ds.datasetStatus === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : ds.datasetStatus === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {ds.datasetStatus}
                                </Badge>
                              )}
                            </div>
                            {hasCriteria && (
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800"
                                aria-label={
                                  isExpanded
                                    ? "Collapse criteria"
                                    : "Expand criteria"
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Dataset Criteria (Expandable) */}
                          {hasCriteria && isExpanded && (
                            <div className="p-3 bg-white border-t">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Selection Criteria:
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {Object.entries(criteriaFields)
                                  .filter(([key, value]) => {
                                    // Filter out null/undefined values
                                    if (value === null || value === undefined)
                                      return false;
                                    // Filter out empty arrays
                                    if (
                                      Array.isArray(value) &&
                                      value.length === 0
                                    )
                                      return false;
                                    return true;
                                  })
                                  .map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex flex-col sm:flex-row sm:items-start gap-1 text-sm"
                                    >
                                      <span className="font-medium text-gray-600 min-w-[140px]">
                                        {formatCriteriaLabel(key)}:
                                      </span>
                                      <span className="text-gray-900 break-words">
                                        {formatCriteriaValue(key, value)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                              {Object.entries(criteriaFields).filter(
                                ([key, value]) => {
                                  if (value === null || value === undefined)
                                    return false;
                                  if (
                                    Array.isArray(value) &&
                                    value.length === 0
                                  )
                                    return false;
                                  return true;
                                },
                              ).length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                  No specific criteria selected (all data
                                  requested)
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  USER TYPE
                </Label>
                <div className="mt-1 flex items-center">
                  {request.user.userType === "individual" ||
                  request.user.userType === "employee" ? (
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                  ) : (
                    <Building className="h-4 w-4 mr-2 text-green-600" />
                  )}
                  <span className="text-gray-900">
                    {request.user.userType.replace("_", " ")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          {request.documents && request.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
                <CardDescription>
                  Documents submitted with this request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {request.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {doc.originalFilename}
                          </p>
                          <p className="text-sm text-gray-500">
                            Category: {doc.category}
                          </p>
                          {doc.fileSize && (
                            <p className="text-xs text-gray-400">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.isVerified && (
                          <Badge className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewDocument(doc.id, doc.originalFilename)
                          }
                          title="View document in browser"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownloadDocument(doc.id, doc.originalFilename)
                          }
                          title="Download document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Review Notes
                {visibleReviews.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {visibleReviews.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Notes from reviewers about this request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Review Notes List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoadingReviews ? (
                  <p className="text-sm text-gray-500">
                    Loading review notes...
                  </p>
                ) : visibleReviews.length === 0 ? (
                  <p className="text-sm text-gray-500">No review notes yet</p>
                ) : (
                  visibleReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {review.reviewer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {review.reviewer.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {review.reviewer.role}
                          </Badge>
                          <Badge
                            className={
                              review.reviewStatus === "approved"
                                ? "bg-green-100 text-green-800 text-xs"
                                : review.reviewStatus === "rejected"
                                  ? "bg-red-100 text-red-800 text-xs"
                                  : review.reviewStatus === "changes_requested"
                                    ? "bg-orange-100 text-orange-800 text-xs"
                                    : review.reviewStatus === "pending"
                                      ? "bg-yellow-100 text-yellow-800 text-xs"
                                      : review.reviewStatus === "in_progress"
                                        ? "bg-blue-100 text-blue-800 text-xs"
                                        : "bg-gray-100 text-gray-800 text-xs"
                            }
                          >
                            {review.reviewStatus.replace("_", " ")}
                          </Badge>
                          {review.isInternal && (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">
                              Internal Note
                            </Badge>
                          )}
                        </div>
                        {review.reviewNotes && (
                          <p className="text-sm text-gray-700 mt-2">
                            {review.reviewNotes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {review.reviewedAt
                              ? `Reviewed: ${new Date(review.reviewedAt).toLocaleString()}`
                              : `Assigned: ${new Date(review.assignedAt).toLocaleString()}`}
                          </p>
                          {review.reviewLevel > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Level {review.reviewLevel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle>Requester Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {request.user.userType === "individual" ||
                request.user.userType === "employee" ? (
                  <User className="h-8 w-8 text-blue-600" />
                ) : (
                  <Building className="h-8 w-8 text-green-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {request.user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {request.user.userType.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  EMAIL
                </Label>
                <p className="mt-1 text-gray-900">{request.user.email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  REQUEST DATE
                </Label>
                <p className="mt-1 text-gray-900">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>

              {request.submittedAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    SUBMITTED DATE
                  </Label>
                  <p className="mt-1 text-gray-900">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canEdit &&
                (request.status === "draft" ||
                  request.status === "changes_requested") && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/requests/new?id=${request.id}&mode=edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Request
                    </Link>
                  </Button>
                )}

              {canApprove && (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Request
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleRequestChanges}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>

                  <Button
                    onClick={handleReject}
                    disabled={isProcessing}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Data Exports Section */}
          {request.status === "approved" &&
            (isOwner || hasPermission("canExportData")) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Data Exports
                  </CardTitle>
                  <CardDescription>
                    Download your approved data package
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingExports ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : exportStatus === "processing" ? (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertTitle>Preparing Your Data</AlertTitle>
                      <AlertDescription>
                        Your data exports are being prepared. This may take a
                        few minutes. This page will automatically update when
                        ready.
                      </AlertDescription>
                    </Alert>
                  ) : exports.length === 0 ? (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Export Pending</AlertTitle>
                      <AlertDescription>
                        Your data export will be available shortly. Please check
                        back in a few minutes.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {exports.map((exportItem) => {
                        const isExpired = exportItem.isExpired;
                        const isExpiringSoon =
                          !isExpired && (exportItem.daysRemaining || 0) <= 3;

                        return (
                          <div
                            key={exportItem.id}
                            className={`border rounded-lg p-4 ${
                              isExpired ? "bg-gray-50 opacity-60" : "bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Archive
                                  className={`h-5 w-5 mt-0.5 ${
                                    isExpired
                                      ? "text-gray-400"
                                      : "text-blue-600"
                                  }`}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">
                                      Data Package (ZIP)
                                    </h4>
                                    {isExpired && (
                                      <Badge variant="destructive">
                                        Expired
                                      </Badge>
                                    )}
                                    {isExpiringSoon && (
                                      <Badge
                                        variant="outline"
                                        className="bg-yellow-50 text-yellow-700 border-yellow-300"
                                      >
                                        ⚠️ Expires in {exportItem.daysRemaining}{" "}
                                        {exportItem.daysRemaining === 1
                                          ? "day"
                                          : "days"}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p>
                                      <span className="font-medium">Size:</span>{" "}
                                      {(
                                        exportItem.fileSize /
                                        (1024 * 1024)
                                      ).toFixed(2)}{" "}
                                      MB
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Downloads:
                                      </span>{" "}
                                      {exportItem.downloadCount}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Created:
                                      </span>{" "}
                                      {new Date(
                                        exportItem.createdAt,
                                      ).toLocaleString()}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Expires:
                                      </span>{" "}
                                      {new Date(
                                        exportItem.expiresAt,
                                      ).toLocaleString()}
                                    </p>
                                    {exportItem.datasetInfo && (
                                      <p className="text-xs text-gray-500 mt-2">
                                        Contains{" "}
                                        {exportItem.datasetInfo.datasetsCount ||
                                          request.datasets.length}{" "}
                                        dataset(s)
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div>
                                {!isExpired && (
                                  <Button
                                    onClick={() =>
                                      handleDownloadExport(exportItem.id)
                                    }
                                    disabled={isDownloading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    {isDownloading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Downloading...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download ZIP
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {isExpired && (
                              <Alert className="mt-3" variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  This export has expired and the files have
                                  been deleted. Please contact support if you
                                  need to regenerate the data.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Request Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Draft Created
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {request.submittedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Submitted for Review
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {request.status === "approved" && request.approvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Request Approved
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.approvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {request.status === "changes_requested" && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Changes Requested
                      </p>
                      <p className="text-xs text-gray-600">
                        {request.adminNotes}
                      </p>
                    </div>
                  </div>
                )}

                {request.status === "rejected" && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Request Rejected
                      </p>
                      <p className="text-xs text-gray-600">
                        {request.rejectionReason}
                      </p>
                    </div>
                  </div>
                )}

                {(request.status === "pending" ||
                  request.status === "in_review") && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Under Review
                      </p>
                      <p className="text-xs text-gray-600">
                        Awaiting approval from administrators
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Notes Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "rejected"
                ? "Reject Request"
                : "Request Changes"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "rejected"
                ? "Please provide a reason for rejecting this request. The requester will be notified."
                : "Please provide details about what changes are needed. The requester will be notified."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="review-notes">
                {reviewAction === "rejected"
                  ? "Rejection Reason"
                  : "Change Details"}{" "}
                *
              </Label>
              <Textarea
                id="review-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === "rejected"
                    ? "Explain why this request is being rejected..."
                    : "Describe what changes are needed..."
                }
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                This note will be visible to the request owner.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setReviewNotes("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === "rejected" ? "destructive" : "default"}
              onClick={handleSubmitReview}
              disabled={isProcessing || !reviewNotes.trim()}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : reviewAction === "rejected" ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
