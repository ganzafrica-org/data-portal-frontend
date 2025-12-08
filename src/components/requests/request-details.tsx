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
  Send,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  api,
  getErrorMessage,
  type Request,
  type RequestComment,
} from "@/lib/api-config";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || "");
  const [rejectionReason, setRejectionReason] = useState(
    request.rejectionReason || "",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!user) return null;

  const canEdit =
    (user.id === request.userId &&
      (request.status === "draft" || request.status === "changes_requested")) ||
    hasPermission("canApproveRequests");

  const canApprove =
    hasPermission("canApproveRequests") &&
    (request.status === "pending" || request.status === "in_review");

  const isOwner = user.id === request.userId;

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoadingComments(true);
        const fetchedComments = await api.getRequestComments(request.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to load comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [request.id]);

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
    setIsProcessing(true);
    try {
      await api.updateRequest(request.id, {
        // Call status update endpoint
      });
      await refreshRequest();
      toast.success("Request approved successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!adminNotes.trim()) {
      toast.error("Please provide notes about what changes are needed");
      return;
    }

    setIsProcessing(true);
    try {
      await api.requestChanges(request.id, adminNotes);
      await refreshRequest();
      toast.success("Changes requested. User has been notified.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement reject endpoint
      await refreshRequest();
      toast.success("Request rejected");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const comment = await api.addComment(request.id, {
        comment: newComment,
        isInternal: !isOwner && hasPermission("canApproveRequests"),
      });
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmittingComment(false);
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

  // Filter comments based on user role
  const visibleComments = comments.filter((comment) => {
    if (hasPermission("canApproveRequests")) return true; // Admins see all
    if (isOwner) return !comment.isInternal; // Owners don't see internal comments
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {request.datasets.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No datasets selected yet
                    </p>
                  ) : (
                    request.datasets.map((ds) => (
                      <Badge
                        key={ds.id}
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {ds.dataset.name}
                        {ds.datasetStatus !== "pending" && (
                          <span className="ml-1">({ds.datasetStatus})</span>
                        )}
                      </Badge>
                    ))
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
                            {doc.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.isVerified && (
                          <Badge className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownloadDocument(doc.id, doc.originalFilename)
                          }
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

          {/* Admin Section */}
          {hasPermission("canApproveRequests") && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-800">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="admin-notes"
                    className="text-sm font-medium text-amber-700"
                  >
                    ADMIN NOTES
                  </Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this request..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {request.status === "pending" && (
                  <>
                    <div>
                      <Label
                        htmlFor="rejection-reason"
                        className="text-sm font-medium text-amber-700"
                      >
                        REJECTION REASON (Required for rejection)
                      </Label>
                      <Textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comments
                {comments.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {visibleComments.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoadingComments ? (
                  <p className="text-sm text-gray-500">Loading comments...</p>
                ) : visibleComments.length === 0 ? (
                  <p className="text-sm text-gray-500">No comments yet</p>
                ) : (
                  visibleComments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.user.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {comment.user.role}
                          </Badge>
                          {comment.isInternal && (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {comment.comment}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {/* Add Comment */}
              <div className="space-y-2">
                <Label htmlFor="new-comment">Add Comment</Label>
                <Textarea
                  id="new-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  size="sm"
                >
                  {isSubmittingComment ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
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

              {request.status === "approved" &&
                hasPermission("canExportData") && (
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Data Package
                  </Button>
                )}
            </CardContent>
          </Card>

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
    </div>
  );
}
